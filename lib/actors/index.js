const { start, query } = require('nact')

const system = start()

const cipher = require('./cipher')(system)
const lnd = require('./lnd')(system)
const db = require('./db')(system)

module.exports = {
  system,
  cipher,
  lnd,
  db
}
