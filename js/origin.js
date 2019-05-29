;(function() {
  $(function() {
    initFilter()
    initRank()
  })

  function initFilter() {
    let $combine = $('.filter .combine')
    let $condition = $('.filter .condition')
    $combine
      .on('click', '.factor', function cancel() {
        let $target = $(this)
        let cat = $target.attr('data-cat')
        $condition.children(`.row[data-cat=${cat}]`).show()
        $target.remove()
      })
      .on('click', '.reset', function reset() {
        $condition.children('.row[data-cat]').show()
        $combine.children('.factor').remove()
      })
    $condition
      .on('click', '.row:not(.multi) .value a', function filter() {
        let $target = $(this)
        let $row = $target.closest('.row[data-cat]')
        let cat = $row.attr('data-cat')
        let val = $target.text()
        $(buildFactor(cat, val)).insertBefore('.filter .combine .reset')
        $row.hide()
      })
      .on('click', '.row.multi .value li', function select() {
        let $target = $(this)
        $target.closest('li').toggleClass('active')
      })
      .on('click', '.extra .multi', function multi() {
        let $target = $(this)
        $target.closest('.row[data-cat]').addClass('multi')
      })
      .on('click', '.extra .submit', function submit() {
        let $target = $(this)
        let $row = $target.closest('.row.multi[data-cat]')
        let $active = $row.find('.value li.active')
        let cat = $row.attr('data-cat')
        let comb = ''
        $active.text(function combine(idx, val) {
          comb += (idx ? ',' : '') + val
        })
        if (comb) {
          $(buildFactor(cat, comb)).insertBefore('.filter .combine .reset')
          $row.hide()
        }
        $row.removeClass('multi')
        $active.removeClass('active')
      })
      .on('click', '.extra .cancel', function cancel() {
        let $target = $(this)
        let $row = $target.closest('.row.multi[data-cat]')
        let $active = $row.find('.value li.active')
        $row.removeClass('multi')
        $active.removeClass('active')
      })
  }

  function initRank() {
    // initial params
    let params = {
      pageNum: 1,
      pageSize: 5,
      fileDataType: 1,
      sortType: 1,
      keyWord: '',
      classOne: '',
      classTwo: '',
      brand: ''
    }
    let $table = $('#table_origin')
    let $tbody = $table.find('tbody')
    // initial data
    getRankData(params, $tbody)

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
        getRankData(params, $tbody)
      }
    })

    // limit
    let $nav = $table.siblings('nav')
    let $limit = $nav.find('.limit select')
    $limit.on('change', function limit(e) {
      params.pageSize = parseInt(e.target.value)
      // reload data
      getRankData(params, $tbody)
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
        // reload data
        getRankData(params, $tbody)
      }
    })

    // search
    let $search = $table.siblings('.search')
    $search
      .on('change', '.search-box', function() {
        // prettier-ignore
        params.keyWord = $(this).val().trim()
      })
      .on('click', '.search-btn', function() {
        // reload data
        getRankData(params, $tbody)
      })
      .on('keydown', '.search-box', function(e) {
        if (e.keyCode == 13) {
          // prettier-ignore
          params.keyWord = $(this).val().trim()
          // reload data
          getRankData(params, $tbody)
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
            style="display:none"
          >
            <input name="fileDataId" value="${id}" />
            <input name="fileDataType" value="1" />
          </form>
        `)
        $(document.body).append($form)
        $form.submit().remove()
      }
    })
    $tbody.on('click', 'button[data-action=star]', function star() {
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
      if (action === 'star') {
        $target
          .attr({ 'data-toggle': 'unstar', title: '取消收藏' })
          .children('.material-icons')
          .text('star')
        $.toast({
          heading: '收藏成功',
          ...TOAST_OPTION
        })
      } else if (action === 'unstar') {
        $target
          .attr({ 'data-toggle': 'star', title: '收藏' })
          .children('.material-icons')
          .text('star_border')
        $.toast({
          heading: '已取消收藏',
          ...TOAST_OPTION
        })
      }
    })
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
      default:
        translate = ''
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
        <td title="${obj.company}">${obj.company.substr(0, 4)}</td>
        <td>${obj.state}</td>
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
    let $pagination = $('#table_origin')
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

  function getRankData(obj, $tbody) {
    $.post('fileData/queryFileData', obj, function(res) {
      handleResult(res, function(data) {
        // build table
        $tbody.html('')
        data.list.map(file => {
          $tbody.append(
            buildRankRow({
              id: file.fileDataId,
              title: file.fileName,
              date: file.dataTimeDesc,
              size: file.fileSize + 'MB',
              type: file.fileDataTypeDesc,
              cate: file.classTwoDesc,
              brand: file.brandDesc,
              company: file.enterprise,
              state: file.fileDataStatusDesc,
              download: file.downloadCount,
              fav: false // TODO
            })
          )
        })
        // build pagination
        let { pageNum, total, pages } = data
        buildPage({ pageNum, total, pages })
      })
    })
  }
})()
