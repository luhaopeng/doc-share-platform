;(function() {
  const TOAST_OPTION = {
    icon: 'success',
    position: 'bottom-right',
    allowToastClose: false,
    stack: false,
    loader: false,
    hideAfter: 2000,
    textAlign: 'center'
  }

  $(function() {
    initUserModal()
    initRoleModal()
    initSearchComplete()
    initTable('#table_user', {
      ban: function ban(params) {
        let $target = $(this)
        let $tr = $target.closest('tr')
        let account = $tr.attr('data-account')
        let action = $target.attr('data-toggle')
        $.toast().reset('all')
        if (action === 'ban') {
          banUser({ account, status: 2 }, function() {
            $target
              .attr({ 'data-toggle': 'recover', title: '恢复登录' })
              .addClass('btn-success')
              .removeClass('btn-danger')
              .children('.material-icons')
              .text('replay')
            $.toast({
              heading: '已禁用',
              ...TOAST_OPTION
            })
            // reload
            buildRow('#table_user', params, $('#table_user tbody'))
          })
        } else if (action === 'recover') {
          banUser({ account, status: 1 }, function() {
            $target
              .attr({ 'data-toggle': 'ban', title: '限制登录' })
              .addClass('btn-danger')
              .removeClass('btn-success')
              .children('.material-icons')
              .text('not_interested')
            $.toast({
              heading: '已恢复',
              ...TOAST_OPTION
            })
            // reload
            buildRow('#table_user', params, $('#table_user tbody'))
          })
        }
      },
      edit: function edit() {
        let $this = $(this)
        let $tr = $this.closest('tr')
        let account = $tr.attr('data-account')
        let roleid = $tr.attr('data-role')

        let $modal = $('#changeRoleModal')
        $modal.data('action', 'edit')
        // basic inputs
        $modal.find('.modal-title').text('修改角色')
        // prettier-ignore
        $modal.find('input#user').prop('disabled', true).val(account)
        $modal.find('select#role').val(roleid)
        // show
        $modal.modal()
      }
    })
    initTable('#table_role', {
      edit: function edit() {
        // prettier-ignore
        let id = $(this).closest('tr').attr('data-id')
        let $modal = $('#editRoleModal')
        $modal.data('action', 'edit')
        $modal.find('.modal-title').text('修改角色')
        getRole({ roleId: id }, function(data) {
          // basic inputs
          $modal.data('id', id)
          $modal.find('input#name').val(data.disc)
          $modal.find('input#desc').val(data.remark)
          // auth checkboxes
          $modal.find('.form-check-input').prop('checked', false)
          data.moduleIdList.map(v => {
            $modal
              .find(`.authority input[data-id="${v}"]`)
              .prop('checked', true)
          })
          // show
          $modal.modal()
        })
      },
      delete: function del() {
        // prettier-ignore
        let id = $(this).closest('tr').attr('data-id')
        // prettier-ignore
        $('#deleteRoleModal').data('id', id).modal()
      }
    })
    initTable('#table_bonus')
  })

  /**
   * 初始化角色select列表
   */
  function initUserModal() {
    $.post('sys/queryRoleList', function(res) {
      handleResult(res, function(data) {
        let $select = $('#changeRoleModal select#role')
        $select.html('')
        data.map(role => {
          $select.append(`
            <option value="${role.roleid}">${role.disc}</option>
          `)
        })
      })
    })
  }

  function initRoleModal() {
    let $authority = $('#editRoleModal .authority')
    $.post('sys/queryPermissions', function(res) {
      handleResult(res, function(data) {
        data.map(v => {
          $authority.append(
            buildAuth({
              id: v.moduleid,
              label: v.disc
            })
          )
        })
      })
    })
  }

  function initSearchComplete(change) {
    $.post('main/queryAllEnt', function(res) {
      handleResult(res, function(data) {
        let companys = data.map(v => v.name)
        $('#searchCompany').autocomplete({
          lookup: companys,
          onSelect: change
        })
      })
    })
  }

  function initTable(selector, actionCB = {}) {
    // initial params
    let params = {
      pageNum: 1,
      pageSize: 5,
      keyword: '',
      entName: '',
      account: ''
    }

    // init modal btns
    if (/user/i.test(selector)) {
      let $userModal = $('#changeRoleModal')
      // bring up modal
      $('#users .search .add').on('click', function add() {
        $userModal.data('action', 'add')
        // basic inputs
        $userModal.find('.modal-title').text('新增用户')
        // prettier-ignore
        $userModal.find('input#user').prop('disabled', false).val('')
        $userModal.find('select#role').get(0).selectedIndex = 0
        // show
        $userModal.modal()
      })
      // modal submit
      $userModal.on('click', '.submit', function change() {
        // prettier-ignore
        let account = $userModal.find('#user').val().trim()
        let roleId = $userModal.find('#role').val()
        if ($userModal.data('action') === 'add') {
          addUser(
            { account, roleId },
            $userModal.find('.modal-body'),
            function() {
              buildRow('#table_user', params, $('#table_user tbody'))
              $userModal.modal('hide')
            }
          )
        } else if ($userModal.data('action') === 'edit') {
          editUser({ account, roleId }, function() {
            buildRow('#table_user', params, $('#table_user tbody'))
            $userModal.modal('hide')
          })
        }
      })
    } else if (/role/i.test(selector)) {
      let $roleModal = $('#editRoleModal')
      // bring up modal
      $('#roles .search .add').on('click', function add() {
        $roleModal.data('action', 'add')
        // basic inputs
        $roleModal.find('.modal-title').text('新增角色')
        $roleModal.find('input#name').val('')
        $roleModal.find('input#desc').val('')
        // auth checkboxes
        $roleModal.find('.form-check-input').prop('checked', false)
        // show
        $roleModal.modal()
      })
      // modal submit
      $roleModal.on('click', '.submit', function edit() {
        // prettier-ignore
        let name = $roleModal.find('#name').val().trim()
        // prettier-ignore
        let desc = $roleModal.find('#desc').val().trim()
        let auth = Array.from(
          $roleModal.find('.authority .form-check-input:checked')
        ).map(v => $(v).attr('data-id'))
        if ($roleModal.data('action') === 'add') {
          addRole(
            { disc: name, remark: desc, list: auth },
            $roleModal.find('.modal-body'),
            function() {
              buildRow('#table_role', params, $('#table_role tbody'))
              $roleModal.modal('hide')
            }
          )
        } else if ($roleModal.data('action') === 'edit') {
          let id = $roleModal.data('id')
          editRole(
            { roleId: id, disc: name, remark: desc, list: auth },
            function() {
              buildRow('#table_role', params, $('#table_role tbody'))
              $roleModal.modal('hide')
            }
          )
        }
      })
      // delete
      let $delModal = $('#deleteRoleModal')
      $delModal.on('click', '.submit', function del() {
        let id = $delModal.data('id')
        delRole({ roleId: id }, function() {
          buildRow('#table_role', params, $('#table_role tbody'))
          $delModal.modal('hide')
        })
      })
    }

    // initial data
    let $table = $(selector)
    let $tbody = $table.find('tbody')
    buildRow(selector, params, $tbody)

    // limit
    let $nav = $table.siblings('nav')
    let $limit = $nav.find('.limit select')
    $limit.on('change', function limit(e) {
      params.pageNum = 1
      params.pageSize = parseInt(e.target.value, 10)
      buildRow(selector, params, $tbody)
    })

    // page change
    let $pagination = $nav.find('ul.pagination')
    $pagination.on('click', '.page-item', function() {
      let max = parseInt(
        $pagination
          .find('.page-item:not(.prev):not(.next)')
          .last()
          .text(),
        10
      )
      let $this = $(this)
      let old = params.pageNum
      if ($this.hasClass('prev')) {
        params.pageNum = params.pageNum - 1 || 1
      } else if ($this.hasClass('next')) {
        params.pageNum = (params.pageNum + 1) % (max + 1) || max
      } else if ($this.hasClass('else')) {
        // do nothing
      } else {
        params.pageNum = parseInt($this.text(), 10) || 1
      }
      if (old !== params.pageNum) {
        buildRow(selector, params, $tbody)
      }
    })

    // search
    initSearchComplete(function() {
      // prettier-ignore
      params.entName = $(this).val().trim()
    })
    let $search = $(selector).siblings('.search')
    if (/user/i.test(selector)) {
      $search.on('change', '.search-box', function() {
        // prettier-ignore
        params.keyword = $(this).val().trim()
      })
    } else if (/role/i.test(selector)) {
      $search.on('change', '.search-box', function() {
        // prettier-ignore
        params.keyword = $(this).val().trim()
      })
    } else if (/bonus/i.test(selector)) {
      $search
        .on('change', '.search-box:first-child', function() {
          // company
          // prettier-ignore
          params.entName = $(this).val().trim()
        })
        .on('change', '.search-box:nth-child(2)', function() {
          // account
          // prettier-ignore
          params.account = $(this).val().trim()
        })
    }
    $search
      .on('click', '.search-btn', function() {
        buildRow(selector, params, $tbody)
      })
      .on('keydown', '.search-box', function(e) {
        if (e.keyCode == 13) {
          // prettier-ignore
          if (/bonus/i.test(selector)) {
            let idx = $(this).index()
            params[idx ? 'account' : 'entName'] = $(this).val().trim()
          } else {
            params.keyword = $(this).val().trim()
          }
          buildRow(selector, params, $tbody)
        }
      })

    // td-actions
    for (let key in actionCB) {
      if (typeof actionCB[key] === 'function') {
        $tbody.on('click', `button[data-action=${key}]`, function() {
          actionCB[key].call(this, params)
        })
      }
    }
  }

  function buildRow(selector, data, $tbody) {
    $tbody.html('')
    let $table = $tbody.closest('table')
    $table.siblings('.empty').remove()
    if (/user/i.test(selector)) {
      getUsers(
        data,
        res => build(res, buildUser),
        page => buildPage(selector, page)
      )
    } else if (/role/i.test(selector)) {
      getRoles(
        data,
        res => build(res, buildRole),
        page => buildPage(selector, page)
      )
    } else if (/bonus/i.test(selector)) {
      getBonus(
        data,
        res => build(res, buildBonus),
        page => buildPage(selector, page)
      )
    }

    function build(res, func) {
      if (res.length === 0) {
        $('<div class="empty">暂无数据</div>').insertAfter($table)
      } else {
        res.map(v => $tbody.append(func(v)))
      }
    }
  }

  function buildUser(obj) {
    const banAction = {
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
    }
    let { toggle, color, title, icon } = banAction[
      obj.banned ? 'recover' : 'ban'
    ]
    let action = `
      <td class="td-actions">
        <button
          data-action="ban"
          data-toggle="${toggle}"
          type="button"
          class="btn btn-${color}"
          title="${title}"
        >
          <i class="material-icons">${icon}</i>
        </button>
        <button
          data-action="edit"
          type="button"
          class="btn btn-info"
          title="修改角色"
        >
          <i class="material-icons">edit</i>
        </button>
      </td>
    `
    return `
      <tr data-account=${obj.account} data-role=${obj.roleid}>
        <td>${obj.account}</td>
        <td>${obj.company}</td>
        <td>${obj.date}</td>
        <td class="${obj.banned ? 'text-warning' : ''}">
          ${obj.banned ? '登录受限' : '正常'}
        </td>
        <td>${obj.type}</td>
        <td>${obj.role}</td>
        ${obj.sys ? '<td>---</td>' : action}
      </tr>
    `
  }

  function buildRole(obj) {
    return `
      <tr data-id=${obj.id}>
        <td>${obj.name}</td>
        <td>${obj.desc}</td>
        <td>${obj.creator}</td>
        <td>${obj.time}</td>
        <td class="td-actions">
          <button
            data-action="edit"
            type="button"
            class="btn btn-info"
            title="修改"
          >
            <i class="material-icons">edit</i>
          </button>
          <button
            data-action="delete"
            type="button"
            class="btn btn-danger"
            title="${obj.disabled ? '角色已分配，无法删除' : '删除'}"
            ${obj.disabled ? 'disabled' : ''}
          >
            <i class="material-icons">delete</i>
          </button>
        </td>
      </tr>
    `
  }

  function buildBonus(obj) {
    return `
      <tr>
        <td>${obj.time}</td>
        <td>${obj.account}</td>
        <td>${obj.company}</td>
        <td>${obj.type}</td>
        <td>${obj.operand} ${obj.bonus}</td>
        <td>${obj.total}</td>
      </tr>
    `
  }

  function buildAuth(obj) {
    return `
      <div class="form-check col-md-4">
        <label class="form-check-label">
          <input
            class="form-check-input"
            type="checkbox"
            data-id="${obj.id}"
          />
          ${obj.label}
          <span class="form-check-sign">
            <span class="check"></span>
          </span>
        </label>
      </div>
    `
  }

  function buildPage(selector, options) {
    let $pagination = $(selector)
      .siblings('nav')
      .find('ul.pagination')
    $pagination.find('li.page-item:not(.prev):not(.next)').remove()
    let $next = $pagination.find('.page-item.next')
    let max = options.pages
    let n = options.pageNum
    if (max <= 10) {
      for (let i = 1; i <= max; ++i) {
        $(page(i, n)).insertBefore($next)
      }
    } else {
      if (n <= 3) {
        // 1, 2, 3, ..., max
        $(page(1, n)).insertBefore($next)
        $(page(2, n)).insertBefore($next)
        $(page(3, n)).insertBefore($next)
        $(page('...', n)).insertBefore($next)
        $(page(max, n)).insertBefore($next)
      } else if (n >= max - 2) {
        // 1, ..., max-2, max-1, max
        $(page(1, n)).insertBefore($next)
        $(page('...', n)).insertBefore($next)
        $(page(max - 2, n)).insertBefore($next)
        $(page(max - 1, n)).insertBefore($next)
        $(page(max, n)).insertBefore($next)
      } else {
        // 1, ..., n-1, n, n+1, ..., max
        $(page(1, n)).insertBefore($next)
        $(page('...', n)).insertBefore($next)
        $(page(n - 1, n)).insertBefore($next)
        $(page(n, n)).insertBefore($next)
        $(page(n + 1, n)).insertBefore($next)
        $(page('...', n)).insertBefore($next)
        $(page(max, n)).insertBefore($next)
      }
    }

    function page(i, cur) {
      // prettier-ignore
      return `
        <li class="page-item ${
          cur === i ? 'active' : ''
        } ${
          i === '...' ? 'else' : ''
        }">
          <a class="page-link">${i}</a>
        </li>
      `
    }
  }

  function buildAlert($wrapper, obj) {
    let $msg = $wrapper.find('.alert')
    if ($msg[0]) {
      $msg
        .removeClass('alert-warning')
        .removeClass('alert-success')
        .addClass(obj.className)
        .show()
        .find('span.msg')
        .text(obj.msg)
    } else {
      $wrapper.prepend(`
        <div
          class="alert ${obj.className} alert-dismissible fade show"
          role="alert"
          style="display:block;"
        >
          <span class="msg">${obj.msg}</span>
          <button
            type="button"
            class="close"
            style="top:9px;"
            data-dismiss="alert"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
     `)
    }
  }

  function getUsers(obj, buildFunc, pageFunc) {
    $.post('sys/queryUsers', obj, function done(res) {
      handleResult(res, function(data) {
        let { pageNum, pageSize, total, pages, list } = data
        let pageObj = { pageNum, pageSize, total, pages }
        let objs = list.map(v => ({
          account: v.account,
          company: v.enterprise,
          date: v.registerTimeStr,
          banned: !!(v.status - 1),
          sys: v.type === 2,
          type: v.typeStr,
          roleid: v.roleid,
          role: v.roleName
        }))
        typeof buildFunc === 'function' && buildFunc(objs)
        typeof pageFunc === 'function' && pageFunc(pageObj)
      })
    })
  }

  function getRoles(obj, buildFunc, pageFunc) {
    $.post('sys/queryRoles', obj, function done(res) {
      handleResult(res, function(data) {
        let { pageNum, pageSize, total, pages, list } = data
        let pageObj = { pageNum, pageSize, total, pages }
        let objs = list.map(v => ({
          id: v.roleid,
          name: v.disc,
          desc: v.remark,
          creator: v.creator,
          time: v.createtime,
          disabled: !!parseInt(v.occupied, 10)
        }))
        typeof buildFunc === 'function' && buildFunc(objs)
        typeof pageFunc === 'function' && pageFunc(pageObj)
      })
    })
  }

  function getBonus(obj, buildFunc, pageFunc) {
    $.post('sys/queryIntegralList', obj, function done(res) {
      handleResult(res, function(data) {
        let { pageNum, pageSize, total, pages, list } = data
        let pageObj = { pageNum, pageSize, total, pages }
        let objs = list.map(v => ({
          time: v.dataTimeStr,
          account: v.account,
          company: v.entName,
          type: v.typeStr,
          operand: parseInt(v.inOutType, 10) === 1 ? '+' : '-',
          bonus: v.integral,
          total: v.currentIntegral
        }))
        typeof buildFunc === 'function' && buildFunc(objs)
        typeof pageFunc === 'function' && pageFunc(pageObj)
      })
    })
  }

  function addUser(obj, $wrapper, done) {
    $.post('sys/doAddUser', obj, function(res) {
      if (res.ret) {
        // fail
        buildAlert($wrapper, {
          className: 'alert-warning',
          msg: res.msg
        })
      } else {
        // success
        typeof done === 'function' && done(res.data)
      }
    })
  }

  function editUser(obj, done) {
    $.post('sys/doUpdateUser', obj, function(res) {
      handleResult(res, done)
    })
  }

  function banUser(obj, done) {
    $.post('sys/doUpdateUserStatus', obj, function(res) {
      handleResult(res, done)
    })
  }

  function addRole(obj, $wrapper, done) {
    $.post('sys/doAddRole', obj, function(res) {
      if (res.ret) {
        // fail
        buildAlert($wrapper, {
          className: 'alert-warning',
          msg: res.msg
        })
      } else {
        // success
        typeof done === 'function' && done(res.data)
      }
    })
  }

  function getRole(obj, done) {
    $.post('sys/queryRoleDetail', obj, function(res) {
      handleResult(res, done)
    })
  }

  function editRole(obj, done) {
    $.post('sys/doUpdateRole', obj, function(res) {
      handleResult(res, done)
    })
  }

  function delRole(obj, done) {
    $.post('sys/doDeleteRole', obj, function(res) {
      handleResult(res, done)
    })
  }
})()
