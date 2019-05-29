"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

;

(function () {
  $(function () {
    initFilter();
    initRank();
  });

  function initFilter() {
    var $combine = $('.filter .combine');
    var $condition = $('.filter .condition');
    $combine.on('click', '.factor', function cancel() {
      var $target = $(this);
      var cat = $target.attr('data-cat');
      $condition.children(".row[data-cat=".concat(cat, "]")).show();
      $target.remove();
    }).on('click', '.reset', function reset() {
      $condition.children('.row[data-cat]').show();
      $combine.children('.factor').remove();
    });
    $condition.on('click', '.row:not(.multi) .value a', function filter() {
      var $target = $(this);
      var $row = $target.closest('.row[data-cat]');
      var cat = $row.attr('data-cat');
      var val = $target.text();
      $(buildFactor(cat, val)).insertBefore('.filter .combine .reset');
      $row.hide();
    }).on('click', '.row.multi .value li', function select() {
      var $target = $(this);
      $target.closest('li').toggleClass('active');
    }).on('click', '.extra .multi', function multi() {
      var $target = $(this);
      $target.closest('.row[data-cat]').addClass('multi');
    }).on('click', '.extra .submit', function submit() {
      var $target = $(this);
      var $row = $target.closest('.row.multi[data-cat]');
      var $active = $row.find('.value li.active');
      var cat = $row.attr('data-cat');
      var comb = '';
      $active.text(function combine(idx, val) {
        comb += (idx ? ',' : '') + val;
      });

      if (comb) {
        $(buildFactor(cat, comb)).insertBefore('.filter .combine .reset');
        $row.hide();
      }

      $row.removeClass('multi');
      $active.removeClass('active');
    }).on('click', '.extra .cancel', function cancel() {
      var $target = $(this);
      var $row = $target.closest('.row.multi[data-cat]');
      var $active = $row.find('.value li.active');
      $row.removeClass('multi');
      $active.removeClass('active');
    });
  }

  function initRank() {
    // initial params
    var params = {
      pageNum: 1,
      pageSize: 5,
      fileDataType: 1,
      sortType: 1,
      keyWord: '',
      classOne: '',
      classTwo: '',
      brand: ''
    };
    var $table = $('#table_origin');
    var $tbody = $table.find('tbody'); // initial data

    getRankData(params, $tbody); // rank mark

    var $rank_a = $table.find('a[data-rank]');
    $rank_a.on('click', function () {
      var $cur_a = $(this);
      var rank = $cur_a.attr('data-rank');

      if (rank === 'none') {
        $rank_a.attr('data-rank', 'none').children('i').removeClass('rank-desc').removeClass('rank-asc');
        $cur_a.attr('data-rank', 'desc').children('i').addClass('rank-desc');
        params.sortType = $cur_a.attr('data-type'); // reload data

        getRankData(params, $tbody);
      }
    }); // limit

    var $nav = $table.siblings('nav');
    var $limit = $nav.find('.limit select');
    $limit.on('change', function limit(e) {
      params.pageSize = parseInt(e.target.value); // reload data

      getRankData(params, $tbody);
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
        // reload data
        getRankData(params, $tbody);
      }
    }); // search

    var $search = $table.siblings('.search');
    $search.on('change', '.search-box', function () {
      // prettier-ignore
      params.keyWord = $(this).val().trim();
    }).on('click', '.search-btn', function () {
      // reload data
      getRankData(params, $tbody);
    }).on('keydown', '.search-box', function (e) {
      if (e.keyCode == 13) {
        // prettier-ignore
        params.keyWord = $(this).val().trim(); // reload data

        getRankData(params, $tbody);
      }
    }); // click

    $tbody.on('click', 'tr', function detail(e) {
      var tag = e.target.tagName;

      if (/tr|td/i.test(tag)) {
        // prettier-ignore
        var id = $(this).closest('tr').attr('data-id');
        var $form = $("\n          <form\n            action=\"fileData/fileDataDetail\"\n            method=\"post\"\n            target=\"_blank\"\n            rel=\"noopener noreferrer\"\n            style=\"display:none\"\n          >\n            <input name=\"fileDataId\" value=\"".concat(id, "\" />\n            <input name=\"fileDataType\" value=\"1\" />\n          </form>\n        "));
        $(document.body).append($form);
        $form.submit().remove();
      }
    });
    $tbody.on('click', 'button[data-action=star]', function star() {
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
  }

  function buildFactor(cat, value) {
    var translate;

    switch (cat) {
      case 'brand':
        translate = '品牌';
        break;

      case 'type':
        translate = '设备类型';
        break;

      default:
        translate = '';
    }

    var em = value;

    if (em.length > 7) {
      em = em.substr(0, 7) + '...';
    }

    return "\n      <a\n        class=\"factor\"\n        title=\"".concat(value, "\"\n        data-cat=\"").concat(cat, "\"\n      >\n        <b>").concat(translate, "\uFF1A</b>\n        <em>").concat(em, "</em>\n        <i class=\"material-icons\">close</i>\n      </a>\n    ");
  }

  function buildRankRow(obj) {
    return "\n      <tr data-id=\"".concat(obj.id, "\">\n        <td\n          class=\"text-left\"\n          title=\"").concat(obj.title, "\"\n        >\n          <div class=\"text-ellipsis\">").concat(obj.title, "</div>\n        </td>\n        <td>").concat(obj.date, "</td>\n        <td>").concat(obj.size, "</td>\n        <td>").concat(obj.type, "</td>\n        <td>").concat(obj.cate, "</td>\n        <td>").concat(obj.brand, "</td>\n        <td title=\"").concat(obj.company, "\">").concat(obj.company.substr(0, 4), "</td>\n        <td>").concat(obj.state, "</td>\n        <td class=\"text-right\">").concat(obj.download, "</td>\n        <td class=\"td-actions text-right\">\n          <button\n            data-action=\"star\"\n            data-toggle=\"").concat(obj.fav ? 'unstar' : 'star', "\"\n            type=\"button\"\n            class=\"btn btn-warning\"\n            title=\"").concat(obj.fav ? '取消' : '', "\u6536\u85CF\"\n          >\n            <i class=\"material-icons\">star").concat(obj.fav ? '' : '_border', "</i>\n          </button>\n          <button\n            data-action=\"download\"\n            type=\"button\"\n            class=\"btn btn-success\"\n            title=\"\u4E0B\u8F7D\"\n          >\n            <i class=\"material-icons\">get_app</i>\n          </button>\n        </td>\n      </tr>\n    ");
  }

  function buildPage(options) {
    var $pagination = $('#table_origin').siblings('nav').find('ul.pagination');
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

  function getRankData(obj, $tbody) {
    $.post('fileData/queryFileData', obj, function (res) {
      handleResult(res, function (data) {
        // build table
        $tbody.html('');
        data.list.map(function (file) {
          $tbody.append(buildRankRow({
            id: file.fileDataId,
            title: file.fileName,
            date: file.dataTimeDesc,
            size: file.fileSize + 'MB',
            type: file.fileDataTypeDesc,
            cate: file.classTwoDesc,
            brand: file.brandDesc,
            company: file.enterprise,
            state: file.fileDataStatusDesc,
            download: file.downloadCount,
            fav: false // TODO

          }));
        }); // build pagination

        var pageNum = data.pageNum,
            total = data.total,
            pages = data.pages;
        buildPage({
          pageNum: pageNum,
          total: total,
          pages: pages
        });
      });
    });
  }
})();