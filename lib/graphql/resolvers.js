const crypto = require('crypto')
const { promisify } = require('util')
const { PubSub, withFilter } = require('graphql-subscriptions')
const { cipher, lnd, db } = require('../actors')
const {
  getPayload,
  getSubscription,
  rescue
} = require('../util')
const {
  error,
  subscribeInvoices,
  setOwnerInvoice,
  decryptData,
  createInvoice,
  encryptData,
  decodePaymentRequest,
  getOwnerInvoices,
  sendPaymentSync,
  deleteOwnerInvoices,
  setDataHashKey,
  getDataHashKey
} = require('../actions')

const PAYOUT_PCT = 0.9
const OWNER_RE = /^owner:[0-9a-f]{66}$/

const pubsub = new PubSub()

;(async () => {
  const invoices = getSubscription(lnd, subscribeInvoices())
  for await (const { type, payload } of invoices) {
    const { memo, preimageHash, amount } = payload
    if (memo.match(OWNER_RE)) {
      getPayload(db, setOwnerInvoice({
        owner: memo.replace('owner:',''),
        preimageHash,
        amount: Math.floor(amount * PAYOUT_PCT)
      }))
    }
    pubsub.publish(type, payload)
  }
})()

const resolvers = {
  Query: {
    encryptData: async (root, { owner, data, price }, ctx) => {
      const key = crypto.randomBytes(32).toString('hex')
      const encryptedData = (await getPayload(cipher, encryptData({
        key,
        data
      }))).data
      const dataHash = crypto.createHash('sha256')
        .update(new Buffer(encryptedData, 'base64')).digest('hex')
      await getPayload(db, setDataHashKey({
        dataHash,
        key,
        owner,
        price
      }))
      return {
        data: encryptedData
      }
    },
    decryptData: async (root, { key, data }, ctx) => {
      return {
        data: (await getPayload(cipher, decryptData({
          key,
          data
        }))).data
      }
    },
    encryptDataPayment: async (root, { owner, data, price }, ctx) => {
      const key = crypto.randomBytes(32).toString('hex')
      return {
        ...await getPayload(lnd, createInvoice({
          preimage: key,
          amount: price,
          memo: `owner:${owner}`
        })),
        data: (await getPayload(cipher, encryptData({
          key,
          data
        }))).data
      }
    },
    decryptEncryptDataPayment: async (root, {
      encryptedData
    }, ctx) => {
      const dataHash = crypto.createHash('sha256')
        .update(new Buffer(encryptedData, 'base64')).digest('hex')
      const { key, owner, price } = await getPayload(db, getDataHashKey({
        dataHash
      }))
      const encryptKey = crypto.randomBytes(32).toString('hex')
      return {
        ...await getPayload(lnd, createInvoice({
          preimage: encryptKey,
          amount: price,
          memo: `owner:${owner}`
        })),
        data: (await getPayload(cipher, encryptData({
          key: encryptKey,
          data: (await getPayload(cipher, decryptData({
            key,
            data: encryptedData
          }))).data
        }))).data
      }
    }
  },
  Mutation: {
    requestPayout: async (root, { paymentRequest }, ctx) => {
      const { destination } = await getPayload(lnd, decodePaymentRequest({
        paymentRequest
      }))
      const { invoices } = await getPayload(db, getOwnerInvoices({
        owner: destination
      }))
      const totalAmount = invoices.reduce((total, { amount }) => (
        total += amount
      ), 0)
      const { paymentError } = await getPayload(lnd, sendPaymentSync({
        paymentRequest,
        amount: totalAmount
      }))
      await getPayload(db, deleteOwnerInvoices({
        owner: destination
      }))
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
