import React from 'react'
import Markdown from 'react-remarkable'

export default (props) => (
  <div>
    <style jsx global>{`
      article {
        color: #ccc;
        min-width: 274px;
        line-height: 20px;
        margin: 0 24px 0;
        font-size: 0.9em;
      }
      article h1,
      article h2,
      article h3,
      article h4,
      article h5,
      article h6,
      article h7,
      article h8 {
        color: #fff;
      }
      article a {
        color: #4c71e4;
        text-decoration: none;
      }
      article p,
      article blockquote,
      article table,
      article pre {
        margin: 15px 0;
      }
      article ul {
        padding-left: 30px;
      }
      article ol {
        padding-left: 30px;
      }
      article ol li ul:first-of-type {
        margin-top: 0px;
      }
      article hr {
        border: none;
        border-top: 1px solid #111;
      }
      article blockquote {
        border-left: 4px solid #111;
        padding: 0 15px;
        color: #666;
      }
      article blockquote > :first-child {
        margin-top: 0;
      }
      article blockquote > :last-child {
        margin-bottom: 0;
      }
      article table {
        border-collapse: collapse;
        border-spacing: 0;
        font-size: 100%;
        font: inherit;
      }
      article table th {
        font-weight: bold;
        border: 1px solid #111;
        padding: 6px 13px;
        color: #666;
      }
      article table td {
        border: 1px solid #111;
        padding: 6px 13px;
      }
      article table tr {
        border-top: 1px solid #ccc;
        background-color: #fff;
      }
      article img {
        max-width: 100%;
      }
      article code, article tt {
        margin: 0 2px;
        padding: 0 5px;
        white-space: pre;
        border: 1px solid #333;
        background-color: #111;
        border-radius: 3px;
        color: #666;
      }
      article pre > code {
        margin: 0;
        padding: 0;
        white-space: pre;
        border: none;
        background: transparent;
      }
      article pre {
        border: 1px solid #111;
        font-size: 14px;
        line-height: 19px;
        overflow: auto;
        padding: 10px 16px;
        border-radius: 3px;
        margin: 26px 0;
      }
      article pre code,
      article pre tt {
        background-color: transparent;
        border: none;
      }
      article sup,
      article sub,
      article a.footnote {
        font-size: 1.4ex;
        height: 0;
        line-height: 1;
        vertical-align: super;
        position: relative;
      }
      article sub {
        vertical-align: sub;
        top: -1px;
      }
    `}</style>
    <article>
      <Markdown source={props.body} />
    </article>
  </div>
)
