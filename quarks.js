function Quark (index, flavour, charge, color) {
  this.index = index
  this.flavour = flavour
  this.charge = charge
  this.color = color
}


function QuarkConstraint (cnt) {
  this.excluded = 0
  this.variants = new Array(cnt)
  for (var i = 0; i < this.variants.length; i++) {
    this.variants[i] = i
  }
}

QuarkConstraint.prototype.exclude = function (index) {
  if (this.variants[index] != undefined) {
    this.variants[index] = undefined
    this.excluded++
  }
}

// @return QuarkConstraint
QuarkConstraint.prototype.copy = function () {
  var result= new QuarkConstraint(this.variants.length)
  result.excluded = this.excluded
  for (var i = 0; i < this.variants.length; i++) {
    result.variants[i] = this.variants[i]
  }
  return result
}

// @return int
QuarkConstraint.prototype.pickRandom = function () {
  var index = randomIndex(this.variants.length - this.excluded)
  var j = 0
  while (this.variants[j] == undefined) j++
  for (; index > 0; index--) {
    j++
    while (this.variants[j] == undefined) j++
  }
  return this.variants[j]
}


function QuarkModel (flavours) {
  this.flavours = (flavours ? flavours : 2)
  this.cnt = this.flavours * 6
  this.quarks = []
}

QuarkModel.prototype.setFlavours = function (flavours) {
  this.flavours = flavours
  this.cnt = flavours * 6
}

// @return Quark
QuarkModel.prototype.getQuark = function (index) {
  if (!this.quarks[index]) {
    var flavour = Math.floor(index / 6)
    var c = index % 6
    var charge = (c < 3 ? 1 : -1)
    var color = (c < 3 ? c + 1 : 2 - c)
    this.quarks[index] = new Quark(index, flavour, charge, color)
  }
  return this.quarks[index]
}

// @return int
QuarkModel.prototype.getIndex = function (flavour, color) {
  return (flavour * 6 + (color > 0 ? color - 1 : 2 - color))
}

QuarkModel.prototype.toQuark = function (q) {
  return (typeof q == 'number' ? this.getQuark(q) : q)
}

// @return bool
QuarkModel.prototype.isPair = function (q1, q2) {
  q1 = this.toQuark(q1)
  q2 = this.toQuark(q2)
  return (q1.flavour == q2.flavour && q1.color == -q2.color)
}

// @return bool
QuarkModel.prototype.isTriplet = function (q1, q2, q3) {
  q1 = this.toQuark(q1)
  q2 = this.toQuark(q2)
  q3 = this.toQuark(q3)
  return (
    q1.charge == q2.charge && q1.charge == q3.charge &&
    Math.abs(q1.color + q2.color + q3.color) == 6 &&
    Math.abs(q1.color * q2.color * q3.color) == 6 &&
    (Number(q1.flavour == q2.flavour) + Number(q1.flavour == q3.flavour) + Number(q2.flavour == q3.flavour)) == 1
  )
}

// @return Quark
QuarkModel.prototype.getPairQuark = function (q) {
  q = this.toQuark(q)
  return this.getQuark(this.getIndex(q.flavour, -q.color))
}

// @return Quark[]
QuarkModel.prototype.getTripletQuarks = function (q1, q2) {
  q1 = this.toQuark(q1)
  q2 = this.toQuark(q2)
  var result = []
  if (q1.color == q2.color || q1.charge != q2.charge) {
    return result
  }

  var missingColor = q1.color + q2.color
  missingColor = (missingColor > 0 ? 6 - missingColor : -6 - missingColor)
  if (q1.flavour != q2.flavour) {
    result.push(this.getQuark(this.getIndex(q1.flavour, missingColor)))
    result.push(this.getQuark(this.getIndex(q2.flavour, missingColor)))
  } else {
    for (var i = 0; i < this.flavours; i++) {
      if (i != q1.flavour) {
        result.push(this.getQuark(this.getIndex(i, missingColor)))
      }
    }
  }

  return result
}

// @return QuarkConstraint
QuarkModel.prototype.getConstraint = function () {
  return new QuarkConstraint(this.cnt)
}
