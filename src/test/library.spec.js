const NodeExternals = require('../index')
const testUtils = require('./test-utils.js')
const mockNodeModules = testUtils.mockNodeModules
const restoreMock = testUtils.restoreMock
const context = {}
const assertResult = testUtils.buildAssertion.bind(null, context)
const chai = require('chai')
const expect = chai.expect

// Test basic functionality
describe('invocation with no settings', function() {
  before(function() {
    mockNodeModules()
    context.instance = new NodeExternals()
  })

  describe('should invoke a commonjs callback', function() {
    it('when given an existing module', assertResult('moduleA', 'commonjs moduleA'))
    it('when given another existing module', assertResult('moduleB', 'commonjs moduleB'))
    it(
      'when given another existing module for scoped package',
      assertResult('@organisation/moduleA', 'commonjs @organisation/moduleA')
    )
    it('when given an existing sub-module', assertResult('moduleA/sub-module', 'commonjs moduleA/sub-module'))
    it(
      'when given an existing file in a sub-module',
      assertResult('moduleA/another-sub/index.js', 'commonjs moduleA/another-sub/index.js')
    )
    it(
      'when given an existing file in a scoped package',
      assertResult('@organisation/moduleA/index.js', 'commonjs @organisation/moduleA/index.js')
    )
    it(
      'when given an another existing file in a scoped package',
      assertResult(
        '@organisation/base-node/vs/base/common/paths',
        'commonjs @organisation/base-node/vs/base/common/paths'
      )
    )
  })

  describe('should invoke an empty callback', function() {
    it('when given a non-node module', assertResult('non-node-module', undefined))
    it('when given a module in the file but not in folder', assertResult('moduleE', undefined))
    it('when given a relative path', assertResult('./src/index.js', undefined))
    it('when given a different absolute path', assertResult('/test/node_modules/non-node-module', undefined))
    it(
      'when given a complex different absolute path',
      assertResult('/test/node_modules/non-node-module/node_modules/moduleA', undefined)
    )
    it('when given an absolute path', assertResult('/test/node_modules/moduleA', undefined))
    it(
      'when given an existing sub-module inside node_modules',
      assertResult('/moduleA/node_modules/moduleB', undefined)
    )
  })

  after(function() {
    restoreMock()
  })
})

// Test different "importType"
describe('invocation with a different importType', function() {
  before(function() {
    mockNodeModules()
    context.instance = new NodeExternals({ importType: 'var' })
  })

  describe('should invoke a var callback', function() {
    it('when given an existing module', assertResult('moduleA', 'var moduleA'))
    it('when given another existing module', assertResult('moduleB', 'var moduleB'))
    it(
      'when given another existing module for scoped package',
      assertResult('@organisation/moduleA', 'var @organisation/moduleA')
    )
    it('when given an existing sub-module', assertResult('moduleA/sub-module', 'var moduleA/sub-module'))
    it(
      'when given an existing file in a sub-module',
      assertResult('moduleA/another-sub/index.js', 'var moduleA/another-sub/index.js')
    )
    it(
      'when given an existing file in a scoped package',
      assertResult('@organisation/moduleA/index.js', 'var @organisation/moduleA/index.js')
    )
  })

  describe('should invoke an empty callback', function() {
    it('when given a non-node module', assertResult('non-node-module', undefined))
    it('when given a relative path', assertResult('./src/index.js', undefined))
  })

  describe('should invoke a custom function', function() {
    before(function() {
      context.instance = new NodeExternals({
        importType: function(moduleName) {
          return 'commonjs ' + moduleName
        },
      })
    })

    it('when given an existing module', assertResult('moduleA', 'commonjs moduleA'))
    it('when given a non-node module', assertResult('non-node-module', undefined))
  })

  after(function() {
    restoreMock()
  })
})

// Test reading from file
describe('reads from a file', function() {
  before(function() {
    mockNodeModules()
    context.instance = new NodeExternals({ modulesFromFile: true })
  })

  describe('should invoke a commonjs callback', function() {
    it('when given an existing module in the file', assertResult('moduleE', 'commonjs moduleE'))
    it(
      'when given an existing module for scoped package in the file',
      assertResult('@organisation/moduleE', 'commonjs @organisation/moduleE')
    )
    it(
      'when given an existing file in a sub-module',
      assertResult('moduleG/another-sub/index.js', 'commonjs moduleG/another-sub/index.js')
    )
    it(
      'when given an existing file in a scoped package',
      assertResult('@organisation/moduleG/index.js', 'commonjs @organisation/moduleG/index.js')
    )
  })

  describe('should invoke an empty callback', function() {
    it('when given a non-node module', assertResult('non-node-module', undefined))
    it('when given a module in the folder but not in the file', assertResult('moduleA', undefined))
    it(
      'when given a module of scoped package in the folder but not in the file',
      assertResult('@organisation/moduleA', undefined)
    )
    it('when given a relative path', assertResult('./src/index.js', undefined))
  })

  describe('should accept options from file', function() {
    describe(' > include', function() {
      before(function() {
        context.instance = new NodeExternals({
          modulesFromFile: { include: ['dependencies'] },
        })
      })
      it('when given a module in the include', assertResult('moduleE', 'commonjs moduleE'))
      it('when given a module not in the include', assertResult('moduleG', undefined))
    })

    describe(' > exclude', function() {
      before(function() {
        context.instance = new NodeExternals({
          modulesFromFile: { exclude: ['dependencies'] },
        })
      })
      it('when given a module in the exclude', assertResult('moduleE', undefined))
      it('when given a module not in the exclude', assertResult('moduleG', 'commonjs moduleG'))
    })

    describe(' > file name', function() {
      before(function() {
        context.instance = new NodeExternals({
          modulesFromFile: { fileName: 'noFile.json' },
        })
      })
      it('when given any module, return empty', assertResult('moduleE', undefined))
    })
  })

  after(function() {
    restoreMock()
  })
})

// Test whitelist
describe('respects a whitelist', function() {
  before(function() {
    mockNodeModules()
    context.instance = new NodeExternals({
      whitelist: [
        'moduleA/sub-module',
        'moduleA/another-sub/index.js',
        'moduleC',
        function(m) {
          return m == 'moduleF'
        },
        /^moduleD/,
      ],
    })
  })

  describe('should invoke a commonjs callback', function() {
    it('when given an existing module', assertResult('moduleB', 'commonjs moduleB'))
    it('when given an existing sub-module', assertResult('moduleB/sub-module', 'commonjs moduleB/sub-module'))
    it('when given a module which is the parent on an ignored path', assertResult('moduleA', 'commonjs moduleA'))
    it(
      'when given a sub-module of an ignored module',
      assertResult('moduleC/sub-module', 'commonjs moduleC/sub-module')
    )
    it(
      'when given a sub-module of an module ignored by a function',
      assertResult('moduleF/sub-module', 'commonjs moduleF/sub-module')
    )
  })

  describe('should invoke an empty callback', function() {
    it('when given module path ignored by a function', assertResult('moduleC', undefined))
    it('when given an ignored module path', assertResult('moduleF', undefined))
    it('when given an ignored sub-module path', assertResult('moduleA/sub-module', undefined))
    it('when given an ignored file path', assertResult('moduleA/another-sub/index.js', undefined))
    it('when given an ignored regex path', assertResult('moduleD', undefined))
    it('when given an ignored regex sub-module path', assertResult('moduleD/sub-module', undefined))
    it('when given a non-node module', assertResult('non-node-module', undefined))
    it('when given a relative path', assertResult('./src/index.js', undefined))
  })

  after(function() {
    restoreMock()
  })
})

// Test absolute path support
describe('invocation with an absolute path setting', function() {
  before(function() {
    mockNodeModules()
    context.instance = new NodeExternals({
      includeAbsolutePaths: true,
    })
  })

  describe('should invoke a commonjs callback', function() {
    it('when given an existing module', assertResult('moduleA', 'commonjs moduleA'))
    it('when given another existing module', assertResult('moduleB', 'commonjs moduleB'))
    it(
      'when given another existing module for scoped package',
      assertResult('@organisation/moduleA', 'commonjs @organisation/moduleA')
    )
    it('when given an existing sub-module', assertResult('moduleA/sub-module', 'commonjs moduleA/sub-module'))
    it(
      'when given an existing file in a sub-module',
      assertResult('moduleA/another-sub/index.js', 'commonjs moduleA/another-sub/index.js')
    )
    it(
      'when given an existing file in a scoped package',
      assertResult('@organisation/moduleA/index.js', 'commonjs @organisation/moduleA/index.js')
    )
    it('when given an absolute path', assertResult('/test/node_modules/moduleA', 'commonjs /test/node_modules/moduleA'))
    it(
      'when given another absolute path',
      assertResult('../../test/node_modules/moduleA', 'commonjs ../../test/node_modules/moduleA')
    )
    it(
      'when given another absolute path for scoped package',
      assertResult('/test/node_modules/@organisation/moduleA', 'commonjs /test/node_modules/@organisation/moduleA')
    )
    it(
      'when given an existing sub-module inside node_modules',
      assertResult('/moduleA/node_modules/moduleB', 'commonjs /moduleA/node_modules/moduleB')
    )
  })

  describe('should invoke an empty callback', function() {
    it('when given a non-node module', assertResult('non-node-module', undefined))
    it('when given a module in the file but not in folder', assertResult('moduleE', undefined))
    it('when given a relative path', assertResult('./src/index.js', undefined))
    it('when given a different absolute path', assertResult('/test/node_modules/non-node-module', undefined))

    it(
      'when given a complex different absolute path',
      assertResult('/test/node_modules/non-node-module/node_modules/moduleA', undefined)
    )
    it(
      'when given a complex different absolute path for scoped package',
      assertResult('/test/node_modules/non-node-module/node_modules/@organisation/moduleA', undefined)
    )

    it(
      'when given another complex different absolute path',
      assertResult('../../node_modules/non-node-module/node_modules/moduleA', undefined)
    )
    it(
      'when given another complex different absolute path for scoped package',
      assertResult('../../node_modules/non-node-module/node_modules/@organisation/moduleA', undefined)
    )
  })

  after(function() {
    restoreMock()
  })
})

describe('when modules dir does not exist', function() {
  before(function() {
    mockNodeModules()
  })
  it('should not log ENOENT error', function() {
    const log = global.console.log
    let errorLogged = false

    // wrap console.log to catch error message
    global.console.log = function(error) {
      if (
        error instanceof Error &&
        error.message.indexOf("ENOENT, no such file or directory 'node_modules/somepackage/node_modules") !== -1
      ) {
        errorLogged = true
      }
      log.apply(null, arguments)
    }

    context.instance = new NodeExternals({
      modulesDir: 'node_modules/somepackage/node_modules',
    })

    // cleanup specific testcase env changes
    global.console.log = log

    expect(errorLogged, 'ENOENT not logged').to.be.equal(false)
  })
  it('should process like node_modules is empty', function(done) {
    context.instance = new NodeExternals({
      modulesDir: 'node_modules/somepackage/node_modules',
    })
    testUtils.buildAssertion(context, 'somepackage', undefined)(done)
  })
  after(function() {
    restoreMock()
  })
})
