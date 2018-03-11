import React from 'react'
import Markdown from './Markdown'
import ToggleButton from 'react-toggle-button'

export default class extends React.Component {
  state = {
    saved: false
  }

  componentDidMount () {
    import('local-storage').then((ls) => {
      const { bodyHash } = this.props
      this.setState({
        saved: !!ls(bodyHash)
      })
    })
  }

  onSaveToggle = (value) => {
    const { bodyHash, body } = this.props
    import('local-storage').then((ls) => {
      this.setState({
        saved: !value
      }, () => {
        if (value) ls.remove(bodyHash)
        else ls(bodyHash, body)
      })
    })
  }

  render () {
    const { body } = this.props
    return (
      <div>
        <style jsx global>{`
          article {
            color: #ccc;
            min-width: 274px;
            line-height: 20px;
            padding: 0.83em 16px;
            font-size: 0.9em;
            overflow-y: hidden;
          }
          article h1,
          article h2,
          article h3,
          article h4,
          article h5,
          article h6,
          article h7,
          article h8 {
            color: #fff;
          }
          article a {
            color: #4c71e4;
            text-decoration: none;
          }
          article p,
          article blockquote,
          article table,
          article pre {
            margin: 15px 0;
          }
          article ul {
            padding-left: 30px;
          }
          article ol {
            padding-left: 30px;
          }
          article ol li ul:first-of-type {
            margin-top: 0px;
          }
          article hr {
            border: none;
            border-top: 1px solid #111;
          }
          article blockquote {
            border-left: 4px solid #111;
            padding: 0 15px;
            color: #666;
          }
          article blockquote > :first-child {
            margin-top: 0;
          }
          article blockquote > :last-child {
            margin-bottom: 0;
          }
          article table {
            border-collapse: collapse;
            border-spacing: 0;
            font-size: 100%;
            font: inherit;
          }
          article table th {
            font-weight: bold;
            border: 1px solid #111;
            padding: 6px 13px;
            color: #666;
          }
          article table td {
            border: 1px solid #111;
            padding: 6px 13px;
          }
          article table tr {
            border-top: 1px solid #ccc;
            background-color: #fff;
          }
          article img {
            max-width: 100%;
          }
          article code, article tt {
            margin: 0 2px;
            padding: 0 5px;
            white-space: pre;
            border: 1px solid #333;
            background-color: #111;
            border-radius: 3px;
            color: #666;
          }
          article pre > code {
            margin: 0;
            padding: 0;
            white-space: pre;
            border: none;
            background: transparent;
          }
          article pre {
            border: 1px solid #111;
            font-size: 14px;
            line-height: 19px;
            overflow: auto;
            padding: 10px 16px;
            border-radius: 3px;
            margin: 26px 0;
          }
          article pre code,
          article pre tt {
            background-color: transparent;
            border: none;
          }
          article sup,
          article sub,
          article a.footnote {
            font-size: 1.4ex;
            height: 0;
            line-height: 1;
            vertical-align: super;
            position: relative;
          }
          article sub {
            vertical-align: sub;
            top: -1px;
          }
          article figure {
            margin: 0;
            position: relative;
            width: 100%;
            height: 0;
            padding-bottom: 56.25%;
          }
          article figure iframe {
            position: absolute;
            width: 100%;
            height: 100%;
            left: 0;
            top: 0;
          }
        `}</style>
        <style jsx>{`
          span {
            display: inline-flex;
            flex-direction: row;
            width: 100%;
            align-items: right;
          }
          label {
            color: #c3c3c3;
            margin: 12px 0;
            display: block;
            font-size: 14px;
            text-indent: 2px;
          }
          section {
            margin-left: 16px;
          }
          .final {
            margin: 6px 0 26px;
            display: flex;
            justify-content: center;
          }
          button {
            width: 100px;
            line-height: 40px;
            background: #000;
            border: 1px solid #464646;
            border-radius: 2px;
            color: #c3c3c3;
            margin: 20px 0 20px 16px;
            font-size: 14px;
            min-height: 45px;
            -webkit-tap-highlight-color: white;
          }
          button:active,
          button:focus {
            outline: none;
            background-color: #eee;
            color: #000;
          }
        `}</style>
        <article>
          <Markdown source={body} />
        </article>
       <div className='final'>
          <span style={{width:'126px'}}>
            <section style={{order:2}}>
              <ToggleButton
                colors={{
                  inactiveThumb: { base: 'rgb(0,0,0)', hover: 'rgb(0,0,0)' },
                  activeThumb: { base: 'rgb(0,0,0)', hover: 'rgb(0,0,0)' }
                }}
                activeLabelStyle={{display:'none'}}
                inactiveLabelStyle={{display:'none'}}
                thumbStyle={{
                  width:'38px',
                  height: '38px',
                  boxShadow: 'unset'
                }}
                trackStyle={{height:'40px', width: '72px'}}
                containerStyle={{width: '72px'}}
                value={this.state.saved}
                onToggle={this.onSaveToggle} />
            </section>
            <label style={{order:1}}>
              { this.state.saved ? 'Saved' : 'Save' }
            </label>
          </span>
        </div>
      </div>
    )
  }
}
