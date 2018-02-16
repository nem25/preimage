const { makeExecutableSchema } = require('graphql-tools')
const { schema } = require('./schema')
const { resolvers } = require('./resolvers')

const graphqlExecutableSchema = ({
  schema: makeExecutableSchema({
    typeDefs: [schema],
    resolvers
  }),
  context: {
    ...resolvers
  }
})

const graphqlConfig = ({
  typeDefs: schema,
  resolvers,
  context: {
    ...resolvers
  }
})

module.exports = {
  graphqlExecutableSchema,
  graphqlConfig
}
