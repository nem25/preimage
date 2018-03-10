import React from 'react'
import Router from 'next/router'

export default class PayoutButton extends React.Component {
  constructor (props) {
    super(props)
  }

  onClick = async () => {
    const { amount } = this.props
    if (amount !== 0) {
      Router.push('/get-paid')
    }
  }

  render () {
    const { amount } = this.props
    return (
      <div>
        <style jsx>{`
          button {
            display: block;
            padding: 0 10px;
            line-height: 30px;
            background: transparent;
            color: #666;
            border: none;
            font-size: 13px;
            min-height: 32px;
            margin-top: 4px;
            cursor: pointer;
          }
          button:focus {
            outline: none;
          }
          @media (max-width: 387px) {
            button {
              font-size: 12px;
            }
          }
        `}</style>
        <button className='get-paid' onClick={this.onClick}>
          { amount !== null ? `${amount} SAT` : 'Get paid' }
        </button>
      </div>
    )
  }
}
