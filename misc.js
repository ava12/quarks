function randomIndex (len) {
  return Math.floor(Math.random() * len)
}

function zeroArray (len) {
  var result = new Array(len)
  for (var i = 0; i < len; i++) {
    result[i] = 0
  }

  return result
}

function maxIndex (a) {
  var result = 0
  var maxValue = a[0]
  var maxCopys = 1
  for (var i = 1; i < a.length; i++) {
    if (a[i] > maxValue) {
      result = i
      maxValue = a[i]
      maxCopys = 1
    } else if (a[i] == maxValue) {
      maxCopys++
      if (Math.random() < 1 / maxCopys) {
        result = i
      }
    }
  }

  return result
}
