import dynamic from 'next/dynamic'
import cookie from 'cookie'
import React from 'react'
import Layout from '../components/Layout'
import withData from '../lib/withData'

const Detail = dynamic({
  modules: () => ({
    ls: import('local-storage'),
    Detail: import('../components/Detail'),
    DetailContainer: import('../containers/Detail')
  }),
  render: ({ bodyHash, identity }, { ls, Detail, DetailContainer }) => {
    const body = ls(bodyHash)
    if (body) {
      return <Detail bodyHash={bodyHash} body={body} />
    }
    return <DetailContainer bodyHash={bodyHash} identity={identity} />
  },
  ssr: false
})

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
