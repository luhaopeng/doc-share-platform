;(function() {
  // initial params
  let params = {
    pageNum: 1,
    pageSize: 5,
    fileDataType: 2,
    sortType: 1,
    keyWord: '',
    classOne: 0,
    classTwo: 0,
    brands: []
  }

  $(function() {
    initFilter()
    initRank()
  })

  function initFilter() {
    // parse filter obj
    let filterObj = JSON.parse(filterObjStr)
    let brands = filterObj.BRAND.map(obj => ({
      id: obj.value,
      label: obj.name
    }))
    let categories = filterObj.CLASS_ONE.map(obj => {
      let children = obj.childrens.map(child => ({
        id: child.value,
        label: child.name
      }))
      return {
        id: obj.value,
        label: obj.name,
        children
      }
    })
    // build conditions
    let $combine = $('.filter .combine')
    let $condition = $('.filter .condition')

    $condition
      .html('')
      .append(
        buildCondition({
          cat: 'brand',
          catStr: '品牌',
          options: brands,
          multi: true
        })
      )
      .append(
        buildCondition({
          cat: 'type',
          catStr: '设备类型',
          options: categories,
          multi: false
        })
      )

    $combine
      .on('click', '.factor', function cancel() {
        let $target = $(this)
        let cat = $target.attr('data-cat')
        $condition.children(`.row[data-cat=${cat}]`).show()
        $target.remove()
        switch (cat) {
          case 'brand':
            params.brands = []
            break
          case 'type':
            params.classOne = 0
            params.classTwo = 0
            $target.siblings('[data-cat="subtype"]').remove()
            $condition.find('[data-cat="subtype"]').remove()
            break
          case 'subtype':
            params.classTwo = 0
            break
          default:
            return
        }
        getRankData(params)
      })
      .on('click', '.reset', function reset() {
        $condition
          .children('.row[data-cat]')
          .show()
          .filter('[data-cat="subtype"]')
          .remove()
        $combine.children('.factor').remove()
        params.brands = []
        params.classOne = 0
        params.classTwo = 0
        getRankData(params)
      })
    $condition
      .on('click', '.row:not(.multi) .value a', function filter() {
        // single selection
        let $target = $(this)
        let $row = $target.closest('.row[data-cat]')
        let cat = $row.attr('data-cat')
        let val = $target.text()
        $(buildFactor(cat, val)).insertBefore('.filter .combine .reset')
        $row.hide()
        switch (cat) {
          case 'brand':
            params.brands = [parseInt($target.attr('data-id'), 10)]
            break
          case 'type':
            let typeId = parseInt($target.attr('data-id'), 10)
            params.classOne = typeId
            // find type
            let type = categories.find(v => v.id === typeId)
            if (type.children.length) {
              // build sub type
              $condition.append(
                buildCondition({
                  cat: 'subtype',
                  catStr: '设备次级类型',
                  options: type.children,
                  multi: false
                })
              )
            }
            break
          case 'subtype':
            params.classTwo = parseInt($target.attr('data-id'), 10)
            break
          default:
            return
        }
        getRankData(params)
      })
      .on('click', '.row.multi .value li', function select() {
        // multi-selection
        // toggle active
        let $target = $(this)
        $target.closest('li').toggleClass('active')
      })
      .on('click', '.extra .multi', function multi() {
        // enter multi-selection mode
        let $target = $(this)
        $target.closest('.row[data-cat]').addClass('multi')
      })
      .on('click', '.extra .submit', function submit() {
        // submit multi-selection
        let $target = $(this)
        let $row = $target.closest('.row.multi[data-cat]')
        let $active = $row.find('.value li.active')
        let cat = $row.attr('data-cat')
        let comb = ''
        let multi = []
        $active.text(function combine(idx, val) {
          comb += (idx ? ',' : '') + val
          let $a = $(this).find('a')
          multi.push(parseInt($a.attr('data-id'), 10))
        })
        if (comb) {
          $(buildFactor(cat, comb)).insertBefore('.filter .combine .reset')
          $row.hide()
          params.brands = multi
          getRankData(params)
        }
        $row.removeClass('multi')
        $active.removeClass('active')
      })
      .on('click', '.extra .cancel', function cancel() {
        // exit multi-selection mode
        let $target = $(this)
        let $row = $target.closest('.row.multi[data-cat]')
        let $active = $row.find('.value li.active')
        $row.removeClass('multi')
        $active.removeClass('active')
      })
  }

  function initRank() {
    let $table = $('#table_parsed')
    let $tbody = $table.find('tbody')
    // initial data
    getRankData(params)

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
        params.sortType = $cur_a.attr('data-type')
        // reload data
        getRankData(params)
      }
    })

    // limit
    let $nav = $table.siblings('nav')
    let $limit = $nav.find('.limit select')
    $limit.on('change', function limit(e) {
      params.pageNum = 1
      params.pageSize = parseInt(e.target.value, 10)
      // reload data
      getRankData(params)
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
        // reload data
        getRankData(params)
      }
    })

    // search
    let $search = $table.closest('.card.result').siblings('.search')
    $search
      .on('change', '.search-box', function() {
        // prettier-ignore
        params.keyWord = $(this).val().trim()
      })
      .on('click', '.search-btn', function() {
        // reload data
        getRankData(params)
      })
      .on('keydown', '.search-box', function(e) {
        if (e.keyCode == 13) {
          // prettier-ignore
          params.keyWord = $(this).val().trim()
          // reload data
          getRankData(params)
        }
      })

    // click
    $tbody.on('click', 'tr', function detail(e) {
      let tag = e.target.tagName
      if (/tr|td/i.test(tag)) {
        // prettier-ignore
        let id = $(this).closest('tr').attr('data-id')
        let $form = $(`
          <form
            action="fileData/fileDataDetail"
            method="post"
            target="_blank"
            rel="noopener noreferrer"
            style="display:none;"
          >
            <input name="fileDataId" value="${id}" />
            <input name="fileDataType" value="2" />
          </form>
        `)
        $(document.body).append($form)
        $form.submit().remove()
      }
    })
    $tbody
      .on('click', 'button[data-action=star]', function star() {
        let $target = $(this)
        let $tr = $target.closest('tr')
        let id = $tr.attr('data-id')
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
        $.toast().reset('all')
        if (action === 'star') {
          starFile(
            { fileDataId: id, fileDataType: 2, opsFavoritesType: 1 },
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
            { fileDataId: id, fileDataType: 2, opsFavoritesType: 2 },
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
      })
      .on('click', 'button[data-action=download]', function() {
        // prettier-ignore
        let id = $(this).closest('tr').attr('data-id')
        let $downloadModal = $('#downloadModal')
        let targetFile = { fileDataId: id, fileDataType: 2 }
        downloadCheck(targetFile, function(data) {
          if (parseInt(data.requiredIntegral, 10)) {
            // confirm modal
            $downloadModal.find('.modal-body').html(`
              使用<b class="cost"> ${data.requiredIntegral} 积分</b>下载此文件？
              当前积分余额：<b class="remain">${data.currentIntegral} 积分</b>。
            `)
            $downloadModal.modal()
            $downloadModal.one('click', '#downloadBtn', function() {
              download(targetFile)
              $downloadModal.modal('hide')
            })
          } else {
            // download
            download(targetFile)
          }
        })
      })
  }

  function buildCondition(obj) {
    let lis = ''
    obj.options.map(v => {
      lis += `<li><a data-id="${v.id}">${v.label}</a></li>`
    })
    let mult = `
      <div class="col-sm-2 extra">
        <a class="submit">提交</a>
        <a class="cancel">取消</a>
        <a class="multi">
          <i class="material-icons">add</i>
          多选
        </a>
      </div>
    `
    return `
      <div class="row" data-cat="${obj.cat}">
        <div class="col-sm-2 key">
          ${obj.catStr}：
        </div>
        <ul class="col-sm-8 value">
          ${lis}
        </ul>
        ${obj.multi ? mult : ''}
      </div>
    `
  }

  function buildFactor(cat, value) {
    let translate
    switch (cat) {
      case 'brand':
        translate = '品牌'
        break
      case 'type':
        translate = '设备类型'
        break
      case 'subtype':
        translate = '设备次级类型'
        break
      default:
        translate = ''
        break
    }
    let em = value
    if (em.length > 7) {
      em = em.substr(0, 7) + '...'
    }
    return `
      <a
        class="factor"
        title="${value}"
        data-cat="${cat}"
      >
        <b>${translate}：</b>
        <em>${em}</em>
        <i class="material-icons">close</i>
      </a>
    `
  }

  function buildRankRow(obj) {
    return `
      <tr data-id="${obj.id}">
        <td
          class="text-left"
          title="${obj.title}"
        >
          <div class="text-ellipsis">${obj.title}</div>
        </td>
        <td>${obj.date}</td>
        <td>${obj.size}</td>
        <td>${obj.type}</td>
        <td>${obj.cate}</td>
        <td>${obj.brand}</td>
        <td title="${obj.company}">${obj.company.substr(0, 6)}</td>
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

  function buildPage(options) {
    let $pagination = $('#table_parsed')
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

  function getRankData(obj) {
    let $tbody = $('#table_parsed tbody')
    $.post('fileData/queryFileData', obj, function(res) {
      handleResult(res, function(data) {
        // build table
        $tbody.html('')
        let $table = $tbody.closest('table')
        $table.siblings('.empty').remove()
        if (data.list.length === 0) {
          $('<div class="empty">暂无数据</div>').insertAfter($table)
        } else {
          data.list.map(file => {
            $tbody.append(
              buildRankRow({
                id: file.fileDataId,
                title: file.fileName,
                date: file.dataTimeDesc,
                size: file.fileSizeDesc,
                type: file.fileDataTypeDesc,
                cate: file.classTwoDesc,
                brand: file.brandDesc,
                company: file.enterprise,
                bonus: parseInt(file.requiredIntegral, 10),
                download: file.downloadCount,
                fav: parseInt(file.favoriteStatus, 10) === 1
              })
            )
          })
        }
        // build pagination
        let { pageNum, total, pages } = data
        buildPage({ pageNum, total, pages })
      })
    })
  }

  function downloadCheck(obj, done) {
    $.post('fileData/checkFileDownload', obj, function(res) {
      handleResult(res, done)
    })
  }

  function download(obj) {
    let url = $('base').attr('href') + 'fileData/doFileDownload'
    $.fileDownload(url, { httpMethod: 'POST', data: obj })
  }

  function starFile(obj, done) {
    $.post('account/doFavorites', obj, function(res) {
      handleResult(res, done)
    })
  }
})()
