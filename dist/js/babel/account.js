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
        var $tr = $target.closest('tr');
        var account = $tr.attr('data-account');
        var action = $target.attr('data-toggle');
        $.toast().reset('all');

        if (action === 'ban') {
          banUser({
            account: account,
            status: 2
          }, function () {
            $target.attr({
              'data-toggle': 'recover',
              title: '恢复登录'
            }).addClass('btn-success').removeClass('btn-danger').children('.material-icons').text('replay');
            $.toast(_objectSpread({
              heading: '已禁用'
            }, TOAST_OPTION)); // reload

            buildRow('#table_user', params, $('#table_user tbody'));
          });
        } else if (action === 'recover') {
          banUser({
            account: account,
            status: 1
          }, function () {
            $target.attr({
              'data-toggle': 'ban',
              title: '限制登录'
            }).addClass('btn-danger').removeClass('btn-success').children('.material-icons').text('not_interested');
            $.toast(_objectSpread({
              heading: '已恢复'
            }, TOAST_OPTION)); // reload

            buildRow('#table_user', params, $('#table_user tbody'));
          });
        }
      },
      edit: function edit() {
        var $this = $(this);
        var $tr = $this.closest('tr');
        var account = $tr.attr('data-account');
        var roleid = $tr.attr('data-role');
        var $modal = $('#changeRoleModal');
        $modal.data('action', 'edit'); // basic inputs

        $modal.find('.modal-title').text('修改角色'); // prettier-ignore

        $modal.find('input#user').prop('disabled', true).val(account);
        $modal.find('select#role').val(roleid); // show

        $modal.modal();
      }
    });
    initTable('#table_role', {
      edit: function edit() {
        // prettier-ignore
        var id = $(this).closest('tr').attr('data-id');
        var $modal = $('#editRoleModal');
        $modal.data('action', 'edit');
        $modal.find('.modal-title').text('修改角色');
        getRole({
          roleId: id
        }, function (data) {
          // basic inputs
          $modal.data('id', id);
          $modal.find('input#name').val(data.disc);
          $modal.find('input#desc').val(data.remark); // auth checkboxes

          $modal.find('.form-check-input').prop('checked', false);
          data.moduleIdList.map(function (v) {
            $modal.find(".authority input[data-id=\"".concat(v, "\"]")).prop('checked', true);
          }); // show

          $modal.modal();
        });
      },
      "delete": function del() {
        // prettier-ignore
        var id = $(this).closest('tr').attr('data-id'); // prettier-ignore

        $('#deleteRoleModal').data('id', id).modal();
      }
    });
    initTable('#table_bonus');
  });

  function initModalBtn() {
    // user
    var $userModal = $('#changeRoleModal');
    $userModal.on('click', '.submit', function change() {
      // prettier-ignore
      var account = $userModal.find('#user').val().trim();
      var roleId = $userModal.find('#role').val();

      if ($userModal.data('action') === 'add') {
        addUser({
          account: account,
          roleId: roleId
        }, $userModal.find('.modal-body'), function () {
          buildRow('#table_user', params, $('#table_user tbody'));
          $userModal.modal('hide');
        });
      } else if ($userModal.data('action') === 'edit') {
        editUser({
          account: account,
          roleId: roleId
        }, function () {
          buildRow('#table_user', params, $('#table_user tbody'));
          $userModal.modal('hide');
        });
      }
    }); // role

    var $roleModal = $('#editRoleModal');
    $roleModal.on('click', '.submit', function edit() {
      // prettier-ignore
      var name = $roleModal.find('#name').val().trim(); // prettier-ignore

      var desc = $roleModal.find('#desc').val().trim();
      var auth = Array.from($roleModal.find('.authority .form-check-input:checked')).map(function (v) {
        return $(v).attr('data-id');
      });

      if ($roleModal.data('action') === 'add') {
        addRole({
          disc: name,
          remark: desc,
          list: auth
        }, $roleModal.find('.modal-body'), function () {
          buildRow('#table_role', params, $('#table_role tbody'));
          $roleModal.modal('hide');
        });
      } else if ($roleModal.data('action') === 'edit') {
        var id = $roleModal.data('id');
        editRole({
          roleId: id,
          disc: name,
          remark: desc,
          list: auth
        }, function () {
          buildRow('#table_role', params, $('#table_role tbody'));
          $roleModal.modal('hide');
        });
      }
    }); // delete

    var $delModal = $('#deleteRoleModal');
    $delModal.on('click', '.submit', function del() {
      var id = $delModal.data('id');
      delRole({
        roleId: id
      }, function () {
        buildRow('#table_role', params, $('#table_role tbody'));
        $delModal.modal('hide');
      });
    }); // add

    $('#users .search .add').on('click', function add() {
      var $modal = $('#changeRoleModal');
      $modal.data('action', 'add'); // basic inputs

      $modal.find('.modal-title').text('新增用户'); // prettier-ignore

      $modal.find('input#user').prop('disabled', false).val('');
      $modal.find('select#role').get(0).selectedIndex = 0; // show

      $modal.modal();
    });
    $('#roles .search .add').on('click', function add() {
      var $modal = $('#editRoleModal');
      $modal.data('action', 'add'); // basic inputs

      $modal.find('.modal-title').text('新增角色');
      $modal.find('input#name').val('');
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
    $.post('sys/queryPermissions', function (res) {
      handleResult(res, function (data) {
        data.map(function (v) {
          $authority.append(buildAuth({
            id: v.moduleid,
            label: v.disc
          }));
        });
      });
    });
  }

  function initSearchComplete(change) {
    $.post('main/queryAllEnt', function (res) {
      handleResult(res, function (data) {
        var companys = data.map(function (v) {
          return v.name;
        });
        $('#searchCompany').autocomplete({
          lookup: companys,
          onSelect: change
        });
      });
    });
  }

  function initTable(selector) {
    var actionCB = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    // initial params
    var params = {
      pageNum: 1,
      pageSize: 5,
      keyword: '',
      entName: '',
      account: '' // initial data

    };
    var $table = $(selector);
    var $tbody = $table.find('tbody');
    buildRow(selector, params, $tbody); // limit

    var $nav = $table.siblings('nav');
    var $limit = $nav.find('.limit select');
    $limit.on('change', function limit(e) {
      params.pageNum = 1;
      params.pageSize = parseInt(e.target.value, 10);
      buildRow(selector, params, $tbody);
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
        buildRow(selector, params, $tbody);
      }
    }); // search

    initSearchComplete(function () {
      // prettier-ignore
      params.entName = $(this).val().trim();
    });
    var $search = $(selector).siblings('.search');

    if (/user/i.test(selector)) {
      $search.on('change', '.search-box', function () {
        // prettier-ignore
        params.keyword = $(this).val().trim();
      });
    } else if (/role/i.test(selector)) {
      $search.on('change', '.search-box', function () {
        // prettier-ignore
        params.keyword = $(this).val().trim();
      });
    } else if (/bonus/i.test(selector)) {
      $search.on('change', '.search-box:first-child', function () {
        // company
        // prettier-ignore
        params.entName = $(this).val().trim();
      }).on('change', '.search-box:nth-child(2)', function () {
        // account
        // prettier-ignore
        params.account = $(this).val().trim();
      });
    }

    $search.on('click', '.search-btn', function () {
      buildRow(selector, params, $tbody);
    }).on('keydown', '.search-box', function (e) {
      if (e.keyCode == 13) {
        // prettier-ignore
        if (/bonus/i.test(selector)) {
          var idx = $(this).index();
          params[idx ? 'account' : 'entName'] = $(this).val().trim();
        } else {
          params.keyword = $(this).val().trim();
        }

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
    $tbody.html('');
    var $table = $tbody.closest('table');
    $table.siblings('.empty').remove();

    if (/user/i.test(selector)) {
      getUsers(data, function (res) {
        return build(res, buildUser);
      }, function (page) {
        return buildPage(selector, page);
      });
    } else if (/role/i.test(selector)) {
      getRoles(data, function (res) {
        return build(res, buildRole);
      }, function (page) {
        return buildPage(selector, page);
      });
    } else if (/bonus/i.test(selector)) {
      getBonus(data, function (res) {
        return build(res, buildBonus);
      }, function (page) {
        return buildPage(selector, page);
      });
    }

    function build(res, func) {
      if (res.length === 0) {
        $('<div class="empty">暂无数据</div>').insertAfter($table);
      } else {
        res.map(function (v) {
          return $tbody.append(func(v));
        });
      }
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
    return "\n      <tr data-id=".concat(obj.id, ">\n        <td>").concat(obj.name, "</td>\n        <td>").concat(obj.desc, "</td>\n        <td>").concat(obj.creator, "</td>\n        <td>").concat(obj.time, "</td>\n        <td class=\"td-actions\">\n          <button\n            data-action=\"edit\"\n            type=\"button\"\n            class=\"btn btn-info\"\n            title=\"\u4FEE\u6539\"\n          >\n            <i class=\"material-icons\">edit</i>\n          </button>\n          <button\n            data-action=\"delete\"\n            type=\"button\"\n            class=\"btn btn-danger\"\n            title=\"").concat(obj.disabled ? '角色已分配，无法删除' : '删除', "\"\n            ").concat(obj.disabled ? 'disabled' : '', "\n          >\n            <i class=\"material-icons\">delete</i>\n          </button>\n        </td>\n      </tr>\n    ");
  }

  function buildBonus(obj) {
    return "\n      <tr>\n        <td>".concat(obj.time, "</td>\n        <td>").concat(obj.account, "</td>\n        <td>").concat(obj.company, "</td>\n        <td>").concat(obj.type, "</td>\n        <td>").concat(obj.operand, " ").concat(obj.bonus, "</td>\n        <td>").concat(obj.total, "</td>\n      </tr>\n    ");
  }

  function buildAuth(obj) {
    return "\n      <div class=\"form-check col-md-4\">\n        <label class=\"form-check-label\">\n          <input\n            class=\"form-check-input\"\n            type=\"checkbox\"\n            data-id=\"".concat(obj.id, "\"\n          />\n          ").concat(obj.label, "\n          <span class=\"form-check-sign\">\n            <span class=\"check\"></span>\n          </span>\n        </label>\n      </div>\n    ");
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

  function buildAlert($wrapper, obj) {
    var $msg = $wrapper.find('.alert');

    if ($msg[0]) {
      $msg.removeClass('alert-warning').removeClass('alert-success').addClass(obj.className).show().find('span.msg').text(obj.msg);
    } else {
      $wrapper.prepend("\n        <div\n          class=\"alert ".concat(obj.className, " alert-dismissible fade show\"\n          role=\"alert\"\n          style=\"display:block;\"\n        >\n          <span class=\"msg\">").concat(obj.msg, "</span>\n          <button\n            type=\"button\"\n            class=\"close\"\n            style=\"top:9px;\"\n            data-dismiss=\"alert\"\n            aria-label=\"Close\"\n          >\n            <span aria-hidden=\"true\">&times;</span>\n          </button>\n        </div>\n     "));
    }
  }

  function getUsers(obj, buildFunc, pageFunc) {
    $.post('sys/queryUsers', obj, function done(res) {
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

  function getRoles(obj, buildFunc, pageFunc) {
    $.post('sys/queryRoles', obj, function done(res) {
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
            time: v.createtime,
            disabled: !!parseInt(v.occupied, 10)
          };
        });
        typeof buildFunc === 'function' && buildFunc(objs);
        typeof pageFunc === 'function' && pageFunc(pageObj);
      });
    });
  }

  function getBonus(obj, buildFunc, pageFunc) {
    $.post('sys/queryIntegralList', obj, function done(res) {
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
            time: v.dataTimeStr,
            account: v.account,
            company: v.entName,
            type: v.typeStr,
            operand: parseInt(v.inOutType, 10) === 1 ? '+' : '-',
            bonus: v.integral,
            total: v.currentIntegral
          };
        });
        typeof buildFunc === 'function' && buildFunc(objs);
        typeof pageFunc === 'function' && pageFunc(pageObj);
      });
    });
  }

  function addUser(obj, $wrapper, done) {
    $.post('sys/doAddUser', obj, function (res) {
      if (res.ret) {
        // fail
        buildAlert($wrapper, {
          className: 'alert-warning',
          msg: res.msg
        });
      } else {
        // success
        typeof done === 'function' && done(res.data);
      }
    });
  }

  function editUser(obj, done) {
    $.post('sys/doUpdateUser', obj, function (res) {
      handleResult(res, done);
    });
  }

  function banUser(obj, done) {
    $.post('sys/doUpdateUserStatus', obj, function (res) {
      handleResult(res, done);
    });
  }

  function addRole(obj, $wrapper, done) {
    $.post('sys/doAddRole', obj, function (res) {
      if (res.ret) {
        // fail
        buildAlert($wrapper, {
          className: 'alert-warning',
          msg: res.msg
        });
      } else {
        // success
        typeof done === 'function' && done(res.data);
      }
    });
  }

  function getRole(obj, done) {
    $.post('sys/queryRoleDetail', obj, function (res) {
      handleResult(res, done);
    });
  }

  function editRole(obj, done) {
    $.post('sys/doUpdateRole', obj, function (res) {
      handleResult(res, done);
    });
  }

  function delRole(obj, done) {
    $.post('sys/doDeleteRole', obj, function (res) {
      handleResult(res, done);
    });
  }
})();