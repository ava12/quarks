function QuarkSet (flavors) {
  this.flavors = flavors
  var cnt = flavors * 6
  if (cnt > 32) {
    this.cnt = [32, cnt - 32]
    this.set = [0xffffffff, ((1 << (cnt - 32)) - 1)|0]
  } else {
    this.cnt = [cnt, 0]
    this.set = [((1 << cnt) - 1)|0, 0]
  }
}

// @return QuarkSet
QuarkSet.prototype.copy = function () {
  var result = new QuarkSet(this.flavors)
  result.cnt = this.cnt.slice()
  result.set = this.set.slice()
  return result
}

QuarkSet.prototype.exclude = function (q) {
  var ofs = q >> 5
  var el = 1 << (q & 0x1f)
  if ((this.set[ofs] & el) != 0) {
    this.set[ofs] &= ~el
    this.cnt[ofs]--
  }
}

QuarkSet.prototype.excludePair = function (q) {
  var c = q % 6
  this.exclude(q - c + (c + 3) % 6)
}

QuarkSet.prototype.excludeTriplets = function (q1, q2) {
  var c1 = q1 % 6
  var c2 = q2 % 6
  if (c1 == c2 || (((c1/3) | 0) != ((c2/3) | 0))) {
    return
  }

  var c3 = 3 - (c1%3 + c2%3) + (c1 - c1%3)
  var f1 = q1 - c1
  var f2 = q2 - c2
  if (f1 != f2) {
    this.exclude(f1 + c3)
    this.exclude(f2 + c3)
  } else {
    for (var i = this.flavors; i >= 0; i--) {
      var f3 = i * 6
      if (f3 != f1) {
        this.exclude(f3 + c3)
      }
    }
  }
}

// @return int
QuarkSet.prototype.pickRandom = function () {
  var r = (Math.random() * (this.cnt[0] + this.cnt[1])) | 0
  var set = this.set[0]
  var fixup = 0
  if (r >= this.cnt[0]) {
    set = this.set[1]
    r -= this.cnt[0]
    fixup = 32
  }
  for (var q = 0; q < 32; q++) {
    if (set & (1 << q)) {
      r--
      if (r < 0) {
        return q + fixup
      }
    }
  }
}

var Quark = {}

Quark.flavor = function (q) {
  return (q / 6) | 0
}

Quark.color = function (q) {
  return q % 6
}

Quark.charge = function (q) {
  return (q / 3) & 1
}

Quark.isPair = function (q1, q2) {
  return this.flavor(q1) == this.flavor(q2) && Math.abs(this.color(q1) - this.color(q2)) == 3
}

Quark.isTriplet = function (q1, q2, q3) {
  var c1 = q1%6, c2 = q2%6, c3 = q3%6
  var f1 = q1 - c1, f2 = q2 - c2, f3 = q3 - c3

  return ((c1/3)|0) == ((c2/3)|0) && ((c1/3)|0) == ((c3/3)|0) &&
    c1 != c2 && c1 != c3 && c2 != c3 &&
    ((f1 == f2)|0) + ((f1 == f3)|0) + ((f2 == f3)|0) == 1
}

// @return int
Quark.make = function (flavor, color) {
  return flavor * 6 + color
}