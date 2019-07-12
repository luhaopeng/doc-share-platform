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
    var navLink = fileType === 1 ? 'base' : 'analysis';
    $("nav.navbar .navbar-nav .nav-link[href*=\"".concat(navLink, "\"]")).parent().addClass('active').siblings().removeClass('active'); // breadcrumb

    $('nav ol.breadcrumb li.breadcrumb-item').eq(0).html("\n      <a href=\"fileData/".concat(fileType === 2 ? 'analysis' : 'base', "FileData\">\n        ").concat(fileType === 2 ? '解析' : '原始', "\u6587\u4EF6\u5E93\n      </a>\n    "));
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
      $.toast().reset('all');

      if (action === 'star') {
        starFile({
          fileDataId: fileId,
          fileDataType: fileType,
          opsFavoritesType: 1
        }, function () {
          $target.attr({
            'data-toggle': 'unstar',
            title: '取消收藏'
          }).children('.material-icons').text('star');
          $.toast(_objectSpread({
            heading: '收藏成功'
          }, TOAST_OPTION));
        });
      } else if (action === 'unstar') {
        starFile({
          fileDataId: fileId,
          fileDataType: fileType,
          opsFavoritesType: 2
        }, function () {
          $target.attr({
            'data-toggle': 'star',
            title: '收藏'
          }).children('.material-icons').text('star_border');
          $.toast(_objectSpread({
            heading: '已取消收藏'
          }, TOAST_OPTION));
        });
      }
    });
    $('.card ul.author').on('click', '.download', function showModal() {
      // prettier-ignore
      var $downloadModal = $('#downloadModal'); // prettier-ignore

      var targetFile = {
        fileDataId: fileId,
        fileDataType: fileType
      };
      downloadCheck(targetFile, function (data) {
        if (parseInt(data.requiredIntegral, 10)) {
          // confirm modal
          $downloadModal.find('.modal-body').html("\n              \u4F7F\u7528<b class=\"cost\"> ".concat(data.requiredIntegral, " \u79EF\u5206</b>\u4E0B\u8F7D\u6B64\u6587\u4EF6\uFF1F\n              \u5F53\u524D\u79EF\u5206\u4F59\u989D\uFF1A<b class=\"remain\">").concat(data.currentIntegral, " \u79EF\u5206</b>\u3002\n            "));
          $downloadModal.modal();
          $downloadModal.one('click', '#downloadBtn', function () {
            // download
            download(targetFile);
            $downloadModal.modal('hide');
          });
        } else {
          // download
          download(targetFile);
        }
      });
    }).on('click', '.preview', function newTab() {
      var prefix = $('base').attr('href');
      var url = "".concat(prefix, "fileData/queryChartImg?fileDataId=").concat(fileId);
      window.open(url);
    });
    getDetailData();

    function getDetailData() {
      $.post('fileData/queryFileDataDetail', {
        fileDataId: fileId,
        fileDataType: fileType
      }, function (res) {
        handleResult(res, function (data) {
          var fileDataTypeDesc = data.fileDataTypeDesc,
              account = data.account,
              enterprise = data.enterprise,
              fileName = data.fileName,
              fileSizeDesc = data.fileSizeDesc,
              dataTimeDesc = data.dataTimeDesc,
              downloadCount = data.downloadCount,
              favoriteStatus = data.favoriteStatus,
              requiredIntegral = data.requiredIntegral,
              remark = data.remark,
              classOneDesc = data.classOneDesc,
              classTwoDesc = data.classTwoDesc,
              brandDesc = data.brandDesc,
              model = data.model,
              standard = data.standard,
              pattern = data.pattern,
              ratedV = data.ratedV,
              ratedI = data.ratedI,
              ratedP = data.ratedP,
              equipmentBrand = data.equipmentBrand,
              equipmentModel = data.equipmentModel,
              samplingRate = data.samplingRate,
              variableRatio = data.variableRatio,
              unitV = data.unitV,
              unitI = data.unitI; // star

          var $info = $('.card:first-of-type');
          var $body = $info.find('.card-body');
          $info.find('.star').attr({
            title: favoriteStatus === 1 ? '取消收藏' : '收藏',
            'data-toggle': favoriteStatus === 1 ? 'unstar' : 'star'
          }).children('i').text(favoriteStatus === 1 ? 'star' : 'star_border'); // info

          $body.find('.card-title').text(fileName);
          $body.find('.intro').text(remark); // author

          var bonus = "<li>\u9700 ".concat(requiredIntegral, " \u79EF\u5206</li>");
          var preview = "\n              <li title=\"\u9884\u89C8\" class=\"preview\">\n                <i class=\"material-icons\">image</i>\n                \u9884\u89C8\n              </li>\n            ";
          $body.find('.author').html("\n              <li>".concat(account, "</li>\n              <li>").concat(enterprise, "</li>\n              <li>").concat(dataTimeDesc, "</li>\n              <li>").concat(fileDataTypeDesc, "</li>\n              <li>").concat(downloadCount, " \u6B21\u4E0B\u8F7D</li>\n              ").concat(parseInt(requiredIntegral, 10) > 0 ? bonus : '', "\n              ").concat(fileType === 2 ? preview : '', "\n              <li title=\"\u4E0B\u8F7D\" class=\"download\">\n                <i class=\"material-icons\">get_app</i>\n                ").concat(fileSizeDesc, "\n              </li>\n            ")); // stat
          // part 1

          var $part = $body.find('.stat .part');
          var $data1 = $part.eq(0).find('.row .row div:last-child');
          $data1.eq(0).text("".concat(classOneDesc, "/").concat(classTwoDesc));
          $data1.eq(1).text(brandDesc);
          $data1.eq(2).text(model);
          $data1.eq(3).text(standard);
          $data1.eq(4).text(pattern);
          $data1.eq(5).text("".concat(ratedV, "/").concat(ratedI));
          $data1.eq(6).text(ratedP); // part 2

          var $data2 = $part.eq(1).find('.row .row div:last-child');
          $data2.eq(0).text(equipmentBrand);
          $data2.eq(1).text(equipmentModel);
          $data2.eq(2).text(samplingRate);
          $data2.eq(3).text(variableRatio);
          $data2.eq(4).text(unitV);
          $data2.eq(5).text(unitI);
        });
      });
    }
  }

  function initComment() {
    // initial params
    var params = {
      fileDataId: fileId,
      fileDataType: fileType,
      pageNum: 1,
      pageSize: 10
    };
    var $card = $('.card');
    var $commentDiv = $card.find('.comment-list');
    var $comment = $commentDiv.find('ul.comment'); // publish

    var $publish = $card.find('.publish');
    var $textarea = $publish.find('textarea');
    var $send = $publish.find('button.send');
    $send.on('click', function send() {
      comment({
        fileDataId: fileId,
        fileDataType: fileType,
        content: $textarea.val().trim()
      }, function () {
        $textarea.val('');
        params.pageNum = 1;
        getCommentData(params);
      });
    }); // page change

    var $pagination = $commentDiv.find('ul.pagination');
    $pagination.on('click', '.page-item', function () {
      var max = parseInt($pagination.find('.page-item:not(.prev):not(.next)').last().text(), 10);
      var $this = $(this);
      var old = params.pageNum;

      if ($this.hasClass('prev')) {
        params.pageNum = params.pageNum - 1 || 1;
      } else if ($this.hasClass('next')) {
        params.pageNum = (params.pageNum + 1) % (max + 1) || max;
      } else if ($this.hasClass('else')) {// do nothing
      } else {
        params.pageNum = parseInt($this.text(), 10) || 1;
      }

      if (old !== params.pageNum) {
        // reload data
        getCommentData(params);
      }
    });
    getCommentData(params);

    function getCommentData(obj) {
      $.post('account/queryComments', obj, function (res) {
        handleResult(res, function (data) {
          var pageNum = data.pageNum,
              total = data.total,
              pages = data.pages,
              list = data.list; // build list

          $commentDiv.find('.card-title').text("\u8BC4\u8BBA\uFF08".concat(list.length, "\uFF09"));
          $comment.html('');
          list.map(function (v) {
            $comment.append(buildComment({
              user: v.account,
              time: v.commentTimeDes,
              content: v.content
            }));
          }); // build pagination

          buildPage({
            pageNum: pageNum,
            total: total,
            pages: pages
          });
        });
      });
    }

    function buildComment(obj) {
      return "\n        <li class=\"row\">\n          <div class=\"icon\">\n            <i class=\"material-icons\">face</i>\n          </div>\n          <div class=\"col\">\n            <h4>".concat(obj.user, "</h4>\n            <span>").concat(obj.time, "</span>\n            <p>").concat(obj.content, "</p>\n          </div>\n        </li>\n      ");
    }

    function buildPage(options) {
      var $pagination = $comment.siblings('nav').find('ul.pagination');
      $pagination.find('li.page-item:not(.prev):not(.next)').remove();
      var $next = $pagination.find('.page-item.next');
      var max = options.pages;
      var n = options.pageNum;

      if (max <= 10) {
        for (var i = 1; i <= max; ++i) {
          $(page(i, n)).insertBefore($next);
        }
      } else {
        if (n <= 3) {
          // 1, 2, 3, ..., max
          $(page(1, n)).insertBefore($next);
          $(page(2, n)).insertBefore($next);
          $(page(3, n)).insertBefore($next);
          $(page('...', n)).insertBefore($next);
          $(page(max, n)).insertBefore($next);
        } else if (n >= max - 2) {
          // 1, ..., max-2, max-1, max
          $(page(1, n)).insertBefore($next);
          $(page('...', n)).insertBefore($next);
          $(page(max - 2, n)).insertBefore($next);
          $(page(max - 1, n)).insertBefore($next);
          $(page(max, n)).insertBefore($next);
        } else {
          // 1, ..., n-1, n, n+1, ..., max
          $(page(1, n)).insertBefore($next);
          $(page('...', n)).insertBefore($next);
          $(page(n - 1, n)).insertBefore($next);
          $(page(n, n)).insertBefore($next);
          $(page(n + 1, n)).insertBefore($next);
          $(page('...', n)).insertBefore($next);
          $(page(max, n)).insertBefore($next);
        }
      }

      function page(i, cur) {
        // prettier-ignore
        return "\n          <li class=\"page-item ".concat(cur === i ? 'active' : '', " ").concat(i === '...' ? 'else' : '', "\">\n            <a class=\"page-link\">").concat(i, "</a>\n          </li>\n        ");
      }
    }
  }

  function starFile(obj, done) {
    $.post('account/doFavorites', obj, function (res) {
      handleResult(res, done);
    });
  }

  function downloadCheck(obj, done) {
    $.post('fileData/checkFileDownload', obj, function (res) {
      handleResult(res, done);
    });
  }

  function download(obj) {
    var url = $('base').attr('href') + 'fileData/doFileDownload';
    $.fileDownload(url, {
      httpMethod: 'POST',
      data: obj
    });
  }

  function comment(obj, done) {
    $.post('account/doComment', obj, function (res) {
      handleResult(res, done);
    });
  }
})();