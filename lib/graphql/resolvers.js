const crypto = require('crypto')
const { promisify } = require('util')
const { PubSub, withFilter } = require('graphql-subscriptions')
const { cipher, lnd, db } = require('../objects')

const PAYOUT_PCT = 0.9
const OWNER_RE = /^owner:[0-9a-f]{66}$/

const pubsub = new PubSub()

;(async () => {
  const invoices = await lnd.subscribeInvoices()
  for await (const invoice of invoices) {
    const { memo, preimageHash, amount } = invoice
    if (memo.match(OWNER_RE)) {
      db.setOwnerInvoice({
        owner: memo.replace('owner:',''),
        preimageHash,
        amount: Math.floor(amount * PAYOUT_PCT)
      })
    }
    pubsub.publish('INVOICE', invoice)
  }
})()

const resolvers = {
  Query: {
    encryptData: async (root, { owner, data, price }, ctx) => {
      const key = crypto.randomBytes(32).toString('hex')
      const { encryptedData } = await cipher.encryptData({
        key,
        data
      })
      const dataHash = crypto.createHash('sha256')
        .update(new Buffer(encryptedData, 'base64')).digest('hex')
      await db.setDataHashKey({
        dataHash,
        key,
        owner,
        price
      })
      return {
        encryptedData
      }
    },
    decryptData: async (root, { key, data }, ctx) => {
      return {
        ...await cipher.decryptData({
          key,
          data
        })
      }
    },
    encryptDataPayment: async (root, { owner, data, price }, ctx) => {
      const key = crypto.randomBytes(32).toString('hex')
      return {
        ...await lnd.createInvoice({
          preimage: key,
          amount: price,
          memo: `owner:${owner}`
        }),
        ...await cipher.encryptData({
          key,
          data
        })
      }
    },
    decryptEncryptDataPayment: async (root, {
      encryptedData
    }, ctx) => {
      const dataHash = crypto.createHash('sha256')
        .update(new Buffer(encryptedData, 'base64')).digest('hex')
      const { key, owner, price } = await db.getDataHashKey({
        dataHash
      })
      const encryptKey = crypto.randomBytes(32).toString('hex')
      return {
        ...await lnd.createInvoice({
          preimage: encryptKey,
          amount: price,
          memo: `owner:${owner}`
        }),
        ...await cipher.encryptData({
          key: encryptKey,
          data: (await cipher.decryptData({
            key,
            data: encryptedData
          })).decryptedData
        })
      }
    }
  },
  Mutation: {
    requestPayout: async (root, { paymentRequest }, ctx) => {
      const { destination } = await lnd.decodePaymentRequest({
        paymentRequest
      })
      const { invoices } = await db.getOwnerInvoices({
        owner: destination
      })
      const totalAmount = invoices.reduce((total, { amount }) => (
        total += amount
      ), 0)
      const { paymentError } = await lnd.sendPaymentSync({
        paymentRequest,
        amount: totalAmount
      })
      await db.deleteOwnerInvoices({
        owner: destination
      })
      return {
        sent: !paymentError,
        amount: totalAmount
      }
    }
  },
  Subscription: {
    decryptionKey: ({
      subscribe: withFilter(
        () => pubsub.asyncIterator('INVOICE'),
        (a, b) => a && b && a.preimageHash === b.keyHash
      ),
      resolve: ({ preimage }) => ({
        key: preimage
      })
    })
  }
}

module.exports = {
  resolvers
}
