import * as Util from "./Util";

var RGB_REG = /rgba?\(([\s.,0-9]+)\)/;
function createTmp() {
  var i = document.createElement('i');
  i.title = 'Web Colour Picker';
  i.style.display = 'none';
  document.body.appendChild(i);
  return i;
}
function getValue(start, end, percent, index) {
  var value = start[index] + (end[index] - start[index]) * percent;
  return value;
}
function calColor(colors, percent) {
  if (Util.isNaN(percent) || !Util.isNumber(percent)) {
    percent = 0;
  }
  var steps = colors.length - 1;
  var step = Math.floor(steps * percent);
  var left = steps * percent - step;
  var start = colors[step];
  var end = step === steps ? start : colors[step + 1];
  return [
    getValue(start, end, left, 0),
    getValue(start, end, left, 1),
    getValue(start, end, left, 2),
    getValue(start, end, left, 3)
  ];
}
function rgb2arr(str) {
  var arr = [];
  arr.push(parseInt(str.substr(1, 2), 16));
  arr.push(parseInt(str.substr(3, 2), 16));
  arr.push(parseInt(str.substr(5, 2), 16));
  return arr;
}
var colorCache = {};
var iEl = null;
var ColorUtil = {
  toRGB: function toRGB(color) {
    if (color[0] === '#' && color.length === 7) {
      var colorArray = rgb2arr(color);
      colorArray.push(255);
      return colorArray;
    }
    if (!iEl) {
      iEl = createTmp();
    }
    var rst;
    if (colorCache[color]) {
      rst = colorCache[color];
    } else {
      iEl.style.color = color;
      rst = document.defaultView.getComputedStyle(iEl, '').getPropertyValue('color');
      var matchs = RGB_REG.exec(rst);
      var cArray = matchs[1].split(/\s*,\s*/);
      if (cArray.length === 4) {
        cArray[3] *= 255;
      }
      if (cArray.length === 3) {
        cArray.push(255);
      }
      colorCache[color] = cArray;
      rst = cArray;
    }
    return rst;
  },
  color2Arr: function color2Arr(str) {
    var rgba = this.toRGB(str);
    return rgba.map(function (v) {
      return v / 255;
    });
  },
  color2RGBA: function color2RGBA(str) {
    return this.color2Arr(str);
  },
  rgb2arr: rgb2arr,
  gradient: function gradient(colors) {
    var points = [];
    if (Util.isString(colors)) {
      colors = colors.split('-');
    }
    Util.each(colors, function (color) {
      var colorArray = ColorUtil.toRGB(color).map(function (e) {
        return e / 255;
      });
      points.push(colorArray);
    });
    return function (percent) {
      return calColor(points, percent);
    };
  }
};
export default ColorUtil
