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