"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

;

(function () {
  $(function () {
    $('[data-toggle="popover"]').popover();
    initRank();
  });

  function initRank() {
    initTable('#table_upload');
    initTable('#table_star', true);
    initTableBonus();
  }

  function initTable(selector, isStar) {
    var $table = $(selector); // rank mark

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
      $tbody.append(buildRankRow(randFile(isStar), isStar));
    } // limit


    var $limit = $(".result ".concat(selector, " + nav .limit select"));
    $limit.on('change', function limit(e) {
      var pageSize = parseInt(e.target.value);
      $tbody.html('');

      for (var _i = 0; _i < pageSize; _i++) {
        $tbody.append(buildRankRow(randFile(isStar), isStar));
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

    if (isStar) {
      $('#downloadModal #downloadBtn').on('click', function download() {
        $('#downloadModal').modal('hide');
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
        var $tr = $(this).closest('tr'); // TODO use obj.id

        var bonusStr = $tr.find('td:nth-child(8)').text();

        if (parseInt(bonusStr) > 0) {
          $('#downloadModal').modal();
        }
      });
    }
  }

  function initTableBonus() {
    // data
    var $tbody = $('#table_bonus tbody');

    for (var i = 0; i < 5; i++) {
      $tbody.append(buildBonusRow(randBonus()));
    } // limit


    var $limit = $('.result #table_bonus + nav .limit select');
    $limit.on('change', function limit(e) {
      var pageSize = parseInt(e.target.value);
      $tbody.html('');

      for (var _i2 = 0; _i2 < pageSize; _i2++) {
        $tbody.append(buildBonusRow(randBonus()));
      }
    });
  }

  function buildRankRow(obj, isStar) {
    var action = "\n      <td class=\"td-actions text-right\">\n        <button\n          data-action=\"star\"\n          data-toggle=\"".concat(obj.fav ? 'unstar' : 'star', "\"\n          type=\"button\"\n          class=\"btn btn-warning\"\n          title=\"").concat(obj.fav ? '取消' : '', "\u6536\u85CF\"\n        >\n          <i class=\"material-icons\">star").concat(obj.fav ? '' : '_border', "</i>\n        </button>\n        <button\n          data-action=\"download\"\n          type=\"button\"\n          class=\"btn btn-success\"\n          title=\"\u4E0B\u8F7D\"\n        >\n          <i class=\"material-icons\">get_app</i>\n        </button>\n      </td>\n    ");
    return "\n      <tr data-id=\"".concat(obj.id, "\">\n        <td\n          class=\"text-left\"\n          title=\"").concat(obj.title, "\"\n        >\n          <div class=\"text-ellipsis\">").concat(obj.title, "</div>\n        </td>\n        <td>").concat(obj.date, "</td>\n        <td>").concat(obj.size, "</td>\n        <td>").concat(obj.type, "</td>\n        <td>").concat(obj.cate, "</td>\n        <td>").concat(obj.brand, "</td>\n        <td>").concat(obj.state, "</td>\n        ").concat(isStar ? "<td>".concat(obj.bonus, "</td>") : '', "\n        <td class=\"text-right\">").concat(obj.download, "</td>\n        ").concat(isStar ? action : '', "\n      </tr>\n    ");
  }

  function randFile(isStar) {
    var titles = ['常见react面试题汇总（适合中级前端）', 'SSM主流框架入门与综合项目实战', 'Java开发企业级权限管理系统', 'Linux随机密码'];
    var dates = ['2019-05-09', '2019-05-08', '2019-05-07'];
    var cates = ['电脑', '空调', '热水器', '冰箱'];
    var brands = ['海尔', '格力', '美的', '西门子', '三星', '松下'];
    var states = ['已解析', '未解析'];
    var objs = [{
      type: '原始文件',
      bonus: 0
    }, {
      type: '解析文件',
      bonus: 5
    }];
    var obj = rand(objs);
    return {
      id: parseInt(Math.random() * 100),
      title: rand(titles),
      date: rand(dates),
      size: (Math.random() * 100).toFixed(2) + 'MB',
      type: isStar ? obj.type : '原始文件',
      cate: rand(cates),
      brand: rand(brands),
      state: rand(states),
      bonus: obj.bonus,
      download: parseInt(Math.random() * 100),
      fav: true
    };
  }

  function buildBonusRow(obj) {
    return "\n      <tr>\n        <td>".concat(obj.time, "</td>\n        <td>").concat(obj.type, "</td>\n        <td>").concat(obj.remark, "</td>\n        <td>").concat(obj.operand, " ").concat(obj.bonus, "</td>\n      </tr>\n    ");
  }

  function randBonus() {
    var timeArr = ['2019-05-21 15:47:12', '2019-05-21 12:30:13', '2019-05-21 08:19:53'];
    var titles = ['常见react面试题汇总（适合中级前端）', 'SSM主流框架入门与综合项目实战', 'Java开发企业级权限管理系统', 'Linux随机密码']; // prettier-ignore

    var types = [{
      type: '文件上传',
      remark: "\u4E0A\u4F20\u6587\u4EF6\"".concat(rand(titles), "\""),
      bonus: 2,
      operand: '+'
    }, {
      type: '文件被收藏',
      remark: "\u6587\u4EF6\"".concat(rand(titles), "\"\u88AB\u7528\u6237\u6536\u85CF"),
      bonus: 1,
      operand: '+'
    }, {
      type: '下载文件',
      remark: "\u4E0B\u8F7D\u6587\u4EF6\"".concat(rand(titles), "\""),
      bonus: 5,
      operand: '-'
    }, {
      type: '文件入库',
      remark: "\u6587\u4EF6\"".concat(rand(titles), "\"\u6210\u529F\u5165\u5E93"),
      bonus: 1,
      operand: '+'
    }, {
      type: '评论文件',
      remark: "\u8BC4\u8BBA\u6587\u4EF6\"".concat(rand(titles), "\""),
      bonus: 1,
      operand: '+'
    }];
    return _objectSpread({
      time: rand(timeArr)
    }, rand(types));
  }

  function rand(arr) {
    return arr[Math.random() * arr.length | 0];
  }
})();