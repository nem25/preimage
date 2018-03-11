const schema = `
  scalar TitleString
  scalar PubKeyString
  scalar HashString
  scalar TersePayReqString
  scalar TagsString

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
      owner: PubKeyString!,
      data: String!,
      price: Int!
    ): EncryptedData,
    encryptDataPayment(
      owner: PubKeyString!,
      sponsor: PubKeyString,
      data: String!,
      price: Int!
    ): EncryptedDataPayment,
    decryptEncryptDataPayment(
      encryptedData: String!,
      sponsor: PubKeyString
    ): EncryptedDataPayment,
    decryptData(
      key: HashString!,
      encryptedData: String!
    ): Data,
    getContent(
      bodyHash: HashString!,
      sponsor: PubKeyString
    ): Content,
    getContents: [Content],
    getPayoutAmount(
      identity: PubKeyString!
    ): PayoutAmount
  }

  type Mutation {
    requestPayout(
      paymentRequest: TersePayReqString!
    ): PayoutResult,
    submitContent(
      title: TitleString!,
      price: Int!,
      owner: PubKeyString!,
      body: String!,
      tags: TagsString!,
      sponsoring: Boolean
    ): SubmissionResult
  }

  type Subscription {
    decryptionKey(
      keyHash: HashString!
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
