const url = require('url')
const express = require('express')
const bodyParser = require('body-parser')
const next = require('next')

const { createServer } = require('http')
const { execute, graphql, subscribe } = require('graphql')
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express')
const { SubscriptionServer } = require('subscriptions-transport-ws')

const { graphqlExecutableSchema } = require('./lib/graphql')
const { rescueQuery } = require('./lib/graphql/util')
const { getContent } = require('./lib/graphql/queries')
const { submitContent } = require('./lib/graphql/mutations')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()

nextApp.prepare().then(() => {
  const app = express()
  const server = createServer(app)
  const { schema, context } = graphqlExecutableSchema

  app.use('/graphql', bodyParser.json(), graphqlExpress(graphqlExecutableSchema))
  app.get('/graphiql', graphiqlExpress((req) => ({
    endpointURL: '/graphql',
    subscriptionsEndpoint: url.format({
      host: req.get('host'),
      protocol: !dev ? 'wss' : 'ws',
      pathname: '/graphql'
    })
  })))

  const urlEncodedBodyParser = bodyParser.urlencoded({ extended: false })

  app.post('/new', urlEncodedBodyParser, async (req, res) => {
    const content = await rescueQuery(await graphql(
      schema, submitContent, null, context, req.body))
    if (content.id) {
      res.redirect(301, `/${content.id}`)
      return
    }
    res.redirect(500)
  })

  app.get('/:bodyHash([a-f0-9]{64})', async (req, res) => {
      console.log(req.params.bodyHash)
    const content = await rescueQuery(await graphql(
      schema, getContent, null, context, { bodyHash: req.params.bodyHash }))
    return nextApp.render(req, res, '/detail', { content })
  })

  app.get('*', nextHandler)

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
