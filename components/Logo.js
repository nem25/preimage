import React from 'react'
import Router from 'next/router'

const reverseChildNodes = (node) => {
  const { parentNode, nextSibling } = node
  const fragment = node.ownerDocument.createDocumentFragment()
  parentNode.removeChild(node)
  while (node.lastChild) fragment.appendChild(node.lastChild)
  node.appendChild(fragment)
  parentNode.insertBefore(node, nextSibling)
  return node
}

const caesarShift = (str, amount) => {
  if (amount < 0)
    return caesarShift(str, amount + 26)
  let output = ''
  for (var i = 0; i < str.length; i++) {
    let c = str[i]
    if (c.match(/[a-z]/)) {
      const code = str.charCodeAt(i)
      if ((code >= 97) && (code <= 122))
        c = String.fromCharCode(((code - 97 + amount) % 26) + 97)
    }
    output += c
  }
  return output
}

const timeout = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const makeCancelableChain = (...chain) => {
  let hasCanceled = false
  const cancelPromise = new Promise((resolve, reject) => {
    ;(async () => {
      let val
      while (!hasCanceled && chain.length) {
        await chain.shift()(val).then((_val) => val = _val)
      }
      resolve(val)
    })()
  })
  cancelPromise.cancel = () => {
    hasCanceled = true
  }
  return cancelPromise
}

export default class Logo extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      decodedText: '',
      encodedText: '',
      encoding: false
    }
    this.bindRouteChangeStart()
  } 

  bindRouteChangeStart () {
    Router.onRouteChangeStart = (url) => {
      if (url !== Router.route) {
        this.cycleEncodeDecodeEffect()
      }
    }
  }

  async reencodeText (decodedText) {
    return await new Promise((resolve) => this.setState({
      encodedText: decodedText.split('')
        .map((l) => caesarShift(l, 6 + Math.round(Math.random() * 13)))
        .join('')
    }, resolve))
  }

  logoOnClick = () => { 
    Router.push('/')
  }

  componentWillUnmount () {
    if (this.effectPromise) {
      this.cyclingEffect = false
      this.effectPromise.cancel()
    }
  }

  async cycleEncodeDecodeEffect () {
    this.cyclingEffect = true
    while (this.cyclingEffect) {
      await this.startEncodeDecodeEffect()
      await timeout(100)
    }
  }

  startEncodeDecodeEffect () {
    if (this.state.encoding) return Promise.resolve() 
    return this.effectPromise = makeCancelableChain(
      () => Promise.resolve(this.props.text),
      (text) => new Promise((resolve) => this.setState({
        encoding: true,
        decodedText: text
      }, resolve)).then(() => text),
      (text) => this.reencodeText(text),
      () => this.encodeEffect(),
      () => this.decodeEffect(),
      () => new Promise((resolve) => this.setState({
        encoding: false
      }, resolve))
    )
  }

  async transcodeEffect (origin, destination) {
    const { container } = this.refs
    if (!container) return
    reverseChildNodes(container)
    const { children } = container
    children[1].innerHTML = origin

    for (let i = 0, l = destination.length; i < l; i++) {
      const prefix = destination.substring(0, i)
      children[1].innerHTML = children[1].innerHTML.substring(1)
      for (let n = 0, s; s !== destination[i];) {
        let s = caesarShift(origin[i], ++n)
        children[0].innerHTML = prefix + s
        await timeout(1)
      }
    }
  }

  async decodeEffect () {
    const { encodedText, decodedText } = this.state 
    return this.transcodeEffect(encodedText, decodedText) 
  }

  async encodeEffect () {
    const { encodedText, decodedText } = this.state 
    return this.transcodeEffect(decodedText, encodedText) 
  }

  render () {
    const { text } = this.props
    return (
      <div>
        <style jsx>{`
          span:nth-child(1) {
            padding-left: 18px;
          }
          span {
            color: #000;
            height: 40px;
            line-height: 40px;
            text-transform: uppercase;
            letter-spacing: 3px;
            font-size: 16px;
          }
          .encoded {
            padding-left: 0;
            color: #333;
          }
          .logo {
            cursor: pointer;
            user-select: none;
            background-image: url(/static/img/bolt.png);
            background-position: 9px 9px;
            background-size: 21px;
            background-repeat: no-repeat;
            text-indent: 13px;
          }
          @media (max-width: 387px) {
            span {
              font-size: 13px;
            }
          }
        `}</style>
        <div ref='container' className='logo' onClick={this.logoOnClick}>
          <span ref='decoded'>{text}</span>
          <span ref='encoded' className='encoded' />
        </div>
      </div>
    )
  }
}
