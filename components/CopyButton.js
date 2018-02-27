import React from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'

export default class CopyButton extends React.Component {
  state = {
    copied: false
  }

  onCopy = async () => {
    await this.setState({ copied: true })
    setTimeout(() => this.setState({ copied: false }), 10000)
  }

  render () {
    const { children, text } = this.props
    return (
      <CopyToClipboard text={text}
        onCopy={this.onCopy}>
        <button ref='button'>
          <style jsx>{`
            button {
              display: block;
              width: 200px;
              line-height: 40px;
              background: #000;
              border: 1px solid #666;
              border-radius: 2px;
              color: #666;
              margin: 20px auto;
              font-size: 14px;
              min-height: 45px; 
              -webkit-tap-highlight-color: white;
            }
            button:active{
              background-color: #eee;
              color: #000;
            }
            button:focus {
              outline: none;
            }
          `}</style>
          {this.state.copied ? 'Copied!' : children}
        </button>
      </CopyToClipboard>
    )
  }
}
