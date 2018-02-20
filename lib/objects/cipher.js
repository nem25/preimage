const crypto = require('crypto')
const JSSalsa20 = require('js-salsa20')

class Cipher {
  constructor (objects) {
    this.objects = objects
  }

  async encryptData ({ key, data }) {
    const keyHash = crypto.createHash('sha256')
      .update(new Buffer(key, 'hex')).digest('hex')
    const { db } = this.objects
    const { exists } = await db.getKeyHashNonceExists({
      keyHash
    })
    if (exists)
      throw new Error('Key already seen, use a new key')
    const nonceBytes = crypto.randomBytes(8)
    db.setKeyHashNonce({
      keyHash,
      nonce: nonceBytes.toString('hex')
    })
    return ({
      key,
      encryptedData: new Buffer(new JSSalsa20(new Buffer(key, 'hex'), nonceBytes)
        .encrypt(new Buffer(data, 'utf-8'))).toString('base64')
    })
  }

  async decryptData ({ key, data }) {
    const keyHash = crypto.createHash('sha256')
      .update(new Buffer(key, 'hex')).digest('hex')
    const { db } = this.objects
    const { nonce } = await db.getKeyHashNonce({
      keyHash
    })
    const nonceBytes = new Buffer(nonce, 'hex')
    return ({
      key,
      decryptedData: new Buffer(new JSSalsa20(new Buffer(key, 'hex'), nonceBytes)
        .decrypt(new Buffer(data, 'base64'))).toString('utf-8')
    })
  }
}

module.exports = Cipher
