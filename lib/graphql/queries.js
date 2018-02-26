const getContent = `
  query getContent($bodyHash:String!) {
    getContent(bodyHash:$bodyHash) {
      title
      price
      bodyHash,
      paymentRequest
      preimageHash
      encryptedData
    }
  }
`

module.exports = {
  getContent
}
