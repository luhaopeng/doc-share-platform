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
              fileSize = data.fileSize,
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
          $body.find('.author').html("\n              <li>".concat(account, "</li>\n              <li>").concat(enterprise, "</li>\n              <li>").concat(dataTimeDesc, "</li>\n              <li>").concat(fileDataTypeDesc, "</li>\n              <li>").concat(downloadCount, " \u6B21\u4E0B\u8F7D</li>\n              ").concat(parseInt(requiredIntegral) > 0 ? bonus : '', "\n              <li title=\"\u4E0B\u8F7D\" class=\"download\">\n                <i class=\"material-icons\">get_app</i>\n                ").concat(fileSize, " MB\n              </li>\n            ")); // stat
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