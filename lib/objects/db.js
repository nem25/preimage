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
        if (!entries.length)
          return reject(new Error('Invoices not found'))
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
    const ownerInvoices = await this.getOwnerInvoices({ owner })
    return await Promise.all(ownerInvoices.invoices.map((invoice) => (
      new Promise((resolve, reject) => {
        this.db.del({
          subject: owner,
          predicate: 'invoices',
          object: invoice.preimageHash
        }, (err) => {
          if (err) return reject(err)
          resolve(invoice)
        })
      })
    ))).then(() => ownerInvoices)
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

  async deleteKeyHashNonce ({ keyHash }) {
    const keyHashNonce = await this.getKeyHashNonce({ keyHash })
    return await new Promise((resolve, reject) => {
      this.db.del({
        subject: keyHash,
        predicate: 'nonce',
        object: keyHashNonce.nonce,
      }, (err) => {
        if (err) return reject(err)
        resolve(keyHashNonce)
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
          return reject(new Error('Key not found for data hash'))
        resolve({
          dataHash,
          key: entries[0].object,
          owner: entries[0].owner,
          price: entries[0].price
        })
      })
    })
  }

  async getKeyDataHash ({ key }) {
    return await new Promise((resolve, reject) => {
      this.db.get({
        predicate: 'key',
        object: key
      }, (err, entries) => {
        if (err) return reject(err)
        if (!entries.length)
          return reject(new Error('Data hash not found for key'))
        resolve({
          dataHash: entries[0].subject,
          key,
          owner: entries[0].owner,
          price: entries[0].price
        })
      })
    })
  }

  async deleteKeyDataHash ({ key }) {
    const keyDataHash = await this.getKeyDataHash({ key })
    return await new Promise((resolve, reject) => {
      this.db.del({
        subject: keyDataHash.dataHash,
        predicate: 'key',
        object: key
      }, (err) => {
        if (err) return reject(err)
        resolve(keyDataHash)
      })
    })
  }

  async getKeyDataHashExists ({ key }) {
    return await new Promise((resolve, reject) => {
      this.db.get({
        predicate: 'key',
        object: key
      }, (err, entries) => {
        if (err) return reject(err)
        resolve({
          key,
          exists: !!entries.length
        })
      })
    })
  }
}

module.exports = Db
