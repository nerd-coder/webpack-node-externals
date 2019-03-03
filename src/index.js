const ExternalModuleFactoryPlugin = require('webpack/lib/ExternalModuleFactoryPlugin')

const utils = require('./utils')

const scopedModuleRegex = new RegExp('@[a-zA-Z0-9][\\w-.]+/[a-zA-Z0-9][\\w-.]+([a-zA-Z0-9./]+)?', 'g')

function getModuleName (request, includeAbsolutePaths) {
  var req = request
  var delimiter = '/'

  if (includeAbsolutePaths) {
    req = req.replace(/^.*?\/node_modules\//, '')
  }
  // check if scoped module
  if (scopedModuleRegex.test(req)) {
    // reset regexp
    scopedModuleRegex.lastIndex = 0
    return req.split(delimiter, 2).join(delimiter)
  }
  return req.split(delimiter)[0]
}

module.exports = class NodeExternalsPlugin {
  constructor (options) {
    options = options || {}
    var whitelist = [].concat(options.whitelist || [])
    var binaryDirs = [].concat(options.binaryDirs || ['.bin'])
    var importType = options.importType || 'commonjs'
    var modulesDir = options.modulesDir || 'node_modules'
    var modulesFromFile = !!options.modulesFromFile
    var includeAbsolutePaths = !!options.includeAbsolutePaths

    // create the node modules list
    var nodeModules = modulesFromFile ?
      utils.readFromPackageJson(options.modulesFromFile) :
      utils.readDir(modulesDir).filter(x => !utils.contains(binaryDirs, x))

    // return an externals function
    this.externalFunc = function (context, request, callback) {
      var moduleName = getModuleName(request, includeAbsolutePaths)
      if (utils.contains(nodeModules, moduleName) && !utils.containsPattern(whitelist, request)) {
        if (typeof importType === 'function') {
          return callback(null, importType(request))
        }
        // mark this module as external
        // https://webpack.js.org/configuration/externals/
        return callback(null, importType + ' ' + request)
      }
      callback()
    }
  }

  apply (compiler) {
    // webpack 4+
    if (compiler.hooks) {
      compiler.hooks.compile.tap('compile', params => {
        new ExternalModuleFactoryPlugin(
          compiler.options.output.libraryTarget,
          [this.externalFunc]
        ).apply(params.normalModuleFactory)
      })
      // webpack < 4, remove this in next major version
    } else {
      compiler.plugin('compile', params => {
        params.normalModuleFactory.apply(
          new ExternalModuleFactoryPlugin(
            compiler.options.output.libraryTarget,
            [this.externalFunc]
          )
        )
      })
    }
  }
}
