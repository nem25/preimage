import dynamic from 'next/dynamic'
import React from 'react'
import Navigation from './Navigation'
import IdentifyButton from '../components/IdentifyButton'
import SubmitButton from '../components/SubmitButton'
import PayoutButton from '../containers/PayoutButton'

export default ({ children, identity }) => (
  <div>
    <style jsx>{`
      div {
        max-width: 612px;
        margin: 0 auto;
        height: 100%;
      }
    `}</style>
    <Navigation>
      <PayoutButton identity={identity} />
      <IdentifyButton identity={identity} />
      <SubmitButton />
    </Navigation>
    { children }
  </div>
)
