const submitContent = `
  mutation submitContent(
    $title:TitleString!,
    $price:Int!,
    $owner:PubKeyString!,
    $body:String!,
    $tags:TagsString!,
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
  mutation requestPayout($paymentRequest:TersePayReqString!) {
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
