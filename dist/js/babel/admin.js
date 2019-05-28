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
    $('#switch_bar_1').bootstrapSwitch({
      onText: '下载量',
      offText: '上传量',
      onColor: 'info',
      offColor: 'info',
      state: true,
      size: 'small'
    }); // 所有统计时间

    $('.card .card-footer .stats').html("\n      <i class=\"material-icons\">access_time</i>\n      \u7EDF\u8BA1\u65F6\u95F4\uFF1A".concat(moment().format('YYYY-MM-DD HH:mm:ss'), "\n    "));
    initBasis();
    initLine();
    initBar1();
    initBar2();
    initRank();
  });

  function initBasis() {
    $.post('main/queryBaseData', function (res) {
      handleResult(res, function (data) {
        var totalFile = data.totalFile,
            totalDownload = data.totalDownload,
            totalEnterprise = data.totalEnterprise,
            totalCustomer = data.totalCustomer,
            typeList = data.typeList,
            brandList = data.brandList,
            otherList = data.otherList;
        $('#docCount').html("".concat(totalFile, " <small>\u4EFD</small>"));
        $('#saveCount').html("".concat(totalDownload, " <small>\u6B21</small>"));
        $('#entCount').html("".concat(totalEnterprise, " <small>\u5BB6</small>"));
        $('#userCount').html("".concat(totalCustomer, " <small>\u4EBA</small>"));
        initPie1(typeList);
        initPie2(brandList, otherList);
      });
    });
  }

  function initLine() {
    var FORMAT_DISPLAY = 'YYYY/MM/DD';
    var FORMAT_API = 'YYYY-MM-DD';
    var params = {
      type: 2,
      startDate: '',
      endDate: ''
    };
    $('#switch_line').bootstrapSwitch({
      onText: '下载',
      offText: '上传',
      onColor: 'info',
      offColor: 'info',
      state: true,
      size: 'small',
      onSwitchChange: function onSwitchChange(e, state) {
        params.type = state ? 2 : 1;
        getLineData(params);
      }
    });
    var chartLine = new Chartist.Line('#chart_line', {}, {
      plugins: [Chartist.plugins.ctPointLabels()]
    });
    var iStart = moment().startOf('month');
    var iEnd = moment().endOf('month');

    function pickerUpdate(start, end) {
      $('#range_line span').html(start.format(FORMAT_DISPLAY) + ' - ' + end.format(FORMAT_DISPLAY));
      params.startDate = start.format(FORMAT_API);
      params.endDate = end.format(FORMAT_API);
      getLineData(params);
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
    }, pickerUpdate);
    pickerUpdate(iStart, iEnd);

    function getLineData(obj) {
      $.post('main/queryUpAndDownFile', obj, function (res) {
        handleResult(res, function (data) {
          var valueList = data.valueList,
              dataTimeList = data.dataTimeList;
          var series = valueList.map(function (v) {
            return parseInt(v);
          });
          chartLine.update({
            labels: dataTimeList.map(function (v) {
              return v.substr(8);
            }),
            series: [series]
          });
        });
      });
    }
  }

  function initPie1(list) {
    var labels = [];
    var total = 0;
    var series = list.map(function (obj) {
      labels.push(obj.name);
      total += parseInt(obj.typeNum);
      return {
        meta: obj.name,
        value: obj.typeNum
      };
    });
    new Chartist.Pie('#chart_pie_1', {
      series: series
    }, {
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
    var desc = '';
    list.map(function (obj) {
      desc += "\n        ".concat(obj.name, "\n        <span>\n          ").concat(parseInt(obj.typeNum) / total * 100 | 0, "%\n        </span>\n      ");
    });
    $('.card p.chart-pie-1').html(desc);
  }

  function initPie2(list, other) {
    var labels = [];
    var total = 0;
    var series = list.map(function (obj) {
      labels.push(obj.name);
      total += parseInt(obj.typeNum);
      return {
        meta: obj.name,
        value: obj.typeNum
      };
    });
    new Chartist.Pie('#chart_pie_2', {
      series: series
    }, {
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
    var desc = '';
    var otherName, otherNum;
    list.map(function (obj) {
      if (obj.name !== '其他') {
        desc += "\n          ".concat(obj.name, "\n          <span>\n            ").concat(parseInt(obj.typeNum) / total * 100 | 0, "%\n          </span>\n        ");
      } else {
        otherName = obj.name;
        otherNum = obj.typeNum;
      }
    });
    var $cardBody = $('.card p.chart-pie-2');
    $cardBody.html(desc);

    if (other instanceof Array) {
      var otherLink = "\n        <a\n          class=\"other\"\n          tabindex=\"0\"\n          title=\"\u5176\u4ED6\"\n          data-trigger=\"hover\"\n        >\n          ".concat(otherName, "\n          <span>\n            ").concat(parseInt(otherNum) / total * 100 | 0, "%\n          </span>\n        </a>\n      ");
      $cardBody.append(otherLink);
      var detail = '';
      other.map(function (obj) {
        total += obj.typeNum;
      });
      other.map(function (obj) {
        detail += "\n          ".concat(obj.name, "\n          ").concat(parseInt(obj.typeNum) / total * 100 | 0, "%\n          <br />\n        ");
      });
      $cardBody.find('.other').popover({
        html: true,
        content: detail
      });
    }
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
    $('#switch_bar_option_1').bootstrapSwitch({
      onText: '按年',
      offText: '按月',
      onColor: 'info',
      offColor: 'info',
      state: true,
      size: 'mini'
    });
  }

  function initBar2() {
    var data = {
      // prettier-ignore
      labels: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
      series: [genRandInt(5).concat([0, 0, 0, 0, 0, 0, 0]), genRandInt(5).concat([0, 0, 0, 0, 0, 0, 0])]
    };
    new Chartist.Bar('#chart_bar_2', data, {
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
    $('#switch_bar_option_2').bootstrapSwitch({
      onText: '按年',
      offText: '按月',
      onColor: 'info',
      offColor: 'info',
      state: true,
      size: 'mini'
    });
    $('#btn_bar_option_2').on('click', function () {
      $('#optionModal').modal();
    });
    $('#optionModal .submit').on('click', function () {
      $('#optionModal').modal('hide');
    });
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