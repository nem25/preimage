const Db = require('./db')
const Cipher = require('./cipher')
const Lnd = require('./lnd')

const objects = {}

objects.db = new Db(objects)
objects.cipher = new Cipher(objects)
objects.lnd = new Lnd(objects)

module.exports = objects
