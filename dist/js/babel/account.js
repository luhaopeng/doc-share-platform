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
        var $modal = $('#changeRoleModal'); // basic inputs

        $modal.find('.modal-title').text('修改角色'); // prettier-ignore

        $modal.find('input#user').prop('disabled', true).val('张腾'); // show

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

      $modal.find('input#user').prop('disabled', false).val(''); // show

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
    // data
    var $tbody = $("".concat(selector, " tbody"));

    for (var i = 0; i < 5; i++) {
      $tbody.append(buildRow(selector));
    } // limit


    var $limit = $(".result ".concat(selector, " + nav .limit select"));
    $limit.on('change', function limit(e) {
      var pageSize = parseInt(e.target.value);
      $tbody.html('');

      for (var _i = 0; _i < pageSize; _i++) {
        $tbody.append(buildRow(selector));
      }
    }); // td-actions

    for (var key in actionCB) {
      if (typeof actionCB[key] === 'function') {
        $tbody.on('click', "button[data-action=".concat(key, "]"), actionCB[key]);
      }
    }
  }

  function buildRow(selector) {
    if (/user/i.test(selector)) {
      return buildUser(randUser());
    } else if (/role/i.test(selector)) {
      return buildRole(randRole());
    } else if (/bonus/i.test(selector)) {
      return buildBonus(randBonus());
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
    return "\n      <tr data-id=".concat(obj.id, ">\n        <td>").concat(obj.account, "</td>\n        <td>").concat(obj.company, "</td>\n        <td>").concat(obj.date, "</td>\n        <td class=\"").concat(obj.banned ? 'text-warning' : '', "\">\n          ").concat(obj.banned ? '登录受限' : '正常', "\n        </td>\n        <td>").concat(obj.type, "</td>\n        <td>").concat(obj.role, "</td>\n        ").concat(obj.sys ? '<td>---</td>' : action, "\n      </tr>\n    ");
  }

  function buildRole(obj) {
    var action = "\n      <td class=\"td-actions\">\n        <button\n          data-action=\"edit\"\n          type=\"button\"\n          class=\"btn btn-info\"\n          title=\"\u4FEE\u6539\"\n        >\n          <i class=\"material-icons\">edit</i>\n        </button>\n        <button\n          data-action=\"delete\"\n          type=\"button\"\n          class=\"btn btn-danger\"\n          title=\"\u5220\u9664\"\n        >\n          <i class=\"material-icons\">delete</i>\n        </button>\n      </td>\n    ";
    return "\n      <tr>\n        <td>".concat(obj.name, "</td>\n        <td>").concat(obj.desc, "</td>\n        <td>").concat(obj.creator, "</td>\n        <td>").concat(obj.time, "</td>\n        ").concat(obj.sys ? '<td>---</td>' : action, "\n      </tr>\n    ");
  }

  function buildBonus(obj) {
    return "\n      <tr>\n        <td>".concat(obj.time, "</td>\n        <td>").concat(obj.account, "</td>\n        <td>").concat(obj.company, "</td>\n        <td>").concat(obj.type, "</td>\n        <td>").concat(obj.operand, " ").concat(obj.bonus, "</td>\n        <td>").concat(obj.total, "</td>\n      </tr>\n    ");
  }

  function buildAuth(obj) {
    return "\n      <div class=\"form-check col-md-4\">\n        <label class=\"form-check-label\">\n          <input\n            class=\"form-check-input\"\n            type=\"checkbox\"\n            name=\"".concat(obj.name, "\"\n          />\n          ").concat(obj.label, "\n          <span class=\"form-check-sign\">\n            <span class=\"check\"></span>\n          </span>\n        </label>\n      </div>\n    ");
  }

  function randUser() {
    var accounts = ['admin', '张腾', '小张', '张工'];
    var companys = ['国网电力科学研究院', '华立科技股份有限公司', '威盛集团有限公司', '江苏林洋能源有限公司'];
    var dates = ['2019-05-09', '2019-05-08', '2019-05-07'];
    var ban = [true, false];
    var types = [{
      sys: true,
      type: '平台管理员',
      role: '系统管理员'
    }, {
      sys: false,
      type: '企业用户',
      role: '企业用户'
    }];
    return _objectSpread({
      id: parseInt(Math.random() * 100),
      account: rand(accounts),
      company: rand(companys),
      date: rand(dates),
      banned: rand(ban)
    }, rand(types));
  }

  function randRole() {
    var roles = [{
      name: '系统管理员',
      desc: '系统自定义',
      sys: true
    }, {
      name: '企业用户',
      desc: '普通用户',
      sys: false
    }, {
      name: '华立企业管理员',
      desc: '企业管理员',
      sys: false
    }];
    var times = ['2019-04-23 17:15:25', '2019-04-22 15:27:36', '2019-05-01 09:30:44'];
    return _objectSpread({}, rand(roles), {
      creator: 'admin',
      time: rand(times)
    });
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