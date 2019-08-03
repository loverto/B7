import AttributeBase from "./AttributeBase";

class Opacity extends AttributeBase{

  constructor(cfg) {
    super(cfg)
    var _this = this;
    _this.names = ['opacity'];
    _this.type = 'opacity';
    _this.gradient = null;
    return _this;
  }

}

export default Opacity
