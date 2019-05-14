;(function() {
  $(function() {
    initType()
    initDetail()
    initComment()
  })

  function initType() {
    let qsObj = qs(window.location.search)
    let parsed = !!qsObj.type && qsObj.type === 'parsed'

    if (parsed) {
      // navbar
      $('nav.navbar .navbar-nav li.nav-item')
        .eq(2)
        .addClass('active')
        .siblings()
        .removeClass('active')
      // breadcrumb
      $('nav ol.breadcrumb li.breadcrumb-item')
        .eq(0)
        .html('<a href="./parsed.html">解析文件库</a>')
      // file info
      $('.card .card-body ul.author li')
        .eq(3)
        .text('解析文件')
      $('<li>需 5 积分</li>').insertBefore(
        '.card .card-body ul.author li.download'
      )
    }
  }

  function initDetail() {
    $('.card .star').on('click', function star() {
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

    $('.card ul.author .download').on('click', function showModal() {
      $('#downloadModal').modal()
    })

    $('#downloadModal #downloadBtn').on('click', function download() {
      console.log('download')
      $('#downloadModal').modal('hide')
    })
  }

  function initComment() {
    let $publish = $('.card .publish')
    let $textarea = $publish.find('textarea')
    let $send = $publish.find('button.send')
    $send.on('click', function send() {
      let comment = {
        user: '张腾',
        time: moment().format('YYYY-MM-DD HH:mm:ss'),
        content: $textarea.val().trim()
      }
      $('.card ul.comment').prepend(buildComment(comment))
      $textarea.val('')
    })
  }

  function buildComment(obj) {
    return `
      <li class="row">
        <div class="icon">
          <i class="material-icons">face</i>
        </div>
        <div class="col">
          <h4>${obj.user}</h4>
          <span>${obj.time}</span>
          <p>${obj.content}</p>
        </div>
      </li>
    `
  }
})()
