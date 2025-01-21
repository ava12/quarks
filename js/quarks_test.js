testing.test('quarks', {
  testFlavor: function () {
    var samples = [
      [0, 0],
      [1, 0],
      [5, 0],
      [6, 1],
      [47, 7],
    ]
    testing.runSamples(samples, function (q, f) {
      var got = Quark.flavor(q)
      testing.assertEqual(f, got)
    })
  },

  testColor: function () {
    var samples = [
      [0, 0],
      [1, 1],
      [5, 5],
      [6, 0],
      [47, 5]
    ]
    testing.runSamples(samples, function (q, c) {
      var got = Quark.color(q)
      testing.assertEqual(c, got)
    })
  },

  testCharge: function () {
    var samples = [
      [0, 0],
      [1, 0],
      [5, 1],
      [6, 0],
      [47, 1]
    ]
    testing.runSamples(samples, function (q, c) {
      var got = Quark.charge(q)
      testing.assertEqual(c, got)
    })
  },

  testIsPair: function () {
    var samples = [
      [0, 0, false],
      [0, 9, false],
      [0, 3, true],
      [1, 4, true],
      [2, 5, true],
      [42, 45, true],
      [44, 47, true]
    ]
    testing.runSamples(samples, function (q1, q2, expected) {
      testing.assertEqual(expected, Quark.isPair(q1, q2))
    })
  },

  testIsTriplet: function () {
    var samples = [
      [0, 0, 0, false],
      [0, 1, 5, false],
      [0, 1, 2, false],
      [45, 46, 47, false],
      [0, 1, 8, true],
      [45, 46, 5, true],
      [45, 5, 46, true],
      [5, 45, 46, true],
    ]
    testing.runSamples(samples, function (q1, q2, q3, expected) {
      testing.assertEqual(expected, Quark.isTriplet(q1, q2, q3))
    })
  }
})

testing.test('quark set', {
  testNew: function () {
    var samples = [
      [2, 12, 0, 0xfff, 0],
      [3, 18, 0, 0x3ffff, 0],
      [6, 32, 4, 0xffffffff, 0xf],
      [8, 32, 16, 0xffffffff, 0xffff]
    ]
    testing.runSamples(samples, function (f, cl, ch, ml, mh) {
      var qs = new QuarkSet(f)
      testing.assertEqual(f, qs.flavors)
      testing.assertEqual(cl, qs.cnt[0])
      testing.assertEqual(ch, qs.cnt[1])
      testing.assertEqual(ml, qs.set[0])
      testing.assertEqual(mh, qs.set[1])
    })
  },

  testExclude: function () {
    var data = [
      [0, 0xfffffffe, 0xf],
      [11, 0xfffff7fe, 0xf],
      [3, 0xfffff7f6, 0xf],
      [33, 0xfffff7f6, 0xd],
      [47, 0xfffff7f6, 0xd]
    ]
    var qs = new QuarkSet(6)
    for (var i in data) {
      qs.exclude(data[i][0])
      if (!testing.assertEqual(data[i][1]|0, qs.set[0]) || 
        !testing.assertEqual(data[i][2]|0, qs.set[1])) {
        return
      }
    }
  },

  testExcludePair: function () {
    var samples = [
      [0, 0xfffffff7, 0xffff],
      [1, 0xffffffef, 0xffff],
      [2, 0xffffffdf, 0xffff],
      [3, 0xfffffffe, 0xffff],
      [4, 0xfffffffd, 0xffff],
      [5, 0xfffffffb, 0xffff],
      [6, 0xfffffdff, 0xffff],
      [32, 0xffffffff, 0xfff7],
      [40, 0xffffffff, 0xffdf]
    ]
    testing.runSamples(samples, function (q, ml, mh) {
      var qs = new QuarkSet(8)
      qs.excludePair(q)
      testing.assertEqual(ml|0, qs.set[0]|0)
      testing.assertEqual(mh|0, qs.set[1]|0)
    })
  },

  testExcludeTriplets: function () {
    var samples = [
      [0, 0, 0xffffffff, 0xffff],
      [0, 4, 0xffffffff, 0xffff],
      [0, 1, 0xfbefbeff, 0xefbe],
      [7, 8, 0xbefbeffe, 0xfbef],
      [6, 38, 0xffffff7f, 0xffdf]
    ]
    testing.runSamples(samples, function (q1, q2, ml, mh) {
      var qs = new QuarkSet(8)
      qs.excludeTriplets(q1, q2)
      testing.assertEqual(ml|0, qs.set[0]|0)
      testing.assertEqual(mh|0, qs.set[1]|0)
    })
  },

  testPickRandom: function () {
    var leftover = [0, 1, 7, 31, 32, 33, 47]

    var qs = new QuarkSet(8)
    var matches = leftover.slice()
    var match = matches.shift()
    for (var i = 0; i < 48; i++) {
      if (i == match) {
        match = matches.shift()
      } else {
        qs.exclude(i)
      }
    }

    var freq = []
    for (i = 0; i < 48; i++) {
      freq[i] = 0
    }
    for (var cnt = 1000; cnt > 0; cnt--) {
      i = qs.pickRandom()
      freq[i]++
    }

    var total = 0
    for (i in leftover) {
      var q = leftover[i]
      total += freq[q]
    }
    testing.assertEqual(1000, total)
    for (i in freq) {
      if (freq[i] != 0) {
        testing.log('=== ' + i + ': x' + freq[i])
      }
    }
  }
})
