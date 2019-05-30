;(function() {
  $(function() {
    // click to change validation code
    $('img.val-code').on('click', function() {
      $(this).attr('src', `common/validateCode?v=${Math.random()}`)
    })

    // sign in error message
    let $signInMsg = $('#sign_in .alert')
    if ($signInMsg.attr('data-msg').length > 0) {
      $signInMsg.show()
    }

    // sign up
    let $signUp = $('#sign_up')
    $signUp.find('form').on('submit', function(e) {
      e.preventDefault()
      let params = {
        account: this.username.value.trim(),
        password: this.password.value,
        confirmPassword: this.confirm.value,
        enterprise: this.company.value.trim(),
        checkCode: this.code.value.trim()
      }
      $.post('frame/doRegister', params, function(res) {
        if (!res.ret) {
          // success
          buildAlert($signUp, {
            className: 'alert-success',
            msg: '注册成功!'
          })
        } else {
          // fail
          buildAlert($signUp, {
            className: 'alert-warning',
            msg: res.msg
          })
        }
      })
    })
  })

  function buildAlert($tab, obj) {
    let $msg = $tab.find('.alert')
    if ($msg[0]) {
      $msg
        .removeClass('alert-warning')
        .removeClass('alert-success')
        .addClass(obj.className)
        .show()
        .find('span.msg')
        .text(obj.msg)
    } else {
      $tab.find('.form-wrapper').prepend(`
        <div
          class="alert ${obj.className} alert-dismissible fade show"
          role="alert"
          style="display:block;"
        >
          <span class="msg">${obj.msg}</span>
          <button
            type="button"
            class="close"
            style="top:9px;"
            data-dismiss="alert"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
     `)
    }
  }
})()
