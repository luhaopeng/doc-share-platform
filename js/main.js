(function(){
  $(function(){
    // 所有统计时间
    $('.card .card-footer .stats').html(`
      <i class="material-icons">access_time</i>
      统计时间：${moment().format('YYYY-MM-DD HH:mm:ss')}
    `)
    initUserInfo()
    initBasis()
    initRank()
  })

  function initUserInfo() {
    $.post('account/queryAccountInfo', function(res) {
      handleResult(res, function(data) {
        let {
          account,
          enterprise,
          integral,
          uploadFileCount,
          beDownloadFileCount,
          favoritesFileCount
        } = data
        let $user = $('.card.user')
        let $header = $user.find('.card-header h4')
        $header.text(account + ' / ' + enterprise)
        let $stats = $user.find('.stats p')
        $stats.eq(0).text(uploadFileCount)
        $stats.eq(1).text(beDownloadFileCount)
        $stats.eq(2).text(favoritesFileCount)
        $stats.eq(3).text(integral)
      })
    })
  }

  function initBasis() {
    $.post('main/queryBaseData', function(res) {
      handleResult(res, function(data) {
        let {
          typeList,
          brandList,
          otherList
        } = data

        initPie1(typeList)
        initPie2(brandList, otherList)
      })
    })
  }

  function initPie1(list) {
    let labels = []
    let total = 0
    let series = list.map(obj => {
      labels.push(obj.name)
      total += parseInt(obj.typeNum, 10)
      return {
        meta: obj.name,
        value: obj.typeNum
      }
    })
    new Chartist.Pie(
      '#chart_pie_1',
      { series },
      {
        height: '200px',
        labelOffset: 15,
        showLabel: false,
        plugins: [
          Chartist.plugins.legend({ legendNames: labels }),
          Chartist.plugins.tooltip({
            tooltipOffset: { x: 14, y: -10 }
          })
        ]
      }
    )
    let desc = ''
    list.map(obj => {
      desc += `
        ${obj.name}
        <span>
          ${((parseInt(obj.typeNum, 10) / total) * 100).toFixed()}%
        </span>
      `
    })
    $('.card p.chart-pie-1').html(desc)
  }

  function initPie2(list, other) {
    let labels = []
    let total = 0
    let series = list.map(obj => {
      labels.push(obj.name)
      total += parseInt(obj.typeNum, 10)
      return {
        meta: obj.name,
        value: obj.typeNum
      }
    })
    new Chartist.Pie(
      '#chart_pie_2',
      { series },
      {
        height: '200px',
        labelOffset: 15,
        showLabel: false,
        plugins: [
          Chartist.plugins.legend({ legendNames: labels }),
          Chartist.plugins.tooltip({
            tooltipOffset: { x: 14, y: -10 }
          })
        ]
      }
    )
    let desc = ''
    let otherName, otherNum
    list.map(obj => {
      if (obj.name !== '其他') {
        desc += `
          ${obj.name}
          <span>
            ${((parseInt(obj.typeNum, 10) / total) * 100).toFixed()}%
          </span>
        `
      } else {
        otherName = obj.name
        otherNum = obj.typeNum
      }
    })
    let $cardBody = $('.card p.chart-pie-2')
    $cardBody.html(desc)
    if (other.length) {
      let otherLink = `
        <a
          class="other"
          tabindex="0"
          title="其他"
          data-trigger="hover"
        >
          ${otherName}
          <span>
            ${((parseInt(otherNum, 10) / total) * 100).toFixed()}%
          </span>
        </a>
      `
      $cardBody.append(otherLink)
      let detail = ''
      other.map(obj => {
        detail += `
          ${obj.name}
          ${((parseInt(obj.typeNum, 10) / total) * 100).toFixed()}%
          <br />
        `
      })
      $cardBody.find('.other').popover({
        html: true,
        content: detail
      })
    }
  }

  function initRank() {
    // initial params
    let params = { circleType: 1 }
    let $table = $('#table_rank')
    let $tbody = $table.find('tbody')

    // nav tab
    let $nav = $table.closest('.card').find('ul.nav-tabs')
    $nav.on('click', '.nav-link', function tab() {
      let $this = $(this)
      if ($this.hasClass('active')) {
        return
      }
      $nav.find('.nav-link').removeClass('active')
      $this.addClass('active')
      params.circleType = parseInt($this.attr('data-type'), 10)
      getRankData(params)
    })

    // click
    $tbody.on('click', 'tr', function detail(e) {
      let tag = e.target.tagName
      if (/tr|td|div/i.test(tag)) {
        // prettier-ignore
        let $tr = $(this).closest('tr')
        let id = $tr.attr('data-id')
        let $form = $(`
          <form
            action="fileData/fileDataDetail"
            method="post"
            target="_blank"
            rel="noopener noreferrer"
            style="display:none;"
          >
            <input name="fileDataId" value="${id}" />
          </form>
        `)
        $(document.body).append($form)
        $form.submit().remove()
      }
    })

    getRankData(params)

    function getRankData(obj) {
      $.post('main/queryFileDownloadTop5', obj, function(res) {
        handleResult(res, function(data) {
          $tbody.html('')
          // build table
          $tbody.html('')
          let $table = $tbody.closest('table')
          $table.siblings('.empty').remove()
          if (data.length === 0) {
            $('<div class="empty">暂无数据</div>').insertAfter($table)
          } else {
            data.map(file => {
              $tbody.append(`
                <tr data-id=${file.fileDataId}>
                  <td class="text-left">${file.fileName}</td>
                  <td>${file.enterprise}</td>
                  <td>${file.classTwoDesc}</td>
                  <td>${file.brandDesc}</td>
                  <td>${file.dataTimeDesc}</td>
                  <td>${file.downloadCount}</td>
                </tr>
              `)
            })
          }
        })
      })
    }
  }

})()
