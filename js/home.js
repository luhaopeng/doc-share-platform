;(function() {
  $(function() {
    initRank()
  })

  function initRank() {
    initTable('#table_upload')
    initTable('#table_star', true)
  }

  function initTable(selector, isStar) {
    let $table = $(selector)
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
      $tbody.append(buildRankRow(randFile(isStar), isStar))
    }

    // limit
    let $limit = $('.result nav .limit select')
    $limit.on('change', function limit(e) {
      let pageSize = parseInt(e.target.value)
      $tbody.html('')
      for (let i = 0; i < pageSize; i++) {
        $tbody.append(buildRankRow(randFile(isStar), isStar))
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
    if (isStar) {
      $('#downloadModal #downloadBtn').on('click', function download() {
        $('#downloadModal').modal('hide')
      })
      $tbody
        .on('click', 'button[data-action=star]', function star() {
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
        .on('click', 'button[data-action=download]', function download() {
          let $tr = $(this).closest('tr')
          // TODO use obj.id
          let bonusStr = $tr.find('td:nth-child(8)').text()
          if (parseInt(bonusStr) > 0) {
            $('#downloadModal').modal()
          }
        })
    }
  }

  function buildRankRow(obj, isStar) {
    let action = `
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
    `
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
        <td>${obj.state}</td>
        ${isStar ? `<td>${obj.bonus}</td>` : ''}
        <td class="text-right">${obj.download}</td>
        ${isStar ? action : ''}
      </tr>
    `
  }

  function randFile(isStar) {
    const titles = [
      '常见react面试题汇总（适合中级前端）',
      'SSM主流框架入门与综合项目实战',
      'Java开发企业级权限管理系统',
      'Linux随机密码'
    ]
    const dates = ['2019-05-09', '2019-05-08', '2019-05-07']
    const cates = ['电脑', '空调', '热水器', '冰箱']
    const brands = ['海尔', '格力', '美的', '西门子', '三星', '松下']
    const states = ['已解析', '未解析']
    const objs = [
      { type: '原始文件', bonus: 0 },
      { type: '解析文件', bonus: 5 }
    ]
    let obj = rand(objs)
    return {
      id: parseInt(Math.random() * 100),
      title: rand(titles),
      date: rand(dates),
      size: (Math.random() * 100).toFixed(2) + 'MB',
      type: isStar ? obj.type : '原始文件',
      cate: rand(cates),
      brand: rand(brands),
      state: rand(states),
      bonus: obj.bonus,
      download: parseInt(Math.random() * 100),
      fav: true
    }
  }

  function rand(arr) {
    return arr[(Math.random() * arr.length) | 0]
  }
})()
