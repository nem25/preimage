const level = require('level-browserify')
const levelgraph = require('levelgraph')
const { dispatch, spawnStateless } = require('nact')

const db = levelgraph(level('store'))

module.exports = (system) => spawnStateless(
  system,
  async (msg, { self, sender }) => {
    return (({
      SET_OWNER_INVOICE: async ({ owner, preimageHash, amount }) => {
        db.put({
          subject: owner,
          predicate: 'invoices',
          object: preimageHash,
          amount
        }, (err) => {
          dispatch(sender, {
            type: err ? 'ERROR' : 'OWNER_INVOICE',
            payload: err ? err.message : {
              owner,
              invoice: {
                preimageHash,
                amount
              }
            }
          }, self)
        })
      },
      GET_OWNER_INVOICES: async ({ owner }) => {
        db.get({
          subject: owner,
          predicate: 'invoices'
        }, (err, entries) => {
          dispatch(sender, {
            type: err ? 'ERROR' : 'OWNER_INVOICES',
            payload: err ? err.message : {
              owner,
              invoices: entries.map(({ object, amount }) => ({
                preimageHash: object,
                amount
              })) 
            }
          }, self)
        })
      },
      DELETE_OWNER_INVOICES: async ({ owner }) => {
        db.del({
          subject: owner,
          predicate: 'invoices'
        }, (err) => {
          dispatch(sender, {
            type: err ? 'ERROR' : 'DELETED_OWNER_INVOICES',
            payload: err ? err.message : {
              owner
            }
          }, self)
        })
      },
    })[msg.type] || (() => (
      dispatch(sender, {
        type: 'ERROR',
        payload: 'Action not found'
      }, self)
    )))(msg.payload)
  },
  'db'
)
