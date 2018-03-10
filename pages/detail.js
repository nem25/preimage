import cookie from 'cookie'
import React from 'react'
import Layout from '../components/Layout'
import Detail from '../containers/Detail'
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
    const { bodyHash, identity } = this.props
    return (
      <Layout identity={identity}>
        <Detail bodyHash={bodyHash} identity={identity} />
      </Layout>
    )
  }
})
