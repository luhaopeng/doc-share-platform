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
    let $rank_a = $('#table_origin a[data-rank]')
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
    if (em.length >= 8) {
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
})()
