import cookie from 'cookie'
import React from 'react'
import Layout from '../components/Layout'
import Entries from '../containers/Entries'
import withData from '../lib/withData'

const fetchIdentity = (source) => (
  cookie.parse(source || '').identity || ''
)

export default withData(class extends React.Component {
  static getInitialProps ({ req, query: { tags }}) {
    return {
      tags,
      identity: fetchIdentity(process.browser ? document.cookie : req.headers.cookie)
    }
  }

  render () {
    const { identity, tags } = this.props
    return (
      <Layout identity={identity} >
        <Entries tags={tags} />
      </Layout>
    )
  }
})
