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

  type Query {
    decryptData(
      key: String!,
      data: String!
    ): DecryptedData
  }

  type Mutation {
    encryptData(
      data: String!,
      price: Int!
    ): EncryptedData 
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
