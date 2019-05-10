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
