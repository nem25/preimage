import React from 'react'
import Remarkable from 'remarkable'
import { Plugin as Embed } from 'remarkable-embed'

const youtubeExtension = (code) => (
    code.match(/^[a-zA-Z0-9_-]{11}$/) ?
      `<figure>
        <iframe type="text/html" 
          src="https://www.youtube.com/embed/${code}" frameborder="0">
        </iframe>
      </figure>` : ''
)

class Markdown extends React.Component {
  componentWillUpdate (nextProps, nextState) {
    if (nextProps.options !== this.props.options) {
      const md = new Remarkable(nextProps.options)
      const embed = new Embed()
      embed.register('youtube', youtubeExtension)
      md.use(embed.hook)
      this.md = md
    }
  }

  content () {
    if (this.props.source) {
      return <span dangerouslySetInnerHTML={{
        __html: this.renderMarkdown(this.props.source)
      }} />
    }
    else {
      return React.Children.map(this.props.children, (child) => {
        if (typeof child === 'string') {
          return <span dangerouslySetInnerHTML={{
            __html: this.renderMarkdown(child)
          }} />
        }
        else {
          return child
        }
      })
    }
  }

  renderMarkdown (source) {
    if (!this.md) {
      const md = new Remarkable(this.props.options)
      const embed = new Embed()
      embed.register('youtube', youtubeExtension)
      md.use(embed.hook)
      this.md = md
    }
    return this.md.render(source)
  }

  render () {
    var Container = this.props.container
    return (
      <Container>
        {this.content()}
      </Container>
    )
  }
}

Markdown.defaultProps = {
  container: 'div',
  options: {}
}

export default Markdown
