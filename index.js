const Nodejieba = require('nodejieba')
const Bayes = require('./lib/bayes')
const reg = require('./lib/reg')
const fs = require('fs')
const tokenizer = string => {
  string = string.replace(reg, '')
  return Nodejieba.cut(string)
}
/**
 *
 * @param {object} options
 * @param {object} options.dict 自定义分词词典
 * @constructor bayeszh
 */
const bayeszh =
class {
  constructor (options) {
    if (options && Object.keys(options).length > 0) {
      if (options.dict) {
        Nodejieba.load({
          userDict: options.dict
        })
      }
    }
    this.bayes = new Bayes({tokenizer})
  }
  /**
   *
   * @param {string} text 输入字符串
   * @param {string} category 分类名称
   * @description 分类学习
   */
  learn (text, category) {
    this.hasClassifier = true
    if (!category) {
      throw new Error('category is undefined.')
    }
    this.bayes.learn(text, category)
  }
  /**
   *
   * @param {string} text 字符串
   * @return {string} 分类名称
   * @description 为字符串分类
   */
  categorize (text) {
    if (!this.hasClassifier) {
      throw new Error("no using classifier. do you forget to use 'fromJson' or 'fromFile'?")
    }
    return this.bayes.categorize(text)
  }
  /**
   *
   * @param {string} text Json字符串
   * @description 导入Json文本作为分类数据
   */
  fromJson (text) {
    if (text) {
      this.hasClassifier = true
    }
    this.bayes.fromJson(text)
    return this.bayes
  }
  /**
   *
   * @param {string} path 导入文件
   * @description 导入分类器文件作为分类依据。多次使用将覆盖之前的分类数据
   */
  import (path) {
    let string = fs.readFileSync(path)
    this.fromJson(string)
  }
  /**
   *
   * @param {string} path 导出文件
   * @description 导出分类器为文件
   */
  export (path) {
    let expo = fs.createWriteStream(path)
    try {
      expo.write(this.bayes.toJson())
    } catch (e) {
      throw e
    }
    expo.end()
  }
  /**
   *
   * @description 返回Json字符串
   * @return {string} Json字符串
   */
  toJson () {
    if (!this.hasClassifier) {
      throw new Error('no trained classifier.')
    }
    return this.bayes.toJson()
  }
  combine () {
    // todo
  }
}
module.exports = bayeszh
