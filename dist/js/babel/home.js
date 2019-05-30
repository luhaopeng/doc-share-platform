"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

;

(function () {
  var TOAST_OPTION = {
    icon: 'success',
    position: 'bottom-right',
    allowToastClose: false,
    stack: false,
    loader: false,
    hideAfter: 2000,
    textAlign: 'center'
  };
  $(function () {
    $('[data-toggle="popover"]').popover();
    $('#downloadModal #downloadBtn').on('click', function download() {
      $('#downloadModal').modal('hide');
    });
    initUserInfo();
    initTable('#table_upload');
    initTable('#table_star', {
      star: function star() {
        var $target = $(this);
        var action = $target.attr('data-toggle');

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
      },
      download: function download() {
        var $tr = $(this).closest('tr'); // TODO use obj.id

        var bonusStr = $tr.find('td:nth-child(8)').text();

        if (parseInt(bonusStr) > 0) {
          $('#downloadModal').modal();
        }
      }
    });
    initTable('#table_bonus');
    initDropdown();
  });

  function initUserInfo() {
    $.post('account/queryAccountInfo', function (res) {
      handleResult(res, function (data) {
        var account = data.account,
            enterprise = data.enterprise,
            integral = data.integral,
            uploadFileCount = data.uploadFileCount,
            beDownloadFileCount = data.beDownloadFileCount;
        var $user = $('.card.user');
        var $header = $user.find('.card-header');
        $header.find('h3').text(account);
        $header.find('h4').text(enterprise);
        var $stats = $user.find('.stats p');
        $stats.eq(0).text(integral);
        $stats.eq(1).text(uploadFileCount);
        $stats.eq(2).text(beDownloadFileCount);
      });
    });
  }

  function initDropdown() {
    var $menu = $('#table_bonus .dropdown .dropdown-menu');
    $menu.html("\n      <a\n        tabindex=\"-1\"\n        data-type=\"0\"\n        class=\"dropdown-item\"\n      >\n        \u5168\u90E8\u7C7B\u578B\n      </a>\n      <div class=\"dropdown-divider\"></div>\n    "); // add items

    var menuList = JSON.parse(bonusMenuStr);
    menuList.map(function (v) {
      $menu.append("\n        <a\n          tabindex=\"-1\"\n          data-type=\"".concat(v.value, "\"\n          class=\"dropdown-item\"\n        >\n          ").concat(v.text, "\n        </a>\n      "));
    });
  }

  function initTable(selector) {
    var actionCB = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    // initial params
    var params = {
      pageNum: 1,
      pageSize: 5,
      integralType: 0 // initial data

    };
    var $table = $(selector);
    var $tbody = $table.find('tbody');
    buildRow(selector, params, $tbody); // rank mark

    var $rank_a = $table.find('a[data-rank]');
    $rank_a.on('click', function () {
      var $cur_a = $(this);
      var rank = $cur_a.attr('data-rank');

      if (rank === 'none') {
        $rank_a.attr('data-rank', 'none').children('i').removeClass('rank-desc').removeClass('rank-asc');
        $cur_a.attr('data-rank', 'desc').children('i').addClass('rank-desc');
      } else {
        var to = rank === 'desc' ? 'asc' : 'desc';
        $cur_a.attr('data-rank', to).children('i').removeClass('rank-' + rank).addClass('rank-' + to);
      }
    }); // limit

    var $nav = $table.siblings('nav');
    var $limit = $nav.find('.limit select');
    $limit.on('change', function limit(e) {
      params.pageNum = 1;
      params.pageSize = parseInt(e.target.value);
      buildRow(selector, params, $tbody);
    }); // page change

    var $pagination = $nav.find('ul.pagination');
    $pagination.on('click', '.page-item', function () {
      var max = parseInt($pagination.find('.page-item:not(.prev):not(.next)').last().text());
      var $this = $(this);
      var old = params.pageNum;

      if ($this.hasClass('prev')) {
        params.pageNum = params.pageNum - 1 || 1;
      } else if ($this.hasClass('next')) {
        params.pageNum = (params.pageNum + 1) % (max + 1) || max;
      } else if ($this.hasClass('else')) {// do nothing
      } else {
        params.pageNum = parseInt($this.text()) || 1;
      }

      if (old !== params.pageNum) {
        buildRow(selector, params, $tbody);
      }
    }); // click

    if (!/bonus/i.test(selector)) {
      $tbody.on('click', 'tr', function detail(e) {
        var tag = e.target.tagName;

        if (/tr|td/i.test(tag)) {
          // prettier-ignore
          var $tr = $(this).closest('tr');
          var id = $tr.attr('data-id');
          var type = $tr.attr('data-type');
          var $form = $("\n          <form\n            action=\"fileData/fileDataDetail\"\n            method=\"post\"\n            target=\"_blank\"\n            rel=\"noopener noreferrer\"\n            style=\"display:none\"\n          >\n            <input name=\"fileDataId\" value=\"".concat(id, "\" />\n            <input name=\"fileDataType\" value=\"").concat(type, "\" />\n          </form>\n        "));
          $(document.body).append($form);
          $form.submit().remove();
        }
      });
    } // td-actions


    if (/star/i.test(selector)) {
      for (var key in actionCB) {
        if (typeof actionCB[key] === 'function') {
          $tbody.on('click', "button[data-action=".concat(key, "]"), actionCB[key]);
        }
      }
    } // dropdown


    if (/bonus/i.test(selector)) {
      $table.find('.dropdown').on('click', '.dropdown-item', function () {
        params.integralType = $(this).attr('data-type');
        buildRow(selector, params, $tbody);
      });
    }
  }

  function buildRow(selector, data, $tbody) {
    if (/upload/i.test(selector)) {
      $tbody.html('');
      getUploads(data, function (res) {
        return res.map(function (v) {
          return $tbody.append(buildUpload(v));
        });
      }, function (page) {
        return buildPage(selector, page);
      });
    } else if (/star/i.test(selector)) {
      $tbody.html('');
      getStars(data, function (res) {
        return res.map(function (v) {
          return $tbody.append(buildStar(v));
        });
      }, function (page) {
        return buildPage(selector, page);
      });
    } else if (/bonus/i.test(selector)) {
      $tbody.html('');
      getBonus(data, function (res) {
        return res.map(function (v) {
          return $tbody.append(buildBonus(v));
        });
      }, function (page) {
        return buildPage(selector, page);
      });
    }
  }

  function buildUpload(obj) {
    return "\n      <tr data-id=\"".concat(obj.id, "\" data-type=\"").concat(obj.type, "\">\n        <td\n          class=\"text-left\"\n          title=\"").concat(obj.title, "\"\n        >\n          <div class=\"text-ellipsis\">").concat(obj.title, "</div>\n        </td>\n        <td>").concat(obj.date, "</td>\n        <td>").concat(obj.size, "</td>\n        <td>").concat(obj.typeStr, "</td>\n        <td>").concat(obj.cate, "</td>\n        <td>").concat(obj.brand, "</td>\n        <td>").concat(obj.state, "</td>\n        <td class=\"text-right\">").concat(obj.download, "</td>\n      </tr>\n    ");
  }

  function buildStar(obj) {
    return "\n      <tr data-id=\"".concat(obj.id, "\" data-type=\"").concat(obj.type, "\">\n        <td\n          class=\"text-left\"\n          title=\"").concat(obj.title, "\"\n        >\n          <div class=\"text-ellipsis\">").concat(obj.title, "</div>\n        </td>\n        <td>").concat(obj.date, "</td>\n        <td>").concat(obj.size, "</td>\n        <td>").concat(obj.typeStr, "</td>\n        <td>").concat(obj.cate, "</td>\n        <td>").concat(obj.brand, "</td>\n        <td>").concat(obj.state, "</td>\n        <td>").concat(obj.bonus, "</td>\n        <td class=\"text-right\">").concat(obj.download, "</td>\n        <td class=\"td-actions text-right\">\n          <button\n            data-action=\"star\"\n            data-toggle=\"").concat(obj.fav ? 'unstar' : 'star', "\"\n            type=\"button\"\n            class=\"btn btn-warning\"\n            title=\"").concat(obj.fav ? '取消' : '', "\u6536\u85CF\"\n          >\n            <i class=\"material-icons\">star").concat(obj.fav ? '' : '_border', "</i>\n          </button>\n          <button\n            data-action=\"download\"\n            type=\"button\"\n            class=\"btn btn-success\"\n            title=\"\u4E0B\u8F7D\"\n          >\n            <i class=\"material-icons\">get_app</i>\n          </button>\n        </td>\n      </tr>\n    ");
  }

  function buildBonus(obj) {
    return "\n      <tr>\n        <td>".concat(obj.time, "</td>\n        <td>").concat(obj.type, "</td>\n        <td>").concat(obj.remark, "</td>\n        <td>").concat(obj.operand, " ").concat(obj.bonus, "</td>\n      </tr>\n    ");
  }

  function buildPage(selector, options) {
    var $pagination = $(selector).siblings('nav').find('ul.pagination');
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
      return "\n        <li class=\"page-item ".concat(cur === i ? 'active' : '', " ").concat(i === '...' ? 'else' : '', "\">\n          <a class=\"page-link\">").concat(i, "</a>\n        </li>\n      ");
    }
  }

  function getUploads(obj, buildFunc, pageFunc) {
    $.post('account/queryMyUploads', obj, function done(res) {
      handleResult(res, function (data) {
        var pageNum = data.pageNum,
            total = data.total,
            pages = data.pages,
            list = data.list;
        var pageObj = {
          pageNum: pageNum,
          total: total,
          pages: pages
        };
        var objs = list.map(function (v) {
          return {
            id: v.fileDataId,
            title: v.fileName,
            date: v.uploadTimeDesc,
            size: v.fileSize + ' MB',
            type: v.fileDataType,
            typeStr: v.fileDataTypeDesc,
            cate: v.classTwoDesc,
            brand: v.brandDesc,
            state: v.fileDataStatusDesc,
            download: v.downloadCount
          };
        });
        typeof buildFunc === 'function' && buildFunc(objs);
        typeof pageFunc === 'function' && pageFunc(pageObj);
      });
    });
  }

  function getStars(obj, buildFunc, pageFunc) {
    $.post('account/queryMyFavorites', obj, function done(res) {
      handleResult(res, function (data) {
        var pageNum = data.pageNum,
            total = data.total,
            pages = data.pages,
            list = data.list;
        var pageObj = {
          pageNum: pageNum,
          total: total,
          pages: pages
        };
        var objs = list.map(function (v) {
          return {
            id: v.fileDataId,
            title: v.fileName,
            date: v.dataTimeDesc,
            size: v.fileSize + ' MB',
            type: v.fileDataType,
            typeStr: v.fileDataTypeDesc,
            cate: v.classTwoDesc,
            brand: v.brandDesc,
            state: v.fileDataStatusDesc,
            bonus: v.requiredIntegral,
            download: v.downloadCount,
            fav: true
          };
        });
        typeof buildFunc === 'function' && buildFunc(objs);
        typeof pageFunc === 'function' && pageFunc(pageObj);
      });
    });
  }

  function getBonus(obj, buildFunc, pageFunc) {
    $.post('account/queryMyIntegrals', obj, function done(res) {
      handleResult(res, function (data) {
        var pageNum = data.pageNum,
            total = data.total,
            pages = data.pages,
            list = data.list;
        var pageObj = {
          pageNum: pageNum,
          total: total,
          pages: pages
        };
        var objs = list.map(function (v) {
          return {
            time: v.addTimeDesc,
            type: v.integralTypeDesc,
            remark: v.description,
            bonus: v.integral,
            operand: parseInt(v.inOutType) === 1 ? '+' : '-'
          };
        });
        typeof buildFunc === 'function' && buildFunc(objs);
        typeof pageFunc === 'function' && pageFunc(pageObj);
      });
    });
  }
})();