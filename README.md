Webpack node modules externals
==============================
> Easily exclude node modules in Webpack

## Disclaimer

This lib is a forked version of _Liad Yosef_'s [webpack-node-externals](https://github.com/liady/webpack-node-externals) which have same API but slightly difference usage.

### Usage

```js
npm i -D @nerd-coder/webpack-node-externals
```

In your `webpack.config.js`

```js
const NodeExternals = require('@nerd-coder/webpack-node-externals')
...
module.exports = {
    ...
    target: 'node', // in order to ignore built-in modules like path, fs, etc.
    plugins: [new NodeExternals()], // in order to ignore all modules in node_modules folder
    ...
}
```

Or you can use it in CLI (_zero config_)

```sh
webpack -p --plugin @nerd-coder/webpack-node-externals
```

### Options

Please refer to the [original docs](https://github.com/liady/webpack-node-externals) for detailed available options
### 



## License
MIT
