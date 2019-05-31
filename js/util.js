function qs(str) {
  let mStr = str.replace(/^\?/, '')
  let match = mStr.match(/(?<=^|&)([^&=]*=[^&]*)(?=&|$)/gi)
  let obj = {}
  match.map(function split(val) {
    let split = val.split('=')
    obj[decodeURIComponent(split[0])] = decodeURIComponent(split[1])
  })
  return obj
}

function handleResult(res, callback) {
  if (!res.ret) {
    typeof callback === 'function' && callback(res.data)
  } else {
    $.toast({
      heading: '出错了',
      text: res.msg,
      icon: 'error',
      position: 'bottom-left',
      allowToastClose: true,
      stack: false,
      loader: false,
      hideAfter: false
    }).reset('all')
  }
}
