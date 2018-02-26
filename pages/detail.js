import React from 'react'
import Layout from '../components/Layout'
import Detail from '../components/Detail'

export default class extends React.Component {
  static getInitialProps ({ query: { content }}) {
    return { content }
  }

  render () {
    return (
      <Layout title='Content reading'>
        <Detail {...this.props.content} />
      </Layout>
    )
  }
}
