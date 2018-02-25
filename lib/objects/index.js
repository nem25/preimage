const Db = require('./db')
const Cipher = require('./cipher')
const Lnd = require('./lnd')

const objects = {}

module.exports = ({ exclude = [], include = {} } = {}) => {
  if (Object.keys(objects).length)
    return objects
  if (exclude.indexOf('db') === -1)
    objects.db = new Db(objects)
  if (include.Db)
    objects.db = new include.Db(objects)
  if (exclude.indexOf('cipher') === -1)
    objects.cipher = new Cipher(objects)
  if (include.Cipher)
    objects.cipher = new include.Cipher(objects)
  if (exclude.indexOf('lnd') === -1)
    objects.lnd = new Lnd(objects)
  if (include.Lnd)
    objects.lnd = new include.Lnd(objects)
  return objects
}
