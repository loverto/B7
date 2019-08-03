import * as Utils from '@antv/util'
var Util = Utils.mix({}, Utils, {
    assign: Utils.mix,
    merge: Utils.deepMix,
    cloneDeep: Utils.clone,
    isFinite: isFinite,
    isNaN: isNaN,
    snapEqual: Utils.isNumberEqual,
    remove: Utils.pull,
    inArray: Utils.contains,
    toAllPadding: function toAllPadding(padding) {
        var top = 0;
        var left = 0;
        var right = 0;
        var bottom = 0;
        if (Util.isNumber(padding) || Util.isString(padding)) {
            top = left = right = bottom = padding;
        } else if (Util.isArray(padding)) {
            top = padding[0];
            right = !Util.isNil(padding[1]) ? padding[1] : padding[0];
            bottom = !Util.isNil(padding[2]) ? padding[2] : padding[0];
            left = !Util.isNil(padding[3]) ? padding[3] : right;
        } else if (Util.isObject(padding)) {
            top = padding.top || 0;
            right = padding.right || 0;
            bottom = padding.bottom || 0;
            left = padding.left || 0;
        }
        return [
            top,
            right,
            bottom,
            left
        ];
    }
});
Util.Array = {
    groupToMap: Utils.groupToMap,
    group: Utils.group,
    merge: Utils.merge,
    values: Utils.valuesOfKey,
    getRange: Utils.getRange,
    firstValue: Utils.firstValue,
    remove: Utils.pull
};

export default Util;
