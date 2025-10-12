module.exports = {
  // semi: false, // 是否使用分号，默认true
  singleQuote: true, // 是否使用单引号, 默认false
  trailingComma: 'all', // 行尾逗号，默认none，可选 none|es5|all，es5 包括es5中的数组、对象
  printWidth: 120, // 使用较大的打印宽度，因为 Prettier 的换行设置似乎是针对没有注释的 JavaScript
  tabWidth: 2, // tab缩进大小，默认为2
  useTabs: false, // 使用tab缩进，默认false
  bracketSpacing: true, // 对象中的空格 默认true。{ foo: bar }
  arrowParens: 'avoid', // 箭头函数中单个参数是否带括号 默认avoid 可选 avoid| always
  quoteProps: 'as-needed',
  // JSX标签闭合位置 默认false
  // false: <div
  //          className=""
  //          style={{}}
  //       >
  // true: <div
  //          className=""
  //          style={{}} >
  jsxSingleQuote: true,
} 