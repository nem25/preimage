import React from 'react'
import QRCode from 'qrcode.react'
import CopyButton from '../components/CopyButton'

export default (props) => (
  <div>
  　<style jsx>{`
      div {
        height: calc(100% - 40px);
        min-width: 320px;
        margin: 0 16px 0;
      }
      h1 {
        color: #ccc;
        text-align: center;
        font-size: 22px;
      }
      h2 {
        font-style: none;
        font-size: 22px;
        color: #00ff88;
        text-align center;
      }
      figure {
        display: block;
        width: 256px;
        height: 256px;
        margin: 40px auto;
        text-align: center;
        background: url(/static/img/loading.gif);
        background-size: 256px;
        background-repeat: no-repeat;
      } 
      figure:before {
        content: 'Loading QR';
        color: #fff;
        line-height: 256px;
      }
      figure span {
        position: relative;
        top: -256px;
      }
    `}</style>
    <h1>
      {props.title}
    </h1>
    <figure>
      <span>
        <QRCode value={`lightning:${props.paymentRequest}`} size={256} />
      </span>
    </figure>
    <h2>{props.price} SAT</h2> 
    <CopyButton text={props.paymentRequest}>
      Copy payment request
    </CopyButton>
  </div>
)
