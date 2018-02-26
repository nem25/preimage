import React from 'react'

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

export default class Logo extends React.Component {
  state = {
    decodedText: '',
    encodedText: '' 
  }

  componentDidMount () {
    this.startEncodeDecodeEffect()
  }

  async reencodeText (decodedText) {
    await this.setState({
      encodedText: decodedText.split('')
        .map((l) => caesarShift(l, 6 + Math.round(Math.random() * 13)))
        .join('')
    })
  }

  async startEncodeDecodeEffect () {
    const { text } = this.props
    await this.setState({
      decodedText: text
    })
    await this.reencodeText(text)
    await this.encodeEffect()
    await this.decodeEffect()
  }

  async transcodeEffect (origin, destination) {
    const { container } = this.refs
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
            padding-left: 16px;
          }
          span {
            color: #000;
            height: 40px;
            line-height: 40px;
            text-transform: uppercase;
            letter-spacing: 3px;
            font-size: 18px;
          }
          .encoded {
            padding-left: 0;
            color: #777;
          }
        `}</style>
        <div ref='container'>
          <span ref='decoded'>{text}</span>
          <span ref='encoded' className='encoded' />
        </div>
      </div>
    )
  }
}
