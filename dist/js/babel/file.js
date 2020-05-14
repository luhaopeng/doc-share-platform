"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

;

(function () {
  $(function () {
    initDetail();
    initComment();
  });

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
    var $downloadModal = $('#downloadModal');
    $downloadModal.on('hidden.bs.modal', function () {
      $downloadModal.off('click', '#downloadBtn');
    });
    $('.card').on('click', 'ul.author .download, h3.feature .download', function showModal(e) {
      var targetFile = {
        fileDataId: fileId
      };
      var type = $(e.target).attr('data-type');

      if (type === 'feature') {
        targetFile.fileDataType = 3;
      } else {
        targetFile.fileDataType = 1;
      }

      downloadCheck(targetFile, function (data) {
        if (parseInt(data.requiredIntegral, 10)) {
          // confirm modal
          $downloadModal.find('.modal-body').html("\n              \u4F7F\u7528<b class=\"cost\"> ".concat(data.requiredIntegral, " \u79EF\u5206</b>\u4E0B\u8F7D\u6B64\u6587\u4EF6\uFF1F\n              \u5F53\u524D\u79EF\u5206\u4F59\u989D\uFF1A<b class=\"remain\">").concat(data.currentIntegral, " \u79EF\u5206</b>\u3002\n            "));
          $downloadModal.modal();
          $downloadModal.on('click', '#downloadBtn', function () {
            // download
            download(targetFile);
            $downloadModal.modal('hide');
          });
        } else {
          // download
          download(targetFile);
        }
      });
    }).on('click', 'ul.author .preview', function newTab() {
      var prefix = $('base').attr('href');
      var url = "".concat(prefix, "fileData/queryChartImg?fileDataId=").concat(fileId);
      window.open(url);
    });
    getDetailData();

    function getDetailData() {
      $.post('fileData/queryFileDataDetail', {
        fileDataId: fileId
      }, function (res) {
        handleResult(res, function (data) {
          var account = data.account,
              enterprise = data.enterprise,
              fileName = data.fileName,
              fileSizeDesc = data.fileSizeDesc,
              dataTimeDesc = data.dataTimeDesc,
              downloadCount = data.downloadCount,
              fileDataStatus = data.fileDataStatus,
              fileDataStatusDesc = data.fileDataStatusDesc,
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
          var preview;

          if (parseInt(fileDataStatus, 10) === 2) {
            preview = "\n                <li title=\"\u9884\u89C8\" class=\"preview\">\n                  <i class=\"material-icons\">image</i>\n                  \u9884\u89C8\n                </li>\n              "; // feature

            $body.append(buildFeature(data));
          } else {
            preview = "<li>".concat(fileDataStatusDesc, "</li>");
          }

          $body.find('.author').html("\n              <li>".concat(account, "</li>\n              <li>").concat(enterprise, "</li>\n              <li>").concat(dataTimeDesc, "</li>\n              <li>").concat(downloadCount, " \u6B21\u4E0B\u8F7D</li>\n              ").concat(parseInt(requiredIntegral, 10) > 0 ? bonus : '', "\n              ").concat(preview, "\n              <li title=\"\u4E0B\u8F7D\" class=\"download\">\n                <i class=\"material-icons\">get_app</i>\n                ").concat(fileSizeDesc, "\n              </li>\n            ")); // stat
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

  function buildFeature(obj) {
    var openmaxpStr = obj.openmaxpStr,
        openmaxqStr = obj.openmaxqStr,
        openminpStr = obj.openminpStr,
        openminqStr = obj.openminqStr,
        closemaxpStr = obj.closemaxpStr,
        closemaxqStr = obj.closemaxqStr,
        closeminpStr = obj.closeminpStr,
        closeminqStr = obj.closeminqStr,
        basecurrentStr = obj.basecurrentStr,
        xb1realStr = obj.xb1realStr,
        xb1imaginaryStr = obj.xb1imaginaryStr,
        xb2realStr = obj.xb2realStr,
        xb2imaginaryStr = obj.xb2imaginaryStr,
        xb3realStr = obj.xb3realStr,
        xb3imaginaryStr = obj.xb3imaginaryStr,
        xb4realStr = obj.xb4realStr,
        xb4imaginaryStr = obj.xb4imaginaryStr,
        xb5realStr = obj.xb5realStr,
        xb5imaginaryStr = obj.xb5imaginaryStr,
        xb6realStr = obj.xb6realStr,
        xb6imaginaryStr = obj.xb6imaginaryStr,
        xb7realStr = obj.xb7realStr,
        xb7imaginaryStr = obj.xb7imaginaryStr,
        xb8realStr = obj.xb8realStr,
        xb8imaginaryStr = obj.xb8imaginaryStr,
        xb9realStr = obj.xb9realStr,
        xb9imaginaryStr = obj.xb9imaginaryStr,
        xb10realStr = obj.xb10realStr,
        xb10imaginaryStr = obj.xb10imaginaryStr,
        xb11realStr = obj.xb11realStr,
        xb11imaginaryStr = obj.xb11imaginaryStr;
    return "\n      <h3 class=\"feature\">\n        \u7279\u5F81\u91CF\u53C2\u6570\n        <button\n          data-type=\"feature\"\n          type=\"button\"\n          style=\"padding-left: 0.5rem;padding-right: 0.5rem;\"\n          class=\"btn btn-sm btn-success download\"\n          title=\"\u4E0B\u8F7D\"\n        >\n          <i class=\"material-icons\">get_app</i>\n        </button>\n      </h3>\n      <div class=\"container-fluid stat\">\n        <div class=\"part\">\n          <h4>\u6682\u6001</h4>\n          <div class=\"row\">\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u6682\u6001\u5F00\u542F\u6700\u5927\u6709\u529F\u529F\u7387(W)</div>\n                <div class=\"col-sm-5\">".concat(openmaxpStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u6682\u6001\u5F00\u542F\u6700\u5927\u65E0\u529F\u529F\u7387(Var)</div>\n                <div class=\"col-sm-5\">").concat(openmaxqStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u6682\u6001\u5F00\u542F\u6700\u5C0F\u6709\u529F\u529F\u7387(W)</div>\n                <div class=\"col-sm-5\">").concat(openminpStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u6682\u6001\u5F00\u542F\u6700\u5C0F\u65E0\u529F\u529F\u7387(Var)</div>\n                <div class=\"col-sm-5\">").concat(openminqStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u6682\u6001\u5173\u95ED\u6700\u5927\u6709\u529F\u529F\u7387(W)</div>\n                <div class=\"col-sm-5\">").concat(closemaxpStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u6682\u6001\u5173\u95ED\u6700\u5927\u65E0\u529F\u529F\u7387(Var)</div>\n                <div class=\"col-sm-5\">").concat(closemaxqStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u6682\u6001\u5173\u95ED\u6700\u5C0F\u6709\u529F\u529F\u7387(W)</div>\n                <div class=\"col-sm-5\">").concat(closeminpStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u6682\u6001\u5173\u95ED\u6700\u5C0F\u65E0\u529F\u529F\u7387(Var)</div>\n                <div class=\"col-sm-5\">").concat(closeminqStr, "</div>\n              </div>\n            </div>\n          </div>\n        </div>\n        <div class=\"part\">\n          <h4>\u7A33\u6001</h4>\n          <div class=\"row\">\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u4E00\u6B21\u8C10\u6CE2\u5B9E\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb1realStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u4E00\u6B21\u8C10\u6CE2\u865A\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb1imaginaryStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u4E8C\u6B21\u8C10\u6CE2\u5B9E\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb2realStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u4E8C\u6B21\u8C10\u6CE2\u865A\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb2imaginaryStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u4E09\u6B21\u8C10\u6CE2\u5B9E\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb3realStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u4E09\u6B21\u8C10\u6CE2\u865A\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb3imaginaryStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u56DB\u6B21\u8C10\u6CE2\u5B9E\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb4realStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u56DB\u6B21\u8C10\u6CE2\u865A\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb4imaginaryStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u4E94\u6B21\u8C10\u6CE2\u5B9E\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb5realStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u4E94\u6B21\u8C10\u6CE2\u865A\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb5imaginaryStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u516D\u6B21\u8C10\u6CE2\u5B9E\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb6realStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u516D\u6B21\u8C10\u6CE2\u865A\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb6imaginaryStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u4E03\u6B21\u8C10\u6CE2\u5B9E\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb7realStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u4E03\u6B21\u8C10\u6CE2\u865A\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb7imaginaryStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u516B\u6B21\u8C10\u6CE2\u5B9E\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb8realStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u516B\u6B21\u8C10\u6CE2\u865A\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb8imaginaryStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u4E5D\u6B21\u8C10\u6CE2\u5B9E\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb9realStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u4E5D\u6B21\u8C10\u6CE2\u865A\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb9imaginaryStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u5341\u6B21\u8C10\u6CE2\u5B9E\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb10realStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u5341\u6B21\u8C10\u6CE2\u865A\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb10imaginaryStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u5341\u4E00\u6B21\u8C10\u6CE2\u5B9E\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb11realStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u5341\u4E00\u6B21\u8C10\u6CE2\u865A\u90E8</div>\n                <div class=\"col-sm-5\">").concat(xb11imaginaryStr, "</div>\n              </div>\n            </div>\n            <div class=\"col-sm-3\">\n              <div class=\"row\">\n                <div class=\"col-sm-7\">\u57FA\u6CE2\u7535\u6D41</div>\n                <div class=\"col-sm-5\">").concat(basecurrentStr, "</div>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    ");
  }

  function initComment() {
    // initial params
    var params = {
      fileDataId: fileId,
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
        content: $textarea.val().trim()
      }, function () {
        $textarea.val('');
        params.pageNum = 1;
        getCommentData(params);
      });
    }); // delete comment

    $comment.on('click', '.del', function (e) {
      var id = $(e.target).closest('li').attr('data-id');
      delComment({
        commentId: id
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
              id: v.id,
              user: v.account,
              time: v.commentTimeDes,
              content: v.content,
              removeable: !!parseInt(v.flag, 10)
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

    function delComment(obj) {
      $.post('account/doDelComment', obj, function (res) {
        handleResult(res, function () {
          getCommentData(params);
        });
      });
    }

    function buildComment(obj) {
      var delSpan = '';

      if (obj.removeable) {
        delSpan = '<span class="del">删除</span>';
      }

      return "\n        <li class=\"row\" data-id=\"".concat(obj.id, "\">\n          <div class=\"icon\">\n            <i class=\"material-icons\">face</i>\n          </div>\n          <div class=\"col\">\n            <h4>").concat(obj.user, "</h4>\n            <div>\n              <span>").concat(obj.time, "</span>").concat(delSpan, "\n            </div>\n            <p>").concat(obj.content, "</p>\n          </div>\n        </li>\n      ");
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