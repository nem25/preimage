const rescue = (depth, obj) => {
  let key
  while (--depth)
    obj = obj[key = Object.keys(obj)[0]]
  return obj
}

module.exports = {
  rescue
}
