import { ApolloClient } from 'apollo-client'
import { ApolloLink, split, from } from 'apollo-link'
import { setContext } from 'apollo-link-context'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { onError } from 'apollo-link-error'
import { getMainDefinition } from 'apollo-utilities'
import WebSocket from 'isomorphic-ws'
import fetch from 'isomorphic-unfetch'

const dev = process.env.NODE_ENV !== 'production'
const host = process.env.HOST || 'localhost:3000'

let apolloClient = null

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
  global.fetch = fetch
}

const create = (initialState) => {
  const errLink = onError(({ networkError, graphQLErrors }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ),
      );
    }
    if (networkError) console.log(`[Network error]: ${networkError}`);
  })

  const httpLink = new HttpLink({
    uri: process.env.GRAPHQL_HTTP 
  })

  const wsLink = new WebSocketLink({
    uri: process.env.GRAPHQL_WS,
    options: { reconnect: true },
    webSocketImpl: WebSocket
  })

  return new ApolloClient({
    connectToDevTools: process.browser,
    ssrMode: !process.browser,
    link: from([
      errLink,
      split(
        ({ query }) => {
          const { kind, operation } = getMainDefinition(query)
          return kind === 'OperationDefinition' && operation === 'subscription'
        },
        wsLink,
        httpLink
      )
    ]),
    cache: new InMemoryCache().restore(initialState || {})
  })
}

const initApollo = (initialState) => {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!process.browser) {
    return create(initialState)
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState)
  }

  return apolloClient
}

export default initApollo
