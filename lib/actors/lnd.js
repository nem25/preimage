const { dispatch, spawnStateless } = require('nact')
const { getGraphQLExecutableSchema } = require('lnd-graphql')
const { graphql, subscribe } = require('graphql')
const gql = require('graphql-tag')
const { rescue } = require('../util')
const {
  createInvoice,
  subscribeInvoices,
  decodePaymentRequest,
  sendPaymentSync,
  error,
  paymentRequest,
  invoiceSubscription,
  decodedPaymentRequest,
  paymentStatusUpdate
} = require('../actions')

module.exports = (system) => spawnStateless(
  system,
  async (msg, { self, sender }) => {
    const { schema } = await getGraphQLExecutableSchema()
    return (({
      [createInvoice]: async ({ preimage, amount, memo }) => {
        dispatch(sender, paymentRequest(
          rescue(3, await graphql(schema, `
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
        ), self)
      },
      [subscribeInvoices]: async () => {
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
        dispatch(sender, invoiceSubscription(
          subscription
        ), self)
      },
      [decodePaymentRequest]: async ({ paymentRequest }) => {
        dispatch(sender, decodedPaymentRequest(
          rescue(3, await graphql(schema, `
            query decodePaymentRequest($paymentRequest:String) {
              decodePaymentRequest(paymentRequest:$paymentRequest) {
                destination
                preimageHash
              }
            }
          `, null, null, {
            paymentRequest
          }))
        ), self)
      },
      [sendPaymentSync]: async ({
        paymentRequest,
        amount
      }) => {
        dispatch(sender, paymentStatusUpdate(
          rescue(3, await graphql(schema, `
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
        ), self)
      }
    })[msg.type] || (() => (
      dispatch(sender, error(
        new Error('Action not found')
      ), self)
    )))(msg.payload)
  },
  'lnd'
)
