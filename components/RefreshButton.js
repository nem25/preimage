import React from 'react'

export default ({ refreshing, onClick }) => (
  <div>
    <style jsx global>{`
      @-webkit-keyframes rotate {
        0% {
          -webkit-transform: rotate(0deg);
          transform: rotate(0deg);
        }
        100% {
          -webkit-transform: rotate(360deg);
          transform: rotate(360deg);
        }
      }
      @keyframes rotate {
        0% {
          -webkit-transform: rotate(0deg);
          transform: rotate(0deg);
        }
        100% {
          -webkit-transform: rotate(360deg);
          transform: rotate(360deg);
        }
      }
      .refreshing {
        -webkit-animation: rotate 2s infinite linear;
        animation: rotate 2s infinite linear;
      }
    `}</style>
    <style jsx>{`
      button {
        display: block;
        padding: 0 10px;
        line-height: 30px;
        background: transparent;
        color: #666;
        border: none;
        font-size: 13px;
        min-height: 40px;
        cursor: pointer;
      }
      button:focus {
        outline: none;
      }
      .refresh {
        width: 32px;
        background-image: url(/static/img/refresh.png);
        background-position: 4px 7px;
        background-size: 26px;
        background-repeat: no-repeat;
      }
      @media (max-width: 437px) {
        .refresh {
          display: none;
        }
      }
    `}</style>
    <button className={`refresh ${refreshing ? 'refreshing' : ''}`}
      onClick={onClick} />
  </div>
)
