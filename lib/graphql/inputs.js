const { GraphQLValidatedString } = require('graphql-validated-types')

const TitleString = new GraphQLValidatedString({
  name: 'TitleString' 
}).regex(/^.{1,140}$/)

const PubKeyString = new GraphQLValidatedString({
  name: 'PubKeyString'
}).regex(/^[a-f0-9]{66}$/i)

const HashString = new GraphQLValidatedString({
  name: 'HashString'
}).regex(/^[a-f0-9]{64}$/i)

const TersePayReqString = new GraphQLValidatedString({
  name: 'TersePayReqString'
}).regex(/^(lightning:)?(ln(bc|tb|sb)1)[023456789acdefghjklmnpqrstuvwxyz]{1,180}$/i)

const TagsString = new GraphQLValidatedString({
  name: 'TagsString'
}).regex(/^( ?[^ ]+){1,3}$/i)

module.exports = {
  TitleString,
  PubKeyString,
  HashString,
  TersePayReqString,
  TagsString
}
