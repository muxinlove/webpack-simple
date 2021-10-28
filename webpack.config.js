const path = require("path");

module.exports = {
  mode: "development",
  // 输入
  entry: "./src/index.js",
  // 输出
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
};
