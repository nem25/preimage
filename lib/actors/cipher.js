const crypto = require('crypto')
const { dispatch, spawnStateless } = require('nact')
const JSSalsa20 = require('js-salsa20')
const {
  encryptData,
  decryptData,
  error,
  encryptedData,
  decryptedData
} = require('../actions')

module.exports = (system) => spawnStateless(
  system,
  (msg, { self, sender }) => (
    (({
      [encryptData]: ({ key, data }) => {
        const nonce = new Buffer('deadbeefbaadf00d', 'hex')
        try {
          dispatch(sender, encryptedData(
            new Buffer(new JSSalsa20(new Buffer(key, 'hex'), nonce)
              .encrypt(new Buffer(data, 'utf-8'))).toString('base64')
          ), self)
        } catch (err) {
          dispatch(sender, error(err), self)
        }
      },
      [decryptData]: ({ key, data }) => {
        const nonce = new Buffer('deadbeefbaadf00d', 'hex')
        try {
          dispatch(sender, decryptedData(
            new Buffer(new JSSalsa20(new Buffer(key, 'hex'), nonce)
              .decrypt(new Buffer(data, 'base64'))).toString('utf-8')
          ), self)
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
