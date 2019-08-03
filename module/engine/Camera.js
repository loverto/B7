import {PerspectiveCamera} from "three";

/**
 * 相机
 */
class Camera {
    constructor(container){
        this.container = container;
        var camera = new PerspectiveCamera(45, 1, 1, 2000000);
        this.camera = camera;
        this.updateSize();
        window.addEventListener('resize', this.updateSize.bind(this));
    }
    updateSize() {
        var container = this.container;
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
    }
}

export default Camera
