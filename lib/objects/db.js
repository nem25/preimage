const crypto = require('crypto')
const mongoose = require('mongoose')

const ONE_HOUR = 1000 * 60 * 60

const ringSchema = mongoose.Schema({
  key: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(32).toString('hex')
  },
  nonce: {
    type: String,
    default: () => crypto.randomBytes(8).toString('hex')
  },
  expiresAt: Date
}, { versionKey: false })

ringSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const Ring = mongoose.model('Ring', ringSchema)

const ownerSchema = mongoose.Schema({
  pubKey: {
    type: String,
    required: true
  }
}, { versionKey: false })

const Owner = mongoose.model('Owner', ownerSchema)

const dataSchema = mongoose.Schema({
  ring: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ring',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: true
  },
  hash: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  expiresAt: Date
}, { versionKey: false })

dataSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const Data = mongoose.model('Data', dataSchema)

const paymentSchema = mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: true
  },
  amount: {
    type: Number,
    required: true
  }
}, { versionKey: false })

const Payment = mongoose.model('Payment', paymentSchema)

const bodySchema = mongoose.Schema({
  data: String,
  hash: String
})

const Body = mongoose.model('Body', bodySchema)

const contentSchema = mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    required: true
  },
  body: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Body',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  tags: [String]
})

const Content = mongoose.model('Content', contentSchema)

const MONGODB_URI = process.env.MONGODB_URI
  || 'mongodb://localhost:27017/preimage'

class Db {
  constructor (objects) {
    this.objects = objects
    this.mongoose = mongoose.connect(MONGODB_URI)
  }

  async createData (input) {
    return await Data.create({
      ring: input.ring,
      owner: input.owner,
      hash: input.hash,
      price: input.price
    })
  }

  async createRing () {
    return await Ring.create({})
  }

  async createPayment (input) {
    return await Payment.create({
      owner: input.owner,
      amount: input.amount
    })
  }

  async createOwnerIfNew (input) {
    const owner = await Owner.findOne({
      pubKey: input.pubKey
    })
    if (owner) return owner
    return await Owner.create({
      pubKey: input.pubKey
    })
  }

  async createBody (input) {
    return await Body.create({
      data: input.data,
      hash: crypto.createHash('sha256')
        .update(new Buffer(input.data, 'utf-8'))
        .digest('hex')
    })
  }

  async createContent (input) {
    return await Content.create({
      owner: input.owner,
      body: input.body,
      title: input.title,
      price: input.price,
      tags: input.tags
    })
  }

  async setExpirable (doc) {
    doc.expiresAt = Date.now() + ONE_HOUR
    await doc.save()
    return doc 
  }

  async findRingBy (input) {
    return await Ring.findOne(input)
  }

  async findDataBy (input) {
    return await Data.findOne(input)
  }

  async findPaymentsByOwnerBy (input) {
    const owner = await Owner.findOne(input)
    return await Payment.find({
      owner: owner._id
    })
  }

  async findBodyBy (input) {
    return await Body.findOne(input)
  }

  async findContentBy (input) {
    return await Content.findOne(input)
  }

  async findOwnerBy (input) {
    return await Owner.findOne(input)
  }

  async deleteData (id) {
    return await Data.findOneAndRemove({ _id: id })
  }

  async deleteRing (id) {
    return await Ring.findOneAndRemove({ _id: id })
  }

  async deletePaymentsByOwnerBy (input) {
    const owner = await Owner.findOne(input)
    const payments = await Payment.find({
      owner: owner._id
    })
    await Payment.remove({
      owner: owner._id
    })
    return payments
  }
}

module.exports = Db
