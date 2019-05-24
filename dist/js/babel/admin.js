"use strict";

;

(function () {
  var PICKER_LOCALE = {
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
    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    firstDay: 1
  };
  $(function () {
    $('#switch_line').bootstrapSwitch({
      onText: '下载',
      offText: '上传',
      onColor: 'info',
      offColor: 'info',
      state: true,
      size: 'small'
    });
    $('#switch_bar_1').bootstrapSwitch({
      onText: '下载量',
      offText: '上传量',
      onColor: 'info',
      offColor: 'info',
      state: true,
      size: 'mini'
    });
    $('#switch_bar_2').bootstrapSwitch({
      onText: '下载量',
      offText: '上传量',
      onColor: 'info',
      offColor: 'info',
      state: true,
      size: 'mini'
    });
    initLine();
    initPie1();
    initPie2();
    initBar1();
    initBar2();
    initRank();
  });

  function initLine() {
    var dataMay = {
      labels: ['01', '02', '03', '04', '05', '06', '07'],
      series: [genRandInt(7)]
    };
    var dataApril = {
      // prettier-ignore
      labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
      series: [genRandInt(30)]
    };
    var chartLine = new Chartist.Line('#chart_line', dataMay, {
      plugins: [Chartist.plugins.ctPointLabels()]
    });
    var iStart = moment().startOf('month');
    var iEnd = moment().endOf('month');

    function cb(start, end) {
      var format = 'YYYY/MM/DD';
      $('#range_line span').html(start.format(format) + ' - ' + end.format(format));

      if (iStart.isSame(start)) {
        chartLine.update(dataMay);
      } else {
        chartLine.update(dataApril);
      }
    }

    $('#range_line').daterangepicker({
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
        '上月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
      }
    }, cb);
    cb(iStart, iEnd);
  }

  function initPie1() {
    var labels = ['一类', '二类', '三类', '四类', '五类'];
    var data = {
      series: genRandInt(5).map(function (v, i) {
        return {
          meta: labels[i],
          value: v
        };
      })
    };
    new Chartist.Pie('#chart_pie_1', data, {
      height: '200px',
      labelOffset: 15,
      showLabel: false,
      plugins: [Chartist.plugins.legend({
        legendNames: labels
      }), Chartist.plugins.tooltip({
        tooltipOffset: {
          x: 14,
          y: -10
        }
      })]
    });
  }

  function initPie2() {
    var labels = ['松下', '格力', '三星', '美的', '西门子', '海尔'];
    var data = {
      series: genRandInt(6).map(function (v, i) {
        return {
          meta: labels[i],
          value: v
        };
      })
    };
    new Chartist.Pie('#chart_pie_2', data, {
      height: '200px',
      labelOffset: 15,
      showLabel: false,
      plugins: [Chartist.plugins.legend({
        legendNames: labels
      }), Chartist.plugins.tooltip({
        tooltipOffset: {
          x: 14,
          y: -10
        }
      })]
    });
  }

  function initBar1() {
    var data = {
      // prettier-ignore
      labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
      series: [genRandInt(12), genRandInt(5).concat([0, 0, 0, 0, 0, 0, 0])]
    };
    new Chartist.Bar('#chart_bar_1', data, {
      seriesBarDistance: 10,
      plugins: [Chartist.plugins.legend({
        legendNames: ['2018', '2019']
      }), Chartist.plugins.tooltip({
        tooltipOffset: {
          x: 14,
          y: -10
        }
      })]
    });
  }

  function initBar2() {
    var data = {
      // prettier-ignore
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      series: [genRandInt(5).concat([0, 0, 0, 0, 0, 0, 0]), genRandInt(5).concat([0, 0, 0, 0, 0, 0, 0])]
    };
    var dataPrev = {
      // prettier-ignore
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      series: [genRandInt(12), genRandInt(12)]
    };
    var chartBar = new Chartist.Bar('#chart_bar_2', data, {
      seriesBarDistance: 10,
      plugins: [Chartist.plugins.legend({
        legendNames: ['华立科技', '威盛电子']
      }), Chartist.plugins.tooltip({
        tooltipOffset: {
          x: 14,
          y: -10
        }
      })]
    });
    var iStart = moment().startOf('year');
    var iEnd = moment().endOf('year');

    function cb(start, end) {
      var format = 'YYYY/MM';
      $('#range_bar span').html(start.format(format) + ' - ' + end.format(format));

      if (iStart.startOf('year').isSame(start)) {
        chartBar.update(data);
      } else {
        chartBar.update(dataPrev);
      }
    }

    $('#range_bar').daterangepicker({
      startDate: iStart,
      endDate: iEnd,
      opens: 'center',
      linkedCalendars: false,
      showDropdowns: true,
      locale: PICKER_LOCALE,
      // prettier-ignore
      ranges: {
        '今年': [iStart, iEnd],
        '去年': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')]
      }
    }, cb);
    cb(iStart, iEnd);
  }

  function initRank() {
    var $rank_a = $('#table_rank a[data-rank]');
    $rank_a.on('click', function () {
      var $cur_a = $(this);
      var rank = $cur_a.attr('data-rank');

      if (rank === 'none') {
        $rank_a.attr('data-rank', 'none').children('i').removeClass('rank-desc').removeClass('rank-asc');
        $cur_a.attr('data-rank', 'desc').children('i').addClass('rank-desc');
      } else {
        var to = rank === 'desc' ? 'asc' : 'desc';
        $cur_a.attr('data-rank', to).children('i').removeClass('rank-' + rank).addClass('rank-' + to);
      }
    });
  }

  function genRandInt(n) {
    var arr = [];

    while (n-- > 0) {
      arr.push(parseInt(Math.random() * 15 + 1));
    }

    return arr;
  }
})();