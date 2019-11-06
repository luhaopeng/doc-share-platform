"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

;

(function () {
  // initial params
  var params = {
    pageNum: 1,
    pageSize: 5,
    sortType: 1,
    keyWord: '',
    classOne: 0,
    classTwo: 0,
    status: 0,
    brands: []
  };

  if (!sessionStorage.readFileList) {
    sessionStorage.readFileList = JSON.stringify([]);
  }

  $(function () {
    initFilter();
    initRank();
  });

  function initFilter() {
    // parse filter obj
    var filterObj = JSON.parse(filterObjStr);
    var brands = filterObj.BRAND.map(function (obj) {
      return {
        id: obj.value,
        label: obj.name
      };
    });
    var categories = filterObj.CLASS_ONE.map(function (obj) {
      var children = obj.childrens.map(function (child) {
        return {
          id: child.value,
          label: child.name
        };
      });
      return {
        id: obj.value,
        label: obj.name,
        children: children
      };
    });
    var filterStatus = JSON.parse(filterStatusStr);
    var statuses = filterStatus.map(function (obj) {
      return {
        id: obj.value,
        label: obj.name
      };
    }); // build conditions

    var $combine = $('.filter .combine');
    var $condition = $('.filter .condition');
    $condition.html('').append(buildCondition({
      cat: 'brand',
      catStr: '品牌',
      options: brands,
      multi: true
    })).append(buildCondition({
      cat: 'type',
      catStr: '设备类型',
      options: categories,
      multi: false
    })).append(buildCondition({
      cat: 'status',
      catStr: '文件状态',
      options: statuses,
      multi: false
    }));
    $combine.on('click', '.factor', function cancel() {
      var $target = $(this);
      var cat = $target.attr('data-cat');
      $condition.children(".row[data-cat=".concat(cat, "]")).show();
      $target.remove();

      switch (cat) {
        case 'brand':
          params.brands = [];
          break;

        case 'type':
          params.classOne = 0;
          params.classTwo = 0;
          $target.siblings('[data-cat="subtype"]').remove();
          $condition.find('[data-cat="subtype"]').remove();
          break;

        case 'subtype':
          params.classTwo = 0;
          break;

        case 'status':
          params.status = 0;
          break;

        default:
          return;
      }

      getRankData(params);
    }).on('click', '.reset', function reset() {
      $condition.children('.row[data-cat]').show().filter('[data-cat="subtype"]').remove();
      $combine.children('.factor').remove();
      params.brands = [];
      params.classOne = 0;
      params.classTwo = 0;
      params.status = 0;
      getRankData(params);
    });
    $condition.on('click', '.row:not(.multi) .value a', function filter() {
      // single selection
      var $target = $(this);
      var $row = $target.closest('.row[data-cat]');
      var cat = $row.attr('data-cat');
      var val = $target.text();
      $(buildFactor(cat, val)).insertBefore('.filter .combine .reset');
      $row.hide();

      switch (cat) {
        case 'brand':
          params.brands = [parseInt($target.attr('data-id'), 10)];
          break;

        case 'type':
          var typeId = parseInt($target.attr('data-id'), 10);
          params.classOne = typeId; // find type

          var type = categories.find(function (v) {
            return v.id === typeId;
          });

          if (type.children.length) {
            // build sub type
            $condition.append(buildCondition({
              cat: 'subtype',
              catStr: '设备次级类型',
              options: type.children,
              multi: false
            }));
          }

          break;

        case 'subtype':
          params.classTwo = parseInt($target.attr('data-id'), 10);
          break;

        case 'status':
          params.status = parseInt($target.attr('data-id'), 10);
          break;

        default:
          return;
      }

      getRankData(params);
    }).on('click', '.row.multi .value li', function select() {
      // multi-selection
      // toggle active
      var $target = $(this);
      $target.closest('li').toggleClass('active');
    }).on('click', '.extra .multi', function multi() {
      // enter multi-selection mode
      var $target = $(this);
      $target.closest('.row[data-cat]').addClass('multi');
    }).on('click', '.extra .submit', function submit() {
      // submit multi-selection
      var $target = $(this);
      var $row = $target.closest('.row.multi[data-cat]');
      var $active = $row.find('.value li.active');
      var cat = $row.attr('data-cat');
      var comb = '';
      var multi = [];
      $active.text(function combine(idx, val) {
        comb += (idx ? ',' : '') + val;
        var $a = $(this).find('a');
        multi.push(parseInt($a.attr('data-id'), 10));
      });

      if (comb) {
        $(buildFactor(cat, comb)).insertBefore('.filter .combine .reset');
        $row.hide();
        params.brands = multi;
        getRankData(params);
      }

      $row.removeClass('multi');
      $active.removeClass('active');
    }).on('click', '.extra .cancel', function cancel() {
      // exit multi-selection mode
      var $target = $(this);
      var $row = $target.closest('.row.multi[data-cat]');
      var $active = $row.find('.value li.active');
      $row.removeClass('multi');
      $active.removeClass('active');
    });
  }

  function initRank() {
    var $table = $('#table_origin');
    var $tbody = $table.find('tbody'); // initial data

    getRankData(params); // rank mark

    var $rank_a = $table.find('a[data-rank]');
    $rank_a.on('click', function () {
      var $cur_a = $(this);
      var rank = $cur_a.attr('data-rank');

      if (rank === 'none') {
        $rank_a.attr('data-rank', 'none').children('i').removeClass('rank-desc').removeClass('rank-asc');
        $cur_a.attr('data-rank', 'desc').children('i').addClass('rank-desc');
        params.sortType = $cur_a.attr('data-type'); // reload data

        getRankData(params);
      }
    }); // limit

    var $nav = $table.siblings('nav');
    var $limit = $nav.find('.limit select');
    $limit.on('change', function limit(e) {
      params.pageNum = 1;
      params.pageSize = parseInt(e.target.value, 10); // reload data

      getRankData(params);
    }); // page change

    var $pagination = $nav.find('ul.pagination');
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
        getRankData(params);
      }
    }); // search

    var $search = $table.closest('.card.result').siblings('.search');
    $search.on('change', '.search-box', function () {
      // prettier-ignore
      params.keyWord = $(this).val().trim();
    }).on('click', '.search-btn', function () {
      // reload data
      getRankData(params);
    }).on('keydown', '.search-box', function (e) {
      if (e.keyCode == 13) {
        // prettier-ignore
        params.keyWord = $(this).val().trim(); // reload data

        getRankData(params);
      }
    }); // click

    $tbody.on('click', 'tr', function detail(e) {
      var tag = e.target.tagName;

      if (/tr|td|div/i.test(tag)) {
        // prettier-ignore
        var $tr = $(this).closest('tr');
        var id = $tr.attr('data-id');
        var $form = $("\n          <form\n            action=\"fileData/fileDataDetail\"\n            method=\"post\"\n            target=\"_blank\"\n            rel=\"noopener noreferrer\"\n            style=\"display:none;\"\n          >\n            <input name=\"fileDataId\" value=\"".concat(id, "\" />\n          </form>\n        "));
        $tr.find('.unread').removeClass('unread');
        readFile(parseInt(id, 10));
        $(document.body).append($form);
        $form.submit().remove();
      }
    });
    $tbody.on('click', 'button[data-action=star]', function star() {
      var $target = $(this);
      var $tr = $target.closest('tr');
      var id = $tr.attr('data-id');
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
          fileDataId: id,
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
          fileDataId: id,
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
    }).on('click', 'button[data-action=download]', function () {
      // prettier-ignore
      var id = $(this).closest('tr').attr('data-id');
      var $downloadModal = $('#downloadModal');
      var targetFile = {
        fileDataId: id,
        fileDataType: 1
      };
      downloadCheck(targetFile, function (data) {
        if (parseInt(data.requiredIntegral, 10)) {
          // confirm modal
          $downloadModal.find('.modal-body').html("\n              \u4F7F\u7528<b class=\"cost\"> ".concat(data.requiredIntegral, " \u79EF\u5206</b>\u4E0B\u8F7D\u6B64\u6587\u4EF6\uFF1F\n              \u5F53\u524D\u79EF\u5206\u4F59\u989D\uFF1A<b class=\"remain\">").concat(data.currentIntegral, " \u79EF\u5206</b>\u3002\n            "));
          $downloadModal.modal();
          $downloadModal.one('click', '#downloadBtn', function () {
            download(targetFile);
            $downloadModal.modal('hide');
          });
        } else {
          // download
          download(targetFile);
        }
      });
    }).on('click', 'button[data-action=preview]', function () {
      var id = $(this).closest('tr').attr('data-id');
      var prefix = $('base').attr('href');
      var url = "".concat(prefix, "fileData/queryChartImg?fileDataId=").concat(id);
      window.open(url);
    });
  }

  function buildCondition(obj) {
    var lis = '';
    obj.options.map(function (v) {
      lis += "<li><a data-id=\"".concat(v.id, "\">").concat(v.label, "</a></li>");
    });
    var mult = "\n      <div class=\"col-sm-2 extra\">\n        <a class=\"submit\">\u63D0\u4EA4</a>\n        <a class=\"cancel\">\u53D6\u6D88</a>\n        <a class=\"multi\">\n          <i class=\"material-icons\">add</i>\n          \u591A\u9009\n        </a>\n      </div>\n    ";
    return "\n      <div class=\"row\" data-cat=\"".concat(obj.cat, "\">\n        <div class=\"col-sm-2 key\">\n          ").concat(obj.catStr, "\uFF1A\n        </div>\n        <ul class=\"col-sm-8 value\">\n          ").concat(lis, "\n        </ul>\n        ").concat(obj.multi ? mult : '', "\n      </div>\n    ");
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

      case 'subtype':
        translate = '设备次级类型';
        break;

      case 'status':
        translate = '文件状态';
        break;

      default:
        translate = '';
        break;
    }

    var em = value;

    if (em.length > 7) {
      em = em.substr(0, 7) + '...';
    }

    return "\n      <a\n        class=\"factor\"\n        title=\"".concat(value, "\"\n        data-cat=\"").concat(cat, "\"\n      >\n        <b>").concat(translate, "\uFF1A</b>\n        <em>").concat(em, "</em>\n        <i class=\"material-icons\">close</i>\n      </a>\n    ");
  }

  function buildRankRow(obj) {
    var $stateTd;

    if (obj.state) {
      $stateTd = "\n        <button\n          data-action=\"preview\"\n          type=\"button\"\n          class=\"btn btn-info\"\n          title=\"\u9884\u89C8\"\n        >\n          <i class=\"material-icons\">image</i>\n        </button>\n      ";
    } else {
      $stateTd = obj.stateStr;
    }

    var className = 'text-ellipsis';

    if (obj.unread && !hasReadFile(parseInt(obj.id, 10))) {
      className += ' unread';
    }

    return "\n      <tr data-id=\"".concat(obj.id, "\">\n        <td\n          class=\"text-left\"\n          title=\"").concat(obj.title, "\"\n        >\n          <div class=\"").concat(className, "\">").concat(obj.title, "</div>\n        </td>\n        <td>").concat(obj.date, "</td>\n        <td>").concat(obj.size, "</td>\n        <td>").concat(obj.cate, "</td>\n        <td>").concat(obj.brand, "</td>\n        <td title=\"").concat(obj.company, "\">").concat(obj.company.substr(0, 4), "</td>\n        <td>").concat(obj.bonus, "</td>\n        <td class=\"td-actions\">").concat($stateTd, "</td>\n        <td class=\"text-right\">").concat(obj.download, "</td>\n        <td class=\"td-actions text-right\">\n          <button\n            data-action=\"star\"\n            data-toggle=\"").concat(obj.fav ? 'unstar' : 'star', "\"\n            type=\"button\"\n            class=\"btn btn-warning\"\n            title=\"").concat(obj.fav ? '取消' : '', "\u6536\u85CF\"\n          >\n            <i class=\"material-icons\">star").concat(obj.fav ? '' : '_border', "</i>\n          </button>\n          <button\n            data-action=\"download\"\n            type=\"button\"\n            class=\"btn btn-success\"\n            title=\"\u4E0B\u8F7D\"\n          >\n            <i class=\"material-icons\">get_app</i>\n          </button>\n        </td>\n      </tr>\n    ");
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

  function loadReadSet() {
    // load
    var readArr = JSON.parse(sessionStorage.readFileList);
    return new Set(readArr);
  }

  function storeReadSet(readSet) {
    // store
    sessionStorage.readFileList = JSON.stringify(_toConsumableArray(readSet));
  }

  function readFile(id) {
    var readSet = loadReadSet();
    readSet.add(id);
    storeReadSet(readSet);
  }

  function hasReadFile(id) {
    var readSet = loadReadSet();
    return readSet.has(id);
  }

  function getRankData(obj) {
    var $tbody = $('#table_origin tbody');
    $.post('fileData/queryFileData', obj, function (res) {
      handleResult(res, function (data) {
        // build table
        $tbody.html('');
        var $table = $tbody.closest('table');
        $table.siblings('.empty').remove();

        if (data.list.length === 0) {
          $('<div class="empty">暂无数据</div>').insertAfter($table);
        } else {
          data.list.map(function (file) {
            $tbody.append(buildRankRow({
              id: file.fileDataId,
              title: file.fileName,
              date: file.dataTimeDesc,
              size: file.fileSizeDesc,
              cate: file.classTwoDesc,
              brand: file.brandDesc,
              company: file.enterprise,
              bonus: file.requiredIntegral,
              state: parseInt(file.fileDataStatus, 10) === 2,
              stateStr: file.fileDataStatusDesc,
              download: file.downloadCount,
              fav: parseInt(file.favoriteStatus, 10) === 1,
              unread: !!parseInt(file.flag, 10)
            }));
          });
        } // build pagination


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

  function starFile(obj, done) {
    $.post('account/doFavorites', obj, function (res) {
      handleResult(res, done);
    });
  }
})();