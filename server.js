const url = require('url')
const express = require('express')
const bodyParser = require('body-parser')
const next = require('next')

const { createServer } = require('http')
const { execute, graphql, subscribe } = require('graphql')
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express')
const { SubscriptionServer } = require('subscriptions-transport-ws')

const ExpressBrute = require('express-brute')
const MongoStore = require('express-brute-mongo')

const { graphqlExecutableSchema } = require('./lib/graphql')
const { rescueQuery } = require('./lib/graphql/util')
const { submitContent, requestPayout } = require('./lib/graphql/mutations')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()

nextApp.prepare().then(() => {
  const app = express()
  const server = createServer(app)
  const { schema, context } = graphqlExecutableSchema

  const store = new MongoStore((ready) => {
    const { connection } = require('mongoose')
    const collection = connection.collection('throttles')
    collection.ensureIndex({ expires: 1 }, { expireAfterSeconds: 0 })
    ready(collection)
  })

  const throttler = new ExpressBrute(store, {
    freeRetries: 100,       // 100 reqs
    lifetime: 5 * 60 * 1e3  // 5 mins
  })

  app.use('/graphql',
    bodyParser.json(),
    graphqlExpress(graphqlExecutableSchema))

  app.get('/graphiql', graphiqlExpress((req) => ({
    endpointURL: '/graphql',
    subscriptionsEndpoint: url.format({
      host: req.get('host'),
      protocol: !dev ? 'wss' : 'ws',
      pathname: '/graphql'
    })
  })))

  const urlEncodedBodyParser = bodyParser
    .urlencoded({ extended: false, limit: '24kb' })

  app.post('/new', urlEncodedBodyParser, async (req, res) => {
    const content = await rescueQuery(await graphql(
      schema, submitContent, null, context, req.body))
    if (content.id) {
      res.redirect(301, `/${content.id}`)
      return
    }
    console.error(content)
    res.redirect('/')
  })

  app.post('/payout', urlEncodedBodyParser, async (req, res) => {
    const payout = await rescueQuery(await graphql(
      schema, requestPayout, null, context, req.body))
    if (payout.sent) {
      res.redirect(301, `/`)
      return
    }
    console.error(payout)
    res.redirect('/')
  })

  app.get('/:bodyHash([a-f0-9]{64})', throttler.prevent, (req, res) => {
    const { bodyHash } = req.params
    return nextApp.render(req, res, '/detail', { bodyHash })
  })

  app.get('/@/:x([^ ]+)/:y([^ ]+)/:z([^ ]+)', (req, res) => {
    const { x, y, z } = req.params
    return nextApp.render(req, res, '/entries', { tags: [x, y, z] })
  })

  app.get('/@/:x([^ ]+)/:y([^ ]+)', (req, res) => {
    const { x, y } = req.params
    return nextApp.render(req, res, '/entries', { tags: [x, y] })
  })

  app.get('/@/:x([^ ]+)', (req, res) => {
    const { x } = req.params
    return nextApp.render(req, res, '/entries', { tags: [x] })
  })

  app.get('/@', (req, res) => (
    res.redirect(301, `/`)
  ))

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
