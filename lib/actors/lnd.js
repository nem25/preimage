const { dispatch, spawnStateless } = require('nact')
const { getGraphQLExecutableSchema } = require('lnd-graphql')
const { graphql, subscribe } = require('graphql')
const gql = require('graphql-tag')
const { getConnection } = require('lnd-graphql/lib/grpc')
const { rescue } = require('../util')

module.exports = (system) => spawnStateless(
  system,
  async (msg, { self, sender }) => {
    const { schema } = await getGraphQLExecutableSchema()
    return (({
      CREATE_INVOICE: async ({ preimage, amount }) => {
        dispatch(sender, {
          type: 'PAYMENT_REQUEST',
          payload: rescue(3, await graphql(schema, `
            mutation addInvoice(
              $amount:Int,
              $preimage:String
            ) {
              addInvoice(
                amount:$amount,
                preimage:$preimage
              ) {
                paymentRequest
                preimageHash
              }
            } 
          `, null, null, {
            amount,
            preimage
          }))
        }, self)
      },
      SUBSCRIBE_INVOICES: async () => {
        const subscription = await subscribe(schema, gql`
          subscription subscribeInvoices {
            subscribeInvoices {
              preimage
              preimageHash
            }
          } 
        `)
        dispatch(sender, {
          type: 'INVOICE_SUBSCRIPTION',
          payload: subscription
        }, self)
      }
    })[msg.type] || (() => (
      dispatch(sender, {
        type: 'ERROR',
        payload: 'Action not found'
      }, self)
    )))(msg.payload)
  },
  'lnd'
)
