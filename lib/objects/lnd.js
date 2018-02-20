const { getGraphQLExecutableSchema } = require('lnd-graphql')
const { graphql, subscribe } = require('graphql')
const gql = require('graphql-tag')
const { rescueQuery, rescueSubscription } = require('../graphql/util')

class Lnd {
  constructor (objects) {
    this.objects = objects
    this.executableSchema = getGraphQLExecutableSchema()
  }

  async createInvoice ({ preimage, amount, memo }) {
    const { schema } = await this.executableSchema
    return rescueQuery(await graphql(schema, `
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
  }

  async subscribeInvoices () {
    const { schema } = await this.executableSchema
    return rescueSubscription(await subscribe(schema, gql`
      subscription subscribeInvoices {
        subscribeInvoices {
          preimage
          preimageHash
          memo
          amount
        }
      } 
    `))
  }

  async decodePaymentRequest ({ paymentRequest }) {
    const { schema } = await this.executableSchema
    return rescueQuery(await graphql(schema, `
      query decodePaymentRequest($paymentRequest:String) {
        decodePaymentRequest(paymentRequest:$paymentRequest) {
          destination
          preimageHash
        }
      }
    `, null, null, {
      paymentRequest
    }))
  }

  async sendPaymentSync ({ paymentRequest, amount }) {
    const { schema } = await this.executableSchema
    return rescueQuery(await graphql(schema, `
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
  }
}

module.exports = Lnd
