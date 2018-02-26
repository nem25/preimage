const submitContent = `
  mutation submitContent(
    $title:String!,
    $price:Int!,
    $owner:String!,
    $body:String!,
    $tags:[String!]
  ) {
    submitContent(
      title:$title,
      price:$price,
      owner:$owner,
      body:$body,
      tags:$tags
    ) {
      id
    }
  }
`

module.exports = {
  submitContent
}
