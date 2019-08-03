import AttributeBase from "./AttributeBase";
import Util from "../../utils/Util";

class Size extends AttributeBase{
  constructor(cfg) {
    super(cfg)
    var _this = this;
    _this.names = ['size'];
    _this.type = 'size';
    _this.gradient = null;
    _this.domainIndex = 0;
    return _this;
  }

  mapping() {
    var self = this;
    var outputs = [];
    var scales = self.scales;
    if (self.values.length === 0) {
      var callback = this.callback.bind(this);
      outputs.push(callback.apply(void 0, arguments));
    } else {
      if (!Util.isArray(self.values[0])) {
        self.values = [self.values];
      }
      for (var i = 0; i < scales.length; i++) {
        outputs.push(self._scaling(scales[i], arguments[i]));
      }
    }
    this.domainIndex = 0;
    return outputs;
  }

  _scaling(scale, v) {
    if (scale.type === 'identity') {
      return v;
    } else if (scale.type === 'linear') {
      var percent = scale.scale(v);
      return this.getLinearValue(percent);
    }
  }

  getLinearValue(percent) {
    var values = this.values[this.domainIndex];
    var steps = values.length - 1;
    var step = Math.floor(steps * percent);
    var leftPercent = steps * percent - step;
    var start = values[step];
    var end = step === steps ? start : values[step + 1];
    var rstValue = start + (end - start) * leftPercent;
    this.domainIndex += 1;
    return rstValue;
  }
}
export default Size
