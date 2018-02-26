import React from 'react'

export default () => (
  <form>
    <style jsx>{`
      form {
        font-family: Montserrat;
        display: flex;
        flex-flow: column;
        height: calc(100% - 40px);
      }
      form > input, 
      form > textarea, 
      form > button {
        display block;
      }
      input, textarea {
        border: 1px solid #464646;
        border-radius: 2px;
        background: #000;
        color: #666;
        font-size: 14px;
        width: calc(100% - 52px);
        line-height: 18px;
        margin: 0 16px 0;
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
        min-height: calc(100% - 328px);
      }
      label {
        color: #666;
        margin: 16px;
        display: block;
        font-size: 14px;
        text-indent: 2px;
      }
      input:invalid {
        border-color: red !important;
      }
      input::placeholder {
        position: relative;
        left: calc(-100% + 22px);
      }
      input[type='number']::-webkit-outer-spin-button,
      input[type='number']::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input[type='number'] {
        -moz-appearance: textfield;
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
        border: 1px solid #666;
        border-radius: 2px;
        color: #666;
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
    <input style={{order:2, textAlign: 'right'}} 
      type='number' placeholder='BTC'
      step='0.00000001' max='21000000' />
    <label style={{order:1}}>Price</label>
    <input style={{order:4}} type='text'
      pattern='^[a-f0-9]{66}$' />
    <label style={{order:3}}>Payout public key</label>
    <textarea style={{order:6}} />
    <label style={{order:5}}>Markdown</label>
    <button style={{order:7}}>Submit</button>
  </form>
)
