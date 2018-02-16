const { dispatch, spawnStateless } = require('nact')
const { getGraphQLExecutableSchema } = require('lnd-graphql')
const { graphql, subscribe } = require('graphql')
const gql = require('graphql-tag')
const { rescue } = require('../util')

module.exports = (system) => spawnStateless(
  system,
  async (msg, { self, sender }) => {
    const { schema } = await getGraphQLExecutableSchema()
    return (({
      CREATE_INVOICE: async ({ preimage, amount, memo }) => {
        dispatch(sender, {
          type: 'PAYMENT_REQUEST',
          payload: rescue(3, await graphql(schema, `
            mutation addInvoice(
              $amount:Int,
              $preimage:String,
              $memo:String
            ) {
              addInvoice(
                amount:$amount,
                preimage:$preimage,
                memo:$memo
              ) {
                paymentRequest
                preimageHash
              }
            } 
          `, null, null, {
            amount,
            preimage,
            memo
          }))
        }, self)
      },
      SUBSCRIBE_INVOICES: async () => {
        const subscription = await subscribe(schema, gql`
          subscription subscribeInvoices {
            subscribeInvoices {
              preimage
              preimageHash
              memo
              amount
            }
          } 
        `)
        dispatch(sender, {
          type: 'INVOICE_SUBSCRIPTION',
          payload: subscription
        }, self)
      },
      DECODE_PAYMENT_REQUEST: async ({ paymentRequest }) => {
        dispatch(sender, {
          type: 'DECODED_PAYMENT_REQUEST',
          payload: rescue(3, await graphql(schema, `
            query decodePaymentRequest($paymentRequest:String) {
              decodePaymentRequest(paymentRequest:$paymentRequest) {
                destination
                preimageHash
              }
            }
          `, null, null, {
            paymentRequest
          }))
        }, self)
      },
      SEND_PAYMENT_SYNC: async ({
        paymentRequest,
        amount
      }) => {
        dispatch(sender, {
          type: 'PAYMENT_STATUS_UPDATE',
          payload: rescue(3, await graphql(schema, `
            mutation sendPaymentSync(
              $paymentRequest:String,
              $amount:Int
            ) {
              sendPaymentSync(
                paymentRequest:$paymentRequest,
                amount:$amount
              ) {
                  paymentError
              }
            }
          `, null, null, {
            paymentRequest,
            amount
          }))
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
