var fw = {
  hasError: false,
  totalTests: 0,
  totalFuncs: 0,
  totalAssertions: 0,
  totalErrors: 0,

  normalize: function (value) {
    if (value == undefined) return undefined

    return value
  },

  error: function (message) {
    this.hasError = true
    this.totalErrors++
    document.writeln('&nbsp;' + message + '<br>')
  },

  dump: function (value) {
    return JSON.stringify(value)
  },

  compareArrays: function (e, g) {
    if (e.length != g.length) return false

    for (i = 0; i < e.lenght; i++) {
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

  assert: function (expected, got, message) {
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
    this.totalFuncs++
    this.hasError = false
    document.writeln('running <b>' + name + '</b>:<br>')
    func.call(container)
    return !this.hasError
  },

  test: function (name, suit) {
    this.totalTests++
    for (var n in suit) {
      if (n.substr(0, 4) == 'test') {
        if (!this.testFunc(name + '.' + n, suit[n], suit)) {
          return false
        }
      }
    }

    return true
  },

  runCases: function (cases, func, container) {
    for (var i = 0; i < cases.length; i++) {
      var c = [cases[i]].concat(cases[i])
      func.apply(container, c)
      if (this.hasError) return false
    }

    return true
  },

  finish: function () {
    document.writeln('<hr>suits: ' + this.totalTests + ', funcs: ' + this.totalFuncs + ', assertions: ' + this.totalAssertions + ', errors: ' + this.totalErrors)
    document.close()
  }
}
