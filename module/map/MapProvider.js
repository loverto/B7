import Base from "../Base";
import Index from "./theme";
import Global from "../Global";

var DEG2RAD = Math.PI / 180;

class MapProvider extends Base{

    getDefaultCfg() {
        return Object.assign(Global.scene, {
            resizeEnable: true,
            viewMode: '3D'
        });
    }

    constructor(container, cfg) {
        super(cfg)
        var _this = this;
        _this.container = container;
        _this.initMap();
        _this.addOverLayer();
        setTimeout(function () {
            _this.emit('mapLoad');
        }, 100);
    }

    initMap() {
        var mapStyle = this.get('mapStyle');
        switch (mapStyle) {
            case 'dark':
                this.set('mapStyle', Index.darkTheme.mapStyle);
                break;
            case 'light':
                this.set('mapStyle', Index.linghtTheme.mapStyle);
                break;
            default:
                this.set('mapStyle', Index.linghtTheme.mapStyle);
        }
        this.set('zooms', [
            this.get('minZoom'),
            this.get('maxZoom')
        ]);
        this.map = new AMap.Map(this.container, this._attrs);
    }

    asyncCamera(engine) {
        this._engine = engine;
        var camera = engine._camera;
        var scene = engine._scene;
        var pickScene = engine._picking._pickingScene;
        this.map.on('camerachange', function (e) {
            var mapCamera = e.camera;
            var fov = mapCamera.fov, near = mapCamera.near, far = mapCamera.far, height = mapCamera.height, pitch = mapCamera.pitch, rotation = mapCamera.rotation, aspect = mapCamera.aspect;
            pitch *= DEG2RAD;
            rotation *= DEG2RAD;
            camera.fov = 180 * fov / Math.PI;
            camera.aspect = aspect;
            camera.near = near;
            camera.far = far;
            camera.updateProjectionMatrix();
            camera.position.z = height * Math.cos(pitch);
            camera.position.x = height * Math.sin(pitch) * Math.sin(rotation);
            camera.position.y = -height * Math.sin(pitch) * Math.cos(rotation);
            camera.up.x = -Math.cos(pitch) * Math.sin(rotation);
            camera.up.y = Math.cos(pitch) * Math.cos(rotation);
            camera.up.z = Math.sin(pitch);
            camera.lookAt(0, 0, 0);
            scene.position.x = -e.camera.position.x;
            scene.position.y = e.camera.position.y;
            pickScene.position.x = -e.camera.position.x;
            pickScene.position.y = e.camera.position.y;
        });
    }

    projectFlat(lnglat) {
        return this.map.lngLatToGeodeticCoord(lnglat);
    }

    getCenter() {
        return this.map.getCenter();
    }

    getCenterFlat() {
        return this.projectFlat(this.getCenter());
    }

    addOverLayer() {
        var canvasContainer = document.getElementById(this.container);
        this.canvasContainer = canvasContainer;
        this.renderDom = document.createElement('div');
        this.renderDom.style.cssText += 'position: absolute;top: 0; z-index:1;height: 100%;width: 100%;pointer-events: none;';
        this.renderDom.id = 'l7_canvaslayer';
        canvasContainer.appendChild(this.renderDom);
    }


}

export default MapProvider;
