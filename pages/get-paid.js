import cookie from 'cookie'
import React from 'react'
import Layout from '../components/Layout'
import GetPaid from '../components/GetPaid'
import withData from '../lib/withData'

const fetchIdentity = (source) => (
  cookie.parse(source || '').identity || ''
)

export default withData(class extends React.Component {
  static getInitialProps ({ req, query: { bodyHash }}) {
    return {
      bodyHash,
      identity: fetchIdentity(process.browser ? document.cookie : req.headers.cookie)
    }
  }

  render () {
    const { identity } = this.props
    return (
      <Layout identity={identity} >
        <GetPaid />
      </Layout>
    )
  }
})
