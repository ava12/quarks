onerror = function(e) {
  if (e instanceof Error) {
    e = e.message
  }
  testing.log('Ошибка: ' + e)
}

var testing = {
  output: null,
  hasError: false,
  totalSuits: 0,
  totalTests: 0,
  totalAssertions: 0,
  totalErrors: 0,
  suits: [],
  sampleName: null,

  normalize: function (value) {
    if (value == undefined) return undefined

    return value
  },

  log: function (message) {
    if (!message) {
      message = '\u00a0'
    }
    if (this.output) {
      var p = document.createElement('div')
      p.innerText = message
      this.output.appendChild(p)
    } else {
      alert(message)
    }
  },

  error: function (message) {
    this.hasError = true
    this.totalErrors++
    message = 'error: ' + message
    if (this.sampleName) {
      message = 'sample ' + this.sampleName + ": " + message
    }
    this.log('\u00a0\u00a0' + message)
  },

  dump: function (value) {
    return JSON.stringify(value)
  },

  compareArrays: function (e, g) {
    if (e.length != g.length) return false

    for (i = 0; i < e.length; i++) {
      if (!this.compare(e[i], g[i])) return false
    }

    return true
  },

  compareObjects: function (e, g) {
    for (var n in e) {
      if (!this.compare(e[n], g[n])) return false
    }
    return true
  },

  compare: function (e, g) {
    if (typeof e != typeof g) return false

    if (typeof e == 'object') {
      if (e.constructor == Array && g.constructor == Array) return this.compareArrays(e, g)
      else return this.compareObjects(e, g)
    }

    return (e == g)
  },

  assertEqual: function (expected, got, message) {
    this.totalAssertions++
    expected = this.normalize(expected)
    got = this.normalize(got)
    if (this.compare(expected, got)) return true

    message = (message ? String(message) : '')
    message += ' (expected ' + this.dump(expected) + ', got ' + this.dump(got) + ')'
    this.error(message)
    return false
  },

  testFunc: function (name, func, container) {
    this.totalTests++
    this.hasError = false
    this.log(name + ':')
    func.call(container)
    return !this.hasError
  },

  test: function (name, suit) {
    this.suits.push({
      name: name,
      suit: suit
    })
  },

  run: function(output) {
    this.output = output
    for (var i in this.suits) {
      var name = this.suits[i].name
      var suit = this.suits[i].suit
      this.totalSuits++
      for (var n in suit) {
        if (n.substring(0, 4) == 'test') {
          this.testFunc('@ ' + name + ': ' + n, suit[n], suit)
        }
      }
    }

    this.log()
    this.log('suits: ' + this.totalSuits + 
      ', tests: ' + this.totalTests + 
      ', assertions: ' + this.totalAssertions + 
      ', errors: ' + this.totalErrors)
  },

  runSamples: function (cases, func, container) {
    for (var n in cases) {
      this.sampleName = n
      func.apply(container, cases[n])
      if (this.hasError) return false
    }
    this.sampleName = null

    return true
  }
}
