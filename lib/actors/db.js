const level = require('level-browserify')
const levelgraph = require('levelgraph')
const { dispatch, spawnStateless } = require('nact')
const {
  setOwnerInvoice,
  getOwnerInvoices,
  deleteOwnerInvoices,
  error,
  ownerInvoice,
  ownerInvoices,
  deletedOwnerInvoices
} = require('../actions')

const db = levelgraph(level('store'))

module.exports = (system) => spawnStateless(
  system,
  async (msg, { self, sender }) => {
    return (({
      [setOwnerInvoice]: async ({ owner, preimageHash, amount }) => {
        db.put({
          subject: owner,
          predicate: 'invoices',
          object: preimageHash,
          amount
        }, (err) => {
          dispatch(sender, err ? error(err) : ownerInvoice({
            owner,
            invoice: {
              preimageHash,
              amount
            }
          }), self)
        })
      },
      [getOwnerInvoices]: async ({ owner }) => {
        db.get({
          subject: owner,
          predicate: 'invoices'
        }, (err, entries) => {
          dispatch(sender, err ? error(err) : ownerInvoices({
            owner,
            invoices: entries.map(({ object, amount }) => ({
              preimageHash: object,
              amount
            }))
          }), self)
        })
      },
      [deleteOwnerInvoices]: async ({ owner }) => {
        db.del({
          subject: owner,
          predicate: 'invoices'
        }, (err) => {
          dispatch(sender, err ? error(err) : deletedOwnerInvoices({
            owner
          }), self)
        })
      },
    })[msg.type] || (() => (
      dispatch(sender, error(
        new Error('Action not found')
      ), self)
    )))(msg.payload)
  },
  'db'
)
