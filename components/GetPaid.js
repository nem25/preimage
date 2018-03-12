import React from 'react'
import Router from 'next/router'

export default class GetPaid extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      paymentRequest: ''
    }
  }

  onSubmit = (e) => {
    if (!this.checkValidity()) {
      e.preventDefault()
      return
    }
    const { router } = Router
    router.events.emit('routeChangeStart', '/payout')
  }

  onTextAreaChange = (field) => (e) => {
    e.target.setCustomValidity('')
    this.setState({
      [field]: e.target.value
    })
    if (!e.target.value) {
      e.target.setCustomValidity('required')
    }
    const pattern = e.target.getAttribute('pattern')
    if (!e.target.value.match(new RegExp(pattern, 'i'))) {
      e.target.setCustomValidity('invalid')
    }
  }

  checkValidity = () => {
    const { paymentRequest } = this.refs
    const fields = [paymentRequest]
    let valid = true
    for (let f = 0, l = fields.length; f < l; f++) {
      if (!fields[f].validity.valid) {
        valid = false
        continue
      }
      if (!fields[f].value) {
        fields[f].setCustomValidity('required')
        valid = false
      }
    }
    return valid
  }

  render () {
    const { identity } = this.props
    return (
      <form id='payout' action='/payout' method='post' onSubmit={this.onSubmit}>
        <style jsx>{`
          form {
            height: calc(100% - 56px);
            min-width: 320px;
            padding: 16px 0 0;
          }
          div {
            min-height: 88px;
            display: flex;
            position: relative;
            top: 0;
          }
          span {
            display: inline-flex;
            flex-direction: column;
            width: 100%;
          }
          .final {
            padding-top: 6px;
          }
          textarea, section {
            margin: 0 16px 0;
          }
          textarea {
            border: 1px solid #464646;
            border-radius: 2px;
            background: #000;
            color: #c3c3c3;
            font-size: 14px;
            width: calc(100% - 52px);
            line-height: 18px;
            padding: 10px;
            max-width: 560px;
            min-height: 55px;
          }
          textarea:focus {
            outline: none;
          }
          textarea:invalid {
            border-color: red !important;
          }
          label {
            color: #c3c3c3;
            margin: 16px;
            display: block;
            font-size: 14px;
            text-indent: 2px;
          }
          textarea:focus,
          textarea:focus + label {
            border-color: #888;
            color: #888;
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
        <div>
          <span>
            <textarea ref='paymentRequest' name='paymentRequest' style={{order:2}}
              pattern='^(lightning:)?(ln(bc|tb|sb)1)[023456789acdefghjklmnpqrstuvwxyz]{1,2000}$'
              value={this.state.paymentRequest}
              onChange={this.onTextAreaChange('paymentRequest')} />
            <label style={{order:1}}>Payment request (no memo, 0 value)</label>
          </span>
        </div>
        <div className='final'>
          <span>
            <button type='submit' form='payout'>Get paid</button>
          </span>
        </div>
      </form>
    )
  }
}
