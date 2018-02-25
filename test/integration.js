const assert = require('assert')
const mongoose = require('mongoose')
const { Mockgoose } = require('mockgoose')
const { graphql, subscribe } = require('graphql')
const gql = require('graphql-tag')

const BASE64_RE = /(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?/
const HASH_32_RE = /[a-f0-9]{64}/
const HASH_32 = new Array(64).fill(0).join('')
const HASH_33 = new Array(66).fill(0).join('')

const objects = require('../lib/objects')

class MockLnd {
  constructor () {
    this.queryResults = {
      createInvoice: {
        paymentRequest: 'lntb1234',
        preimageHash: HASH_32
      },
      subscribeInvoices: {
        preimageHash: HASH_32,
        preimage: null,
        amount: 1234
      },
      decodePaymentRequest: {
        destination: HASH_33,
        preimageHash: HASH_33 
      },
      sendPaymentSync: {
        paymentError: null
      }
    }
  }

  async createInvoice ({ preimage, amount, memo }) {
    return await Promise.resolve(this.queryResults.createInvoice)
  }
  async *subscribeInvoices () {
    while (true) {
      if (this.queryResults.subscribeInvoices.preimage)
        yield await Promise.resolve(this.queryResults.subscribeInvoices)
      await new Promise((resolve) => setTimeout(resolve, 100)) 
    }
  }
  async decodePaymentRequest ({ paymentRequest }) {
    return await Promise.resolve(this.queryResults.decodePaymentRequest)
  }
  async sendPaymentSync ({ paymentRequest, amount }) {
    return await Promise.resolve(this.queryResults.sendPaymentSync)
  }
}

const { db, cipher, lnd } = objects({ exclude: ['lnd'], include: {
  Lnd: MockLnd
}})

const { graphqlExecutableSchema } = require('../lib/graphql')
const { rescueQuery, rescueSubscription } = require('../lib/graphql/util')

const { schema } = graphqlExecutableSchema

before(function (done) {
  const mockgoose = new Mockgoose(mongoose)
  mockgoose.prepareStorage().then(() => {
    mongoose.connect('mongodb://testing.com/preimage', done)
  })
})

describe('public decryption', () => {
  let encryptDataResult,
    decryptEncryptDataPaymentResult,
    decryptionKeySubscriptionResult,
    decryptDataResult
  describe('encryptData', () => {
    it('encrypts some data', async () => {
      encryptDataResult = await rescueQuery(await graphql(schema, `
        query encryptData(
          $owner:String!,
          $data:String!,
          $price:Int!
        ) {
          encryptData(
            owner:$owner,
            data:$data,
            price:$price) {
              encryptedData
          }
        }
      `, null, null, {
        owner: HASH_33,
        data: 'Unit test',
        price: 1234
      })) 
      assert(encryptDataResult.encryptedData)
    })
    it('encryptDataResult.encryptedData is 12 chars long', () => {
      assert.equal(encryptDataResult.encryptedData.length, 12)
    })
    it('encryptDataResult.encryptedData is base64', () => {
      assert(encryptDataResult.encryptedData.match(BASE64_RE))
    })
  })
  describe('decryptEncryptDataPayment', () => { 
    it('decrypts and reencrypts data using preimage', async () => {
      decryptEncryptDataPaymentResult = await rescueQuery(await graphql(schema, `
        query decryptEncryptDataPayment(
          $encryptedData:String!
        ) {
          decryptEncryptDataPayment(
            encryptedData:$encryptedData
          ) {
            paymentRequest
            preimageHash
            encryptedData
          }
        }
      `, null, null, {
        encryptedData: encryptDataResult.encryptedData
      }))
      assert(decryptEncryptDataPaymentResult)
    })
    it('decryptEncryptDataPaymentResult.paymentRequest is correct', () => {
      assert.equal(decryptEncryptDataPaymentResult.paymentRequest,
        lnd.queryResults.createInvoice.paymentRequest)
    })
    it('decryptEncryptDataPaymentResult.preimageHash is correct', () => {
      assert.equal(decryptEncryptDataPaymentResult.preimageHash,
        lnd.queryResults.createInvoice.preimageHash)
    })
    it('decryptEncryptDataPaymentResult.encryptedData is 12 chars long', () => {
      assert.equal(decryptEncryptDataPaymentResult.encryptedData.length, 12)
    })
    it('decryptEncryptDataPaymentResult.encryptedData is base64', () => {
      assert(decryptEncryptDataPaymentResult.encryptedData.match(BASE64_RE))
    })
  })
  describe('decryptionKey', () => {
    it('subscribes to decryption keys', async () => {
      const ring = await db.findRingBy({ expiresAt: { $exists: true }}) 
      const subscription = await subscribe(schema, gql`
        subscription decryptionKey(
          $keyHash:String!
        ) {
          decryptionKey(
            keyHash:$keyHash
          ) {
            key
          }
        }
      `, null, null, {
        keyHash: decryptEncryptDataPaymentResult.preimageHash 
      })
      lnd.queryResults.subscribeInvoices.preimage = ring.key
      for await (const invoice of rescueSubscription(subscription)) {
        decryptionKeySubscriptionResult = invoice
        break
      }
      assert(decryptionKeySubscriptionResult)
    })
    it('decryptionKeySubscriptionResult.key is 32 bytes hex', () => {
      assert(decryptionKeySubscriptionResult.key.match(HASH_32_RE))
    })
  })
  describe('decryptData', () => {
    it('decrypts data using decryption key', async () => {
      decryptDataResult = await rescueQuery(await graphql(schema, `
        query decryptData(
          $key:String!,
          $encryptedData:String!
        ) {
          decryptData(
            key:$key,
            encryptedData:$encryptedData
          ) {
            data
          }
        }
      `, null, null, {
        key: decryptionKeySubscriptionResult.key,
        encryptedData: decryptEncryptDataPaymentResult.encryptedData
      }))
      assert(decryptDataResult)
    })
    it('decryptDataResult.data is previous string to encrypt', () => {
      assert.equal(decryptDataResult.data, 'Unit test')
    }) 
  }) 
})

describe('private decryption', () => {
  let encryptDataPaymentResult,
    decryptionKeySubscriptionResult,
    decryptDataResult
  describe('encryptDataPayment', () => {
    it('encrypts some data using preimage', async () => {
      await mongoose.models.Ring.remove({ expiresAt: { $exists: true }})
      encryptDataPaymentResult = await rescueQuery(await graphql(schema, `
        query encryptDataPayment(
          $owner:String!,
          $data:String!,
          $price:Int!
        ) {
          encryptDataPayment(
            owner:$owner,
            data:$data,
            price:$price
          ) {
            paymentRequest
            preimageHash
            encryptedData
          }
        }
      `, null, null, {
        owner: HASH_33,
        data: 'Unit test',
        price: 1234
      })) 
      assert(encryptDataPaymentResult)
    })
    it('encryptDataPaymentResult.paymentRequest is correct', () => {
      assert.equal(encryptDataPaymentResult.paymentRequest,
        lnd.queryResults.createInvoice.paymentRequest)
    })
    it('encryptDataPaymentResult.preimageHash is correct', () => {
      assert.equal(encryptDataPaymentResult.preimageHash,
        lnd.queryResults.createInvoice.preimageHash)
    })
    it('encryptDataPaymentResult.encryptedData is 12 chars long', () => {
      assert.equal(encryptDataPaymentResult.encryptedData.length, 12)
    })
    it('encryptDataPaymentResult.encryptedData is base64', () => {
      assert(encryptDataPaymentResult.encryptedData.match(BASE64_RE))
    })
  })
  describe('decryptionKey', () => {
    it('subscribes to decryption keys', async () => {
      const ring = await db.findRingBy({ expiresAt: { $exists: true }}) 
      const subscription = await subscribe(schema, gql`
        subscription decryptionKey(
          $keyHash:String!
        ) {
          decryptionKey(
            keyHash:$keyHash
          ) {
            key
          }
        }
      `, null, null, {
        keyHash: encryptDataPaymentResult.preimageHash 
      })
      lnd.queryResults.subscribeInvoices.preimage = ring.key
      for await (const invoice of rescueSubscription(subscription)) {
        decryptionKeySubscriptionResult = invoice
        break
      }
      assert(decryptionKeySubscriptionResult)
    })
    it('decryptionKeySubscriptionResult.key is 32 bytes hex', () => {
      assert(decryptionKeySubscriptionResult.key.match(HASH_32_RE))
    })
  })
  describe('decryptData', () => {
    it('decrypts data using decryption key', async () => {
      decryptDataResult = await rescueQuery(await graphql(schema, `
        query decryptData(
          $key:String!,
          $encryptedData:String!
        ) {
          decryptData(
            key:$key,
            encryptedData:$encryptedData
          ) {
            data
          }
        }
      `, null, null, {
        key: decryptionKeySubscriptionResult.key,
        encryptedData: encryptDataPaymentResult.encryptedData
      }))
      assert(decryptDataResult)
    })
    it('decryptDataResult.data is previous string to encrypt', () => {
      assert.equal(decryptDataResult.data, 'Unit test')
    })
  })
})

describe('payout', () => {
  let requestPayoutResult
  describe('requestPayout', () => {
    it('sends payout', async () => {
      requestPayoutResult = await rescueQuery(await graphql(schema, `
        mutation requestPayout(
          $paymentRequest:String!
        ) {
          requestPayout(
            paymentRequest:$paymentRequest
          ) {
            sent
            amount
          }
        }
      `, null, null, {
          paymentRequest: 'lntb1234'
      }))
      assert(requestPayoutResult)
    })
    it('requestPayoutResult.sent is true', () => {
      assert(requestPayoutResult.sent)
    })
    it('requestPayoutResult.sent amount is (payments * 0.90) * 2', () => {
      assert.equal(requestPayoutResult.amount, Math.floor(1234 * 0.90) * 2)
    })
  })
})
