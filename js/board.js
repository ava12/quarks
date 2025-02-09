function GameScore () {
  this.lines = {} // {key: {x0, y0, x1, y1}}
  this.pairScore = 5
  this.tripletScore = 20
  this.setMultiplier = 0.2
  this.runMultiplier = 0.2

  this.runCnt = 0
  this.runScore = 0
  this.setCnt = 0
  this.setScore = 0
}

// @return bool true: линия добавлена, false: линия уже есть
GameScore.prototype.addLine = function (l) {
  var key = [l.x0, l.y0, l.x1, l.y1].join(':')
  if (this.lines[key]) {
    return false
  }

  this.lines[key] = l
  return true
}

// @return bool true: линия добавлена, false: линия уже есть
GameScore.prototype.scorePair = function (line) {
  if (!this.addLine(line)) {
    return false
  }

  this.setCnt++
  this.setScore += this.pairScore
  return true
}

// @return bool true: линия добавлена, false: линия уже есть
GameScore.prototype.scoreTriplet = function (line) {
  if (!this.addLine(line)) {
    return false
  }

  this.setCnt++
  this.setScore += this.tripletScore
  return true
}

// @return bool true: линия добавлена
GameScore.prototype.scoreLine = function (l) {
  var dx = Math.abs(l.x0 - l.x1)
  var dy = Math.abs(l.y0 - l.y1)
  if (dx * dy != 0) return false

  switch (Math.max(dx, dy)) {
    case 1: return this.scorePair(l)
    case 2: return this.scoreTriplet(l)
    default: return false
  }
}

GameScore.prototype.scoreLines = function (lines) {
  for (var i = 0; i < lines.length; i++) {
    this.scoreLine(lines[i])
  }
}

GameScore.prototype.newSet = function () {
  this.runCnt++
  this.runScore += this.setScore
  this.setScore = 0
  this.lines = {}
}

// @return int общий рекорд с коэффициентами
// портит объект!
GameScore.prototype.total = function () {
  if (this.setScore) {
    this.newSet()
  }
  return Math.round(this.runScore * (1 + this.setMultiplier * (this.setCnt - 1) + this.runMultiplier * (this.runCnt - 1)))
}


function GameBoard (width, height) {
  this.width = width
  this.height = height
  this.board = new Array(width)
  this.reset()
}

GameBoard.prototype.copy = function () {
  var result = new GameBoard(this.width, this.height)
  for (var i = 0; i < this.width; i++) {
    result.board[i] = this.board[i].slice()
  }
  return result
}

GameBoard.prototype.reset = function () {
  for (var x = 0; x < this.width; x++) {
    this.board[x] = new Array(this.height)
  }
}

GameBoard.prototype.line = function (x0, y0, x1, y1) {
  if (x0 > x1 || y0 > y1) {
    var v = x0
    x0 = x1
    x1 = v
    v = y0
    y0 = y1
    y1 = v
  }

  return {x0: x0, y0: y0, x1: x1, y1: y1}
}

GameBoard.prototype.setCell = function (x, y, q) {
  this.board[x][y] = q
}

GameBoard.prototype.clearCell = function (x, y) {
  this.setCell(x, y)
}

// @return int|null
GameBoard.prototype.getCell = function (x, y) {
  if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
    return null
  }

  return this.board[x][y]
}

// @return QuarkSet
GameBoard.prototype.getConstraint = function (qs, x, y) {
  var cons = qs.copy()
  var cd = [[-1, 0], [1, 0], [0, -1]]
  var td = [[-2, 0, -1, 0], [-1, 0, 1, 0], [1, 0, 2, 0], [0, -1, 0, -2]]

  for (var i = 0; i < cd.length; i++) {
    var q = this.getCell(x + cd[i][0], y + cd[i][1])
    if (q != undefined) {
      cons.excludePair(q)
    }
  }

  for (i = 0; i < td.length; i++) {
    q = this.getCell(x + td[i][0], y + td[i][1])
    var r = this.getCell(x + td[i][2], y + td[i][3])
    if (q != undefined && r != undefined) {
      cons.excludeTriplets(q, r)
    }
  }

  return cons
}

// @return array int (y-координата нижней заполненной клетки в колонке), null (колонка не изменилась)
GameBoard.prototype.fill = function (qs) {
  var lowestFill = new Array(this.width)

  for (var x = 0; x < this.width; x++) {
    for (var y = 0; y < this.height; y++) {
      if (this.getCell(x, y) == undefined) {
        this.board[x][y] = this.getConstraint(qs, x, y).pickRandom()
        if (lowestFill[x] == undefined) {
          lowestFill[x] = y
        }
      }
    }
  }

  return lowestFill
}

// @return array int (y-координата нижней измененной клетки в колонке), null (колонка не изменилась)
GameBoard.prototype.compact = function () {
  var lowestUpdate = new Array(this.width)

  for (var x = 0; x < this.width; x++) {
    var col = this.board[x]
    var y = 0, t = 1
    while (t < this.height) {
      while (col[y] != undefined) {
        y++
        t = y + 1
      }
      if (lowestUpdate[x] == undefined) {
        lowestUpdate[x] = y
      }
      col[y] = col[t]
      col[t] = undefined
      t++
    }
  }

  return lowestUpdate
}

GameBoard.prototype.swap = function (x1, y1, x2, y2) {
  var q = this.getCell(x1, y1)
  var r = this.getCell(x2, y2)
  this.board[x1][y1] = r
  this.board[x2][y2] = q
}

// @return int[][4] [{x0, y0, x1, y1}*]
GameBoard.prototype.getPairs = function (x, y) {
  var result = []
  var d = [[0, 1], [-1, 0], [1, 0], [0, -1]]
  var p = this.board[x][y]

  for (var i = 0; i < d.length; i++) {
    var q = this.getCell(x + d[i][0], y + d[i][1])
    if (q != undefined && Quark.isPair(p, q)) {
      result.push(this.line(x, y, x + d[i][0], y + d[i][1]))
    }
  }

  return result
}

// @return int[][4] [{x0, y0, x1, y1}*]
GameBoard.prototype.getTriplets = function (x, y) {
  var result = []
  var d = [[-2, 0, -1, 0], [-1, 0, 1, 0], [1, 0, 2, 0], [0, -2, 0, -1], [0, -1, 0, 1], [0, 1, 0, 2]]
  var p = this.board[x][y]

  for (var i = 0; i < d.length; i++) {
    var x1 = x + d[i][0]
    var y1 = y + d[i][1]
    var x2 = x + d[i][2]
    var y2 = y + d[i][3]
    var q = this.getCell(x1, y1)
    var r = this.getCell(x2, y2)

    if (q != undefined && r != undefined && Quark.isTriplet(p, q, r)) {
      result.push(this.line(Math.min(x, x1, x2), Math.min(y, y1, y2), Math.max(x, x1, x2), Math.max(y, y1, y2)))
    }
  }

  return result
}

// @return int[][4] [{x0, y0, x1, y1}*]
GameBoard.prototype.getLines = function (x, y) {
  return this.getPairs(x, y).concat(this.getTriplets(x, y))
}

GameBoard.prototype.clearLine = function (l) {
  this.clearCell(l.x0, l.y0)
  this.clearCell(l.x1, l.y1)
  this.clearCell((l.x0 + l.x1) >> 1, (l.y0 + l.y1) >> 1)
}

GameBoard.prototype.clearLines = function (ls) {
  for (var i in ls) {
    this.clearLine(ls[i])
  }
}

GameBoard.prototype.updateScoreSet = function (score, x, y) {
  var lines = this.getPairs(x, y)
  for (var i = 0; i < lines.length; i++) {
    score.scorePair(lines[i])
  }
  lines = this.getTriplets(x, y)
  for (var i = 0; i < lines.length; i++) {
    score.scoreTriplet(lines[i])
  }
}

// @return bool
GameBoard.prototype.isScoringMove = function (x1, y1, x2, y2) {
  this.swap(x1, y1, x2, y2)
  var result = (
    this.getPairs(x1, y1).length > 0 ||
    this.getPairs(x2, y2).length > 0 ||
    this.getTriplets(x1, y1).length > 0 ||
    this.getTriplets(x2, y2).length > 0
  )
  this.swap(x1, y1, x2, y2)
  return result
}

// @return bool
GameBoard.prototype.hasScoringMove = function () {
  for (var x = 0; x < this.width - 1; x++) {
    for (var y = 0; y < this.height; y++) {
      if (this.isScoringMove(x, y, x + 1, y)) {
        return true
      }
    }
  }

  for (var x = 0; x < this.width; x++) {
    for (var y = 0; y < this.height - 1; y++) {
      if (this.isScoringMove(x, y, x, y + 1)) {
        return true
      }
    }
  }

  return false
}

// @return Array
GameBoard.prototype.serialize = function () {
  for (i = 0; i < this.width; i++) {
    this.board[i] = this.board[i].slice(0, this.height)
  }
  return this.board.flat()
}

GameBoard.prototype.deserialize = function (data) {
  if (!data instanceof Array) {
    throw 'некорректный тип сериализованных данных'
  }

  if (data.length != this.width * this.height) {
    throw 'некорректный размер сериализованных данных'
  }

  var pos = 0
  for (var i = 0; i < this.width; i++, pos += this.height) {
    this.board[i] = data.slice(pos, pos + this.height)
  }
}
