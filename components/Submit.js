import React from 'react'
import Router from 'next/router'
import ToggleButton from 'react-toggle-button'

export default class Submit extends React.Component {
  constructor (props) {
    super(props)
    const { identity } = this.props
    this.state = {
      title: '',
      price: '',
      owner: identity || '',
      body: '',
      tags: '',
      sponsoring: false
    }
  }

  onSubmit = (e) => {
    if (!this.checkValidity()) {
      e.preventDefault()
      return
    }
    const { router } = Router
    router.events.emit('routeChangeStart', '/new')
  }

  onFieldChange = (field) => (e) => {
    e.target.setCustomValidity('')
    this.setState({
      [field]: e.target.value
    })
    if (!e.target.value) {
      e.target.setCustomValidity('required')
    }
    const pattern = e.target.getAttribute('pattern')
    if (pattern && !e.target.value.match(new RegExp(pattern, 'i'))) {
      e.target.setCustomValidity('invalid')
    }
  }

  onSponsoringToggle = (value) => {
    this.setState({
      sponsoring: !value
    })
  }

  checkValidity = () => {
    const { title, price, owner, body, tags } = this.refs
    const fields = [title, price, owner, body, tags]
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
      <form id='new' action='/new' method='post' onSubmit={this.onSubmit}>
        <style jsx>{`
          form {
            height: calc(100% - 56px);
            min-width: 320px;
            padding: 16px 0 0;
          }
          div {
            margin: 0 auto;
            max-width: 580px;
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
          .expand {
            height: calc(100% - 116px - (88px * 3));
            min-height: 250px;
          }
          .final {
            padding-top: 6px;
          }
          input, textarea, section {
            margin: 0 16px 0;
          }
          input, textarea {
            border: 1px solid #464646;
            border-radius: 2px;
            background: #000;
            color: #c3c3c3;
            font-size: 14px;
            width: calc(100% - 52px);
            line-height: 18px;
            padding: 10px;
            max-width: 560px;
          }
          input:focus, textarea:focus {
            outline: none;
          }
          input {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            min-height: 18px;
          }
          textarea {
            height: calc(100% - 22px);
            min-height: 182px;
          }
          label {
            color: #c3c3c3;
            margin: 16px;
            display: block;
            font-size: 14px;
            text-indent: 2px;
          }
          input:invalid,
          textarea:invalid {
            border-color: red !important;
          }
          input[type='number']::-webkit-outer-spin-button,
          input[type='number']::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type='number'] {
            -moz-appearance: textfield;
            text-align: right;
          }
          input:focus,
          textarea:focus,
          input:focus + label,
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
          <span style={{width:'62%'}}>
            <input ref='title' name='title' style={{order:2}}
              type='text' pattern='^.{1,140}$' value={this.state.title}
              onChange={this.onFieldChange('title')} />
            <label style={{order:1}}>Title (140 chars max)</label>
          </span>
          <span style={{width:'38%'}}>
            <input ref='price' name='price' style={{order:2}}
              type='number' step='1' max='2100000000000000' value={this.state.price}
              onChange={this.onFieldChange('price')} />
            <label style={{order:1}}>Price (SATs)</label>
          </span>
        </div>
        <div>
          <span>
            <input ref='owner' name='owner' style={{order:2}} type='text'
              pattern='^[a-f0-9]{66}$' value={this.state.owner}
              onChange={this.onFieldChange('owner')} />
            <label style={{order:1}}>Payout public key (66 chars hex)</label>
          </span>
        </div>
        <div className='expand'>
          <span>
            <textarea ref='body' name='body' style={{order:2}} value={this.state.body}
              pattern='^[\s\S]{1,20000}$' onChange={this.onFieldChange('body')} />
            <label style={{order:1}}>Content (markdown format, 20kb max)</label>
          </span>
        </div>
        <div>
          <span style={{width:'calc(100% - 100px)'}}>
            <input ref='tags' name='tags' style={{order:2}} type='text'
              pattern='^( ?[^ ]+){1,3}$' value={this.state.tags}
              onChange={this.onFieldChange('tags')} />
            <label style={{order:1}}>Tags (3 words max)</label>
          </span>
          <span style={{width:'100px'}}>
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
                passThroughInputProps={{name: 'sponsoring'}}
                value={this.state.sponsoring}
                onToggle={this.onSponsoringToggle} />
            </section>
            <label style={{order:1}}>Sponsors</label>
          </span>
        </div>
        <div className='final'>
          <span>
            <button type='submit' form='new'>Submit</button>
          </span>
        </div>
      </form>
    )
  }
}
