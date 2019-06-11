;(function() {
  const PICKER_LOCALE = {
    format: 'YYYY/MM/DD',
    separator: ' - ',
    applyLabel: '应用',
    cancelLabel: '取消',
    fromLabel: '从',
    toLabel: '至',
    customRangeLabel: '自定义',
    weekLabel: '星期',
    daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
    // prettier-ignore
    monthNames: [
      '一月', '二月', '三月', '四月',
      '五月', '六月', '七月', '八月',
      '九月', '十月', '十一月', '十二月'
    ],
    firstDay: 1
  }

  $(function() {
    // 所有统计时间
    $('.card .card-footer .stats').html(`
      <i class="material-icons">access_time</i>
      统计时间：${moment().format('YYYY-MM-DD HH:mm:ss')}
    `)

    initBasis()
    initLine()
    initBar1()
    initBar2()
    initRank()
  })

  function initBasis() {
    $.post('main/queryBaseData', function(res) {
      handleResult(res, function(data) {
        let {
          totalFile,
          totalDownload,
          totalEnterprise,
          totalCustomer,
          typeList,
          brandList,
          otherList
        } = data
        let comma = $.animateNumber.numberStepFactories.separator(',')
        let option = {
          easing: 'swing',
          duration: 1000
        }
        $('#docCount span').animateNumber(
          {
            number: totalFile,
            numberStep: comma
          },
          option
        )
        $('#saveCount span').animateNumber(
          {
            number: totalDownload,
            numberStep: comma
          },
          option
        )
        $('#entCount span').animateNumber(
          {
            number: totalEnterprise,
            numberStep: comma
          },
          option
        )
        $('#userCount span').animateNumber(
          {
            number: totalCustomer,
            numberStep: comma
          },
          option
        )

        initPie1(typeList)
        initPie2(brandList, otherList)
      })
    })
  }

  function initLine() {
    const FORMAT_DISPLAY = 'YYYY/MM/DD'
    const FORMAT_API = 'YYYY-MM-DD'
    let params = { type: 2, startDate: '', endDate: '' }
    $('#switch_line').bootstrapSwitch({
      onText: '下载',
      offText: '上传',
      onColor: 'info',
      offColor: 'info',
      state: true,
      size: 'small',
      onSwitchChange: function(e, state) {
        params.type = state ? 2 : 1
        getLineData(params)
      }
    })
    let chartLine = new Chartist.Line(
      '#chart_line',
      {},
      {
        plugins: [Chartist.plugins.ctPointLabels()]
      }
    )

    let iStart = moment().startOf('month')
    let iEnd = moment().endOf('month')

    function pickerUpdate(start, end) {
      $('#range_line span').html(
        start.format(FORMAT_DISPLAY) + ' - ' + end.format(FORMAT_DISPLAY)
      )
      params.startDate = start.format(FORMAT_API)
      params.endDate = end.format(FORMAT_API)
      getLineData(params)
    }

    $('#range_line').daterangepicker(
      {
        startDate: iStart,
        endDate: iEnd,
        opens: 'center',
        maxSpan: {
          days: 31
        },
        locale: PICKER_LOCALE,
        // prettier-ignore
        ranges: {
          '最近7天': [moment().subtract(6, 'days'), moment()],
          '最近15天': [moment().subtract(14, 'days'), moment()],
          '最近30天': [moment().subtract(29, 'days'), moment()],
          '当月': [moment().startOf('month'), moment().endOf('month')],
          '上月': [
            moment().subtract(1, 'month').startOf('month'),
            moment().subtract(1, 'month').endOf('month')
          ]
        }
      },
      pickerUpdate
    )

    pickerUpdate(iStart, iEnd)

    function getLineData(obj) {
      $.post('main/queryUpAndDownFile', obj, function(res) {
        handleResult(res, function(data) {
          let { valueList, dataTimeList } = data
          chartLine.update({
            labels: dataTimeList.map(v => v.substr(8)),
            series: [valueList.map(v => parseInt(v, 10))]
          })
        })
      })
    }
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

  function initBar1() {
    // initial params
    let params = { fileType: 2, circleType: 3 }
    let chartBar

    $('#switch_bar_1').bootstrapSwitch({
      onText: '下载量',
      offText: '上传量',
      onColor: 'info',
      offColor: 'info',
      state: true,
      size: 'small',
      onSwitchChange: function(e, state) {
        params.fileType = state ? 2 : 1
        getBarData(params)
      }
    })

    $('#switch_bar_option_1').bootstrapSwitch({
      onText: '按年',
      offText: '按月',
      onColor: 'info',
      offColor: 'info',
      state: true,
      size: 'mini',
      onSwitchChange: function(e, state) {
        params.circleType = state ? 3 : 2
        getBarData(params)
      }
    })

    getBarData(params)

    function getBarData(obj) {
      $.post('main/queryVerticalFile', obj, function(res) {
        handleResult(res, function(data) {
          let legendNames = []
          let labels = []
          let series = []
          data.dataList.map((legend, idx) => {
            let part = []
            legendNames.push(legend.dataTime)
            legend.fileCountList.map(val => {
              if (labels.length < legend.fileCountList.length) {
                labels.push(val.xdata)
              }
              part.push(val.fileCount)
            })
            series[idx] = part
          })
          chartBar && chartBar.detach()
          chartBar = new Chartist.Bar(
            '#chart_bar_1',
            { labels, series },
            {
              seriesBarDistance: 10,
              plugins: [
                Chartist.plugins.legend({ legendNames }),
                Chartist.plugins.tooltip({
                  tooltipOffset: { x: 14, y: -10 }
                })
              ]
            }
          )
        })
      })
    }
  }

  function initBar2() {
    // initial params
    let params = { fileType: 1, circleType: 3, eid: 1, compareEid: 1 }
    let chartBar

    $('#switch_bar_option_2').bootstrapSwitch({
      onText: '按年',
      offText: '按月',
      onColor: 'info',
      offColor: 'info',
      state: true,
      size: 'mini',
      onSwitchChange: function(e, state) {
        params.circleType = state ? 3 : 2
        getBarData(params)
      }
    })

    let $modal = $('#optionModal')
    $('#btn_bar_option_2').on('click', function() {
      $modal.modal()
    })

    $modal.on('click', '.submit', function() {
      params.eid = parseInt($modal.find('#ent1').val(), 10)
      params.compareEid = parseInt($modal.find('#ent2').val(), 10)
      getBarData(params)
      $modal.modal('hide')
    })

    initOptionModal()

    function initOptionModal() {
      let $selects = $('#optionModal #ent1, #optionModal #ent2')
      $.post('main/queryAllEnt', function(res) {
        handleResult(res, function(data) {
          // build options
          $selects.html('')
          data.map(v => {
            $selects.append(`<option value="${v.id}">${v.name}</option>`)
          })
          params.eid = data[0].id
          params.compareEid = data[data.length - 1].id
          // init bar
          getBarData(params)
        })
      })
    }

    function getBarData(obj) {
      $.post('main/queryTransverseFile', obj, function(res) {
        handleResult(res, function(data) {
          let legendNames = []
          let labels = []
          let series = []
          data.dataList.map((legend, idx) => {
            let part = []
            legendNames.push(legend.enterprise)
            legend.fileCountList.map(val => {
              if (labels.length < legend.fileCountList.length) {
                labels.push(val.xdata)
              }
              part.push(val.fileCount)
            })
            series[idx] = part
          })
          chartBar && chartBar.detach()
          chartBar = new Chartist.Bar(
            '#chart_bar_2',
            { labels, series },
            {
              seriesBarDistance: 10,
              plugins: [
                Chartist.plugins.legend({ legendNames }),
                Chartist.plugins.tooltip({
                  tooltipOffset: { x: 14, y: -10 }
                })
              ]
            }
          )
        })
      })
    }
  }

  function initRank() {
    // initial params
    let params = { rankingType: 1, rankingTimeType: 1, sortType: 'desc' }
    // rank mark
    let $table = $('#table_rank')
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
      // rank data
      params.rankingType = parseInt($cur_a.attr('data-type'), 10)
      params.sortType = $cur_a.attr('data-rank')
      // get data
      getRankData(params)
    })

    // nav tab
    let $nav = $table.closest('.card').find('ul.nav-tabs')
    $nav.on('click', '.nav-link', function tab() {
      let $this = $(this)
      if ($this.hasClass('active')) {
        return
      }
      $nav.find('.nav-link').removeClass('active')
      $this.addClass('active')
      params.rankingTimeType = parseInt($this.attr('data-type'), 10)
      getRankData(params)
    })

    getRankData(params)

    function getRankData(obj) {
      let $tbody = $table.find('tbody')
      $.post('main/queryEnterpriseRanking', obj, function(res) {
        handleResult(res, function(data) {
          $tbody.html('')
          data.map((val, idx) => {
            $tbody.append(`
              <tr>
                <td>${idx + 1}</td>
                <td>${val.name}</td>
                <td>${val.integralCount}</td>
                <td>${val.fileUploadCount}</td>
                <td>${val.fileDownloadedCount}</td>
              </tr>
            `)
          })
        })
      })
    }
  }
})()
