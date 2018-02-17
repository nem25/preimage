const { start } = require('nact')
const { rescue } = require('../util')

const system = start()
const actors = {}

actors.cipher = require('./cipher')(system, actors)
actors.lnd = require('./lnd')(system, actors)
actors.db = require('./db')(system, actors)

module.exports = actors
