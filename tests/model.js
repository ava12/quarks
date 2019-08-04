var model = new QuarkModel(3)

fw.test('model', {
  testConversions: function () {
    var cases = [
      [0, 0, 1, 1],
      [1, 0, 1, 2],
      [2, 0, 1, 3],
      [3, 0, -1, -1],
      [4, 0, -1, -2],
      [5, 0, -1, -3],
      [6, 1, 1, 1],
      [15, 2, -1, -1]
    ]

    fw.runCases(cases, function (c, index, flavour, charge, color) {
      var i = model.getIndex(flavour, color)
      fw.assert(index, i, 'getIndex ' + c)
      var gq = model.getQuark(index)
      var eq = new Quark(index, flavour, charge, color)
      fw.assert(eq, gq, 'quark ' + c)
    })
  },

  testPairMatch: function () {
    var cases = [
      [0, 3],
      [1, 4],
      [2, 5],
      [6, 9],
      [7, 10],
      [8, 11],
      [12, 15]
    ]

    fw.runCases(cases, function (c, q1, q2) {
      fw.assert(q2, model.getPairQuark(q1).index, 'pair ' + [q1, q2])
      fw.assert(q1, model.getPairQuark(q2).index, 'pair ' + [q2, q1])
      for (var q = 0; q < model.cnt; q++) {
        fw.assert(q == q2, model.isPair(q1, q), 'is pair ' + [q1, q])
        fw.assert(q == q1, model.isPair(q2, q), 'is pair ' + [q2, q])
      }
    })
  },

  testNoTripletMatch: function () {
    var cases = [
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [5, 5],
      [6, 6],
      [0, 3],
      [0, 4],
      [0, 5],
      [0, 6]
    ]

    fw.runCases(cases, function (c, q1, q2) {
      var m = 'no triplet ' + c
      fw.assert([], model.getTripletQuarks(q1, q2), m)
      for (var i = 0; i < model.cnt; i++) {
        fw.assert(false, model.isTriplet(q1, q2, i), m + ', ' + i)
      }
    })
  },

  testTripleMatch: function () {
    var cases = [
      [0, 1, [8, 14]],
      [3, 4, [11, 17]],
      [6, 8, [2, 13]],
      [9, 11, [4, 16]],
      [13, 14, [0, 6]],
      [16, 17, [3, 9]],
      [0, 7, [2, 8]],
      [1, 14, [0, 12]],
      [9, 17, [10, 16]]
    ]

    fw.runCases(cases, function (c, q1, q2, qs) {
      var matched = model.getTripletQuarks(q1, q2)
      for (var i = 0; i < matched.length; i++) {
        matched[i] = matched[i].index
        fw.assert(true, model.isTriplet(q1, q2, matched[i]), 'triplet ' + c + ', ' + matched[i])
      }
      fw.assert(qs, matched, 'triplet ' + c)
    })
  }
})

