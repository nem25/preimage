import React from 'react'
import Link from 'next/link'
import CopyButton from '../components/CopyButton'

export default (props) => (
  <article>
    <style jsx>{`
      article {
        min-width: 274px;
        padding: 0.83em 16px;
      }
      h1 {
        text-align: center;
        font-size: 22px;
        color: #fff;
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
      a {
        display: block;
        width: 200px;
        background: #000;
        border: 1px solid #464646;
        border-radius: 2px;
        color: #c3c3c3;
        margin: 20px auto;
        font-size: 14px;
        min-height: 45px; 
        -webkit-tap-highlight-color: white;
        text-align: center;
        text-decoration: none;
        font-size: 14px;
        line-height: 45px;
      }
      .tags {
        border: none;
        margin: 0 auto;
        min-height: auto;
        line-height: normal;
      }
      a:active {
        background-color: #eee;
        color: #000;
      }
      a:focus {
        outline: none;
      }
    `}</style>
    <h1>{props.title}</h1>
    {props.tags && props.tags.length && (
      <h2>
        <Link href={`/@/${props.tags.join('/')}`}>
          <a className='tags'>@/{props.tags.join('/')}</a>
        </Link>
      </h2>
    )}
    <figure>
      <span>
        <img src={
          'https://chart.apis.google.com/chart?cht=qr&chs=256x256&chl=' +
          `lightning:${props.paymentRequest}`
        } />
      </span>
    </figure>
    <h2>{props.price} SAT</h2> 
    <CopyButton text={props.paymentRequest}>
      Copy payment request
    </CopyButton>
    <a href={`lightning:${props.paymentRequest}`}>Pay with local wallet</a>
    { process.env.LND_PEER &&
      <CopyButton text={process.env.LND_PEER}>
        Copy peer address
      </CopyButton> }
  </article>
)
