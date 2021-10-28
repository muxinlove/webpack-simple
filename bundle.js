// 拿到webpack的配置文件
const options = require("./webpack.config.js");

const step = 3;
const Webpack = require("./lib/webpack" + step + ".js");

new Webpack(options).run();
