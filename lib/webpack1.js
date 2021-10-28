const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { transformFromAst } = require("@babel/core");
const path = require("path");

module.exports = class Webpack {
  constructor(options) {
    //! 1.引入webpack配置
    // console.log("options", options);
    const { entry, output } = options;
    this.entry = entry;
    this.output = output;
  }
  run() {
    // console.log("hello webpack!");
    this.parse(this.entry);
  }
  parse(entryFile) {
    //! 2.读取入口文件
    // 分析入口模块的内容
    const content = fs.readFileSync(entryFile, "utf-8");
    // console.log("content", content);

    //! 3.分析内容
    // 分析出哪些是依赖？以及依赖的路径
    // 把内容通过parse 抽象成语法树，便于分析 提取
    const ast = parser.parse(content, {
      sourceType: "module",
    });

    //! 4.抽取依赖路径
    // console.log("ast", ast);
    // console.log("ast", ast.program.body);
    const dependencies = {};
    traverse(ast, {
      ImportDeclaration({ node }) {
        console.log(node.source.value); //./expo.js => ./src/expo.js
        // console.log(path.dirname(entryFile));
        const newPathName =
          "./" + path.join(path.dirname(entryFile), node.source.value);
        // console.log("newPathName", newPathName);
        dependencies[node.source.value] = newPathName;
      },
    });

    //! 5.编译内容
    // 处理内容 处理es6等语法 转换ast
    const { code } = transformFromAst(ast, null, {
      presets: ["@babel/preset-env"],
    });
    // console.log("code", code);
    return {
      entryFile,
      dependencies,
      code,
    };
  }
};
