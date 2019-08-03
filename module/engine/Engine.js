import EventEmitter from "EventEmitter";
import {Clock, Scene} from "three";
import Camera from "./Camera";
import Renderer from "./Renderer";
import Picking from "./Picking";

/**
 * 引擎
 */
class Engine extends EventEmitter{
    constructor(container, world){
        super()
        var _this = this;
        _this._scene = new Scene();
        _this._camera = new Camera(container).camera;
        _this._renderer = new Renderer(container).renderer;
        _this._world = world;
        _this._picking = Object(Picking)(_this._world, _this._renderer, _this._camera, _this._scene);
        _this.clock = new Clock();
    }

    _initPostProcessing() {
    }

    update() {
        this._renderer.render(this._scene, this._camera);
    }

    destroy() {
    }

    run() {
        this.update();
        this.engineID = requestAnimationFrame(this.run.bind(this));
    }

    stop() {
        cancelAnimationFrame(this.engineID);
    }
}

export default Engine
