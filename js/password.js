;(function() {
  $(function() {
    let $wrapper = $('.form-wrapper')
    $wrapper.find('form').on('submit', function(e) {
      e.preventDefault()
      let params = {
        account: this.username.value.trim(),
        password: this.password.value,
        confirmPassword: this.confirm.value,
        enterprise: this.company.value.trim(),
        checkCode: this.code.value.trim()
      }
      $.post('frame/doForgetPassword', params, function(res) {
        if (!res.ret) {
          // success
          let sec = 4
          countDown()
          function countDown() {
            if (--sec === 0) {
              window.location.href = 'frame/login'
            } else {
              buildAlert($wrapper, {
                className: 'alert-success',
                msg: `修改成功!（${sec}秒后前往登录）`
              })
              setTimeout(countDown, 1000)
            }
          }
        } else {
          // fail
          buildAlert($wrapper, {
            className: 'alert-warning',
            msg: res.msg
          })
        }
      })
    })
  })

  function buildAlert($wrapper, obj) {
    let $msg = $wrapper.find('.alert')
    if ($msg[0]) {
      $msg
        .removeClass('alert-warning')
        .removeClass('alert-success')
        .addClass(obj.className)
        .find('span.msg')
        .text(obj.msg)
    } else {
      $wrapper.prepend(`
        <div
          class="alert ${obj.className} alert-dismissible fade show"
          role="alert"
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
