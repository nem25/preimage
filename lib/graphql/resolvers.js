const crypto = require('crypto')
const { promisify } = require('util')
const { PubSub, withFilter } = require('graphql-subscriptions')
const objects = require('../objects')

const { cipher, lnd, db } = objects()

const PAYOUT_PCT = 0.9

const pubsub = new PubSub()

;(async () => {
  const invoices = await lnd.subscribeInvoices()
  for await (const invoice of invoices) {
    const { preimage, preimageHash, amount } = invoice
    try {
      const ring = await db.findRingBy({ key: preimage })
      const data = await db.findDataBy({ ring: ring._id })
      await db.deleteData(data._id)
      delete ring.expiresAt
      ring.save()
      db.createPayment({
        owner: data.owner,
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
    encryptData: async (root, input, ctx) => {
      const { ring, encryptedData } = await cipher.encryptData({
        data: input.data
      })
      const owner = await db.createOwnerIfNew({
        pubKey: input.owner
      })
      const data = await db.createData({
        ring: ring._id,
        owner: owner._id,
        hash: crypto.createHash('sha256')
          .update(new Buffer(encryptedData, 'base64'))
          .digest('hex'),
        price: input.price
      })
      return {
        encryptedData
      }
    },
    encryptDataPayment: async (root, input, ctx) => {
      const { ring, encryptedData } = await cipher.encryptData({
        data: input.data
      })
      await db.setExpirable(ring)
      const owner = await db.createOwnerIfNew({
        pubKey: input.owner
      })
      const data = await db.createData({
        ring: ring._id,
        owner: owner._id,
        hash: crypto.createHash('sha256')
          .update(new Buffer(input.data, 'base64'))
          .digest('hex'),
        price: input.price
      })
      return {
        ...await lnd.createInvoice({
          preimage: ring.key,
          amount: input.price,
          memo: `sha256:${data.hash} cipher:salsa20 nonce:${ring.nonce}`
        }),
        encryptedData
      }
    },
    decryptEncryptDataPayment: async (root, input, ctx) => {
      const prevData = await db.findDataBy({
        hash: crypto.createHash('sha256')
          .update(new Buffer(input.encryptedData, 'base64'))
          .digest('hex')
      })
      const prevRing = await db.findRingBy({ _id: prevData.ring })
      const { decryptedData } = await cipher.decryptData({
        key: prevRing.key,
        encryptedData: input.encryptedData
      })
      const { ring, encryptedData } = await cipher.encryptData({
        data: decryptedData
      })
      await db.setExpirable(ring)
      const data = await db.createData({
        ring: ring._id,
        owner: prevData.owner,
        hash: crypto.createHash('sha256')
          .update(new Buffer(decryptedData, 'utf-8'))
          .digest('hex'),
        price: prevData.price
      })
      await db.setExpirable(data)
      return {
        ...await lnd.createInvoice({
          preimage: ring.key,
          amount: data.price,
          memo: `sha256:${data.hash} cipher:salsa20 nonce:${ring.nonce}`
        }),
        encryptedData 
      }
    },
    decryptData: async (root, input, ctx) => {
      const ring = await db.findRingBy({
        key: input.key
      })
      if (!ring) {
        throw new Error("Unknown or one-time use key, won't decrypt")
      }
      const { decryptedData } = await cipher.decryptData({
        key: input.key,
        encryptedData: input.encryptedData
      })
      await db.deleteRing(ring._id)
      return {
        data: decryptedData
      }
    },
    getContent: async (root, input, ctx) => {
      const body = await db.findBodyBy({
        hash: input.bodyHash
      })
      const content = await db.findContentBy({
        body: body._id
      })
      const owner = await db.findOwnerBy({
        _id: content.owner
      })
      const { encryptDataPayment } = ctx.Query
      const encryptedDataPayment = await encryptDataPayment(root, {
        owner: owner.pubKey,
        data: body.data,
        price: content.price
      })
      return {
        title: content.title,
        price: content.price,
        bodyHash: input.bodyHash,
        ...encryptedDataPayment
      }
    }
  },
  Mutation: {
    requestPayout: async (root, input, ctx) => {
      const { destination } = await lnd.decodePaymentRequest({
        paymentRequest: input.paymentRequest
      })
      const payments = await db.findPaymentsByOwnerBy({
        pubKey: destination
      })
      const totalAmount = payments.reduce((total, { amount }) => (
        total += amount
      ), 0)
      const { paymentError } = await lnd.sendPaymentSync({
        paymentRequest: input.paymentRequest,
        amount: totalAmount
      })
      await db.deletePaymentsByOwnerBy({
        pubKey: destination
      })
      return {
        sent: !paymentError,
        amount: totalAmount
      }
    },
    submitContent: async (root, input, ctx) => {
      const owner = await db.createOwnerIfNew({
        pubKey: input.owner
      })
      const body = await db.createBody({
        data: input.body
      })
      const content = await db.createContent({
        owner: owner._id,
        body: body._id,
        title: input.title,
        price: input.price,
        tags: input.tags
      })
      return {
        id: body.hash
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
