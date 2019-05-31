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
    $('[data-toggle="popover"]').popover()
    initUserInfo()
    initTable('#table_upload')
    initTable('#table_star', {
      star: function star() {
        let $target = $(this)
        let $tr = $target.closest('tr')
        let id = $tr.attr('data-id')
        let type = $tr.attr('data-type')
        let action = $target.attr('data-toggle')
        $.toast().reset('all')
        if (action === 'star') {
          starFile(
            { fileDataId: id, fileDataType: type, opsFavoritesType: 1 },
            function() {
              $target
                .attr({ 'data-toggle': 'unstar', title: '取消收藏' })
                .children('.material-icons')
                .text('star')
              $.toast({
                heading: '收藏成功',
                ...TOAST_OPTION
              })
            }
          )
        } else if (action === 'unstar') {
          starFile(
            { fileDataId: id, fileDataType: type, opsFavoritesType: 2 },
            function() {
              $target
                .attr({ 'data-toggle': 'star', title: '收藏' })
                .children('.material-icons')
                .text('star_border')
              $.toast({
                heading: '已取消收藏',
                ...TOAST_OPTION
              })
            }
          )
        }
      },
      download: function() {
        // prettier-ignore
        let $tr = $(this).closest('tr')
        let id = $tr.attr('data-id')
        let type = $tr.attr('data-type')
        let $downloadModal = $('#downloadModal')
        downloadCheck({ fileDataId: id, fileDataType: type }, function(data) {
          if (parseInt(data.requiredIntegral)) {
            // confirm modal
            $downloadModal.find('.modal-body').html(`
              使用<b class="cost"> ${data.requiredIntegral} 积分</b>下载此文件？
              当前积分余额：<b class="remain">${data.currentIntegral} 积分</b>。
            `)
            $downloadModal.modal()
            $downloadModal.on('click', '#downloadBtn', function() {
              // download
              download({ fileDataId: id, fileDataType: type })
              $downloadModal.modal('hide')
            })
          } else {
            // download
            download({ fileDataId: id, fileDataType: type })
          }
        })
      }
    })
    initTable('#table_bonus')
    initDropdown()
  })

  function initUserInfo() {
    $.post('account/queryAccountInfo', function(res) {
      handleResult(res, function(data) {
        let {
          account,
          enterprise,
          integral,
          uploadFileCount,
          beDownloadFileCount
        } = data
        let $user = $('.card.user')
        let $header = $user.find('.card-header')
        $header.find('h3').text(account)
        $header.find('h4').text(enterprise)
        let $stats = $user.find('.stats p')
        $stats.eq(0).text(integral)
        $stats.eq(1).text(uploadFileCount)
        $stats.eq(2).text(beDownloadFileCount)
      })
    })
  }

  function initDropdown() {
    let $menu = $('#table_bonus .dropdown .dropdown-menu')
    $menu.html(`
      <a
        tabindex="-1"
        data-type="0"
        class="dropdown-item"
      >
        全部类型
      </a>
      <div class="dropdown-divider"></div>
    `)
    // add items
    let menuList = JSON.parse(bonusMenuStr)
    menuList.map(v => {
      $menu.append(`
        <a
          tabindex="-1"
          data-type="${v.value}"
          class="dropdown-item"
        >
          ${v.text}
        </a>
      `)
    })
  }

  function initTable(selector, actionCB = {}) {
    // initial params
    let params = { pageNum: 1, pageSize: 5, integralType: 0 }

    // initial data
    let $table = $(selector)
    let $tbody = $table.find('tbody')
    buildRow(selector, params, $tbody)

    // rank mark
    let $rank_a = $table.find('a[data-rank]')
    $rank_a.on('click', function() {
      let $cur_a = $(this)
      let rank = $cur_a.attr('data-rank')
      if (rank === 'none') {
        $rank_a
          .attr('data-rank', 'none')
          .children('i')
          .removeClass('rank-desc')
          .removeClass('rank-asc')
        $cur_a
          .attr('data-rank', 'desc')
          .children('i')
          .addClass('rank-desc')
      } else {
        let to = rank === 'desc' ? 'asc' : 'desc'
        $cur_a
          .attr('data-rank', to)
          .children('i')
          .removeClass('rank-' + rank)
          .addClass('rank-' + to)
      }
    })

    // limit
    let $nav = $table.siblings('nav')
    let $limit = $nav.find('.limit select')
    $limit.on('change', function limit(e) {
      params.pageNum = 1
      params.pageSize = parseInt(e.target.value)
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

    // click
    if (!/bonus/i.test(selector)) {
      $tbody.on('click', 'tr', function detail(e) {
        let tag = e.target.tagName
        if (/tr|td/i.test(tag)) {
          // prettier-ignore
          let $tr = $(this).closest('tr')
          let id = $tr.attr('data-id')
          let type = $tr.attr('data-type')
          let $form = $(`
            <form
              action="fileData/fileDataDetail"
              method="post"
              target="_blank"
              rel="noopener noreferrer"
              style="display:none;"
            >
              <input name="fileDataId" value="${id}" />
              <input name="fileDataType" value="${type}" />
            </form>
          `)
          $(document.body).append($form)
          $form.submit().remove()
        }
      })
    }

    // td-actions
    if (/star/i.test(selector)) {
      for (let key in actionCB) {
        if (typeof actionCB[key] === 'function') {
          $tbody.on('click', `button[data-action=${key}]`, actionCB[key])
        }
      }
    }

    // dropdown
    if (/bonus/i.test(selector)) {
      $table.find('.dropdown').on('click', '.dropdown-item', function() {
        params.integralType = $(this).attr('data-type')
        buildRow(selector, params, $tbody)
      })
    }
  }

  function buildRow(selector, data, $tbody) {
    if (/upload/i.test(selector)) {
      $tbody.html('')
      getUploads(
        data,
        res => res.map(v => $tbody.append(buildUpload(v))),
        page => buildPage(selector, page)
      )
    } else if (/star/i.test(selector)) {
      $tbody.html('')
      getStars(
        data,
        res => res.map(v => $tbody.append(buildStar(v))),
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

  function buildUpload(obj) {
    return `
      <tr data-id="${obj.id}" data-type="${obj.type}">
        <td
          class="text-left"
          title="${obj.title}"
        >
          <div class="text-ellipsis">${obj.title}</div>
        </td>
        <td>${obj.date}</td>
        <td>${obj.size}</td>
        <td>${obj.typeStr}</td>
        <td>${obj.cate}</td>
        <td>${obj.brand}</td>
        <td>${obj.state}</td>
        <td class="text-right">${obj.download}</td>
      </tr>
    `
  }

  function buildStar(obj) {
    return `
      <tr data-id="${obj.id}" data-type="${obj.type}">
        <td
          class="text-left"
          title="${obj.title}"
        >
          <div class="text-ellipsis">${obj.title}</div>
        </td>
        <td>${obj.date}</td>
        <td>${obj.size}</td>
        <td>${obj.typeStr}</td>
        <td>${obj.cate}</td>
        <td>${obj.brand}</td>
        <td>${obj.state}</td>
        <td>${obj.bonus}</td>
        <td class="text-right">${obj.download}</td>
        <td class="td-actions text-right">
          <button
            data-action="star"
            data-toggle="${obj.fav ? 'unstar' : 'star'}"
            type="button"
            class="btn btn-warning"
            title="${obj.fav ? '取消' : ''}收藏"
          >
            <i class="material-icons">star${obj.fav ? '' : '_border'}</i>
          </button>
          <button
            data-action="download"
            type="button"
            class="btn btn-success"
            title="下载"
          >
            <i class="material-icons">get_app</i>
          </button>
        </td>
      </tr>
    `
  }

  function buildBonus(obj) {
    return `
      <tr>
        <td>${obj.time}</td>
        <td>${obj.type}</td>
        <td>${obj.remark}</td>
        <td>${obj.operand} ${obj.bonus}</td>
      </tr>
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

  function getUploads(obj, buildFunc, pageFunc) {
    $.post('account/queryMyUploads', obj, function done(res) {
      handleResult(res, function(data) {
        let { pageNum, total, pages, list } = data
        let pageObj = { pageNum, total, pages }
        let objs = list.map(v => ({
          id: v.fileDataId,
          title: v.fileName,
          date: v.uploadTimeDesc,
          size: v.fileSize + ' MB',
          type: v.fileDataType,
          typeStr: v.fileDataTypeDesc,
          cate: v.classTwoDesc,
          brand: v.brandDesc,
          state: v.fileDataStatusDesc,
          download: v.downloadCount
        }))
        typeof buildFunc === 'function' && buildFunc(objs)
        typeof pageFunc === 'function' && pageFunc(pageObj)
      })
    })
  }

  function getStars(obj, buildFunc, pageFunc) {
    $.post('account/queryMyFavorites', obj, function done(res) {
      handleResult(res, function(data) {
        let { pageNum, total, pages, list } = data
        let pageObj = { pageNum, total, pages }
        let objs = list.map(v => ({
          id: v.fileDataId,
          title: v.fileName,
          date: v.dataTimeDesc,
          size: v.fileSize + ' MB',
          type: v.fileDataType,
          typeStr: v.fileDataTypeDesc,
          cate: v.classTwoDesc,
          brand: v.brandDesc,
          state: v.fileDataStatusDesc,
          bonus: v.requiredIntegral,
          download: v.downloadCount,
          fav: true
        }))
        typeof buildFunc === 'function' && buildFunc(objs)
        typeof pageFunc === 'function' && pageFunc(pageObj)
      })
    })
  }

  function getBonus(obj, buildFunc, pageFunc) {
    $.post('account/queryMyIntegrals', obj, function done(res) {
      handleResult(res, function(data) {
        let { pageNum, total, pages, list } = data
        let pageObj = { pageNum, total, pages }
        let objs = list.map(v => ({
          time: v.addTimeDesc,
          type: v.integralTypeDesc,
          remark: v.description,
          bonus: v.integral,
          operand: parseInt(v.inOutType) === 1 ? '+' : '-'
        }))
        typeof buildFunc === 'function' && buildFunc(objs)
        typeof pageFunc === 'function' && pageFunc(pageObj)
      })
    })
  }

  function downloadCheck(obj, done) {
    $.post('fileData/checkFileDownload', obj, function(res) {
      handleResult(res, done)
    })
  }

  function starFile(obj, done) {
    $.post('account/doFavorites', obj, function(res) {
      handleResult(res, done)
    })
  }
})()
