import crypto from 'crypto'
import React from 'react'
import Router from 'next/router'
import bip39 from 'english-checksum-bip39'

export default class IdentifyButton extends React.Component {
  constructor (props) {
    super(props)
    const { identity } = props
    this.state = {
      identity 
    }
  }

  generateAlias = (pubKey) => {
    const hash = pubKey.length === 66 ?
      crypto.createHash('sha256').update(
        new Buffer(pubKey, 'hex')).digest('hex') : ''
    return hash ?
      bip39.entropyToMnemonic(
        hash.substring(0, 4) +
        hash.substring(hash.length-4, hash.length)
      ).toString().split(' ').join('-') : ''
  }

  onClick = async () => {
    Router.push('/identify')
  }

  render () {
    const { identity } = this.state
    return (
      <div>
        <style jsx>{`
          button {
            display: block;
            padding: 0 10px;
            line-height: 30px;
            background: transparent;
            border: none;
            color: #000;
            font-size: 13px;
            min-height: 32px;
            margin-top: 4px;
            cursor: pointer;
          }
          button:focus {
            outline: none;
          }
          .identify {
            border-right: 1px dotted #666;
            border-left: 1px dotted #666;
          }
          @media (max-width: 421px) {
            button {
              font-size: 12px;
            }
          }
        `}</style>
        <button className='identify' onClick={this.onClick}>
          { identity ? this.generateAlias(identity) : 'Identify' }
        </button>
      </div>
    )
  }
}
