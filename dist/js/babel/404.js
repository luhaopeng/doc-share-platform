"use strict";

;

(function () {
  $(function () {
    PnF.fragment('.fragment-container', {
      homeUrl: './admin.html',
      homeLabel: '回到首页',
      layers: [{
        offset: 50,
        fragments: '页面不存在'.split(''),
        color: 'palevioletred'
      }, {
        offset: 25,
        fragments: 35,
        color: 'burlywood'
      }, {
        offset: 12,
        fragments: 55,
        color: 'powderblue'
      }]
    });
  });
})();