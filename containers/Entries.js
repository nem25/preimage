import React from 'react'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import Entries from '../components/Entries'

class EntriesContainer extends React.Component {
  render () {
    const { getContents } = this.props
    if (getContents && !getContents.loading && getContents.getContents) {
      const contents = getContents.getContents
      return <Entries contents={contents} />
    }
    return null
  }
}

const getContents = gql`
  query getContents {
    getContents {
      title
      price
      purchased
      bodyHash
    }
  }
`

export default graphql(getContents, {
  name: 'getContents'
})(EntriesContainer)
