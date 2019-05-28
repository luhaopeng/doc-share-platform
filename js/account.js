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
    initUserModal()
    initRoleModal()
    initSearchComplete()
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
            heading: '已禁用',
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
        let $this = $(this)
        let $tr = $this.closest('tr')
        let account = $tr.data('id')
        let $modal = $('#changeRoleModal')
        // basic inputs
        $modal.find('.modal-title').text('修改角色')
        // prettier-ignore
        $modal.find('input#user').prop('disabled', true).val('张腾')
        // show
        $modal.modal()
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
    initTable('#table_bonus')
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
    $('#users .search .add').on('click', function add() {
      let $modal = $('#changeRoleModal')
      // basic inputs
      $modal.find('.modal-title').text('新增用户')
      // prettier-ignore
      $modal.find('input#user').prop('disabled', false).val('')
      // show
      $modal.modal()
    })
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

  function initSearchComplete() {
    const companys = [
      '华立科技股份有限公司',
      '威盛集团有限公司',
      '江苏林洋能源有限公司',
      '深圳市科陆电子科技股份有限公司'
    ]
    $('#searchCompany').autocomplete({ lookup: companys })
  }

  function initTable(selector, actionCB = {}) {
    // initial params
    let params = { pageNum: 1, pageSize: 5, keyword: '', disc: '' }

    // initial data
    let $table = $(selector)
    let $tbody = $table.find('tbody')
    buildRow(selector, params, $tbody)

    // limit
    let $nav = $table.siblings('nav')
    let $limit = $nav.find('.limit select')
    $limit.on('change', function limit(e) {
      let pageSize = parseInt(e.target.value)
      params.pageSize = pageSize
      buildRow(selector, params, $tbody)
    })

    // page change
    let $pagination = $nav.find('ul.pagination')
    $pagination.on('click', '.page-item', function() {
      let max = parseInt(
        $pagination
          .find('.page-item:not(.prev):not(.next)')
          .last()
          .text()
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
        params.pageNum = parseInt($this.text()) || 1
      }
      if (old !== params.pageNum) {
        buildRow(selector, params, $tbody)
      }
    })

    // search
    let $search = $(selector).siblings('.search')
    if (/user/i.test(selector)) {
      $search.on('change', '.search-box', function() {
        // prettier-ignore
        params.keyword = $(this).val().trim()
      })
    } else if (/role/i.test(selector)) {
      $search.on('change', '.search-box', function() {
        // prettier-ignore
        params.disc = $(this).val().trim()
      })
    } else if (/bonus/i.test(selector)) {
      // TODO
    }
    $search
      .on('click', '.search-btn', function() {
        buildRow(selector, params, $tbody)
      })
      .on('keydown', '.search-box', function(e) {
        if (e.keyCode == 13) {
          // prettier-ignore
          params.keyword = $(this).val().trim()
          buildRow(selector, params, $tbody)
        }
      })

    // td-actions
    for (let key in actionCB) {
      if (typeof actionCB[key] === 'function') {
        $tbody.on('click', `button[data-action=${key}]`, actionCB[key])
      }
    }
  }

  function buildRow(selector, data, $tbody) {
    if (/user/i.test(selector)) {
      $tbody.html('')
      getUsers(
        data,
        res => res.map(v => $tbody.append(buildUser(v))),
        page => buildPage(selector, page)
      )
    } else if (/role/i.test(selector)) {
      $tbody.html('')
      getRoles(
        data,
        res => res.map(v => $tbody.append(buildRole(v))),
        page => buildPage(selector, page)
      )
    } else if (/bonus/i.test(selector)) {
      $tbody.html('')
      getBonus(
        data,
        res => res.map(v => $tbody.append(buildBonus(v))),
        page => buildPage(selector, page)
      )
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
            title="删除"
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

  function getUsers(data, buildFunc, pageFunc) {
    $.post('sys/queryUsers', data, function done(res) {
      handleResult(res, function(data) {
        let { pageNum, pageSize, total, pages, list } = data
        let pageObj = { pageNum, pageSize, total, pages }
        let objs = list.map(v => ({
          id: v.account,
          account: v.account,
          company: v.enterprise,
          date: v.registerTimeStr,
          banned: !!(v.status - 1),
          sys: v.type === 2,
          type: v.typeStr,
          role: v.roleName
        }))
        typeof buildFunc === 'function' && buildFunc(objs)
        typeof pageFunc === 'function' && pageFunc(pageObj)
      })
    })
  }

  function getRoles(data, buildFunc, pageFunc) {
    $.post('sys/queryRoles', data, function done(res) {
      handleResult(res, function(data) {
        let { pageNum, pageSize, total, pages, list } = data
        let pageObj = { pageNum, pageSize, total, pages }
        let objs = list.map(v => ({
          id: v.roleid,
          name: v.disc,
          desc: v.remark,
          creator: v.creator,
          time: v.createtime
        }))
        typeof buildFunc === 'function' && buildFunc(objs)
        typeof pageFunc === 'function' && pageFunc(pageObj)
      })
    })
  }

  function getBonus(data, buildFunc) {
    // TODO
    let objs = [1, 2, 3, 4, 5].map(() => randBonus())
    typeof buildFunc === 'function' && buildFunc(objs)
  }

  function randBonus() {
    const accounts = ['admin', '张腾', '小张', '张工']
    const timeArr = [
      '2019-05-21 15:47:12',
      '2019-05-21 12:30:13',
      '2019-05-21 08:19:53'
    ]
    const companys = [
      '华立科技股份有限公司',
      '威盛集团有限公司',
      '江苏林洋能源有限公司',
      '深圳市科陆电子科技股份有限公司'
    ]
    // prettier-ignore
    const types = [
      { type: '文件上传', bonus: 2, operand: '+' },
      { type: '文件被收藏', bonus: 1, operand: '+' },
      { type: '下载文件', bonus: 5, operand: '-' },
      { type: '文件入库', bonus: 1, operand: '+' },
      { type: '评论文件', bonus: 1, operand: '+' }
    ]
    return {
      account: rand(accounts),
      time: rand(timeArr),
      company: rand(companys),
      ...rand(types),
      total: parseInt(Math.random() * 200)
    }
  }

  function rand(arr) {
    return arr[(Math.random() * arr.length) | 0]
  }
})()
