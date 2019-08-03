'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports['fill'] = fill;
exports['extrude'] = extrude;
exports['line'] = line;
exports['extrudeline'] = extrudeline;
var __WEBPACK_IMPORTED_MODULE_0__extrude__ = require('./Extrude');
function fill(points) {
  return Object(__WEBPACK_IMPORTED_MODULE_0__extrude__['a'])(points, false);
}
function extrude(points) {
  return Object(__WEBPACK_IMPORTED_MODULE_0__extrude__['a'])(points, true);
}
function line(points) {
  var vertIndex = [];
  var vertCount = points[0].length - 1;
  for (var i = 0; i < vertCount; i++) {
    vertIndex.push(i, i + 1);
  }
  vertIndex.push(vertCount, 0);
  return {
    positions: points[0],
    positionsIndex: vertIndex
  };
}
function extrudeline(points) {
  var positions = [];
  points[0].forEach(function (p) {
    positions.push([
      p[0],
      p[1],
      0
    ]);
  });
  points[0].forEach(function (p) {
    positions.push([
      p[0],
      p[1],
      1
    ]);
  });
  var vertIndex = [];
  var pointCount = points[0].length;
  var vertCount = pointCount - 1;
  for (var i = 0; i < vertCount; i++) {
    vertIndex.push(i, i + 1);
    vertIndex.push(i + pointCount, i + 1 + pointCount);
    vertIndex.push(i, i + pointCount);
  }
  vertIndex.push(vertCount, 0);
  vertIndex.push(vertCount, vertCount + pointCount);
  vertIndex.push(vertCount + pointCount, pointCount);
  return {
    positions: positions,
    positionsIndex: vertIndex
  };
}
