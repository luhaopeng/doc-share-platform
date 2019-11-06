"use strict";

(function () {
  $(function () {
    // 所有统计时间
    $('.card .card-footer .stats').html("\n      <i class=\"material-icons\">access_time</i>\n      \u7EDF\u8BA1\u65F6\u95F4\uFF1A".concat(moment().format('YYYY-MM-DD HH:mm:ss'), "\n    "));
    initUserInfo();
    initBasis();
    initRank();
  });

  function initUserInfo() {
    $.post('account/queryAccountInfo', function (res) {
      handleResult(res, function (data) {
        var account = data.account,
            enterprise = data.enterprise,
            integral = data.integral,
            uploadFileCount = data.uploadFileCount,
            beDownloadFileCount = data.beDownloadFileCount,
            favoritesFileCount = data.favoritesFileCount;
        var $user = $('.card.user');
        var $header = $user.find('.card-header h4');
        $header.text(account + ' / ' + enterprise);
        var $stats = $user.find('.stats p');
        $stats.eq(0).text(uploadFileCount);
        $stats.eq(1).text(beDownloadFileCount);
        $stats.eq(2).text(favoritesFileCount);
        $stats.eq(3).text(integral);
      });
    });
  }

  function initBasis() {
    $.post('main/queryBaseData', function (res) {
      handleResult(res, function (data) {
        var typeList = data.typeList,
            brandList = data.brandList,
            otherList = data.otherList;
        initPie1(typeList);
        initPie2(brandList, otherList);
      });
    });
  }

  function initPie1(list) {
    var labels = [];
    var total = 0;
    var series = list.map(function (obj) {
      labels.push(obj.name);
      total += parseInt(obj.typeNum, 10);
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
      desc += "\n        ".concat(obj.name, "\n        <span>\n          ").concat((parseInt(obj.typeNum, 10) / total * 100).toFixed(), "%\n        </span>\n      ");
    });
    $('.card p.chart-pie-1').html(desc);
  }

  function initPie2(list, other) {
    var labels = [];
    var total = 0;
    var series = list.map(function (obj) {
      labels.push(obj.name);
      total += parseInt(obj.typeNum, 10);
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
        desc += "\n          ".concat(obj.name, "\n          <span>\n            ").concat((parseInt(obj.typeNum, 10) / total * 100).toFixed(), "%\n          </span>\n        ");
      } else {
        otherName = obj.name;
        otherNum = obj.typeNum;
      }
    });
    var $cardBody = $('.card p.chart-pie-2');
    $cardBody.html(desc);

    if (other.length) {
      var otherLink = "\n        <a\n          class=\"other\"\n          tabindex=\"0\"\n          title=\"\u5176\u4ED6\"\n          data-trigger=\"hover\"\n        >\n          ".concat(otherName, "\n          <span>\n            ").concat((parseInt(otherNum, 10) / total * 100).toFixed(), "%\n          </span>\n        </a>\n      ");
      $cardBody.append(otherLink);
      var detail = '';
      other.map(function (obj) {
        detail += "\n          ".concat(obj.name, "\n          ").concat((parseInt(obj.typeNum, 10) / total * 100).toFixed(), "%\n          <br />\n        ");
      });
      $cardBody.find('.other').popover({
        html: true,
        content: detail
      });
    }
  }

  function initRank() {
    // initial params
    var params = {
      circleType: 1
    };
    var $table = $('#table_rank');
    var $tbody = $table.find('tbody'); // nav tab

    var $nav = $table.closest('.card').find('ul.nav-tabs');
    $nav.on('click', '.nav-link', function tab() {
      var $this = $(this);

      if ($this.hasClass('active')) {
        return;
      }

      $nav.find('.nav-link').removeClass('active');
      $this.addClass('active');
      params.circleType = parseInt($this.attr('data-type'), 10);
      getRankData(params);
    }); // click

    $tbody.on('click', 'tr', function detail(e) {
      var tag = e.target.tagName;

      if (/tr|td|div/i.test(tag)) {
        // prettier-ignore
        var $tr = $(this).closest('tr');
        var id = $tr.attr('data-id');
        var $form = $("\n          <form\n            action=\"fileData/fileDataDetail\"\n            method=\"post\"\n            target=\"_blank\"\n            rel=\"noopener noreferrer\"\n            style=\"display:none;\"\n          >\n            <input name=\"fileDataId\" value=\"".concat(id, "\" />\n          </form>\n        "));
        $(document.body).append($form);
        $form.submit().remove();
      }
    });
    getRankData(params);

    function getRankData(obj) {
      $.post('main/queryFileDownloadTop5', obj, function (res) {
        handleResult(res, function (data) {
          $tbody.html(''); // build table

          $tbody.html('');
          var $table = $tbody.closest('table');
          $table.siblings('.empty').remove();

          if (data.length === 0) {
            $('<div class="empty">暂无数据</div>').insertAfter($table);
          } else {
            data.map(function (file) {
              $tbody.append("\n                <tr data-id=".concat(file.fileDataId, ">\n                  <td class=\"text-left\">").concat(file.fileName, "</td>\n                  <td>").concat(file.enterprise, "</td>\n                  <td>").concat(file.classTwoDesc, "</td>\n                  <td>").concat(file.brandDesc, "</td>\n                  <td>").concat(file.dataTimeDesc, "</td>\n                  <td>").concat(file.downloadCount, "</td>\n                </tr>\n              "));
            });
          }
        });
      });
    }
  }
})();