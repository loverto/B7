import EventEmitter from "@antv/event-emitter";

/**
 * 基础工具类
 */
class Base extends EventEmitter {

    getDefaultCfg() {
        return {};
    }

    constructor(cfg){
        super(cfg)
        var attrs = { visible: true };
        var defaultCfg = this.getDefaultCfg();
        this._attrs = attrs;
        Object.assign(attrs, defaultCfg, cfg);
    }

    get(name) {
        return this._attrs[name];
    }

    set(name, value) {
        this._attrs[name] = value;
    }

    destroy() {
        this._attrs = {};
        this.removeAllListeners();
        this.destroyed = true;
    }
}

export default Base
