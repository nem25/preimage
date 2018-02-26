import React from 'react'
import Navigation from './Navigation'

export default ({ children, title }) => (
  <div>
    <style jsx>{`
      div {
        max-width: 612px;
        margin: 0 auto;
        height: 100%;
      }
    `}</style>
    <Navigation title={title} />
    { children }
  </div>
)
