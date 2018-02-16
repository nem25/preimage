const crypto = require('crypto')
const { promisify } = require('util')
const { dispatch, query } = require('nact')
const { cipher, lnd, db } = require('../actors')
const { PubSub, withFilter } = require('graphql-subscriptions')
const { rescue } = require('../util')
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
  deleteOwnerInvoices
} = require('../actions')

const QUERY_TIMEOUT = 2000
const PAYOUT_PCT = 0.9
const OWNER_RE = /^owner:[0-9a-f]{66}$/

const pubsub = new PubSub()

const streamQueryMap = async (query, fn) => {
  const { type, payload } = await query 
  while (true) fn({
    type: type.replace('_SUBSCRIPTION', ''),
    payload: rescue(4, await payload.next())
  })
}

streamQueryMap(query(
  lnd,
  subscribeInvoices(),
  QUERY_TIMEOUT
), ({ type, payload }) => {
  const { memo, preimageHash, amount } = payload
  if (memo.match(OWNER_RE)) {
    query(db, setOwnerInvoice({
      owner: memo.replace('owner:',''),
      preimageHash,
      amount: Math.floor(amount * PAYOUT_PCT)
    }), QUERY_TIMEOUT)
  }
  pubsub.publish(type, payload)
})

const resolvers = {
  Query: {
    decryptData: async (root, { data, key }, ctx) => {
      return {
        data: (await query(cipher, decryptData({
          key,
          data
        }), QUERY_TIMEOUT)).payload
      }
    }
  },
  Mutation: {
    encryptData: async (root, { owner, data, price }, ctx) => {
      const preimage = crypto.randomBytes(32).toString('hex')
      return {
        ...(await query(lnd, createInvoice({
          preimage,
          amount: price,
          memo: `owner:${owner}`
        }), QUERY_TIMEOUT)).payload,
        data: (await query(cipher, encryptData({
          key: preimage,
          data
        }), QUERY_TIMEOUT)).payload
      }
    },
    requestPayout: async (root, { paymentRequest }, ctx) => {
      const { destination } = (await query(lnd, decodePaymentRequest({
        paymentRequest
      }), QUERY_TIMEOUT)).payload
      const { invoices } = (await query(db, getOwnerInvoices({
        owner: destination
      }), QUERY_TIMEOUT)).payload
      const totalAmount = invoices.reduce((total, { amount }) => (
        total += amount
      ), 0)
      const { paymentError } = (await query(lnd, sendPaymentSync({
        paymentRequest,
        amount: totalAmount
      }), QUERY_TIMEOUT)).payload
      await query(db, deleteOwnerInvoices({
        owner: destination
      }), QUERY_TIMEOUT)
      return {
        sent: !paymentError,
        amount: totalAmount
      }
    }
  },
  Subscription: {
    decryptionKeys: ({
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
