const assert = require('assert')
const mongoose = require('mongoose')
const { Mockgoose } = require('mockgoose')

const objects = require('../lib/objects')

const { db, cipher } = objects({ exclude: ['lnd'] })

const BASE64_RE = /(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?/
const HASH_33_RE = /[a-f0-9]{64}/
const HASH_32_RE = /[a-f0-9]{64}/
const HASH_8_RE = /[a-f0-9]{16}/

before(function (done) {
  const mockgoose = new Mockgoose(mongoose)
  mockgoose.prepareStorage().then(() => {
    mongoose.connect('mongodb://testing.com/preimage', done)
  })
})

describe('objects', async () => {
  describe('db', () => {
    let ring, owner, data, payment
    describe('createRing', () => {
      it('instantiates a ring', async () => {
        ring = await db.createRing()
        assert(ring)
      })
      it('ring._id is ObjectId', () => {
        assert.equal(ring._id.constructor, mongoose.Types.ObjectId)
      })
      it('ring.key is 32 bytes hex', () => {
        assert(ring.key.match(HASH_32_RE))
      })
      it('ring.nonce is 8 bytes hex', () => {
        assert(ring.nonce.match(HASH_8_RE))
      })
    })
    describe('createOwnerIfNew', () => {
      it('instantiates an owner', async () => {
        owner = await db.createOwnerIfNew({
          pubKey: new Array(66).fill(0).join('')
        })
        assert(owner)
      })
      it('owner._id is ObjectId', () => {
        assert.equal(owner._id.constructor, mongoose.Types.ObjectId)
      })
      it('owner.pubKey is 33 bytes hex', () => {
        assert(owner.pubKey.match(HASH_33_RE))
      })
    })
    describe('createData', () => {
      it('instantiates a data', async () => {
        data = await db.createData({
          ring: ring._id,
          owner: owner._id,
          hash: new Array(64).fill(0).join(''),
          price: 1234
        })
        assert(data)
      })
      it('data._id is ObjectId', () => {
        assert.equal(data._id.constructor, mongoose.Types.ObjectId)
      })
      it('data.ring is ring._id', () => {
        assert.equal(data.ring, ring._id)
      })
      it('data.owner is owner._id', () => {
        assert.equal(data.owner, owner._id)
      })
      it('data.hash is 64 bytes hex', () => {
        assert(data.hash.match(HASH_32_RE))
      })
      it('data.price is int', () => {
        assert.equal(data.price, 1234)
      })
    })
    describe('createPayment', () => {
      it('instantiates a payment', async () => {
        payment = await db.createPayment({
          recipient: {
            type: 'Owner',
            item: owner._id,
          },
          amount: 1110
        })
        assert(payment)
      })
      it('payment._id is ObjectId', () => {
        assert.equal(payment._id.constructor, mongoose.Types.ObjectId)
      })
      it('payment.recipient.item is owner._id', () => {
        assert.equal(payment.recipient.item, owner._id)
      })
      it('payment.amount is int', () => {
        assert.equal(payment.amount, 1110)
      })
    })
    describe('setExpirable', () => {
      it('sets expiration on ring', async () => {
        await db.setExpirable(ring)
      })
      it('ring.expiresAt is set', () => {
        assert.equal(ring.expiresAt.constructor, Date)
      })
    })
    describe('findRingBy', () => {
      let foundRing
      it('finds a ring by key', async () => {
        foundRing = await db.findRingBy({ key: ring.key })
        assert(foundRing)
      })
      it('foundRing._id is ring._id', () => {
        assert.equal(foundRing._id.toString(), ring._id.toString())
      })
    })
    describe('findDataBy', () => {
      let foundData
      it('finds a data by ring', async () => {
        foundData = await db.findDataBy({ ring: data.ring })
        assert(foundData)
      })
      it('foundData._id is data._id', () => {
        assert.equal(foundData._id.toString(), data._id.toString())
      })
    })
    describe('findPaymentsByRecipientBy', () => {
      let foundPayments
      it('finds payments by owner by pubKey', async () => {
        foundPayments = await db.findPaymentsByRecipientBy({ pubKey: owner.pubKey })
        assert(foundPayments)
        assert.equal(foundPayments.length, 1)
      })
      it('foundPayments[0]._id is payment._id', () => {
        assert.equal(foundPayments[0]._id.toString(), payment._id.toString())
      })
    })
    describe('deleteData', () => {
      let foundData
      it('deletes data by id', async () => {
        foundData = await db.deleteData(data._id) 
        assert(foundData)
      })
      it('foundData._id is data._id', () => {
        assert.equal(foundData._id.toString(), data._id.toString())
      })
    })
    describe('deleteRing', () => {
      let foundRing
      it('deletes ring by id', async () => {
        foundRing = await db.deleteRing(ring._id) 
        assert(foundRing)
      })
      it('foundRing._id is ring._id', () => {
        assert.equal(foundRing._id.toString(), ring._id.toString())
      })
    })
    describe('deletePaymentsByRecipientBy', () => {
      let foundPayments
      it('deletes payments by owner pubKey', async () => {
        foundPayments = await db.deletePaymentsByRecipientBy({
          pubKey: owner.pubKey 
        }) 
        assert(foundPayments)
        assert.equal(foundPayments.length, 1)
      })
      it('foundPayments[0]._id is payment._id', () => {
        assert.equal(foundPayments[0]._id.toString(), payment._id.toString())
      })
    })
  })
  describe('cipher', () => {
    let encryptionResult, decryptionResult
    describe('encryptData', () => {
      it('returns encryptionResult', async () => {
        encryptionResult = await cipher.encryptData({
          data: 'Unit test'
        })
        assert(encryptionResult)
      })
      it('encryptionResult contains ring', () => {
        assert(encryptionResult.ring)
      })
      it('encryptionResult contains encryptedData', () => {
        assert(encryptionResult.encryptedData)
      })
      it('encryptedData is 12 chars long', () => {
        assert.equal(encryptionResult.encryptedData.length, 12)
      })
      it('encryptedData is base64', () => {
        assert(encryptionResult.encryptedData.match(BASE64_RE))
      })
    })
    describe('decryptData', () => {
      it('returns decryptionResult', async () => {
        decryptionResult = await cipher.decryptData({
          key: encryptionResult.ring.key,
          encryptedData: encryptionResult.encryptedData
        })
        assert(decryptionResult)
      })
      it('decryptionResult contains decryptedData', () => {
        assert(decryptionResult.decryptedData)
      })
      it('decryptedData is previous string to encrypt', () => {
        assert.equal(decryptionResult.decryptedData, 'Unit test')
      })
    })
  })
})
