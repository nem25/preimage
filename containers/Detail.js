import React from 'react'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import Detail from '../components/Detail'
import DetailOffer from '../components/DetailOffer'

class DetailContainer extends React.Component {
  render () {
    const { getContent, decryptData } = this.props
    if (decryptData && !decryptData.loading && decryptData.decryptData) {
      const body = decryptData.decryptData.data
      return <Detail body={body} />
    }
    if (getContent && !getContent.loading && getContent.getContent) {
      const { title, price, paymentRequest } = getContent.getContent
      return <DetailOffer title={title} price={price} paymentRequest={paymentRequest} />
    }
    return null
  }
}

const getContent = gql`
  query getContent($bodyHash:String!) {
    getContent(bodyHash:$bodyHash) {
      title
      price
      bodyHash,
      paymentRequest
      preimageHash
      encryptedData
    }
  }
`

const decryptionKey = gql`
  subscription decryptionKey($keyHash:String!) {
    decryptionKey(keyHash:$keyHash) {
      key
    }
  }
`

const decryptData = gql`
  query decryptData($key:String!,$encryptedData:String!) {
    decryptData(key:$key,encryptedData:$encryptedData) {
      data
    }
  }
`

export default compose(
  graphql(getContent, {
    name: 'getContent',
    skip: ({ bodyHash }) => (
      !bodyHash
    ),
    options: ({ bodyHash }) => ({
      variables: {
        bodyHash
      }
    })
  }),
  graphql(decryptionKey, {
    name: 'decryptionKey',
    skip: ({ getContent }) => (
      !getContent || getContent.loading || !getContent.getContent
    ),
    options: ({ getContent }) => ({
      variables: {
        keyHash: getContent.getContent.preimageHash 
      }
    })
  }),
  graphql(decryptData, {
    name: 'decryptData',
    skip: ({ decryptionKey }) => (
      !decryptionKey || decryptionKey.loading || !decryptionKey.decryptionKey
    ),
    options: ({ getContent, decryptionKey }) => ({
      variables: {
        encryptedData: getContent.getContent.encryptedData,
        key: decryptionKey.decryptionKey.key  
      }
    })
  })
)(DetailContainer)