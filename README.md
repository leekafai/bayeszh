# bayeszh
naive bayes classifier for chinese
base on :
- [bayes: A Naive-Bayes classifier for node.js][1]
- [The Jieba Chinese Word Segmentation Implemented By Node.js][2]

[1]:https://github.com/ttezel/bayes
[2]:https://github.com/yanyiwu/nodejieba

windows 下使用 nodejieba 模块可能会有意外问题，请使用 Linux 或 macOS 

usage:
1. 下载模块
`npm install https://github.com/leekafai/bayeszh.git -S`
2. 将node_modules/bayeszh中的classifier.json文件移到./中。
` cp node_modules/bayeszh/classifier.json ./`
3. 将node_modules/bayeszh中的userdict.utf8文件移到./中。
` cp node_modules/bayeszh/userdict.utf8 ./`
4. 使用
```javascript
// ./index.js
const fs = require('fs')
// 刚刚移动的分类器json文件在这里引入
const By = require('newbayeszh')
const by = new By({
  dict: './userdict.utf8'
})
by.import('./classifier.json')
console.log(by.categorize('投资 黄金找我，加v信：dfsdf32r2'))
console.log(by.categorize('所有的投资最重要的是趋势'))
by.export('./out.json')
```