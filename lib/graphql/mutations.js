const submitContent = `
  mutation submitContent(
    $title:String!,
    $price:Int!,
    $owner:String!,
    $body:String!,
    $tags:[String!],
    $sponsoring:Boolean
  ) {
    submitContent(
      title:$title,
      price:$price,
      owner:$owner,
      body:$body,
      tags:$tags,
      sponsoring:$sponsoring
    ) {
      id
    }
  }
`

const requestPayout = `
  mutation requestPayout($paymentRequest:String!) {
    requestPayout(paymentRequest:$paymentRequest) {
      sent
      amount
    }
  }
`

module.exports = {
  submitContent,
  requestPayout
}
