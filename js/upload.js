;(function() {
  let uploader
  let curStep = 1

  $(function() {
    initUploader()
    initNavBtn()
    initSelect()
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

  function initNavBtn() {
    $('#navPrev').on('click', prev)
    $('#navNext').on('click', function() {
      if (curStep === 1 && uploader && uploader.getFiles().length > 0) {
        next()
      }
    })
    $('#startUpload').on('click', function() {
      // prettier-ignore
      let $docTitle = $('#docTitle')
      let title = $docTitle.val().trim()
      let { length } = title
      if (length > 0 && length < 31 && /[\u4e00-\u9fa5]/.test(title)) {
        next()
      } else {
        $docTitle
          .addClass('error')
          .one('keydown', function() {
            $docTitle.removeClass('error')
          })
          .get(0)
          .scrollIntoView({ block: 'end', behavior: 'smooth' })
      }
    })
  }

  function initSelect() {
    const cat2 = {
      ysj: [
        {
          title: '空调',
          value: 'kt'
        },
        {
          title: '冰箱',
          value: 'bx'
        },
        {
          title: '净化器',
          value: 'jhq'
        }
      ],
      zm: [
        {
          title: '台灯',
          value: 'td'
        },
        {
          title: '显示器',
          value: 'xsq'
        }
      ]
    }
    let $level2 = $('#catLevel2')
    $('#catLevel1').on('change', function() {
      $level2.html('')
      let val = $(this).val()
      let options = cat2[val]
      if (options instanceof Array) {
        options.map(function buildOption(v) {
          $level2.append(`<option value="${v.value}">${v.title}</option>`)
        })
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
