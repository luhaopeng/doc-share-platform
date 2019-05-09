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
    let $table = $('#table_origin')
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

    // data
    let $tbody = $table.find('tbody')
    for (let i = 0; i < 5; i++) {
      $tbody.append(buildRankRow(randFile()))
    }

    // limit
    let $limit = $('.result nav .limit select')
    $limit.on('change', function limit(e) {
      let pageSize = parseInt(e.target.value)
      $tbody.html('')
      for (let i = 0; i < pageSize; i++) {
        $tbody.append(buildRankRow(randFile()))
      }
    })

    // click
    $tbody.on('click', 'tr', function detail(e) {
      let tag = e.target.tagName
      if (/tr|td/i.test(tag)) {
        // prettier-ignore
        let id = $(this).closest('tr').attr('data-id')
        window.location.href = `file.html?file=${id}`
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
            type="button"
            class="btn btn-warning"
            title="${obj.fav ? '取消' : ''}收藏"
          >
            <i class="material-icons">star${obj.fav ? '' : '_border'}</i>
          </button>
          <button type="button" class="btn btn-success" title="下载">
            <i class="material-icons">get_app</i>
          </button>
        </td>
      </tr>
    `
  }

  function randFile() {
    const titles = [
      '常见react面试题汇总（适合中级前端）',
      'SSM主流框架入门与综合项目实战',
      'Java开发企业级权限管理系统',
      'Linux随机密码'
    ]
    const dates = ['2019-05-09', '2019-05-08', '2019-05-07']
    const cates = ['电脑', '空调', '热水器', '冰箱']
    const brands = ['海尔', '格力', '美的', '西门子', '三星', '松下']
    const companys = [
      '华立科技股份有限公司',
      '威盛集团有限公司',
      '江苏林洋能源有限公司',
      '深圳市科陆电子科技股份有限公司'
    ]
    const states = ['已解析', '未解析']
    const favs = [true, false]
    return {
      id: parseInt(Math.random() * 100),
      title: rand(titles),
      date: rand(dates),
      size: (Math.random() * 100).toFixed(2) + 'MB',
      type: '原始文件',
      cate: rand(cates),
      brand: rand(brands),
      company: rand(companys),
      state: rand(states),
      download: parseInt(Math.random() * 100),
      fav: rand(favs)
    }
  }

  function rand(arr) {
    return arr[(Math.random() * arr.length) | 0]
  }
})()
