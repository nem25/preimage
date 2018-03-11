# preimage-server

### Requirements

- Node v9 (or any other with support for `--harmony_async_iteration`)
- Mongodb (localhost:27017 or define `process.env.MONGODB_URI`)

## Installation

Just fork and clone this repository.

## Start development

```shell
$ npm run dev
```

## Start production (client side expects https, use nginx + let's encrypt or similar to serve)

```shell
  $ rm -rf node_modules/.cache/babel-loader .next # cache sucks
  $ HOST=<production-hostname> npm run build
  $ npm run start
```

### Notes

- Exposes graphql interface, you can play with it pointing your browser to `/graphiql`.
- Pull requests accepted.
- Needs a lot more documentation.
- Needs a lot more tests. 
