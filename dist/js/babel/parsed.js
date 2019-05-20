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
    var $table = $('#table_parsed'); // rank mark

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
    }); // data

    var $tbody = $table.find('tbody');

    for (var i = 0; i < 5; i++) {
      $tbody.append(buildRankRow(randFile()));
    } // limit


    var $limit = $('.result nav .limit select');
    $limit.on('change', function limit(e) {
      var pageSize = parseInt(e.target.value);
      $tbody.html('');

      for (var _i = 0; _i < pageSize; _i++) {
        $tbody.append(buildRankRow(randFile()));
      }
    }); // click

    $tbody.on('click', 'tr', function detail(e) {
      var tag = e.target.tagName;

      if (/tr|td/i.test(tag)) {
        // prettier-ignore
        var id = $(this).closest('tr').attr('data-id');
        window.location.href = "file.html?file=".concat(id, "&type=parsed");
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
    }).on('click', 'button[data-action=download]', function download() {
      $('#downloadModal').modal();
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
    return "\n      <tr data-id=\"".concat(obj.id, "\">\n        <td\n          class=\"text-left\"\n          title=\"").concat(obj.title, "\"\n        >\n          <div class=\"text-ellipsis\">").concat(obj.title, "</div>\n        </td>\n        <td>").concat(obj.date, "</td>\n        <td>").concat(obj.size, "</td>\n        <td>").concat(obj.type, "</td>\n        <td>").concat(obj.cate, "</td>\n        <td>").concat(obj.brand, "</td>\n        <td title=\"").concat(obj.company, "\">").concat(obj.company.substr(0, 4), "</td>\n        <td>").concat(obj.bonus, "</td>\n        <td class=\"text-right\">").concat(obj.download, "</td>\n        <td class=\"td-actions text-right\">\n          <button\n            data-action=\"star\"\n            data-toggle=\"").concat(obj.fav ? 'unstar' : 'star', "\"\n            type=\"button\"\n            class=\"btn btn-warning\"\n            title=\"").concat(obj.fav ? '取消' : '', "\u6536\u85CF\"\n          >\n            <i class=\"material-icons\">star").concat(obj.fav ? '' : '_border', "</i>\n          </button>\n          <button\n            data-action=\"download\"\n            type=\"button\"\n            class=\"btn btn-success\"\n            title=\"\u4E0B\u8F7D\"\n          >\n            <i class=\"material-icons\">get_app</i>\n          </button>\n        </td>\n      </tr>\n    ");
  }

  function randFile() {
    var titles = ['常见react面试题汇总（适合中级前端）', 'SSM主流框架入门与综合项目实战', 'Java开发企业级权限管理系统', 'Linux随机密码'];
    var dates = ['2019-05-09', '2019-05-08', '2019-05-07'];
    var cates = ['电脑', '空调', '热水器', '冰箱'];
    var brands = ['海尔', '格力', '美的', '西门子', '三星', '松下'];
    var companys = ['华立科技股份有限公司', '威盛集团有限公司', '江苏林洋能源有限公司', '深圳市科陆电子科技股份有限公司'];
    var favs = [true, false];
    return {
      id: parseInt(Math.random() * 100),
      title: rand(titles),
      date: rand(dates),
      size: (Math.random() * 100).toFixed(2) + 'MB',
      type: '解析文件',
      cate: rand(cates),
      brand: rand(brands),
      company: rand(companys),
      bonus: 5,
      download: parseInt(Math.random() * 100),
      fav: rand(favs)
    };
  }

  function rand(arr) {
    return arr[Math.random() * arr.length | 0];
  }
})();