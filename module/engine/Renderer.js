import {WebGLRenderer} from "three";

class Renderer {
    constructor(container){
        this.container = container;
        this.initRender();
        this.updateSize();
        window.addEventListener('resize', this.updateSize.bind(this), false);
    }

    initRender() {
        this.renderer = new WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setClearColor(16711680, 0);
        this.pixelRatio = window.devicePixelRatio;
        this.renderer.setPixelRatio(this.pixelRatio);
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);
    }

    updateSize() {
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
}

export default Renderer;
