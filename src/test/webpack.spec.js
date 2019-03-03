// var nodeExternals = require('../src')
var testUtils = require('./test-utils.js')
var webpackAssertion = testUtils.webpackAssertion

// Test actual webpack output
describe('actual webpack bundling', function () {

    before(function () {
        return testUtils.copyModules(['module-a', 'module-b'])
    })

    describe('basic tests', function () {
        it('should output modules without bundling', webpackAssertion({}, ['module-a', 'module-b'], ['module-c']))
        it('should honor a whitelist', webpackAssertion({ whitelist: ['module-a'] }, ['module-b'], ['module-a', 'module-c']))
    })

    describe('with webpack aliased module in node_modules', function () {
        before(function () {
            return testUtils.copyModules(['module-c'])
        })
        it('should bundle aliased modules', webpackAssertion({ whitelist: ['module-c'] }, ['module-a', 'module-b'], ['module-c']))
    })

    after(function () {
        testUtils.removeModules(['module-a', 'module-b', 'module-c'])
    })
})