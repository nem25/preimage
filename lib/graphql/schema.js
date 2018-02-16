const { buildSchema } = require('graphql')

const schema = `
  type DecryptedData {
    data: String
  }

  type EncryptedData {
    paymentRequest: String,
    preimageHash: String,
    data: String
  }

  type DecryptionKey {
    key: String
  }

  type PayoutResult {
    sent: Boolean,
    amount: Int
  }

  type Query {
    decryptData(
      key: String!,
      data: String!
    ): DecryptedData
  }

  type Mutation {
    encryptData(
      owner: String!,
      data: String!,
      price: Int!
    ): EncryptedData,
    requestPayout(
      paymentRequest: String!
    ): PayoutResult
  }

  type Subscription {
    decryptionKeys(
      keyHash: String
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
