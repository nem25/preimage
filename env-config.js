const dev = process.env.NODE_ENV !== 'production'
const host = process.env.HOST || 'localhost:3000'

module.exports = {
  'process.env.GRAPHQL_HTTP': dev ?
    `http://${host}/graphql` : `https://${host}/graphql`,
  'process.env.GRAPHQL_WS': dev ?
    `ws://${host}/graphql` : `wss://${host}/graphql`
}
