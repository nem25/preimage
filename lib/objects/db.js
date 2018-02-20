const level = require('level-browserify')
const levelgraph = require('levelgraph')

class Db {
  constructor (objects) {
    this.objects = objects
    this.db = levelgraph(level('store'))
  }

  async setOwnerInvoice ({ owner, preimageHash, amount }) {
    return await new Promise((resolve, reject) => {
      this.db.put({
        subject: owner,
        predicate: 'invoices',
        object: preimageHash,
        amount
      }, (err) => {
        if (err) return reject(err) 
        resolve({
          owner,
          preimageHash,
          amount
        })
      })
    })
  }

  async getOwnerInvoices ({ owner }) {
    return await new Promise((resolve, reject) => {
      this.db.get({
        subject: owner,
        predicate: 'invoices'
      }, (err, entries) => {
        if (err) return reject(err)
        resolve({
          owner,
          invoices: entries.map(({ object, amount }) => ({
            preimageHash: object,
            amount
          }))
        })
      })
    })
  }

  async deleteOwnerInvoices ({ owner }) {
    return await new Promise((resolve, reject) => {
      this.db.del({
        subject: owner,
        predicate: 'invoices'
      }, (err) => {
        if (err) return reject(err)
        resolve({
          owner
        })
      })
    })
  }

  async setKeyHashNonce ({ keyHash, nonce }) {
    return await new Promise((resolve, reject) => {
      this.db.put({
        subject: keyHash,
        predicate: 'nonce',
        object: nonce
      }, (err) => {
        if (err) return reject(err)
        resolve({
          keyHash,
          nonce
        })
      })
    })
  }

  async getKeyHashNonce ({ keyHash }) {
    return await new Promise((resolve, reject) => {
      this.db.get({
        subject: keyHash,
        predicate: 'nonce'
      }, (err, entries) => {
        if (err) return reject(err)
        if (!entries.length)
          return reject(new Error('Nonce not found'))
        resolve({
          keyHash,
          nonce: entries[0].object
        })
      })
    })
  }

  async getKeyHashNonceExists ({ keyHash }) {
    return await new Promise((resolve, reject) => {
      this.db.get({
        subject: keyHash,
        predicate: 'nonce'
      }, (err, entries) => {
        if (err) return reject(err)
        resolve({
          keyHash,
          exists: !!entries.length
        })
      })
    })
  }

  async setDataHashKey ({ dataHash, key, owner, price }) {
    return await new Promise((resolve, reject) => {
      this.db.put({
        subject: dataHash,
        predicate: 'key',
        object: key,
        owner,
        price
      }, (err) => {
        if (err) return reject(err)
        resolve({
          dataHash,
          key,
          owner,
          price
        })
      })
    })
  }

  async getDataHashKey ({ dataHash }) {
    return await new Promise((resolve, reject) => {
      this.db.get({
        subject: dataHash,
        predicate: 'key'
      }, (err, entries) => {
        if (err) return reject(err)
        if (!entries.length)
          return reject(new Error('Key not found for data'))
        resolve({
          dataHash,
          key: entries[0].object,
          owner: entries[0].owner,
          price: entries[0].price
        })
      })
    })
  }
}

module.exports = Db
