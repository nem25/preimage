import React from 'react'
import Logo from './Logo'

export default ({ children }) => (
  <div>
    <style jsx>{`
      div {
        max-width: 612px;
        margin: 0 auto;
        height: 40px;
      }
      header {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 40px;
        z-index: -1;
        background: linear-gradient(to right, #ccc, #fff, #ccc);
      }
      span {
        line-height: 40px;
        margin-right: 12px;
        font-size: 14px;
        float: right;
        display: inline-flex;
      }
    `}</style>
    <header />
    <span>
      { children } 
    </span>
    <Logo text='preimage' /> 
  </div>
)
