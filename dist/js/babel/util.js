"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

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