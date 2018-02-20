const rescueQuery = (obj, depth = 3) => {
  let key
  while (--depth)
    obj = obj[key = Object.keys(obj)[0]]
  return obj
}

const rescueSubscription = async function* (subscription) {
  while (true) yield rescueQuery(await subscription.next(), 4)
}

module.exports = {
  rescueQuery,
  rescueSubscription
}
