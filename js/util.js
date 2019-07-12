// function qs(str) {
//   let mStr = str.replace(/^\?/, '')
//   let match = mStr.match(/(?<=^|&)([^&=]*=[^&]*)(?=&|$)/gi)
//   let obj = {}
//   match.map(function split(val) {
//     let split = val.split('=')
//     obj[decodeURIComponent(split[0])] = decodeURIComponent(split[1])
//   })
//   return obj
// }

function handleResult(res, callback) {
  if (!res.ret) {
    typeof callback === 'function' && callback(res.data)
  } else {
    toastErr({ text: res.msg })
  }
}

function toastErr(options) {
  let opts = Object.assign(
    {
      heading: '出错了',
      text: '',
      icon: 'error'
    },
    options
  )
  $.toast().reset('all')
  $.toast({
    position: 'bottom-left',
    allowToastClose: true,
    stack: false,
    loader: false,
    hideAfter: false,
    ...opts
  })
}
