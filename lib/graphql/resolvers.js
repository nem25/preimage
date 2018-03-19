const crypto = require('crypto')
const { promisify } = require('util')
const { PubSub, withFilter } = require('graphql-subscriptions')
const objects = require('../objects')
const inputs = require('./inputs')

const { cipher, lnd, db } = objects()

const PAYOUT_PCT = 0.9

const labelsToString = (labels) => {
  return Object.keys(labels).reduce((res, label) => (
    res.concat(labels[label] ? `${label}:${labels[label]}` : '')
  ), []).join(' ')
}

const parseLabels = (str) => {
  return str.split(' ').reduce((res, kv) => {
    const parts = kv.split(':')
    return Object.assign(res, { [parts[0]]: parts[1] })
  }, {})
}

const pubsub = new PubSub()

;(async () => {
  const invoices = await lnd.subscribeInvoices()
  for await (const invoice of invoices) {
    const { preimage, preimageHash, amount, memo } = invoice
    try {
      const ring = await db.findRingBy({ key: preimage })
      const data = await db.findDataBy({ ring: ring._id })
      const body = await db.findBodyBy({ hash: data.hash })
      const content = await db.findContentBy({ body: body._id })
      await db.deleteData(data._id)
      delete ring.expiresAt
      ring.save()
      const totalAmount = Math.floor(amount * PAYOUT_PCT)
      const sponsor = content.sponsoring &&
        content.sponsors.length &&
        content.sponsors[Math.floor(Math.random() * content.sponsors.length)]
      const finalAmount = Math.floor(totalAmount / ((sponsor ? 1 : 0) + 1))
      db.createPayment({
        recipient: {
          kind: 'Owner',
          item: content.owner
        },
        amount: finalAmount
      })
      if (sponsor) {
        db.createPayment({
          recipient: {
            kind: 'Sponsor',
            item: sponsor
          },
          amount: finalAmount
        })
      }
      const tags = parseLabels(memo)
      if (content.sponsoring && tags.sponsor) {
        const sponsor = await db.createSponsorIfNew({
          pubKey: tags.sponsor
        })
        content.sponsors.push(sponsor._id)
      }
      content.purchased++
      content.save()
      pubsub.publish('INVOICE', invoice)
    } catch (err) {
      console.error('Error checking invoice:', err)
    }
  }
})()

const resolvers = {
  ...inputs,
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
          .update(new Buffer(input.data, 'utf-8'))
          .digest('hex'),
        price: input.price
      })
      return {
        ...await lnd.createInvoice({
          preimage: ring.key,
          amount: input.price,
          memo: labelsToString({
            sponsor: input.sponsor,
            cipher: 'salsa20',
            nonce: ring.nonce,
            sha256: data.hash
          })
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
          memo: labelsToString({
            sponsor: input.sponsor,
            cipher: 'salsa20',
            nonce: ring.nonce,
            sha256: data.hash
          })
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
        sponsor: input.sponsor,
        data: body.data,
        price: content.price
      })
      return {
        title: content.title,
        price: content.price,
        tags: content.tags,
        bodyHash: input.bodyHash,
        ...encryptedDataPayment
      }
    },
    getContents: async (root, input, ctx) => {
      const findBy = {}
      if (input.tags && input.tags.length) {
        findBy.tags = { $all: input.tags }
      }
      const contents = await db.findContentsBy(findBy)
      return await Promise.all(contents.map((content) => (
        content.populate('body').execPopulate()
          .then((content) => ({
            title: content.title,
            price: content.price,
            purchased: content.purchased,
            bodyHash: content.body.hash
          }))
      )))
    },
    getPayoutAmount: async (root, input, ctx) => {
      const payments = await db.findPaymentsByRecipientBy({
        pubKey: input.identity
      })
      let totalAmount = 0
      if (payments.length) {
        totalAmount = payments.reduce((total, { amount }) => (
          total += amount
        ), 0)
      }
      return {
        amount: totalAmount
      }
    }
  },
  Mutation: {
    requestPayout: async (root, input, ctx) => {
      const paymentRequest = input.paymentRequest.replace('lightning:', '')
      const { destination } = await lnd.decodePaymentRequest({
        paymentRequest
      })
      const payments = await db.findPaymentsByRecipientBy({
        pubKey: destination
      })
      let sent = false
      let totalAmount = 0
      if (payments.length) {
        totalAmount = payments.reduce((total, { amount }) => (
          total += amount
        ), 0)
        const { paymentError } = await lnd.sendPaymentSync({
          paymentRequest,
          amount: totalAmount
        })
        sent = !paymentError
        if (sent) {
          await db.deletePaymentsByRecipientBy({
            pubKey: destination
          })
        }
      }
      return {
        sent,
        error: paymentError,
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
        tags: input.tags.split(' ')
          .slice(0, 3).map((t) => t.toLowerCase()),
        sponsoring: input.sponsoring
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
