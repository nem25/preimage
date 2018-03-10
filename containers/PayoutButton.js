import React from 'react'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import PayoutButton from '../components/PayoutButton'

class PayoutButtonContainer extends React.Component {
  render () {
    const { getPayoutAmount } = this.props
    if (getPayoutAmount && !getPayoutAmount.loading && getPayoutAmount.getPayoutAmount) {
      const { amount } = getPayoutAmount.getPayoutAmount
      return <PayoutButton amount={amount} />
    }
    return <PayoutButton amount={null} />
  }
}

const getPayoutAmount = gql`
  query getPayoutAmount($identity:String!) {
    getPayoutAmount(identity:$identity) {
      amount
    }
  }
`

export default graphql(getPayoutAmount, {
  name: 'getPayoutAmount',
  skip: ({ identity }) => (
    !identity
  ),
  options: ({ identity }) => ({
    variables: {
      identity
    }
  })
})(PayoutButtonContainer)
