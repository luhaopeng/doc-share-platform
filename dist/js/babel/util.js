"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// function qs(str) {
//   let mStr = str.replace(/^\?/, '')
//   let match = mStr.match(/(?<=^|&)([^&=]*=[^&]*)(?=&|$)/gi)
//   let obj = {}
//   match.map(function split(val) {
//     let split = val.split('=')
//     obj[decodeURIComponent(split[0])] = decodeURIComponent(split[1])
//   })
//   return obj
// }
function handleResult(res, callback) {
  if (!res.ret) {
    typeof callback === 'function' && callback(res.data);
  } else {
    toastErr({
      text: res.msg
    });
  }
}

function toastErr(options) {
  var opts = Object.assign({
    heading: '出错了',
    text: '',
    icon: 'error'
  }, options);
  $.toast().reset('all');
  $.toast(_objectSpread({
    position: 'bottom-left',
    allowToastClose: true,
    stack: false,
    loader: false,
    hideAfter: false
  }, opts));
}