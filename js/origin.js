;(function() {
  $(function() {
    let $result = $('.filter .result')
    let $condition = $('.filter .condition')
    $result
      .on('click', '.factor', function cancel() {
        let $target = $(this)
        let cat = $target.attr('data-cat')
        $condition.children(`.row[data-cat=${cat}]`).show()
        $target.remove()
      })
      .on('click', '.reset', function reset() {
        $condition.children('.row[data-cat]').show()
        $result.children('.factor').remove()
      })
    $condition
      .on('click', '.row:not(.multi) .value a', function filter() {
        let $target = $(this)
        let $row = $target.closest('.row[data-cat]')
        let cat = $row.attr('data-cat')
        let val = $target.text()
        $(buildFactor(cat, val)).insertBefore('.filter .result .reset')
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
          $(buildFactor(cat, comb)).insertBefore('.filter .result .reset')
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
  })

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
