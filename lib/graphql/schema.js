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

  type SubmissionResult {
    id: String
  }

  type Content {
    title: String,
    price: Int,
    bodyHash: String,
    paymentRequest: String,
    preimageHash: String,
    encryptedData: String
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
    ): Data,
    getContent(
      bodyHash: String!
    ): Content
  }

  type Mutation {
    requestPayout(
      paymentRequest: String!
    ): PayoutResult,
    submitContent(
      title: String!,
      price: Int!,
      owner: String!,
      body: String!,
      tags: [String!]
    ): SubmissionResult
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
