const { buildSchema } = require('graphql')

const schema = `
  type Data {
    data: String
  }

  type EncryptedData {
    encryptedData: String
  }

  type EncryptedDataPayment {
    paymentRequest: String,
    preimageHash: String,
    encryptedData: String
  }

  type DecryptionKey {
    key: String
  }

  type PayoutResult {
    sent: Boolean,
    amount: Int
  }

  type Query {
    encryptData(
      owner: String!,
      data: String!,
      price: Int!
    ): EncryptedData,
    encryptDataPayment(
      owner: String!,
      data: String!,
      price: Int!
    ): EncryptedDataPayment,
    decryptEncryptDataPayment(
      encryptedData: String!
    ): EncryptedDataPayment,
    decryptData(
      key: String!,
      encryptedData: String!
    ): Data
  }

  type Mutation {
    requestPayout(
      paymentRequest: String!
    ): PayoutResult
  }

  type Subscription {
    decryptionKey(
      keyHash: String!
    ): DecryptionKey
  }

  schema {
    query: Query,
    mutation: Mutation,
    subscription: Subscription
  }
`

module.exports = {
  schema
}
