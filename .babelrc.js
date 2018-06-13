const env = {
  VERSION: require('./package').version
}

module.exports = {
  presets: ['next/babel'],
  plugins: [['transform-define', env]]
}
