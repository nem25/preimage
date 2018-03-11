const getContent = `
  query getContent($bodyHash:HashString!) {
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
