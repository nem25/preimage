const crypto = require('crypto')
const { dispatch, query } = require('nact')
const { cipher, lnd, dummy } = require('../actors')
const { PubSub, withFilter } = require('graphql-subscriptions')
const { rescue } = require('../util')

const QUERY_TIMEOUT = 2000

const pubsub = new PubSub()

const streamQueryMap = async (query, fn) => {
  const { type, payload } = await query 
  while (true) fn({
    type,
    payload: rescue(4, await payload.next())
  })
}

streamQueryMap(query(lnd, {
  type: 'SUBSCRIBE_INVOICES'
}, QUERY_TIMEOUT), ({ type, payload }) => {
  const { preimage, preimageHash } = payload
  pubsub.publish('INVOICE', { preimage, preimageHash })
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
    encryptData: async (root, { data, price }, ctx) => {
      const preimage = crypto.randomBytes(32).toString('hex')
      return {
        ...(await query(lnd, {
          type: 'CREATE_INVOICE',
          payload: {
            preimage,
            amount: price
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
