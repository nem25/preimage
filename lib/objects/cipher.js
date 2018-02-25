const crypto = require('crypto')
const JSSalsa20 = require('js-salsa20')

class Cipher {
  constructor (objects) {
    this.objects = objects
  }

  async encryptData (input) {
    const { db } = this.objects
    const ring = await db.createRing()
    return ({
      ring,
      encryptedData: new Buffer(
        new JSSalsa20(
          new Buffer(ring.key, 'hex'),
          new Buffer(ring.nonce, 'hex')
        ).encrypt(
          new Buffer(input.data, 'utf-8')
        )
      ).toString('base64')
    })
  }

  async decryptData (input) {
    const { db } = this.objects
    const ring = await db.findRingBy({
      key: input.key
    })
    return ({
      decryptedData: new Buffer(
        new JSSalsa20(
          new Buffer(ring.key, 'hex'),
          new Buffer(ring.nonce, 'hex')
        ).decrypt(
          new Buffer(input.encryptedData, 'base64')
        )
      ).toString('utf-8')
    })
  }
}

module.exports = Cipher
