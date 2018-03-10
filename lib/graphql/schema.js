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
    purchased: Int,
    bodyHash: String,
    paymentRequest: String,
    preimageHash: String,
    encryptedData: String
  }

  type PayoutAmount {
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
      sponsor: String,
      data: String!,
      price: Int!
    ): EncryptedDataPayment,
    decryptEncryptDataPayment(
      encryptedData: String!,
      sponsor: String
    ): EncryptedDataPayment,
    decryptData(
      key: String!,
      encryptedData: String!
    ): Data,
    getContent(
      bodyHash: String!,
      sponsor: String
    ): Content,
    getContents: [Content],
    getPayoutAmount(
      identity: String!
    ): PayoutAmount
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
      tags: [String!],
      sponsoring: Boolean
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
