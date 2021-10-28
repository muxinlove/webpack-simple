const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { transformFromAst } = require("@babel/core");
const path = require("path");

module.exports = class Webpack {
  constructor(options) {
    // console.log("options", options);
    const { entry, output } = options;
    this.entry = entry;
    this.output = output;

    this.modules = [];
  }
  run() {
    // console.log("hello webpack!");
    const info = this.parse(this.entry);

    //! 1.递归 处理依赖
    // 处理其他依赖模块，做一个信息汇总
    this.modules.push(info);
    // 数组遍历的方式实现递归
    for (let i = 0; i < this.modules.length; i++) {
      const { dependencies } = this.modules[i];
      for (let j in dependencies) {
        this.modules.push(this.parse(dependencies[j]));
      }
    }
    console.log("this.modules", this.modules);

    //! 2.数组结构转换
    const graph = {};
    this.modules.forEach((item) => {
      graph[item.entryFile] = {
        dependencies: item.dependencies,
        code: item.code,
      };
    });
    // console.log(graph);
  }
  parse(entryFile) {
    // 分析入口模块的内容
    const content = fs.readFileSync(entryFile, "utf-8");
    // console.log("content", content);

    // 分析出哪些是依赖？以及依赖的路径
    // 把内容通过parse 抽象成语法树，便于分析 提取
    const ast = parser.parse(content, {
      sourceType: "module",
    });
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
    // 处理内容 转换ast
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
