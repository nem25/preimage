const { query } = require('nact')

const QUERY_TIMEOUT = 2000

const getPayload = async (actor, msg) => (
  (await query(actor, msg, QUERY_TIMEOUT)).payload
)

const getSubscription = async function* (actor, msg) {
  const { type, payload } = await query(actor, msg, QUERY_TIMEOUT)
  while (true) yield ({
    type: type.replace('_SUBSCRIPTION', ''),
    payload: rescue(4, await payload.next())
  })
}

const rescue = (depth, obj) => {
  let key
  while (--depth)
    obj = obj[key = Object.keys(obj)[0]]
  return obj
}

module.exports = {
  getPayload,
  getSubscription,
  rescue
}
