;(function() {
  $(function() {
    initUsers()
  })

  function initUsers() {
    // data
    let $tbody = $('#table_user tbody')
    for (let i = 0; i < 5; i++) {
      $tbody.append(buildUser(randUser()))
    }

    // limit
    let $limit = $(`.result #table_user + nav .limit select`)
    $limit.on('change', function limit(e) {
      let pageSize = parseInt(e.target.value)
      $tbody.html('')
      for (let i = 0; i < pageSize; i++) {
        $tbody.append(buildUser(randUser()))
      }
    })

    // click
    $('#modifyRoleModal #submitBtn').on('click', function download() {
      $('#modifyRoleModal').modal('hide')
    })
    $tbody
      .on('click', 'button[data-action=ban]', function star() {
        let $target = $(this)
        let action = $target.attr('data-toggle')
        const TOAST_OPTION = {
          icon: 'success',
          position: 'bottom-right',
          allowToastClose: false,
          stack: false,
          loader: false,
          hideAfter: 2000,
          textAlign: 'center'
        }
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
      })
      .on('click', 'button[data-action=edit]', function edit() {
        $('#modifyRoleModal').modal()
      })
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

  function rand(arr) {
    return arr[(Math.random() * arr.length) | 0]
  }
})()
