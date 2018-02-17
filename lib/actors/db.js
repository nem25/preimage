const level = require('level-browserify')
const levelgraph = require('levelgraph')
const { dispatch, spawnStateless } = require('nact')
const {
  setOwnerInvoice,
  getOwnerInvoices,
  deleteOwnerInvoices,
  setKeyHashNonce,
  getKeyHashNonce,
  getKeyHashNonceExists,
  setDataHashKey,
  getDataHashKey,
  error,
  ownerInvoice,
  ownerInvoices,
  deletedOwnerInvoices,
  keyHashNonce,
  keyHashNonceExists,
  dataHashKey
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
            preimageHash,
            amount
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
      [setKeyHashNonce]: async ({ keyHash, nonce }) => {
        db.put({
          subject: keyHash,
          predicate: 'nonce',
          object: nonce
        }, (err) => {
          dispatch(sender, err ? error(err) : keyHashNonce({
            keyHash,
            nonce
          }), self)
        })
      },
      [getKeyHashNonce]: async ({ keyHash }) => {
        db.get({
          subject: keyHash,
          predicate: 'nonce'
        }, (err, entries) => {
          if (!entries.length)
            err = new Error('Nonce not found')
          dispatch(sender, err ? error(err) : keyHashNonce({
            keyHash,
            nonce: entries[0].object
          }), self)
        })
      },
      [getKeyHashNonceExists]: async ({ keyHash }) => {
        db.get({
          subject: keyHash,
          predicate: 'nonce'
        }, (err, entries) => {
          dispatch(sender, err ? error(err) : keyHashNonceExists({
            keyHash,
            exists: !!entries.length
          }), self)
        })
      },
      [setDataHashKey]: async ({ dataHash, key, owner, price }) => {
        db.put({
          subject: dataHash,
          predicate: 'key',
          object: key,
          owner,
          price
        }, (err) => {
          dispatch(sender, err ? error(err) : dataHashKey({
            dataHash,
            key,
            owner,
            price
          }), self)
        })
      },
      [getDataHashKey]: async ({ dataHash }) => {
        db.get({
          subject: dataHash,
          predicate: 'key'
        }, (err, entries) => {
          if (!entries.length)
            err = new Error('Key not found for data')
          dispatch(sender, err ? error(err) : dataHashKey({
            dataHash,
            key: entries[0].object,
            owner: entries[0].owner,
            price: entries[0].price
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
