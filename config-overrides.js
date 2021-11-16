const path = require('path')

module.exports = {
  paths: function (paths, env) {
    paths.appIndexJs = path.resolve(__dirname, 'src/client')
    paths.appSrc = path.resolve(__dirname, 'src/client')
    return paths
  },
}
