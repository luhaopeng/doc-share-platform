;(function() {
  let uploader
  let curStep = 1

  $(function() {
    initUploader()
    initNav()
  })

  function initUploader() {
    uploader = new WebUploader.Uploader({
      swf: '../lib/Uploader.swf',
      // TODO
      server: 'http://webuploader.duapp.com/server/fileupload.php',
      pick: {
        id: '#pickBtn',
        multiple: false
      },
      accept: {
        mimeTypes: 'text/plain,application/matlab-mat'
      }
    })
    uploader
      .on('beforeFileQueued', function() {
        uploader.reset()
      })
      .on('fileQueued', function(file) {
        $('.step-1 .cur-file')
          .addClass('show')
          .children('code')
          .text(file.name)
        // enable btn
        $('#navNext')
          .removeAttr('disabled')
          .removeAttr('title')
      })
  }

  function initNav() {
    $('#navPrev').on('click', prev)
    $('#navNext').on('click', function() {
      if (uploader && uploader.getFiles().length > 0) {
        next()
      }
    })
  }

  function prev() {
    let $content = $('.content')
    let $steps = $('.steps')
    let cur = $steps.find('.steps-item-process').index()
    if (cur > 0) {
      curStep--
      // switch steps
      let $items = $steps.find('.steps-item')
      $items
        .eq(cur - 1)
        .removeClass('steps-item-finish')
        .addClass('steps-item-process')
      $items
        .eq(cur)
        .removeClass('steps-item-process')
        .addClass('steps-item-wait')
      // switch content
      $content.find(`.step.step-${curStep + 1}`).removeClass('current')
      $content.find(`.step.step-${curStep}`).addClass('current')
      // switch action
      $content
        .find('.nav-action')
        .removeClass(`step-${curStep + 1}`)
        .addClass(`step-${curStep}`)
    }
  }

  function next() {
    let $content = $('.content')
    let $steps = $('.steps')
    let cur = $steps.find('.steps-item-process').index()
    let $items = $steps.find('.steps-item')
    let size = $items.length
    if (cur < size - 1) {
      curStep++
      // switch steps
      $items
        .eq(cur + 1)
        .removeClass('steps-item-wait')
        .addClass('steps-item-process')
      $items
        .eq(cur)
        .removeClass('steps-item-process')
        .addClass('steps-item-finish')
      // switch content
      $content.find(`.step.step-${curStep - 1}`).removeClass('current')
      $content.find(`.step.step-${curStep}`).addClass('current')
      // switch action
      $content
        .find('.nav-action')
        .removeClass(`step-${curStep - 1}`)
        .addClass(`step-${curStep}`)
    }
  }
})()
