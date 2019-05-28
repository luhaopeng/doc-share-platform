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
    $('#switch_bar_1').bootstrapSwitch({
      onText: '下载量',
      offText: '上传量',
      onColor: 'info',
      offColor: 'info',
      state: true,
      size: 'small'
    })

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
        $('#docCount').html(`${totalFile} <small>份</small>`)
        $('#saveCount').html(`${totalDownload} <small>次</small>`)
        $('#entCount').html(`${totalEnterprise} <small>家</small>`)
        $('#userCount').html(`${totalCustomer} <small>人</small>`)

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
          let series = valueList.map(v => parseInt(v))
          chartLine.update({
            labels: dataTimeList.map(v => v.substr(8)),
            series: [series]
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
      total += parseInt(obj.typeNum)
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
          ${((parseInt(obj.typeNum) / total) * 100) | 0}%
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
      total += parseInt(obj.typeNum)
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
            ${((parseInt(obj.typeNum) / total) * 100) | 0}%
          </span>
        `
      } else {
        otherName = obj.name
        otherNum = obj.typeNum
      }
    })
    let $cardBody = $('.card p.chart-pie-2')
    $cardBody.html(desc)
    if (other instanceof Array) {
      let otherLink = `
        <a
          class="other"
          tabindex="0"
          title="其他"
          data-trigger="hover"
        >
          ${otherName}
          <span>
            ${((parseInt(otherNum) / total) * 100) | 0}%
          </span>
        </a>
      `
      $cardBody.append(otherLink)
      let detail = ''
      other.map(obj => {
        total += obj.typeNum
      })
      other.map(obj => {
        detail += `
          ${obj.name}
          ${((parseInt(obj.typeNum) / total) * 100) | 0}%
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
    let data = {
      // prettier-ignore
      labels: [
        '01', '02', '03', '04',
        '05', '06', '07', '08',
        '09', '10', '11', '12'
      ],
      series: [genRandInt(12), genRandInt(5).concat([0, 0, 0, 0, 0, 0, 0])]
    }

    new Chartist.Bar('#chart_bar_1', data, {
      seriesBarDistance: 10,
      plugins: [
        Chartist.plugins.legend({
          legendNames: ['2018', '2019']
        }),
        Chartist.plugins.tooltip({
          tooltipOffset: { x: 14, y: -10 }
        })
      ]
    })

    $('#switch_bar_option_1').bootstrapSwitch({
      onText: '按年',
      offText: '按月',
      onColor: 'info',
      offColor: 'info',
      state: true,
      size: 'mini'
    })
  }

  function initBar2() {
    let data = {
      // prettier-ignore
      labels: [
        '01', '02', '03', '04',
        '05', '06', '07', '08',
        '09', '10', '11', '12'
      ],
      series: [
        genRandInt(5).concat([0, 0, 0, 0, 0, 0, 0]),
        genRandInt(5).concat([0, 0, 0, 0, 0, 0, 0])
      ]
    }

    new Chartist.Bar('#chart_bar_2', data, {
      seriesBarDistance: 10,
      plugins: [
        Chartist.plugins.legend({
          legendNames: ['华立科技', '威盛电子']
        }),
        Chartist.plugins.tooltip({
          tooltipOffset: { x: 14, y: -10 }
        })
      ]
    })

    $('#switch_bar_option_2').bootstrapSwitch({
      onText: '按年',
      offText: '按月',
      onColor: 'info',
      offColor: 'info',
      state: true,
      size: 'mini'
    })

    $('#btn_bar_option_2').on('click', function() {
      $('#optionModal').modal()
    })

    $('#optionModal .submit').on('click', function() {
      $('#optionModal').modal('hide')
    })
  }

  function initRank() {
    let $rank_a = $('#table_rank a[data-rank]')
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

  function genRandInt(n) {
    let arr = []
    while (n-- > 0) {
      arr.push(parseInt(Math.random() * 15 + 1))
    }
    return arr
  }
})()
