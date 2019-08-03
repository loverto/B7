import AttributeBase from "./AttributeBase";

class Shape extends AttributeBase{
  constructor(cfg) {
    super(cfg)
    var _this = this;
    _this.names = ['shape'];
    _this.type = 'shape';
    _this.gradient = null;
    return _this;
  }

  getLinearValue(percent) {
    var values = this.values;
    var index = Math.round((values.length - 1) * percent);
    return values[index];
  }

  _getAttrValue(scale, value) {
    if (this.values === 'text') {
      return value;
    }
    var values = this.values;
    if (scale.isCategory && !this.linear) {
      var index = scale.translate(value);
      return values[index % values.length];
    }
    var percent = scale.scale(value);
    return this.getLinearValue(percent);
  }
}

export default Shape
