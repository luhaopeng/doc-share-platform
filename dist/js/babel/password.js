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
          // success
          buildAlert($wrapper, {
            className: 'alert-success',
            msg: '修改成功!'
          });
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