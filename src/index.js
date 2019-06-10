const ExternalModuleFactoryPlugin = require('webpack/lib/ExternalModuleFactoryPlugin')

const utils = require('./utils')

const scopedModuleRegex = new RegExp('@[a-zA-Z0-9][\\w-.]+/[a-zA-Z0-9][\\w-.]+([a-zA-Z0-9./]+)?', 'g')

function getModuleName(request, includeAbsolutePaths) {
  let req = request
  const delimiter = '/'

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
  constructor(options) {
    options = options || {}
    const whitelist = [].concat(options.whitelist || [])
    const binaryDirs = [].concat(options.binaryDirs || ['.bin'])
    const importType = options.importType || 'commonjs'
    const modulesDir = options.modulesDir || 'node_modules'
    const modulesFromFile = !!options.modulesFromFile
    const includeAbsolutePaths = !!options.includeAbsolutePaths

    // create the node modules list
    const nodeModules = modulesFromFile
      ? utils.readFromPackageJson(options.modulesFromFile)
      : utils.readDir(modulesDir).filter(x => !utils.contains(binaryDirs, x))

    // return an externals function
    this.externalFunc = function(context, request, callback) {
      const moduleName = getModuleName(request, includeAbsolutePaths)
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

  apply(compiler) {
    const plugin = new ExternalModuleFactoryPlugin(compiler.options.output.libraryTarget, [this.externalFunc])
    // webpack 4+
    if (compiler.hooks) {
      compiler.hooks.compile.tap('compile', params => plugin.apply(params.normalModuleFactory))
    }
    // webpack < 4, remove this in next major version
    else {
      compiler.plugin('compile', params => params.normalModuleFactory.apply(plugin))
    }
  }
}
