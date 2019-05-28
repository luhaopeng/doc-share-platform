"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

;

(function () {
  $(function () {
    initType();
    initDetail();
    initComment();
  });

  function initType() {
    // navbar
    $('nav.navbar .navbar-nav li.nav-item').eq(fileType).addClass('active').siblings().removeClass('active'); // breadcrumb

    var link = "\n      <a href=\"fileData/".concat(fileType === 2 ? 'analysis' : 'base', "FileData\">\n        ").concat(fileType === 2 ? '解析' : '原始', "\u6587\u4EF6\u5E93\n      </a>\n    ");
    $('nav ol.breadcrumb li.breadcrumb-item').eq(0).html(link); // file info

    if (fileType === 2) {
      $('.card .card-body ul.author li').eq(3).text('解析文件');
      $('<li>需 5 积分</li>').insertBefore('.card .card-body ul.author li.download');
    }
  }

  function initDetail() {
    $('.card .star').on('click', function star() {
      var $target = $(this);
      var action = $target.attr('data-toggle');
      var TOAST_OPTION = {
        icon: 'success',
        position: 'bottom-right',
        allowToastClose: false,
        stack: false,
        loader: false,
        hideAfter: 2000,
        textAlign: 'center'
      };

      if (action === 'star') {
        $target.attr({
          'data-toggle': 'unstar',
          title: '取消收藏'
        }).children('.material-icons').text('star');
        $.toast(_objectSpread({
          heading: '收藏成功'
        }, TOAST_OPTION));
      } else if (action === 'unstar') {
        $target.attr({
          'data-toggle': 'star',
          title: '收藏'
        }).children('.material-icons').text('star_border');
        $.toast(_objectSpread({
          heading: '已取消收藏'
        }, TOAST_OPTION));
      }
    });

    if (fileType === 2) {
      $('.card ul.author .download').on('click', function showModal() {
        $('#downloadModal').modal();
      });
      $('#downloadModal #downloadBtn').on('click', function download() {
        $('#downloadModal').modal('hide');
      });
    }
  }

  function initComment() {
    var $publish = $('.card .publish');
    var $textarea = $publish.find('textarea');
    var $send = $publish.find('button.send');
    $send.on('click', function send() {
      var comment = {
        user: '张腾',
        time: moment().format('YYYY-MM-DD HH:mm:ss'),
        content: $textarea.val().trim()
      };
      $('.card ul.comment').prepend(buildComment(comment));
      $textarea.val('');
    });
  }

  function buildComment(obj) {
    return "\n      <li class=\"row\">\n        <div class=\"icon\">\n          <i class=\"material-icons\">face</i>\n        </div>\n        <div class=\"col\">\n          <h4>".concat(obj.user, "</h4>\n          <span>").concat(obj.time, "</span>\n          <p>").concat(obj.content, "</p>\n        </div>\n      </li>\n    ");
  }
})();