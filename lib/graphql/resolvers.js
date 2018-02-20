const crypto = require('crypto')
const { promisify } = require('util')
const { PubSub, withFilter } = require('graphql-subscriptions')
const { cipher, lnd, db } = require('../objects')

const PAYOUT_PCT = 0.9

const pubsub = new PubSub()

;(async () => {
  const invoices = await lnd.subscribeInvoices()
  for await (const invoice of invoices) {
    const { preimage, preimageHash, amount } = invoice
    try {
      const { owner } = await db.deleteKeyDataHash({
        key: preimage
      })
      db.setOwnerInvoice({
        owner,
        preimageHash,
        amount: Math.floor(amount * PAYOUT_PCT)
      })
      pubsub.publish('INVOICE', invoice)
    } catch (err) {
      console.error('Error checking invoice:', err)
    }
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
    encryptDataPayment: async (root, { owner, data, price }, ctx) => {
      const encryptKey = crypto.randomBytes(32).toString('hex')
      const dataHash = crypto.createHash('sha256')
        .update(new Buffer(data, 'utf-8')).digest('hex')
      await db.setDataHashKey({
        dataHash,
        key: encryptKey,
        owner,
        price
      })
      return {
        ...await lnd.createInvoice({
          preimage: encryptKey,
          amount: price,
          memo: `sha256:${dataHash}`
        }),
        ...await cipher.encryptData({
          key: encryptKey,
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
      const { decryptedData } = await cipher.decryptData({
        key,
        data: encryptedData
      })
      const decryptedDataHash = crypto.createHash('sha256')
        .update(new Buffer(decryptedData, 'utf-8')).digest('hex')
      const encryptKey = crypto.randomBytes(32).toString('hex')
      await db.setDataHashKey({
        dataHash: decryptedDataHash,
        key: encryptKey,
        owner,
        price
      })
      return {
        ...await lnd.createInvoice({
          preimage: encryptKey,
          amount: price,
          memo: `sha256:${decryptedDataHash}`
        }),
        ...await cipher.encryptData({
          key: encryptKey,
          data: decryptedData
        })
      }
    },
    decryptData: async (root, { key, data }, ctx) => {
      const { decryptedData } = await cipher.decryptData({
        key,
        data
      })
      const keyHash = crypto.createHash('sha256')
        .update(new Buffer(key, 'hex')).digest('hex')
      const { exists } = await db.getKeyDataHashExists({
        key
      })
      if (!exists) {
        db.deleteKeyHashNonce({
          keyHash
        })
      }
      return {
        decryptedData
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
