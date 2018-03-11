import React from 'react'
import RefreshButton from '../components/RefreshButton'
import PayoutButton from '../components/PayoutButton'

export default ({ amount, refreshing, onClick }) => (
  <div>
    <style jsx>{`
      div {
        display: flex;
        flex-direction: row;
      }
    `}</style>
    <RefreshButton refreshing={refreshing} onClick={onClick} />
    <PayoutButton amount={amount} />
  </div>
)
