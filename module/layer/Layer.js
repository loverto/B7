import * as THREE from 'three'
import Base from "../Base";
import {Object3D} from "three";
import SourceIndex from "../source";
import Util from "../utils/Util";
import ColorUtil from "../utils/ColorUtil";
import AttrIndex from "./attr/Index";
import Global from '../Global';

import PickingMaterial from "../geom/material/PickingMaterial";

var id = 1;

function parseFields(field) {
    if (Util.isArray(field)) {
        return field;
    }
    if (Util.isString(field)) {
        return field.split('*');
    }
    return [field];
}

class Layer extends Base{



    constructor(scene, cfg) {
        super(cfg)
        var _this = this;
        _this.scene = scene;
        _this.map = scene.map;
        _this._object3D = new Object3D();
        _this._pickObject3D = new Object3D();
        _this._object3D.visible = _this.get('visible');
        _this._object3D.renderOrder = _this.get('zIndex') || 0;
        var layerId = _this._getUniqueId();
        _this.layerId = layerId;
        _this._activeIds = null;
        scene._engine._scene.add(_this._object3D);
        _this.layerMesh = null;
        return _this;
    }


    getDefaultCfg() {
        return {
            visible: true,
            zIndex: 0,
            type: '',
            minZoom: 0,
            maxZoom: 22,
            rotation: 0,
            attrOptions: {},
            scales: {},
            attrs: {},
            styleOptions: {
                stroke: [
                    1,
                    1,
                    1,
                    1
                ],
                strokeWidth: 1,
                opacity: 1,
                texture: false
            },
            selectedOptions: null,
            activedOptions: null,
            animateOptions: { enable: false }
        };
    }

    add(object) {
        var _this2 = this;
        this.layerMesh = object;
        this._visibleWithZoom();
        this.scene.on('zoomchange', function () {
            _this2._visibleWithZoom();
        });
        this.layerMesh.onBeforeRender = function () {
            var zoom = _this2.scene.getZoom();
            _this2.layerMesh.material.setUniformsValue('u_time', _this2.scene._engine.clock.getElapsedTime());
            _this2.layerMesh.material.setUniformsValue('u_zoom', zoom);
        };
        if (this._needUpdateFilter) {
            this._updateFilter();
        }
        this._object3D.add(object);
        this._addPickMesh(object);
    }

    remove(object) {
        this._object3D.remove(object);
    }

    _getUniqueId() {
        return id++;
    }
    _visible(visible) {
        this.set('visible', visible);
        this._object3D.visible = this.get('visible');
    }

    source(data) {
        debugger
        // 设置数据源
        var cfg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var dataType = this._getDataType(data);
        var _cfg$type = cfg.type, type = _cfg$type === void 0 ? dataType : _cfg$type;
        cfg.data = data;
        cfg.mapType = this.get('mapType');
        this.layerSource = new SourceIndex[type](cfg);
        return this;
    }

    color(field, values) {
        // 设置颜色
        // 更新颜色
        this._needUpdateColor = true;
        // 创建颜色可选项属性
        this._createAttrOption('color', field, values, Global.colors);
        return this;
    }

    size(field, values) {
        var fields = parseFields(field);
        if (fields.indexOf('zoom') !== -1) {
            this._zoomScale = true;
        }
        if (Util.isArray(fields) && !values)
            values = fields;
        this._createAttrOption('size', field, values, Global.size);
        return this;
    }

    shape(field, values) {
        if (field.split(':').length === 2) {
            this.shapeType = field.split(':')[0];
            field = field.split(':')[1];
        }
        values === 'text' ? this.shapeType = values : null;
        this._createAttrOption('shape', field, values, Global.sizes);
        return this;
    }

    active(enable, cfg) {
        if (enable === false) {
            this.set('allowActive', false);
        } else if (Util.isObject(enable)) {
            this.set('allowActive', true);
            this.set('activedOptions', enable);
        } else {
            this.set('allowActive', true);
            this.set('activedOptions', cfg || { fill: Global.activeColor });
        }
        return this;
    }

    style(field, cfg) {
        var colorItem = [
            'fill',
            'stroke',
            'color',
            'baseColor',
            'brightColor',
            'windowColor'
        ];
        var styleOptions = this.get('styleOptions');
        if (!styleOptions) {
            styleOptions = {};
            this.set('styleOptions', styleOptions);
        }
        if (Util.isObject(field)) {
            cfg = field;
            field = null;
        }
        var fields;
        if (field) {
            fields = parseFields(field);
        }
        styleOptions.fields = fields;
        Util.assign(styleOptions, cfg);
        for (var item in cfg) {
            if (colorItem.indexOf(item) !== -1) {
                styleOptions[item] = ColorUtil.color2RGBA(styleOptions[item]);
            }
            styleOptions[item] = styleOptions[item];
        }
        this.set('styleOptions', styleOptions);
        return this;
    }

    filter(field, values) {
        this._needUpdateFilter = true;
        this._createAttrOption('filter', field, values, true);
        return this;
    }

    animate(field, cfg) {
        var animateOptions = this.get('animateOptions');
        if (!animateOptions) {
            animateOptions = {};
            this.set('animateOptions', animateOptions);
        }
        if (Util.isObject(field)) {
            cfg = field;
            field = null;
        }
        var fields;
        if (field) {
            fields = parseFields(field);
        }
        animateOptions.fields = fields;
        Util.assign(animateOptions, cfg);
        this.set('animateOptions', animateOptions);
        return this;
    }
    texture() {
    }
    hide() {
        this._visible(false);
        return this;
    }
    show() {
        this._visible(true);
        return this;
    }
    _createScale(field) {
        var scales = this.get('scales');
        var scale = scales[field];
        if (!scale) {
            scale = this.layerSource.createScale(field);
            scales[field] = scale;
        }
        return scale;
    }

    _setAttrOptions(attrName, attrCfg) {
        // 获取属性
        var options = this.get('attrOptions');
        if (attrName === 'size' && this._zoomScale) {
            attrCfg.zoom = this.map.getZoom();
        }
        // 给属性赋值，例如颜色，等等
        options[attrName] = attrCfg;
    }

    _createAttrOption(attrName, field, cfg, defaultValues) {
        // 创建可选项属性
        var attrCfg = {};
        attrCfg.field = field;
        // 如果cfg是函数，则设置回调函数，如果属性名不是颜色，则则赋值
        if (cfg) {
            if (Util.isFunction(cfg)) {
                attrCfg.callback = cfg;
            } else {
                attrCfg.values = cfg;
            }
        } else if (attrName !== 'color') {
            attrCfg.values = defaultValues;
        }
        this._setAttrOptions(attrName, attrCfg);
    }

    init() {
        // 初始化属性
        this._initAttrs();
        // _scale缩放
        this._scaleByZoom();
        // 映射
        this._mapping();
        var activeHander = this._addActiveFeature.bind(this);
        if (this.get('allowActive')) {
            this.scene.on('pick', activeHander);
        } else {
            this.scene.off('pick', activeHander);
        }
    }

    /**
     *
     * @param e
     * @private
     */
    _addActiveFeature(e) {
        var featureId = e.featureId;
        var activeStyle = this.get('activedOptions');
        var selectFeatureIds = this.layerSource.getSelectFeatureId(featureId);
        if (this.StyleData[selectFeatureIds[0]].hasOwnProperty('filter') && this.StyleData[selectFeatureIds[0]].filter === false) {
            return;
        }
        var style = Util.assign({}, this.StyleData[featureId]);
        style.color = ColorUtil.toRGB(activeStyle.fill).map(function (e) {
            return e / 255;
        });
        this.updateStyle([featureId], style);
    }

    _initAttrs() {
        // 获取属性选项
        var attrOptions = this.get('attrOptions');
        // 遍历属性选项
        for (var type in attrOptions) {
            // 如果属性选项有该属性，则更新属性
            if (attrOptions.hasOwnProperty(type)) {
                this._updateAttr(type);
            }
        }
    }

    _updateAttr(type) {
        // 更新属性
        var self = this;
        // 获取属性
        var attrs = this.get('attrs');
        // 获取属性选项
        var attrOptions = this.get('attrOptions');
        // 获取更新的选项值
        var option = attrOptions[type];
        // 设置该选项可更新
        option.neadUpdate = true;
        //
        var className = Util.upperFirst(type);
        // 转换属性
        var fields = parseFields(option.field);
        // 设置缩放比
        var scales = [];
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            var scale = self._createScale(field);
            if (type === 'color' && Util.isNil(option.values)) {
                option.values = Global.colors;
            }
            scales.push(scale);
        }
        option.scales = scales;
        var attr = new AttrIndex[className](option);
        attrs[type] = attr;
    }
    _updateSize(zoom) {
        var _this3 = this;
        var sizeOption = this.get('attrOptions').size;
        var fields = parseFields(sizeOption.field);
        var data = this.layerSource.propertiesData;
        if (!this.zoomSizeCache)
            this.zoomSizeCache = {};
        if (!this.zoomSizeCache[zoom]) {
            this.zoomSizeCache[zoom] = [];
            var _loop = function _loop(i) {
                var params = fields.map(function (field) {
                    return data[i][field];
                });
                var indexZoom = fields.indexOf('zoom');
                indexZoom !== -1 ? params[indexZoom] = zoom : null;
                _this3.zoomSizeCache[zoom].push(sizeOption.callback.apply(sizeOption, _toConsumableArray(params)));
            };
            for (var i = 0; i < data.length; i++) {
                _loop(i);
            }
        }
        this.emit('sizeUpdated', this.zoomSizeCache[zoom]);
    }
    _mapping() {
        var self = this;
        // 获取属性
        var attrs = self.get('attrs');
        // 地图数据
        var mappedData = [];
        // 属性数据
        var data = this.layerSource.propertiesData;
        for (var i = 0; i < data.length; i++) {
            var record = data[i];
            var newRecord = {};
            newRecord.id = data[i]._id;
            for (var k in attrs) {
                if (attrs.hasOwnProperty(k)) {
                    var attr = attrs[k];
                    attr.needUpdate = false;
                    var names = attr.names;
                    var values = self._getAttrValues(attr, record);
                    if (names.length > 1) {
                        for (var j = 0; j < values.length; j++) {
                            var val = values[j];
                            var name = names[j];
                            newRecord[name] = Util.isArray(val) && val.length === 1 ? val[0] : val;
                        }
                    } else {
                        newRecord[names[0]] = values.length === 1 ? values[0] : values;
                    }
                }
            }
            mappedData.push(newRecord);
        }
        this.StyleData = mappedData;
        return mappedData;
    }

    _updateMaping() {
        var self = this;
        var attrs = self.get('attrs');
        var data = this.layerSource.propertiesData;
        for (var i = 0; i < data.length; i++) {
            var record = data[i];
            for (var attrName in attrs) {
                if (attrs.hasOwnProperty(attrName) && attrs[attrName].neadUpdate) {
                    var attr = attrs[attrName];
                    var names = attr.names;
                    var values = self._getAttrValues(attr, record);
                    if (names.length > 1) {
                        for (var j = 0; j < values.length; j++) {
                            var val = values[j];
                            var name = names[j];
                            this.StyleData[i][name] = Util.isArray(val) && val.length === 1 ? val[0] : val;
                        }
                    } else {
                        this.StyleData[i][names[0]] = values.length === 1 ? values[0] : values;
                    }
                    attr.neadUpdate = true;
                }
            }
        }
    }
    _getAttrValues(attr, record) {
        var scales = attr.scales;
        var params = [];
        for (var i = 0; i < scales.length; i++) {
            var scale = scales[i];
            var field = scale.field;
            if (scale.type === 'identity') {
                params.push(scale.value);
            } else {
                params.push(record[field]);
            }
        }
        var indexZoom = params.indexOf('zoom');
        indexZoom !== -1 ? params[indexZoom] = attr.zoom : null;
        var values = attr.mapping.apply(attr, params);
        return values;
    }
    _getDataType(data) {
        if (data.hasOwnProperty('type')) {
            var type = data.type;
            if (type === 'FeatureCollection') {
                return 'geojson';
            }
        }
        return 'basic';
    }

    _scaleByZoom() {
        var _this4 = this;
        if (this._zoomScale) {
            this.map.on('zoomend', function () {
                var zoom = _this4.map.getZoom();
                _this4._updateSize(Math.floor(zoom));
            });
        }
    }

    on(type, callback) {
        this._addPickingEvents();
        super.on(type, callback);
    }

    getPickingId() {
        return this.scene._engine._picking.getNextId();
    }

    addToPicking(object) {
        this.scene._engine._picking.add(object);
    }
    removeFromPicking(object) {
        this.scene._engine._picking.remove(object);
    }

    _addPickMesh(mesh) {
        var _this5 = this;
        this._pickingMesh = new Object3D();
        this._visibleWithZoom();
        this.scene.on('zoomchange', function () {
            _this5._visibleWithZoom();
        });
        this.addToPicking(this._pickingMesh);
        var pickmaterial = new PickingMaterial({ u_zoom: this.scene.getZoom() });
        var pickingMesh = new THREE[mesh.type](mesh.geometry, pickmaterial);
        pickmaterial.setDefinesvalue(this.type, true);
        pickingMesh.onBeforeRender = function () {
            var zoom = _this5.scene.getZoom();
            pickingMesh.material.setUniformsValue('u_zoom', zoom);
        };
        this._pickingMesh.add(pickingMesh);
    }
    _setPickingId() {
        this._pickingId = this.getPickingId();
    }
    _addPickingEvents() {
        var _this6 = this;
        this.scene.on('pick', function (e) {
            var featureId = e.featureId, point2d = e.point2d, intersects = e.intersects;
            if (intersects.length === 0) {
                return;
            }
            var source = _this6.layerSource.get('data');
            var feature = source.features[featureId];
            var lnglat = _this6.scene.containerToLngLat(point2d);
            var target = {
                feature: feature,
                pixel: point2d,
                lnglat: {
                    lng: lnglat.lng,
                    lat: lnglat.lat
                }
            };
            _this6.emit('click', target);
        });
    }
    updateStyle(featureStyleId, style) {
        if (this._activeIds) {
            this.resetStyle();
        }
        this._activeIds = featureStyleId;
        var pickingId = this.layerMesh.geometry.attributes.pickingId.array;
        var color = style.color;
        var colorAttr = this.layerMesh.geometry.attributes.a_color;
        var firstId = pickingId.indexOf(featureStyleId[0] + 1);
        for (var i = firstId; i < pickingId.length; i++) {
            if (pickingId[i] === featureStyleId[0] + 1) {
                colorAttr.array[i * 4 + 0] = color[0];
                colorAttr.array[i * 4 + 1] = color[1];
                colorAttr.array[i * 4 + 2] = color[2];
                colorAttr.array[i * 4 + 3] = color[3];
            } else {
                break;
            }
        }
        colorAttr.needsUpdate = true;
        return;
    }
    _updateColor() {
        this._updateMaping();
    }
    _updateFilter() {
        var _this7 = this;
        this._updateMaping();
        var filterData = this.StyleData;
        this._activeIds = null;
        var colorAttr = this.layerMesh.geometry.attributes.a_color;
        var pickAttr = this.layerMesh.geometry.attributes.pickingId;
        pickAttr.array.forEach(function (id, index) {
            id = Math.abs(id);
            var color = _toConsumableArray(_this7.StyleData[id - 1].color);
            id = Math.abs(id);
            var item = filterData[id - 1];
            if (item.hasOwnProperty('filter') && item.filter === false) {
                colorAttr.array[index * 4 + 0] = 0;
                colorAttr.array[index * 4 + 1] = 0;
                colorAttr.array[index * 4 + 2] = 0;
                colorAttr.array[index * 4 + 3] = 0;
                pickAttr.array[index] = -id;
            } else {
                colorAttr.array[index * 4 + 0] = color[0];
                colorAttr.array[index * 4 + 1] = color[1];
                colorAttr.array[index * 4 + 2] = color[2];
                colorAttr.array[index * 4 + 3] = color[3];
                pickAttr.array[index] = id;
            }
        });
        colorAttr.needsUpdate = true;
        pickAttr.needsUpdate = true;
        this._needUpdateFilter = false;
        this._needUpdateColor = false;
    }
    _visibleWithZoom() {
        var zoom = this.scene.getZoom();
        var minZoom = this.get('minZoom');
        var maxZoom = this.get('maxZoom');
        var offset = 0;
        if (this.type === 'point') {
            offset = 5;
        } else if (this.type === 'polyline') {
            offset = 2;
        }
        this._object3D.position.z = offset * Math.pow(2, 20 - zoom);
        if (zoom < minZoom || zoom > maxZoom) {
            this._object3D.visible = false;
        } else if (this.get('visible')) {
            this._object3D.visible = true;
        }
    }
    resetStyle() {
        var _this8 = this;
        var pickingId = this.layerMesh.geometry.attributes.pickingId.array;
        var colorAttr = this.layerMesh.geometry.attributes.a_color;
        this._activeIds.forEach(function (index) {
            var color = _this8.StyleData[index].color;
            var firstId = pickingId.indexOf(index + 1);
            for (var i = firstId; i < pickingId.length; i++) {
                if (pickingId[i] === index + 1) {
                    colorAttr.array[i * 4 + 0] = color[0];
                    colorAttr.array[i * 4 + 1] = color[1];
                    colorAttr.array[i * 4 + 2] = color[2];
                    colorAttr.array[i * 4 + 3] = color[3];
                }
            }
        });
        colorAttr.needsUpdate = true;
    }

    despose() {
        this.destroy();
        if (this._object3D && this._object3D.children) {
            var child;
            for (var i = 0; i < this._object3D.children.length; i++) {
                child = this._object3D.children[i];
                if (!child) {
                    continue;
                }
                this.remove(child);
                if (child.geometry) {
                    child.geometry.dispose();
                    child.geometry = null;
                }
                if (child.material) {
                    if (child.material.map) {
                        child.material.map.dispose();
                        child.material.map = null;
                    }
                    child.material.dispose();
                    child.material = null;
                }
            }
        }
        this._object3D = null;
        this.scene = null;
    }
}

export default Layer
