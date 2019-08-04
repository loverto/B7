import {LinearFilter, Raycaster, RGBAFormat, Scene, Vector2, WebGLRenderTarget} from "three";



class Picking {
    nextId = 1;
    constructor(world, renderer, camera, scene) {
        this._world = world;
        this._renderer = renderer;
        this._camera = camera;
        this._raycaster = new Raycaster();
        this.scene = scene;
        this._envents = [];
        this._raycaster.linePrecision = 3;
        this._pickingScene = new Scene();
        var vector2Size = new Vector2();
        var size = this._renderer.getSize(vector2Size);
        this._width = size.width;
        this._height = size.height;
        var parameters = {
            minFilter: LinearFilter,
            magFilter: LinearFilter,
            format: RGBAFormat,
            stencilBuffer: false,
            depthBuffer: false
        };
        this._pickingTexture = new WebGLRenderTarget(this._width, this._height, parameters);
        this._nextId = 1;
        this._resizeTexture();
        this._initEvents();
    }


    _initEvents() {
        this._resizeHandler = this._resizeTexture.bind(this);
        window.addEventListener('resize', this._resizeHandler, false);
        this._mouseUpHandler = this._onMouseUp.bind(this);
        this._world._container.addEventListener('mouseup', this._mouseUpHandler, false);
        this._world._container.addEventListener('mousemove', this._mouseUpHandler, false);
        this._world._container.addEventListener('mousemove', this._onWorldMove.bind(this), false);
    }
    _onMouseUp(event) {
        var point = {
            x: event.clientX,
            y: event.clientY
        };
        var normalisedPoint = {
            x: 0,
            y: 0
        };
        normalisedPoint.x = point.x / this._width * 2 - 1;
        normalisedPoint.y = -(point.y / this._height) * 2 + 1;
        this._pick(point, normalisedPoint);
    }
    _onWorldMove() {
        this._needUpdate = true;
    }
    _resizeTexture() {
        var vector2Size = new Vector2();
        var size = this._renderer.getSize(vector2Size);
        this._width = size.width;
        this._height = size.height;
        this._pickingTexture.setSize(this._width, this._height);
        this._pixelBuffer = new Uint8Array(4 * this._width * this._height);
        this._needUpdate = true;
    }

    _update(point) {
        var texture = this._pickingTexture;
        if (this._needUpdate) {
            this._renderer.render(this._pickingScene, this._camera);
            this._renderer.setRenderTarget(this._pickingTexture);
            this._needUpdate = false;
        }
        this.pixelBuffer = new Uint8Array(4);
        this._renderer.readRenderTargetPixels(texture, point.x, this._height - point.y, 1, 1, this.pixelBuffer);
    }

    on(type) {
        this._mouseUpHandler = this._onMouseUp.bind(this);
        this._world._container.addEventListener(type, this._mouseUpHandler, false);
        this._envents.push([
            type,
            this._mouseUpHandler
        ]);
    }

    off(type, hander) {
        this._world._container.removeEventListener(type, this._mouseUpHandler, false);
        this._envents = this._envents.filter(function (item) {
            return item[0] === 'type' && hander === item[1];
        });
    }

    _updateRender() {
        this._renderer.render(this._pickingScene, this._camera, this._pickingTexture);
    }

    _pick(point, normalisedPoint) {
        this._update(point);
        var id = this.pixelBuffer[2] * 255 * 255 + this.pixelBuffer[1] * 255 + this.pixelBuffer[0];
        if (id === 16646655 || this.pixelBuffer[3] === 0) {
            return;
        }
        this._raycaster.setFromCamera(normalisedPoint, this._camera);
        var intersects = this._raycaster.intersectObjects(this._pickingScene.children, true);
        var _point2d = {
            x: point.x,
            y: point.y
        };
        var _point3d;
        if (intersects.length > 0) {
            _point3d = intersects[0].point;
        }
        var item = {
            featureId: id - 1,
            point2d: _point2d,
            point3d: _point3d,
            intersects: intersects
        };
        this._world.emit('pick', item);
    }

    add(mesh) {
        this._pickingScene.add(mesh);
        this._needUpdate = true;
    }

    remove(mesh) {
        this._pickingScene.remove(mesh);
        this._needUpdate = true;
    }

    getNextId() {
        return nextId++;
    }

    destroy() {
        var _this = this;
        window.removeEventListener('resize', this._resizeHandler, false);
        this._envents.forEach(function (event) {
            _this._world._container.removeEventListener(event[0], event[1], false);
        });
        this._world.off('move', this._onWorldMove);
        if (this._pickingScene.children) {
            var child;
            for (var i = this._pickingScene.children.length - 1; i >= 0; i--) {
                child = this._pickingScene.children[i];
                if (!child) {
                    continue;
                }
                this._pickingScene.remove(child);
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
        this._pickingScene = null;
        this._pickingTexture = null;
        this._pixelBuffer = null;
        this._world = null;
        this._renderer = null;
        this._camera = null;
    }
}

export default function (world, renderer, camera, scene) {
    return new Picking(world, renderer, camera, scene);
};
