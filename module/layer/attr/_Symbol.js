import AttributeBase from "./AttributeBase";

class _Symbol extends AttributeBase{
  constructor(cfg) {
    super(cfg)
    var _this = this;
    _this.names = ['symbol'];
    _this.type = 'symbol';
    _this.gradient = null;
    return _this;
  }
}

export default _Symbol
