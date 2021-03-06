import React from 'react'
import Router from 'next/router'
import Link from 'next/link'

export default class Entries extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    const { contents } = this.props
    return (
      <div>
        <style jsx>{`
          div {
            height: calc(100% - 56px);
            min-width: 320px;
          }
          ul {
            padding-left: 0px;
            margin: 0;
            width: 100%;
          }
          li {
            min-height: 48px;
            padding: 10px 0;
            display: flex;
            position: relative;
            top: 0;
            border-bottom: 1px solid #333;
            color: #eee;
          }
          li:hover {
            background: linear-gradient(to right, #ccc, #fff, #ccc);
            color: #000;
            cursor: pointer;
          }
          li:first-child {
            border-top: 1px solid #333;
          }
          li:last-child {
            border: none;
          }
          a {
            width: 100%;
            color: inherit;
            text-decoration: none;
            -webkit-tap-highlight-color: white;
          }
          summary {
            margin: 0 auto;
            max-width: 612px;
            display: flex;
          }
          span {
            display: inline-flex;
            flex-direction: column;
            width: 100%;
            justify-content: center;
            color: inherit;
          }
          span:first-child {
            border-right: 1px solid #333;
          }
          .price p {
            width: calc(100% - 20px);
            margin: 0 auto;
            line-height: 22px;
            text-align: center;
            color: inherit;
          }
          .title p {
            padding-left: 20px;
            word-wrap: break-word;
            width: calc(100% - 20px);
            color: inherit;
          }
          button {
            width: 100px;
            line-height: 40px;
            background: #000;
            border: 1px solid #666;
            border-radius: 2px;
            color: #666;
            margin: 20px 0 20px 16px;
            font-size: 14px;
            min-height: 45px; 
            -webkit-tap-highlight-color: white;
          }
          button:active,
          button:focus {
            outline: none;
            background-color: #eee;
            color: #000;
          }
        `}</style>
        <ul>
          { contents.map((content, n) => ( 
            <li key={n}>
              <Link href={`/${content.bodyHash}`}>
                <a>
                  <summary>
                    <span className='price' style={{width:'68px'}}>
                      <p>{content.price}</p>
                      <p>SAT</p>
                    </span>
                    <span className='title' style={{width:'calc(100% - 68px)'}}>
                      <p>{content.title}</p>
                    </span>
                  </summary>
                </a>
              </Link>
            </li> 
          )) }
        </ul>
      </div>
    )
  }
}
