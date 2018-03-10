import React from 'react'
import Logo from './Logo'

export default ({ children }) => (
  <div>
    <style jsx>{`
      div {
        height: 40px;
        background-color: #fff;
      }
      header {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 40px;
        z-index: -1;
        background-color: #fff;
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
