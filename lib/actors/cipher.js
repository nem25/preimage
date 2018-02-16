const crypto = require('crypto')
const { dispatch, spawnStateless } = require('nact')
const JSSalsa20 = require('js-salsa20')

module.exports = (system) => spawnStateless(
  system,
  (msg, { self, sender }) => (
    (({
      ENCRYPT_DATA: ({ key, data }) => {
        const nonce = new Buffer('deadbeefbaadf00d', 'hex')
        try {
          dispatch(sender, {
            type: 'ENCRYPTED_DATA',
            payload: new Buffer(new JSSalsa20(new Buffer(key, 'hex'), nonce)
              .encrypt(new Buffer(data, 'utf-8'))).toString('base64')
          }, self)
        } catch (err) {
          dispatch(sender, {
            type: 'ERROR',
            payload: err 
          }, self)
        }
      },
      DECRYPT_DATA: ({ key, data }) => {
        const nonce = new Buffer('deadbeefbaadf00d', 'hex')
        try {
          dispatch(sender, {
            type: 'DECRYPTED_DATA',
            payload: new Buffer(new JSSalsa20(new Buffer(key, 'hex'), nonce)
              .decrypt(new Buffer(data, 'base64'))).toString('utf-8')
          }, self)
          return state
        } catch (err) {
          return dispatch(sender, {
            type: 'ERROR',
            payload: err 
          }, self)
        }
      }
    })[msg.type] || (() => (
      dispatch(sender, {
        type: 'ERROR',
        payload: 'Action not found'
      }, self)
    )))(msg.payload)
  ),
  'cipher'
)
