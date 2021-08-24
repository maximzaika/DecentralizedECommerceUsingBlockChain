/** @desc since JavaScript does not possess Random build in function. The code has been
          retrieved from the github, which imitates the idea of a python.
          Has been retrieved from: https://gist.github.com/toastdriven/45a03589731f0c2eac47
          Modifications: no modifications have been done to this code. All the credit
          goes to @toastdriven */
function Random(seed) {
  this.seed = seed || Math.floor(Math.random() * 1000000)
}

var cons = Random
  , proto = cons.prototype

proto.random = function() {
  var x = Math.sin(this.seed++) * 10000
  return x - Math.floor(x)
}

proto.randint = function(start, end) {
  var multiplier = end - start
  var rand = this.random()
  rand = Math.floor(rand * multiplier)
  return rand + start
}

proto.choice = function(collection) {
  var len = collection.length
  var choice = this.randint(0, len)
  return collection[choice]
}

proto.shuffle = function(collection) {
  var len = collection.length
  var offset, tmp

  for(var i = 0; i < len; i++) {
    offset = this.randint(0, len)
    tmp = collection[i]
    collection[i] = collection[offset]
    collection[offset] = tmp
  }

  return collection
}

module.exports = Random;
