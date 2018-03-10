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

const sponsorSchema = mongoose.Schema({
  pubKey: {
    type: String,
    required: true
  }
}, { versionKey: false })

const Sponsor = mongoose.model('Sponsor', sponsorSchema)

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
  recipient: {
    kind: String,
    item: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'recipient.kind',
      required: true
    }
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
  sponsors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sponsor'
  }],
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
  purchased: {
    type: Number,
    default: 0
  },
  tags: [String],
  sponsoring: Boolean
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
      recipient: input.recipient,
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

  async createSponsorIfNew (input) {
    const sponsor = await Sponsor.findOne({
      pubKey: input.pubKey
    })
    if (sponsor) return sponsor
    return await Sponsor.create({
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
      tags: input.tags,
      sponsoring: input.sponsoring
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

  async findPaymentsByRecipientBy (input) {
    let recipient = await Owner.findOne(input)
    if (!recipient) recipient = await Sponsor.findOne(input)
    if (!recipient) return []
    return await Payment.find({
      'recipient.item': recipient._id
    })
  }

  async findBodyBy (input) {
    return await Body.findOne(input)
  }

  async findContentBy (input) {
    return await Content.findOne(input)
  }

  async findContentsBy (input) {
    return await Content.find(input).sort({ purchased: -1 })
  }

  async findOwnerBy (input) {
    return await Owner.findOne(input)
  }

  async findSponsorBy (input) {
    return await Sponsor.findOne(input)
  }

  async deleteData (id) {
    return await Data.findOneAndRemove({ _id: id })
  }

  async deleteRing (id) {
    return await Ring.findOneAndRemove({ _id: id })
  }

  async deletePaymentsByOwnerBy (input) {
    let recipient = await Owner.findOne(input)
    if (!recipient) recipient = await Sponsor.findOne(input)
    if (!recipient) return []
    const payments = await Payment.find({
      'recipient.item': recipient._id
    })
    await Payment.remove({
      'recipient.item': recipient._id
    })
    return payments
  }
}

module.exports = Db
