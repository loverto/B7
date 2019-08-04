import Base from "./Base";
import {AmbientLight} from "three";
import {DirectionalLight} from "three";
import Engine from "./engine/Engine";
import Global from "./Global";
import MapProvider from "./map/MapProvider";
import GaodeMap from "./map/GaodeMap";
import LayerIndex from "./layer";

class Scene extends Base {

    constructor(cfg){
        super(cfg)
        this._initMap();
        this._initAttribution();
        this.addImage();
        this._layers = [];
    }

    getDefaultCfg() {
        return Global.scene;
    }

    _initEngine(mapContainer) {
        this._engine = new Engine(mapContainer, this);
        this._engine.run();
    }

    addPickMesh(object) {
        this._engine._picking.add(object);
    }

    _initMap() {
        var _this2 = this;
        this.mapContainer = this.get('id');
        this._container = document.getElementById(this.mapContainer);
        var Map = new MapProvider(this.mapContainer, this._attrs);
        Map.on('mapLoad', function () {
            _this2._initEngine(Map.renderDom);
            debugger
            var sceneMap = new GaodeMap(Map.map);
            Object.getOwnPropertyNames(sceneMap.__proto__).forEach(function (key) {
                if (true) {
                    _this2.__proto__[key] = sceneMap.__proto__[key];
                }
            });
            _this2.map = Map.map;
            Map.asyncCamera(_this2._engine);
            _this2.initLayer();
            _this2.emit('loaded');
        });
    }

    initLayer() {
        var _this3 = this;
        var _loop = function _loop(methodName) {
            _this3[methodName] = function (cfg) {
                cfg ? cfg.mapType = _this3.mapType : cfg = { mapType: _this3.mapType };
                var layer = new LayerIndex[methodName](_this3, cfg);
                _this3._layers.push(layer);
                return layer;
            };
        };
        for (var methodName in LayerIndex) {
            _loop(methodName);
        }
    }

    on(type, hander) {
        if (this.map) {
            this.map.on(type, hander);
        }
        super.on(type,hander);
    }

    _initAttribution() {
        var message = '<a href="http://antv.alipay.com/zh-cn/index.html title="Large-scale WebGL-powered Geospatial Data Visualization">Bksx | B7  </a>';
        var element = document.createElement('div');
        element.innerHTML = message;
        element.style.cssText += 'position: absolute; pointer-events:none;background: rgba(255, 255, 255, 0.7);font-size: 11px;z-index:100; padding:4px;bottom: 0;right:0px;';
        this._container.appendChild(element);
    }

    addImage() {
        // this.image = new image['a']();
    }

    _initEvent() {
    }

    getLayers() {
        return this._layers;
    }

    _addLight() {
        var scene = this._engine._scene;
        var ambientLight = new AmbientLight(11184810);
        scene.add(ambientLight);
        var directionalLight = new DirectionalLight(16777215, 0.5);
        scene.add(directionalLight);
    }

    _addLayer() {
    }

    removeLayer(layer) {
        var layerIndex = this._layers.indexOf(layer);
        if (layerIndex > -1) {
            this._layers.splice(layerIndex, 1);
        }
        layer.destroy();
    }
}

export default Scene
