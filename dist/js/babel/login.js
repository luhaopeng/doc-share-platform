"use strict";

;

(function () {
  $(function () {
    // click to change validation code
    $('img.val-code').on('click', function () {
      $(this).attr('src', "common/validateCode?v=".concat(Math.random()));
    }); // sign in error message

    var $signInMsg = $('#sign_in .alert');

    if ($signInMsg.attr('data-msg').length > 0) {
      $signInMsg.show();
    } // sign up


    var $signUp = $('#sign_up');
    $signUp.find('form').on('submit', function (e) {
      e.preventDefault();
      var params = {
        account: this.username.value.trim(),
        password: this.password.value,
        confirmPassword: this.confirm.value,
        enterprise: this.company.value.trim(),
        checkCode: this.code.value.trim()
      };
      $.post('frame/doRegister', params, function (res) {
        if (!res.ret) {
          var countDown = function countDown() {
            if (--sec === 0) {
              window.location.href = 'frame/login';
            } else {
              buildAlert($signUp, {
                className: 'alert-success',
                msg: "\u6CE8\u518C\u6210\u529F!\uFF08".concat(sec, "\u79D2\u540E\u524D\u5F80\u767B\u5F55\uFF09")
              });
              setTimeout(countDown, 1000);
            }
          };

          // success
          var sec = 4;
          countDown();
        } else {
          // fail
          buildAlert($signUp, {
            className: 'alert-warning',
            msg: res.msg
          });
        }
      });
    });
  });

  function buildAlert($tab, obj) {
    var $msg = $tab.find('.alert');

    if ($msg[0]) {
      $msg.removeClass('alert-warning').removeClass('alert-success').addClass(obj.className).show().find('span.msg').text(obj.msg);
    } else {
      $tab.find('.form-wrapper').prepend("\n        <div\n          class=\"alert ".concat(obj.className, " alert-dismissible fade show\"\n          role=\"alert\"\n          style=\"display:block;\"\n        >\n          <span class=\"msg\">").concat(obj.msg, "</span>\n          <button\n            type=\"button\"\n            class=\"close\"\n            style=\"top:9px;\"\n            data-dismiss=\"alert\"\n            aria-label=\"Close\"\n          >\n            <span aria-hidden=\"true\">&times;</span>\n          </button>\n        </div>\n     "));
    }
  }
})();