import React from 'react'
import Router from 'next/router'

export default class SubmitButton extends React.Component {
  onClick = () => {
    Router.push('/submit')
  }

  render () {
    return (
      <div>
        <style jsx>{`
          button {
            display: block;
            padding: 0 10px;
            line-height: 30px;
            background: transparent;
            color: #666;
            border: none;
            font-size: 13px;
            min-height: 32px;
            margin-top: 4px;
            cursor: pointer;
          }
          button:focus {
            outline: none;
          }
          .write {
            width: 38px;
            background-image: url(/static/img/write.png);
            background-position: 12px 8px;
            background-size: 18px;
            background-repeat: no-repeat;
          }
          @media (max-width: 421px) {
            .write {
              width: 32px;
              background-position: 12px 8px;
              background-size: 16px;
            }
          }
        `}</style>
        <button className='write' onClick={this.onClick} />
      </div>
    )
  }
}
