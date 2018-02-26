import React from 'react'
import Logo from './Logo'

export default ({ children, title }) => (
  <div>
    <style jsx>{`
      div {
        height: 40px;
        background-color: #eee;
      }
      header {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 40px;
        z-index: -1;
        background-color: #eee;
      }
      span {
        line-height: 40px;
        margin-right: 16px;
        font-size: 14px;
        float: right;
      }
    `}</style>
    <header />
    <span>{title}</span>
    <Logo text='preimage' /> 
    { children }
  </div>
)
