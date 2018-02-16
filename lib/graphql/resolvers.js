const crypto = require('crypto')
const { promisify } = require('util')
const { dispatch, query } = require('nact')
const { cipher, lnd, db } = require('../actors')
const { PubSub, withFilter } = require('graphql-subscriptions')
const { rescue } = require('../util')

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

streamQueryMap(query(lnd, {
  type: 'SUBSCRIBE_INVOICES'
}, QUERY_TIMEOUT), ({ type, payload }) => {
  const { memo, preimageHash, amount } = payload
  if (memo.match(OWNER_RE)) {
    query(db, {
      type: 'SET_OWNER_INVOICE',
      payload: {
        owner: memo.replace('owner:',''),
        preimageHash,
        amount: Math.floor(amount * PAYOUT_PCT)
      }
    }, QUERY_TIMEOUT)
  }
  pubsub.publish(type, payload)
})

const resolvers = {
  Query: {
    decryptData: async (root, { data, key }, ctx) => {
      return {
        data: (await query(cipher, {
          type: 'DECRYPT_DATA',
          payload: {
            key, 
            data
          }
        }, QUERY_TIMEOUT)).payload
      }
    }
  },
  Mutation: {
    encryptData: async (root, { owner, data, price }, ctx) => {
      const preimage = crypto.randomBytes(32).toString('hex')
      return {
        ...(await query(lnd, {
          type: 'CREATE_INVOICE',
          payload: {
            preimage,
            amount: price,
            memo: `owner:${owner}`
          }
        }, QUERY_TIMEOUT)).payload,
        data: (await query(cipher, {
          type: 'ENCRYPT_DATA',
          payload: {
            key: preimage, 
            data
          }
        }, QUERY_TIMEOUT)).payload
      }
    },
    requestPayout: async (root, { paymentRequest }, ctx) => {
      const { destination } = (await query(lnd, {
        type: 'DECODE_PAYMENT_REQUEST',
        payload: {
          paymentRequest
        }
      }, QUERY_TIMEOUT)).payload
      const { invoices } = (await query(db, {
        type: 'GET_OWNER_INVOICES',
        payload: {
          owner: destination
        }
      }, QUERY_TIMEOUT)).payload
      const totalAmount = invoices.reduce((total, { amount }) => (
        total += amount
      ), 0)
      const { paymentError } = (await query(lnd, {
        type: 'SEND_PAYMENT_SYNC',
        payload: {
          paymentRequest,
          amount: totalAmount
        }
      }, QUERY_TIMEOUT)).payload
      await query(db, {
        type: 'DELETE_OWNER_INVOICES',
        payload: {
          owner: destination
        }
      }, QUERY_TIMEOUT)
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
