;(function() {
  $(function() {
    initDetail()
    initComment()
  })

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
      $.toast().reset('all')
      if (action === 'star') {
        starFile({ fileDataId: fileId, opsFavoritesType: 1 }, function() {
          $target
            .attr({ 'data-toggle': 'unstar', title: '取消收藏' })
            .children('.material-icons')
            .text('star')
          $.toast({
            heading: '收藏成功',
            ...TOAST_OPTION
          })
        })
      } else if (action === 'unstar') {
        starFile({ fileDataId: fileId, opsFavoritesType: 2 }, function() {
          $target
            .attr({ 'data-toggle': 'star', title: '收藏' })
            .children('.material-icons')
            .text('star_border')
          $.toast({
            heading: '已取消收藏',
            ...TOAST_OPTION
          })
        })
      }
    })

    $('.card')
      .on(
        'click',
        'ul.author .download, h3.feature .download',
        function showModal(e) {
          let $downloadModal = $('#downloadModal')
          let targetFile = { fileDataId: fileId }
          let type = $(e.target).attr('data-type')
          if (type === 'feature') {
            targetFile.fileDataType = 3
          } else {
            targetFile.fileDataType = 1
          }
          downloadCheck(targetFile, function(data) {
            if (parseInt(data.requiredIntegral, 10)) {
              // confirm modal
              $downloadModal.find('.modal-body').html(`
              使用<b class="cost"> ${data.requiredIntegral} 积分</b>下载此文件？
              当前积分余额：<b class="remain">${data.currentIntegral} 积分</b>。
            `)
              $downloadModal.modal()
              $downloadModal.one('click', '#downloadBtn', function() {
                // download
                download(targetFile)
                $downloadModal.modal('hide')
              })
            } else {
              // download
              download(targetFile)
            }
          })
        }
      )
      .on('click', 'ul.author .preview', function newTab() {
        let prefix = $('base').attr('href')
        let url = `${prefix}fileData/queryChartImg?fileDataId=${fileId}`
        window.open(url)
      })

    getDetailData()

    function getDetailData() {
      $.post(
        'fileData/queryFileDataDetail',
        {
          fileDataId: fileId
        },
        function(res) {
          handleResult(res, function(data) {
            let {
              account,
              enterprise,
              fileName,
              fileSizeDesc,
              dataTimeDesc,
              downloadCount,
              fileDataStatus,
              fileDataStatusDesc,
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
            let preview
            if (parseInt(fileDataStatus, 10) === 2) {
              preview = `
                <li title="预览" class="preview">
                  <i class="material-icons">image</i>
                  预览
                </li>
              `
              // feature
              $body.append(buildFeature(data))
            } else {
              preview = `<li>${fileDataStatusDesc}</li>`
            }
            $body.find('.author').html(`
              <li>${account}</li>
              <li>${enterprise}</li>
              <li>${dataTimeDesc}</li>
              <li>${downloadCount} 次下载</li>
              ${parseInt(requiredIntegral, 10) > 0 ? bonus : ''}
              ${preview}
              <li title="下载" class="download">
                <i class="material-icons">get_app</i>
                ${fileSizeDesc}
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

  function buildFeature(obj) {
    let {
      openmaxpStr,
      openmaxqStr,
      openminpStr,
      openminqStr,
      closemaxpStr,
      closemaxqStr,
      closeminpStr,
      closeminqStr,
      basecurrentStr,
      xb1realStr,
      xb1imaginaryStr,
      xb2realStr,
      xb2imaginaryStr,
      xb3realStr,
      xb3imaginaryStr,
      xb4realStr,
      xb4imaginaryStr,
      xb5realStr,
      xb5imaginaryStr,
      xb6realStr,
      xb6imaginaryStr,
      xb7realStr,
      xb7imaginaryStr,
      xb8realStr,
      xb8imaginaryStr,
      xb9realStr,
      xb9imaginaryStr,
      xb10realStr,
      xb10imaginaryStr,
      xb11realStr,
      xb11imaginaryStr
    } = obj
    return `
      <h3 class="feature">
        特征量参数
        <button
          data-type="feature"
          type="button"
          style="padding-left: 0.5rem;padding-right: 0.5rem;"
          class="btn btn-sm btn-success download"
          title="下载"
        >
          <i class="material-icons">get_app</i>
        </button>
      </h3>
      <div class="container-fluid stat">
        <div class="part">
          <h4>暂态</h4>
          <div class="row">
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">暂态开启最大有功功率</div>
                <div class="col-sm-5">${openmaxpStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">暂态开启最大无功功率</div>
                <div class="col-sm-5">${openmaxqStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">暂态开启最小有功功率</div>
                <div class="col-sm-5">${openminpStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">暂态开启最小无功功率</div>
                <div class="col-sm-5">${openminqStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">暂态关闭最大有功功率</div>
                <div class="col-sm-5">${closemaxpStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">暂态关闭最大无功功率</div>
                <div class="col-sm-5">${closemaxqStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">暂态关闭最小有功功率</div>
                <div class="col-sm-5">${closeminpStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">暂态关闭最小无功功率</div>
                <div class="col-sm-5">${closeminqStr}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="part">
          <h4>稳态</h4>
          <div class="row">
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">一次谐波实部</div>
                <div class="col-sm-5">${xb1realStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">一次谐波虚部</div>
                <div class="col-sm-5">${xb1imaginaryStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">二次谐波实部</div>
                <div class="col-sm-5">${xb2realStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">二次谐波虚部</div>
                <div class="col-sm-5">${xb2imaginaryStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">三次谐波实部</div>
                <div class="col-sm-5">${xb3realStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">三次谐波虚部</div>
                <div class="col-sm-5">${xb3imaginaryStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">四次谐波实部</div>
                <div class="col-sm-5">${xb4realStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">四次谐波虚部</div>
                <div class="col-sm-5">${xb4imaginaryStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">五次谐波实部</div>
                <div class="col-sm-5">${xb5realStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">五次谐波虚部</div>
                <div class="col-sm-5">${xb5imaginaryStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">六次谐波实部</div>
                <div class="col-sm-5">${xb6realStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">六次谐波虚部</div>
                <div class="col-sm-5">${xb6imaginaryStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">七次谐波实部</div>
                <div class="col-sm-5">${xb7realStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">七次谐波虚部</div>
                <div class="col-sm-5">${xb7imaginaryStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">八次谐波实部</div>
                <div class="col-sm-5">${xb8realStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">八次谐波虚部</div>
                <div class="col-sm-5">${xb8imaginaryStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">九次谐波实部</div>
                <div class="col-sm-5">${xb9realStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">九次谐波虚部</div>
                <div class="col-sm-5">${xb9imaginaryStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">十次谐波实部</div>
                <div class="col-sm-5">${xb10realStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">十次谐波虚部</div>
                <div class="col-sm-5">${xb10imaginaryStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">十一次谐波实部</div>
                <div class="col-sm-5">${xb11realStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">十一次谐波虚部</div>
                <div class="col-sm-5">${xb11imaginaryStr}</div>
              </div>
            </div>
            <div class="col-sm-3">
              <div class="row">
                <div class="col-sm-7">基波电流</div>
                <div class="col-sm-5">${basecurrentStr}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  function initComment() {
    // initial params
    let params = {
      fileDataId: fileId,
      pageNum: 1,
      pageSize: 10
    }
    let $card = $('.card')
    let $commentDiv = $card.find('.comment-list')
    let $comment = $commentDiv.find('ul.comment')
    // publish
    let $publish = $card.find('.publish')
    let $textarea = $publish.find('textarea')
    let $send = $publish.find('button.send')
    $send.on('click', function send() {
      comment(
        {
          fileDataId: fileId,
          content: $textarea.val().trim()
        },
        function() {
          $textarea.val('')
          params.pageNum = 1
          getCommentData(params)
        }
      )
    })
    // delete comment
    $comment.on('click', '.del', function(e) {
      let id = $(e.target).closest('li').attr('data-id')
      delComment({ commentId: id })
    })

    // page change
    let $pagination = $commentDiv.find('ul.pagination')
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
        getCommentData(params)
      }
    })

    getCommentData(params)

    function getCommentData(obj) {
      $.post('account/queryComments', obj, function(res) {
        handleResult(res, function(data) {
          let { pageNum, total, pages, list } = data
          // build list
          $commentDiv.find('.card-title').text(`评论（${list.length}）`)
          $comment.html('')
          list.map(v => {
            $comment.append(
              buildComment({
                id: v.id,
                user: v.account,
                time: v.commentTimeDes,
                content: v.content,
                removeable: !!parseInt(v.flag, 10)
              })
            )
          })
          // build pagination
          buildPage({ pageNum, total, pages })
        })
      })
    }

    function delComment(obj) {
      $.post('account/doDelComment', obj, function(res) {
        handleResult(res, function() {
          getCommentData(params)
        })
      })
    }

    function buildComment(obj) {
      let delSpan = ''
      if (obj.removeable) {
        delSpan = '<span class="del">删除</span>'
      }
      return `
        <li class="row" data-id="${obj.id}">
          <div class="icon">
            <i class="material-icons">face</i>
          </div>
          <div class="col">
            <h4>${obj.user}</h4>
            <div>
              <span>${obj.time}</span>${delSpan}
            </div>
            <p>${obj.content}</p>
          </div>
        </li>
      `
    }

    function buildPage(options) {
      let $pagination = $comment.siblings('nav').find('ul.pagination')
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
  }

  function starFile(obj, done) {
    $.post('account/doFavorites', obj, function(res) {
      handleResult(res, done)
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

  function comment(obj, done) {
    $.post('account/doComment', obj, function(res) {
      handleResult(res, done)
    })
  }
})()
