import React from 'react'
import Layout from '../components/Layout'
import Detail from '../containers/Detail'
import withData from '../lib/withData'

export default withData(class extends React.Component {
  static getInitialProps ({ query: { bodyHash }}) {
    return { bodyHash }
  }

  render () {
    const { bodyHash } = this.props
    return (
      <Layout title='Content reading'>
        <Detail bodyHash={bodyHash} />
      </Layout>
    )
  }
})
