"use strict";

;

(function () {
  $(function () {
    var $wrapper = $('.form-wrapper');
    $wrapper.find('form').on('submit', function (e) {
      e.preventDefault();
      var params = {
        account: this.username.value.trim(),
        password: this.password.value,
        confirmPassword: this.confirm.value,
        enterprise: this.company.value.trim(),
        checkCode: this.code.value.trim()
      };
      $.post('frame/doForgetPassword', params, function (res) {
        if (!res.ret) {
          var countDown = function countDown() {
            if (--sec === 0) {
              window.location.href = 'frame/login';
            } else {
              buildAlert($wrapper, {
                className: 'alert-success',
                msg: "\u4FEE\u6539\u6210\u529F!\uFF08".concat(sec, "\u79D2\u540E\u524D\u5F80\u767B\u5F55\uFF09")
              });
              setTimeout(countDown, 1000);
            }
          };

          // success
          var sec = 4;
          countDown();
        } else {
          // fail
          buildAlert($wrapper, {
            className: 'alert-warning',
            msg: res.msg
          });
        }
      });
    });
  });

  function buildAlert($wrapper, obj) {
    var $msg = $wrapper.find('.alert');

    if ($msg[0]) {
      $msg.removeClass('alert-warning').removeClass('alert-success').addClass(obj.className).find('span.msg').text(obj.msg);
    } else {
      $wrapper.prepend("\n        <div\n          class=\"alert ".concat(obj.className, " alert-dismissible fade show\"\n          role=\"alert\"\n        >\n          <span class=\"msg\">").concat(obj.msg, "</span>\n          <button\n            type=\"button\"\n            class=\"close\"\n            style=\"top:9px;\"\n            data-dismiss=\"alert\"\n            aria-label=\"Close\"\n          >\n            <span aria-hidden=\"true\">&times;</span>\n          </button>\n        </div>\n     "));
    }
  }
})();