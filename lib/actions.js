const { createAction } = require('redux-actions')

module.exports = {
  error: createAction('ERROR'),
  encryptedData: createAction('ENCRYPTED_DATA'),
  decryptedData: createAction('DECRYPTED_DATA'),
  ownerInvoice: createAction('OWNER_INVOICE'),
  ownerInvoices: createAction('OWNER_INVOICES'),
  deletedOwnerInvoices: createAction('DELETED_OWNER_INVOICES'),
  paymentRequest: createAction('PAYMENT_REQUEST'),
  invoiceSubscription: createAction('INVOICE_SUBSCRIPTION'),
  decodedPaymentRequest: createAction('DECODED_PAYMENT_REQUEST'),
  paymentStatusUpdate: createAction('PAYMENT_STATUS_UPDATE'),
  subscribeInvoices: createAction('SUBSCRIBE_INVOICES'),
  setOwnerInvoice: createAction('SET_OWNER_INVOICE'),
  decryptData: createAction('DECRYPT_DATA'),
  createInvoice: createAction('CREATE_INVOICE'),
  encryptData: createAction('ENCRYPT_DATA'),
  decodePaymentRequest: createAction('DECODE_PAYMENT_REQUEST'),
  getOwnerInvoices: createAction('GET_OWNER_INVOICES'),
  sendPaymentSync: createAction('SEND_PAYMENT_SYNC'),
  deleteOwnerInvoices: createAction('DELETE_OWNER_INVOICES')
}
