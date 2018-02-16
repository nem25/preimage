const { start, query } = require('nact')

const system = start()

const cipher = require('./cipher')(system)
const lnd = require('./lnd')(system)

module.exports = {
  system,
  cipher,
  lnd
}
