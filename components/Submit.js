import React from 'react'

export default (props) => (
  <form id='new' action='/new' method='post'>
    <style jsx>{`
      form {
        height: calc(100% - 40px);
        min-width: 320px;
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
      .expand {
        height: calc(100% - 94px - (88px * 3));
        min-height: 275px;
      }
      .final {
        padding-top: 6px;
      }
      input, textarea {
        border: 1px solid #464646;
        border-radius: 2px;
        background: #000;
        color: #c3c3c3;
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
        height: calc(100% - 22px);
        min-height: 206px;
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
    <div>
      <span style={{width:'62%'}}>
        <input name='title' style={{order:2}} type='text' pattern='^.{1,140}$' />
        <label style={{order:1}}>Title (140 chars max)</label>
      </span>
      <span style={{width:'38%'}}>
        <input name='price' style={{order:2}}
          type='number' step='1' max='2100000000000000' />
        <label style={{order:1}}>Price (sats)</label>
      </span>
    </div>
    <div>
      <span>
        <input name='owner' style={{order:2}} type='text'
          pattern='^[a-f0-9]{66}$' />
        <label style={{order:1}}>Payout public key (66 chars hex)</label>
      </span>
    </div>
    <div className='expand'>
      <span>
        <textarea name='body' style={{order:2}} />
        <label style={{order:1}}>Content (markdown format, 20kb max)</label>
      </span>
    </div>
    <div>
      <span>
        <input name='tags' style={{order:2}} type='text'
          pattern='^( ?[^ ]+){1,3}$' />
        <label style={{order:1}}>Tags (space separated words, 3 max)</label>
      </span>
    </div>
    <div className='final'>
      <span>
        <button type='submit' form='new'>Submit</button>
      </span>
    </div>
  </form>
)
