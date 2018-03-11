import React from 'react'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import PayoutControls from '../components/PayoutControls'
import PayoutButton from '../components/PayoutButton'

class PayoutButtonContainer extends React.Component {
  state = {
    refreshing: false
  }

  onRefreshClick = async () => {
    this.setState({ refreshing: true })
    const { getPayoutAmount } = this.props
    await getPayoutAmount.refetch()
    this.setState({ refreshing: false })
  }

  render () {
    const { getPayoutAmount } = this.props
    if (getPayoutAmount && !getPayoutAmount.loading && getPayoutAmount.getPayoutAmount) {
      const { amount } = getPayoutAmount.getPayoutAmount
      return <PayoutControls amount={amount}
        refreshing={this.state.refreshing} onClick={this.onRefreshClick} />
    }
    return <PayoutButton amount={null} />
  }
}

const getPayoutAmount = gql`
  query getPayoutAmount($identity:PubKeyString!) {
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
