const url = require('url')
const express = require('express')
const bodyParser = require('body-parser')
const next = require('next')

const { createServer } = require('http')
const { execute, subscribe } = require('graphql')
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express')
const { SubscriptionServer } = require('subscriptions-transport-ws')

const { graphqlExecutableSchema } = require('./lib/graphql')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()

nextApp.prepare().then(() => {
  const app = express()

  const server = createServer(app)

  app.use('/graphql', bodyParser.json(), graphqlExpress(graphqlExecutableSchema))
  app.get('/graphiql', graphiqlExpress((req) => ({
    endpointURL: '/graphql',
    subscriptionsEndpoint: url.format({
      host: req.get('host'),
      protocol: req.protocol === 'https' ? 'wss' : 'ws',
      pathname: '/graphql'
    })
  })))

  app.get('*', nextHandler)

  const { schema } = graphqlExecutableSchema

  const subscriptions = new SubscriptionServer(
    { schema, execute, subscribe },
    { server, path: '/graphql' })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`graphql: http://localhost:${port}/graphql`)
    console.log(`subscriptions: ws://localhost:${port}/graphql`)
    console.log(`graphiql: http://localhost:${port}/graphiql`)
    console.log(`next: http://localhost:${port}`)
  })
})
