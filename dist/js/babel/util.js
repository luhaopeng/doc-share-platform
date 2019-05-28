"use strict";

function qs(str) {
  var mStr = str.replace(/^\?/, '');
  var match = mStr.match(/(?<=^|&)([^&=]*=[^&]*)(?=&|$)/gi);
  var obj = {};
  match.map(function split(val) {
    var split = val.split('=');
    obj[decodeURIComponent(split[0])] = decodeURIComponent(split[1]);
  });
  return obj;
}

function handleResult(res, callback) {
  if (!res.ret) {
    typeof callback === 'function' && callback(res.data);
  } else {
    $.toast({
      heading: '出错了',
      text: res.msg,
      icon: 'error',
      position: 'bottom-left',
      allowToastClose: true,
      stack: false,
      loader: false,
      hideAfter: false
    });
  }
}