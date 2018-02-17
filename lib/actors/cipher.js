const crypto = require('crypto')
const { dispatch, spawnStateless } = require('nact')
const JSSalsa20 = require('js-salsa20')
const { getPayload } = require('../util')
const {
  encryptData,
  decryptData,
  setKeyHashNonce,
  getKeyHashNonce,
  getKeyHashNonceExists,
  error,
  encryptedData,
  decryptedData
} = require('../actions')

module.exports = (system, actors) => spawnStateless(
  system,
  (msg, { self, sender }) => (
    (({
      [encryptData]: async ({ key, data }) => {
        const keyHash = crypto.createHash('sha256')
          .update(new Buffer(key, 'hex')).digest('hex')
        try {
          const { db } = actors
          const { exists } = await getPayload(db, getKeyHashNonceExists({
            keyHash
          }))
          if (exists) {
            const err = new Error('Key already seen, use a new key')
            dispatch(sender, error(err), self)
            return
          }
          const nonceBytes = crypto.randomBytes(8)
          getPayload(db, setKeyHashNonce({
            keyHash,
            nonce: nonceBytes.toString('hex')
          }))
          dispatch(sender, encryptedData({
            key,
            data: new Buffer(new JSSalsa20(new Buffer(key, 'hex'), nonceBytes)
              .encrypt(new Buffer(data, 'utf-8'))).toString('base64')
          }), self)
        } catch (err) {
          dispatch(sender, error(err), self)
        }
      },
      [decryptData]: async ({ key, data }) => {
        const keyHash = crypto.createHash('sha256')
          .update(new Buffer(key, 'hex')).digest('hex')
        try {
          const { db } = actors
          const { nonce } = await getPayload(db, getKeyHashNonce({
            keyHash
          }))
          const nonceBytes = new Buffer(nonce, 'hex')
          dispatch(sender, decryptedData({
            key,
            data: new Buffer(new JSSalsa20(new Buffer(key, 'hex'), nonceBytes)
              .decrypt(new Buffer(data, 'base64'))).toString('utf-8')
          }), self)
        } catch (err) {
          dispatch(sender, error(err), self)
        }
      }
    })[msg.type] || (() => (
      dispatch(sender, error(
        new Error('Action not found')
      ), self)
    )))(msg.payload)
  ),
  'cipher'
)
