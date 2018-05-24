const STATE_KEYS = [
  'categories', 'docCount', 'totalDocuments', 'vocabulary', 'vocabularySize',
  'wordCount', 'wordFrequencyCount', 'options'
]
const bayes =
class {
  constructor (options) {
    if (options) {}
    this.classifier = this.init(options)
    this.tokenizer = this.defaultTokenizer
    if (options && options.tokenizer) {
      this.tokenizer = options.tokenizer
    }
  }
  fromJson (jsonStr) {
    let self = this
    let parsed
    try {
      parsed = JSON.parse(jsonStr)
    } catch (e) {
      throw new Error('Naivebayes.fromJson expects a valid JSON string.')
    }
    // init a new classifier
    this.classifier = parsed
    // override the classifier's state
    STATE_KEYS.forEach(function (k) {
      if (!parsed[k]) {
        throw new Error('Naivebayes.fromJson: JSON string is missing an expected property: `' + k + '`.')
      }
      self.classifier[k] = parsed[k]
    })
  // return this.classifier
  }
  toJson () {
    let state = {}
    let self = this
    STATE_KEYS.forEach(function (k) {
      state[k] = self.classifier[k]
    })
    let jsonStr = JSON.stringify(state)
    return jsonStr
  }

  tokenProbability (token, category) {
    let classifier = this.classifier
    // how many times this word has occurred in documents mapped to this category
    let wordFrequencyCount = classifier.wordFrequencyCount[category][token] || 0
    // what is the count of all words that have ever been mapped to this category
    let wordCount = classifier.wordCount[category]
    // use laplace Add-1 Smoothing equation
    return (wordFrequencyCount + 1) / (wordCount + classifier.vocabularySize)
  }

  frequencyTable (tokens) {
    let frequencyTable = Object.create(null)

    tokens.forEach(function (token) {
      if (!frequencyTable[token]) {
        frequencyTable[token] = 1
      } else {
        frequencyTable[token]++
      }
    })

    return frequencyTable
  }
  categorize (text) {
    let self = this
    let maxProbability = -Infinity
    let chosenCategory = null
    let classifier = this.classifier
    let tokens = self.tokenizer(text)
    let frequencyTable = self.frequencyTable(tokens)

    // iterate thru our categories to find the one with max probability for this text
    Object
      .keys(classifier.categories)
      .forEach(function (category) {
        // start by calculating the overall probability of this category
        // =>  out of all documents we've ever looked at, how many were
        //    mapped to this category
        let categoryProbability = classifier.docCount[category] / classifier.totalDocuments

        // take the log to avoid underflow
        let logProbability = Math.log(categoryProbability)

        // now determine P( w | c ) for each word `w` in the text
        Object
          .keys(frequencyTable)
          .forEach(function (token) {
            let frequencyInText = frequencyTable[token]
            let tokenProbability = self.tokenProbability(token, category)

            // console.log('token: %s category: `%s` tokenProbability: %d', token, category, tokenProbability)

            // determine the log of the P( w | c ) for this word
            logProbability += frequencyInText * Math.log(tokenProbability)
          })

        if (logProbability > maxProbability) {
          maxProbability = logProbability
          chosenCategory = category
        }
      })

    return chosenCategory
  }
  learn (text, category) {
    let self = this
    let classifier = self.classifier
    // initialize category data structures if we've never seen this category
    self.initializeCategory(category)
    // update our count of how many documents mapped to this category
    classifier.docCount[category]++
    // update the total number of documents we have learned from
    classifier.totalDocuments++
    // normalize the text into a word array
    let tokens = self.tokenizer(text)
    // get a frequency count for each token in the text
    let frequencyTable = self.frequencyTable(tokens)
    /*
        Update our vocabulary and our word frequency count for this category
     */
    Object
      .keys(frequencyTable)
      .forEach(function (token) {
        // add this word to our vocabulary if not already existing
        if (!classifier.vocabulary[token]) {
          classifier.vocabulary[token] = true
          classifier.vocabularySize++
        }
        let frequencyInText = frequencyTable[token]

        // update the frequency information for this word in this category
        if (!classifier.wordFrequencyCount[category][token]) {
          classifier.wordFrequencyCount[category][token] = frequencyInText
        } else {
          classifier.wordFrequencyCount[category][token] += frequencyInText
        }

        // update the count of all words we have seen mapped to this category
        classifier.wordCount[category] += frequencyInText
      })

    return self
  }
  init (options) {
    // set options object
    let classifier = {}
    classifier.options = {}
    if (typeof options !== 'undefined') {
      if (!options || typeof options !== 'object' || Array.isArray(options)) {
        throw TypeError('NaiveBayes got invalid `options`: `' + options + '`. Pass in an object.')
      }
      classifier.options = options
    }
    // classifier.tokenizer = this.defaultTokenizer
    // if (options && options.tokenizer) {
    //   classifier.tokenizer = options.tokenizer
    // }
    // initialize our vocabulary and its size
    classifier.vocabulary = {}
    classifier.vocabularySize = 0
    // number of documents we have learned from
    classifier.totalDocuments = 0
    // document frequency table for each of our categories
    // => for each category, how often were documents mapped to it
    classifier.docCount = {}
    // for each category, how many words total were mapped to it
    classifier.wordCount = {}
    // word frequency table for each category
    // => for each category, how frequent was a given word mapped to it
    classifier.wordFrequencyCount = {}
    // hashmap of our category names
    classifier.categories = {}
    return classifier
  }
  defaultTokenizer (text) {
    // remove punctuation from text - remove anything that isn't a word char or a space
    let rgxPunctuation = /[^(a-zA-ZA-Яa-я0-9_)+\s]/g

    let sanitized = text.replace(rgxPunctuation, ' ')

    return sanitized.split(/\s+/)
  }
  initializeCategory (categoryName) {
    let classifier = this.classifier
    if (!classifier.categories[categoryName]) {
      classifier.docCount[categoryName] = 0
      classifier.wordCount[categoryName] = 0
      classifier.wordFrequencyCount[categoryName] = {}
      classifier.categories[categoryName] = true
    }
  // return this
  }
}
module.exports = bayes
