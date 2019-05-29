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
    initModalBtn();
    initUserModal();
    initRoleModal();
    initSearchComplete();
    initTable('#table_user', {
      ban: function ban() {
        var $target = $(this);
        var action = $target.attr('data-toggle');

        if (action === 'ban') {
          $target.attr({
            'data-toggle': 'recover',
            title: '恢复登录'
          }).addClass('btn-success').removeClass('btn-danger').children('.material-icons').text('replay');
          $.toast(_objectSpread({
            heading: '已禁用'
          }, TOAST_OPTION));
        } else if (action === 'recover') {
          $target.attr({
            'data-toggle': 'ban',
            title: '限制登录'
          }).addClass('btn-danger').removeClass('btn-success').children('.material-icons').text('not_interested');
          $.toast(_objectSpread({
            heading: '已恢复'
          }, TOAST_OPTION));
        }
      },
      edit: function edit() {
        var $this = $(this);
        var $tr = $this.closest('tr');
        var account = $tr.attr('data-account');
        var roleid = $tr.attr('data-role');
        var $modal = $('#changeRoleModal'); // basic inputs

        $modal.find('.modal-title').text('修改角色'); // prettier-ignore

        $modal.find('input#user').prop('disabled', true).val(account);
        $modal.find('select#role').val(roleid); // show

        $modal.modal();
      }
    });
    initTable('#table_role', {
      edit: function edit() {
        var $modal = $('#editRoleModal'); // basic inputs

        $modal.find('.modal-title').text('修改角色');
        $modal.find('input#name').val('企业用户');
        $modal.find('select#rank').val('usr');
        $modal.find('input#desc').val('普通用户');
        $modal.modal(); // auth checkboxes

        $modal.find('.form-check-input').prop('checked', false);
        $modal.find('input[name=origin], input[name=parsed]').prop('checked', true); // show

        $modal.modal();
      },
      "delete": function del() {
        $('#deleteRoleModal').modal();
      }
    });
    initTable('#table_bonus');
  });

  function initModalBtn() {
    // user
    $('#changeRoleModal .submit').on('click', function change() {
      $('#changeRoleModal').modal('hide');
    }); // role

    $('#editRoleModal .submit').on('click', function edit() {
      $('#editRoleModal').modal('hide');
    }); // delete

    $('#deleteRoleModal .submit').on('click', function del() {
      $('#deleteRoleModal').modal('hide');
    }); // add

    $('#users .search .add').on('click', function add() {
      var $modal = $('#changeRoleModal'); // basic inputs

      $modal.find('.modal-title').text('新增用户'); // prettier-ignore

      $modal.find('input#user').prop('disabled', false).val('');
      $modal.find('select#role').get(0).selectedIndex = 0; // show

      $modal.modal();
    });
    $('#roles .search .add').on('click', function add() {
      var $modal = $('#editRoleModal'); // basic inputs

      $modal.find('.modal-title').text('新增角色');
      $modal.find('input#name').val('');
      $modal.find('select#rank').get(0).selectedIndex = 0;
      $modal.find('input#desc').val(''); // auth checkboxes

      $modal.find('.form-check-input').prop('checked', false); // show

      $modal.modal();
    });
  }
  /**
   * 初始化角色select列表
   */


  function initUserModal() {
    $.post('sys/queryRoleList', function (res) {
      handleResult(res, function (data) {
        var $select = $('#changeRoleModal select#role');
        $select.html('');
        data.map(function (role) {
          $select.append("\n            <option value=\"".concat(role.roleid, "\">").concat(role.disc, "</option>\n          "));
        });
      });
    });
  }

  function initRoleModal() {
    var $authority = $('#editRoleModal .authority');
    var auths = [{
      name: 'admin',
      label: '首页'
    }, {
      name: 'origin',
      label: '原始文件库'
    }, {
      name: 'parsed',
      label: '解析文件库'
    }, {
      name: 'account',
      label: '账号管理'
    }];
    auths.map(function (obj) {
      return $authority.append(buildAuth(obj));
    });
  }

  function initSearchComplete() {
    var companys = ['华立科技股份有限公司', '威盛集团有限公司', '江苏林洋能源有限公司', '深圳市科陆电子科技股份有限公司'];
    $('#searchCompany').autocomplete({
      lookup: companys
    });
  }

  function initTable(selector) {
    var actionCB = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    // initial params
    var params = {
      pageNum: 1,
      pageSize: 5,
      keyword: '',
      disc: '' // initial data

    };
    var $table = $(selector);
    var $tbody = $table.find('tbody');
    buildRow(selector, params, $tbody); // limit

    var $nav = $table.siblings('nav');
    var $limit = $nav.find('.limit select');
    $limit.on('change', function limit(e) {
      var pageSize = parseInt(e.target.value);
      params.pageSize = pageSize;
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
    }); // search

    var $search = $(selector).siblings('.search');

    if (/user/i.test(selector)) {
      $search.on('change', '.search-box', function () {
        // prettier-ignore
        params.keyword = $(this).val().trim();
      });
    } else if (/role/i.test(selector)) {
      $search.on('change', '.search-box', function () {
        // prettier-ignore
        params.disc = $(this).val().trim();
      });
    } else if (/bonus/i.test(selector)) {// TODO
    }

    $search.on('click', '.search-btn', function () {
      buildRow(selector, params, $tbody);
    }).on('keydown', '.search-box', function (e) {
      if (e.keyCode == 13) {
        // prettier-ignore
        params.keyword = $(this).val().trim();
        buildRow(selector, params, $tbody);
      }
    }); // td-actions

    for (var key in actionCB) {
      if (typeof actionCB[key] === 'function') {
        $tbody.on('click', "button[data-action=".concat(key, "]"), actionCB[key]);
      }
    }
  }

  function buildRow(selector, data, $tbody) {
    if (/user/i.test(selector)) {
      $tbody.html('');
      getUsers(data, function (res) {
        return res.map(function (v) {
          return $tbody.append(buildUser(v));
        });
      }, function (page) {
        return buildPage(selector, page);
      });
    } else if (/role/i.test(selector)) {
      $tbody.html('');
      getRoles(data, function (res) {
        return res.map(function (v) {
          return $tbody.append(buildRole(v));
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

  function buildUser(obj) {
    var banAction = {
      ban: {
        toggle: 'ban',
        color: 'danger',
        title: '限制登录',
        icon: 'not_interested'
      },
      recover: {
        toggle: 'recover',
        color: 'success',
        title: '恢复登录',
        icon: 'replay'
      }
    };
    var _banAction = banAction[obj.banned ? 'recover' : 'ban'],
        toggle = _banAction.toggle,
        color = _banAction.color,
        title = _banAction.title,
        icon = _banAction.icon;
    var action = "\n      <td class=\"td-actions\">\n        <button\n          data-action=\"ban\"\n          data-toggle=\"".concat(toggle, "\"\n          type=\"button\"\n          class=\"btn btn-").concat(color, "\"\n          title=\"").concat(title, "\"\n        >\n          <i class=\"material-icons\">").concat(icon, "</i>\n        </button>\n        <button\n          data-action=\"edit\"\n          type=\"button\"\n          class=\"btn btn-info\"\n          title=\"\u4FEE\u6539\u89D2\u8272\"\n        >\n          <i class=\"material-icons\">edit</i>\n        </button>\n      </td>\n    ");
    return "\n      <tr data-account=".concat(obj.account, " data-role=").concat(obj.roleid, ">\n        <td>").concat(obj.account, "</td>\n        <td>").concat(obj.company, "</td>\n        <td>").concat(obj.date, "</td>\n        <td class=\"").concat(obj.banned ? 'text-warning' : '', "\">\n          ").concat(obj.banned ? '登录受限' : '正常', "\n        </td>\n        <td>").concat(obj.type, "</td>\n        <td>").concat(obj.role, "</td>\n        ").concat(obj.sys ? '<td>---</td>' : action, "\n      </tr>\n    ");
  }

  function buildRole(obj) {
    return "\n      <tr data-id=".concat(obj.id, ">\n        <td>").concat(obj.name, "</td>\n        <td>").concat(obj.desc, "</td>\n        <td>").concat(obj.creator, "</td>\n        <td>").concat(obj.time, "</td>\n        <td class=\"td-actions\">\n          <button\n            data-action=\"edit\"\n            type=\"button\"\n            class=\"btn btn-info\"\n            title=\"\u4FEE\u6539\"\n          >\n            <i class=\"material-icons\">edit</i>\n          </button>\n          <button\n            data-action=\"delete\"\n            type=\"button\"\n            class=\"btn btn-danger\"\n            title=\"\u5220\u9664\"\n          >\n            <i class=\"material-icons\">delete</i>\n          </button>\n        </td>\n      </tr>\n    ");
  }

  function buildBonus(obj) {
    return "\n      <tr>\n        <td>".concat(obj.time, "</td>\n        <td>").concat(obj.account, "</td>\n        <td>").concat(obj.company, "</td>\n        <td>").concat(obj.type, "</td>\n        <td>").concat(obj.operand, " ").concat(obj.bonus, "</td>\n        <td>").concat(obj.total, "</td>\n      </tr>\n    ");
  }

  function buildAuth(obj) {
    return "\n      <div class=\"form-check col-md-4\">\n        <label class=\"form-check-label\">\n          <input\n            class=\"form-check-input\"\n            type=\"checkbox\"\n            name=\"".concat(obj.name, "\"\n          />\n          ").concat(obj.label, "\n          <span class=\"form-check-sign\">\n            <span class=\"check\"></span>\n          </span>\n        </label>\n      </div>\n    ");
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

  function getUsers(data, buildFunc, pageFunc) {
    $.post('sys/queryUsers', data, function done(res) {
      handleResult(res, function (data) {
        var pageNum = data.pageNum,
            pageSize = data.pageSize,
            total = data.total,
            pages = data.pages,
            list = data.list;
        var pageObj = {
          pageNum: pageNum,
          pageSize: pageSize,
          total: total,
          pages: pages
        };
        var objs = list.map(function (v) {
          return {
            account: v.account,
            company: v.enterprise,
            date: v.registerTimeStr,
            banned: !!(v.status - 1),
            sys: v.type === 2,
            type: v.typeStr,
            roleid: v.roleid,
            role: v.roleName
          };
        });
        typeof buildFunc === 'function' && buildFunc(objs);
        typeof pageFunc === 'function' && pageFunc(pageObj);
      });
    });
  }

  function getRoles(data, buildFunc, pageFunc) {
    $.post('sys/queryRoles', data, function done(res) {
      handleResult(res, function (data) {
        var pageNum = data.pageNum,
            pageSize = data.pageSize,
            total = data.total,
            pages = data.pages,
            list = data.list;
        var pageObj = {
          pageNum: pageNum,
          pageSize: pageSize,
          total: total,
          pages: pages
        };
        var objs = list.map(function (v) {
          return {
            id: v.roleid,
            name: v.disc,
            desc: v.remark,
            creator: v.creator,
            time: v.createtime
          };
        });
        typeof buildFunc === 'function' && buildFunc(objs);
        typeof pageFunc === 'function' && pageFunc(pageObj);
      });
    });
  }

  function getBonus(data, buildFunc) {
    // TODO
    var objs = [1, 2, 3, 4, 5].map(function () {
      return randBonus();
    });
    typeof buildFunc === 'function' && buildFunc(objs);
  }

  function randBonus() {
    var accounts = ['admin', '张腾', '小张', '张工'];
    var timeArr = ['2019-05-21 15:47:12', '2019-05-21 12:30:13', '2019-05-21 08:19:53'];
    var companys = ['华立科技股份有限公司', '威盛集团有限公司', '江苏林洋能源有限公司', '深圳市科陆电子科技股份有限公司']; // prettier-ignore

    var types = [{
      type: '文件上传',
      bonus: 2,
      operand: '+'
    }, {
      type: '文件被收藏',
      bonus: 1,
      operand: '+'
    }, {
      type: '下载文件',
      bonus: 5,
      operand: '-'
    }, {
      type: '文件入库',
      bonus: 1,
      operand: '+'
    }, {
      type: '评论文件',
      bonus: 1,
      operand: '+'
    }];
    return _objectSpread({
      account: rand(accounts),
      time: rand(timeArr),
      company: rand(companys)
    }, rand(types), {
      total: parseInt(Math.random() * 200)
    });
  }

  function rand(arr) {
    return arr[Math.random() * arr.length | 0];
  }
})();