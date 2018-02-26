import Document, { Head, Main, NextScript } from 'next/document'
import flush from 'styled-jsx/server'

export default class MyDocument extends Document {
  static getInitialProps({ renderPage }) {
    const { html, head, errorHtml, chunks } = renderPage()
    const styles = flush()
    return { html, head, errorHtml, chunks, styles }
  }

  render() {
    return (
      <html>
        <meta name='viewport' content='user-scalable=no, width=device-width' />
        <Head>
          <style>{`
            * {
              font-family: Inconsolata, monospace;
            }
            html, body {
              height: 100%;
            }
            body {
              margin: 0;
              background: #000;
            }
            #__next {
              height: 100%;
            }
            button {
              user-select: none;
            }
            ::-moz-selection {
              color: #000;
              background: #ccc;
            }
            ::selection {
              color: #000;
              background: #ccc;
            }
          `}</style>
          <link 
            href='https://fonts.googleapis.com/css?family=Inconsolata'
            rel='stylesheet' />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
