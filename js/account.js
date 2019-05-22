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
    initModalBtn()
    initRoleModal()
    initTable('#table_user', {
      ban: function ban() {
        let $target = $(this)
        let action = $target.attr('data-toggle')
        if (action === 'ban') {
          $target
            .attr({ 'data-toggle': 'recover', title: '恢复登录' })
            .addClass('btn-success')
            .removeClass('btn-danger')
            .children('.material-icons')
            .text('replay')
          $.toast({
            heading: '已禁止该账号登录',
            ...TOAST_OPTION
          })
        } else if (action === 'recover') {
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
        }
      },
      edit: function edit() {
        $('#changeRoleModal').modal()
      }
    })
    initTable('#table_role', {
      edit: function edit() {
        let $modal = $('#editRoleModal')
        // basic inputs
        $modal.find('.modal-title').text('修改角色')
        $modal.find('input#name').val('企业用户')
        $modal.find('select#rank').val('usr')
        $modal.find('input#desc').val('普通用户')
        $modal.modal()
        // auth checkboxes
        $modal.find('.form-check-input').prop('checked', false)
        $modal
          .find('input[name=origin], input[name=parsed]')
          .prop('checked', true)
        // show
        $modal.modal()
      },
      delete: function del() {
        $('#deleteRoleModal').modal()
      }
    })
  })

  function initModalBtn() {
    // user
    $('#changeRoleModal .submit').on('click', function change() {
      $('#changeRoleModal').modal('hide')
    })

    // role
    $('#editRoleModal .submit').on('click', function edit() {
      $('#editRoleModal').modal('hide')
    })

    // delete
    $('#deleteRoleModal .submit').on('click', function del() {
      $('#deleteRoleModal').modal('hide')
    })

    // add
    $('#roles .search .add').on('click', function add() {
      let $modal = $('#editRoleModal')
      // basic inputs
      $modal.find('.modal-title').text('新增角色')
      $modal.find('input#name').val('')
      $modal.find('select#rank').get(0).selectedIndex = 0
      $modal.find('input#desc').val('')
      // auth checkboxes
      $modal.find('.form-check-input').prop('checked', false)
      // show
      $modal.modal()
    })
  }

  function initRoleModal() {
    let $authority = $('#editRoleModal .authority')
    const auths = [
      {
        name: 'admin',
        label: '首页'
      },
      {
        name: 'origin',
        label: '原始文件库'
      },
      {
        name: 'parsed',
        label: '解析文件库'
      },
      {
        name: 'account',
        label: '账号管理'
      }
    ]
    auths.map(obj => $authority.append(buildAuth(obj)))
  }

  function initTable(selector, actionCB = {}) {
    // data
    let $tbody = $(`${selector} tbody`)
    for (let i = 0; i < 5; i++) {
      $tbody.append(buildRow(selector))
    }

    // limit
    let $limit = $(`.result ${selector} + nav .limit select`)
    $limit.on('change', function limit(e) {
      let pageSize = parseInt(e.target.value)
      $tbody.html('')
      for (let i = 0; i < pageSize; i++) {
        $tbody.append(buildRow(selector))
      }
    })

    // td-actions
    for (let key in actionCB) {
      if (typeof actionCB[key] === 'function') {
        $tbody.on('click', `button[data-action=${key}]`, actionCB[key])
      }
    }
  }

  function buildRow(selector) {
    if (/user/i.test(selector)) {
      return buildUser(randUser())
    } else if (/role/i.test(selector)) {
      return buildRole(randRole())
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
      <tr data-id=${obj.id}>
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
    let action = `
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
          title="删除"
        >
          <i class="material-icons">delete</i>
        </button>
      </td>
    `
    return `
      <tr>
        <td>${obj.name}</td>
        <td>${obj.rank}</td>
        <td>${obj.desc}</td>
        <td>${obj.creator}</td>
        <td>${obj.time}</td>
        ${obj.sys ? '<td>---</td>' : action}
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
            name="${obj.name}"
          />
          ${obj.label}
          <span class="form-check-sign">
            <span class="check"></span>
          </span>
        </label>
      </div>
    `
  }

  function randUser() {
    const accounts = ['admin', '张腾', '小张', '张工']
    const companys = [
      '国网电力科学研究院',
      '华立科技股份有限公司',
      '威盛集团有限公司',
      '江苏林洋能源有限公司'
    ]
    const dates = ['2019-05-09', '2019-05-08', '2019-05-07']
    const ban = [true, false]
    const types = [
      {
        sys: true,
        type: '平台管理员',
        role: '系统管理员'
      },
      {
        sys: false,
        type: '企业用户',
        role: '企业用户'
      }
    ]
    return {
      id: parseInt(Math.random() * 100),
      account: rand(accounts),
      company: rand(companys),
      date: rand(dates),
      banned: rand(ban),
      ...rand(types)
    }
  }

  function randRole() {
    const roles = [
      {
        name: '系统管理员',
        rank: '系统管理员',
        desc: '系统自定义',
        sys: true
      },
      {
        name: '企业用户',
        rank: '平台用户',
        desc: '普通用户',
        sys: false
      },
      {
        name: '华立企业管理员',
        rank: '企业管理员',
        desc: '企业管理员',
        sys: false
      }
    ]
    const times = [
      '2019-04-23 17:15:25',
      '2019-04-22 15:27:36',
      '2019-05-01 09:30:44'
    ]
    return {
      ...rand(roles),
      creator: 'admin',
      time: rand(times)
    }
  }

  function rand(arr) {
    return arr[(Math.random() * arr.length) | 0]
  }
})()
