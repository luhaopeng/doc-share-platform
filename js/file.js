;(function() {
  $(function() {
    initType()
    initDetail()
    initComment()
  })

  function initType() {
    // navbar
    let navLink = fileType === 1 ? 'base' : 'analysis'
    $(`nav.navbar .navbar-nav .nav-link[href*="${navLink}"]`)
      .parent()
      .addClass('active')
      .siblings()
      .removeClass('active')
    // breadcrumb
    $('nav ol.breadcrumb li.breadcrumb-item').eq(0).html(`
      <a href="fileData/${fileType === 2 ? 'analysis' : 'base'}FileData">
        ${fileType === 2 ? '解析' : '原始'}文件库
      </a>
    `)
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

    if (fileType === 2) {
      $('.card ul.author .download').on('click', function showModal() {
        $('#downloadModal').modal()
      })

      $('#downloadModal #downloadBtn').on('click', function download() {
        $('#downloadModal').modal('hide')
      })
    }

    getDetailData()

    function getDetailData() {
      $.post(
        'fileData/queryFileDataDetail',
        {
          fileDataId: fileId,
          fileDataType: fileType
        },
        function(res) {
          handleResult(res, function(data) {
            let {
              fileDataTypeDesc,
              account,
              enterprise,
              fileName,
              fileSize,
              dataTimeDesc,
              downloadCount,
              favoriteStatus,
              requiredIntegral,
              remark,
              classOneDesc,
              classTwoDesc,
              brandDesc,
              model,
              standard,
              pattern,
              ratedV,
              ratedI,
              ratedP,
              equipmentBrand,
              equipmentModel,
              samplingRate,
              variableRatio,
              unitV,
              unitI
            } = data
            // star
            let $info = $('.card:first-of-type')
            let $body = $info.find('.card-body')
            $info
              .find('.star')
              .attr({
                title: favoriteStatus === 1 ? '取消收藏' : '收藏',
                'data-toggle': favoriteStatus === 1 ? 'unstar' : 'star'
              })
              .children('i')
              .text(favoriteStatus === 1 ? 'star' : 'star_border')
            // info
            $body.find('.card-title').text(fileName)
            $body.find('.intro').text(remark)
            // author
            let bonus = `<li>需 ${requiredIntegral} 积分</li>`
            $body.find('.author').html(`
              <li>${account}</li>
              <li>${enterprise}</li>
              <li>${dataTimeDesc}</li>
              <li>${fileDataTypeDesc}</li>
              <li>${downloadCount} 次下载</li>
              ${parseInt(requiredIntegral) > 0 ? bonus : ''}
              <li title="下载" class="download">
                <i class="material-icons">get_app</i>
                ${fileSize} MB
              </li>
            `)
            // stat
            // part 1
            let $part = $body.find('.stat .part')
            let $data1 = $part.eq(0).find('.row .row div:last-child')
            $data1.eq(0).text(`${classOneDesc}/${classTwoDesc}`)
            $data1.eq(1).text(brandDesc)
            $data1.eq(2).text(model)
            $data1.eq(3).text(standard)
            $data1.eq(4).text(pattern)
            $data1.eq(5).text(`${ratedV}/${ratedI}`)
            $data1.eq(6).text(ratedP)
            // part 2
            let $data2 = $part.eq(1).find('.row .row div:last-child')
            $data2.eq(0).text(equipmentBrand)
            $data2.eq(1).text(equipmentModel)
            $data2.eq(2).text(samplingRate)
            $data2.eq(3).text(variableRatio)
            $data2.eq(4).text(unitV)
            $data2.eq(5).text(unitI)
          })
        }
      )
    }
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
