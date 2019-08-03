import ColorUtil from "../../utils/ColorUtil";
import AttributeBase from "./AttributeBase";
import Util from "../../utils/Util";

class Color extends AttributeBase{
  constructor(cfg) {
    super(cfg)
    var _this = this;
    _this.names = ['color'];
    _this.type = 'color';
    _this.gradient = null;
    if (Util.isString(_this.values)) {
      _this.linear = true;
    }
    return _this;
  }

  getLinearValue(percent) {
    var gradient = this.gradient;
    if (!gradient) {
      var values = this.values;
      gradient = ColorUtil.gradient(values);
      this.gradient = gradient;
    }
    var color = gradient(percent);
    return color;
  }
}

export default Color
