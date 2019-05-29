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
    // 所有统计时间
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
          chartLine.update({
            labels: dataTimeList.map(function (v) {
              return v.substr(8);
            }),
            series: [valueList.map(function (v) {
              return parseInt(v);
            })]
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
    // initial params
    var params = {
      fileType: 2,
      circleType: 3
    };
    var chartBar;
    $('#switch_bar_1').bootstrapSwitch({
      onText: '下载量',
      offText: '上传量',
      onColor: 'info',
      offColor: 'info',
      state: true,
      size: 'small',
      onSwitchChange: function onSwitchChange(e, state) {
        params.fileType = state ? 2 : 1;
        getBarData(params);
      }
    });
    $('#switch_bar_option_1').bootstrapSwitch({
      onText: '按年',
      offText: '按月',
      onColor: 'info',
      offColor: 'info',
      state: true,
      size: 'mini',
      onSwitchChange: function onSwitchChange(e, state) {
        params.circleType = state ? 3 : 2;
        getBarData(params);
      }
    });
    getBarData(params);

    function getBarData(obj) {
      $.post('main/queryVerticalFile', obj, function (res) {
        handleResult(res, function (data) {
          var legendNames = [];
          var labels = [];
          var series = [];
          data.dataList.map(function (legend, idx) {
            var part = [];
            legendNames.push(legend.dataTime);
            legend.fileCountList.map(function (val) {
              if (labels.length < legend.fileCountList.length) {
                labels.push(val.xdata);
              }

              part.push(val.fileCount);
            });
            series[idx] = part;
          });
          chartBar && chartBar.detach();
          chartBar = new Chartist.Bar('#chart_bar_1', {
            labels: labels,
            series: series
          }, {
            seriesBarDistance: 10,
            plugins: [Chartist.plugins.legend({
              legendNames: legendNames
            }), Chartist.plugins.tooltip({
              tooltipOffset: {
                x: 14,
                y: -10
              }
            })]
          });
        });
      });
    }
  }

  function initBar2() {
    // initial params
    var params = {
      fileType: 1,
      circleType: 3,
      eid: 1,
      compareEid: 1
    };
    var chartBar;
    $('#switch_bar_option_2').bootstrapSwitch({
      onText: '按年',
      offText: '按月',
      onColor: 'info',
      offColor: 'info',
      state: true,
      size: 'mini',
      onSwitchChange: function onSwitchChange(e, state) {
        params.circleType = state ? 3 : 2;
        getBarData(params);
      }
    });
    var $modal = $('#optionModal');
    $('#btn_bar_option_2').on('click', function () {
      $modal.modal();
    });
    $modal.on('click', '.submit', function () {
      params.eid = parseInt($modal.find('#ent1').val());
      params.compareEid = parseInt($modal.find('#ent2').val());
      getBarData(params);
      $modal.modal('hide');
    });
    initOptionModal();

    function initOptionModal() {
      var $selects = $('#optionModal #ent1, #optionModal #ent2');
      $.post('main/queryAllEnt', function (res) {
        handleResult(res, function (data) {
          // build options
          $selects.html('');
          data.map(function (v) {
            $selects.append("<option value=\"".concat(v.id, "\">").concat(v.name, "</option>"));
          });
          params.eid = data[0].id;
          params.compareEid = data[data.length - 1].id; // init bar

          getBarData(params);
        });
      });
    }

    function getBarData(obj) {
      $.post('main/queryTransverseFile', obj, function (res) {
        handleResult(res, function (data) {
          var legendNames = [];
          var labels = [];
          var series = [];
          data.dataList.map(function (legend, idx) {
            var part = [];
            legendNames.push(legend.enterprise);
            legend.fileCountList.map(function (val) {
              if (labels.length < legend.fileCountList.length) {
                labels.push(val.xdata);
              }

              part.push(val.fileCount);
            });
            series[idx] = part;
          });
          chartBar && chartBar.detach();
          chartBar = new Chartist.Bar('#chart_bar_2', {
            labels: labels,
            series: series
          }, {
            seriesBarDistance: 10,
            plugins: [Chartist.plugins.legend({
              legendNames: legendNames
            }), Chartist.plugins.tooltip({
              tooltipOffset: {
                x: 14,
                y: -10
              }
            })]
          });
        });
      });
    }
  }

  function initRank() {
    // initial params
    var params = {
      rankingType: 1,
      rankingTimeType: 1,
      sortType: 'desc' // rank mark

    };
    var $table = $('#table_rank');
    var $rank_a = $table.find('a[data-rank]');
    $rank_a.on('click', function () {
      var $cur_a = $(this);
      var rank = $cur_a.data('rank');

      if (rank === 'none') {
        $rank_a.data('rank', 'none').children('i').removeClass('rank-desc').removeClass('rank-asc');
        $cur_a.data('rank', 'desc').children('i').addClass('rank-desc');
      } else {
        var to = rank === 'desc' ? 'asc' : 'desc';
        $cur_a.data('rank', to).children('i').removeClass('rank-' + rank).addClass('rank-' + to);
      } // rank data


      params.rankingType = parseInt($cur_a.data('type'));
      params.sortType = $cur_a.data('rank'); // get data

      getRankData(params);
    }); // nav tab

    var $nav = $table.closest('.card').find('ul.nav-tabs');
    $nav.on('click', '.nav-link', function tab() {
      var $this = $(this);

      if ($this.hasClass('active')) {
        return;
      }

      $nav.find('.nav-link').removeClass('active');
      $this.addClass('active');
      params.rankingTimeType = parseInt($this.data('type'));
      getRankData(params);
    });
    getRankData(params);

    function getRankData(obj) {
      var $tbody = $table.find('tbody');
      $.post('main/queryEnterpriseRanking', obj, function (res) {
        handleResult(res, function (data) {
          $tbody.html('');
          data.map(function (val, idx) {
            $tbody.append("\n              <tr>\n                <td>".concat(idx + 1, "</td>\n                <td>").concat(val.name, "</td>\n                <td>").concat(val.integralCount, "</td>\n                <td>").concat(val.fileUploadCount, "</td>\n                <td>").concat(val.fileDownloadedCount, "</td>\n              </tr>\n            "));
          });
        });
      });
    }
  }
})();