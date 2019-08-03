import AttributeBase from "./AttributeBase";

class Filter extends AttributeBase{
  constructor(cfg) {
    super(cfg)
    var _this = this;
    _this.names = ['filter'];
    _this.type = 'filter';
    _this.gradient = null;
    return _this;
  }
}

export default Filter
