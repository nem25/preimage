import React from 'react'
import Navigation from './Navigation'

export default ({ children }) => (
  <div>
    <style jsx>{`
      div {
        max-width: 612px;
        margin: 0 auto;
        height: 100%;
      }
    `}</style>
    <Navigation />
    { children }
  </div>
)
