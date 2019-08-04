
function Game (width, height) {
  this.state = this.states.initial
  this.level = 0
  this.totalScore = 0
  this.nextLevelScore = this.levelScores[0]
  this.hint = null // {x1, y1, x2, y2}
  this.hintsLeft = 0
  this.nextHintScore = this.hintCost
  this.selected = null
  this.score = null
  this.model = new QuarkModel(this.level + 2)
  this.board = new GameBoard(this.model, width, height)
  this.cells = new Array(width)
  this.scoreDisplay = document.getElementById('score')
  this.hintBtn = document.getElementById('hint-btn')

  var rows = new Array(height)
  for (var y = 0; y < height; y++) {
    rows[y] = document.createElement('div')
  }
  var t = this
  var clickFunc = function () {
    t.onClick(this)
  }

  for (var x = 0; x < width; x++) {
    this.cells[x] = new Array(height)
    for (y = 0; y < height; y++) {
      var cell = document.createElement('div')
      cell.dataset.x = x
      cell.dataset.y = y
      cell.onclick = clickFunc
      this.cells[x][y] = cell
      rows[y].appendChild(cell)
    }
  }

  var dom = document.getElementById('board')
  for (y = height - 1; y >= 0; y--) {
    dom.appendChild(rows[y])
  }
}

Game.prototype.symbols = ['A', 'V', 'X', '@', '8', '0', '%', '$']
Game.prototype.hintCost = 1000
Game.prototype.levelScores = [500, 1500, 3000, 5000, 7500, 10000]
Game.prototype.states = {
  initial: 'initial',
  selected: 'selected',
  moved: 'moved',
  cleared: 'cleared',
  compacted: 'compacted',
  final: 'final'
}
Game.prototype.timeouts = {
  moved: 500,
  cleared: 500,
  compacted: 500,
  hint: 2000
}

Game.prototype.onClick = function (cell) {
  var cx = Number(cell.dataset.x)
  var cy = Number(cell.dataset.y)

  switch (this.state) {
    case this.states.initial:
      this.hideHint()
      this.state = this.states.selected
      this.selected = {x: cx, y: cy}
      this.selectCell(cx, cy)
    break

    case this.states.selected:
      var sx = this.selected.x
      var sy = this.selected.y
      var dx = Math.abs(cx - sx)
      var dy = Math.abs(cy - sy)
      this.deselectCell(sx, sy)
      this.selected = null
      this.state = this.states.initial

      if (dx + dy == 1 && this.board.isScoringMove(sx, sy, cx, cy)) {
        this.makeMove(sx, sy, cx, cy)
      }

    break
  }
}

Game.prototype.delay = function (delay, func) {
  var t = this
  setTimeout(function () {
    func.call(t)
  }, delay)
}

Game.prototype.selectCell = function (x, y) {
  this.cells[x][y].classList.add('selected')
}

Game.prototype.deselectCell = function (x, y) {
  this.cells[x][y].classList.remove('selected')
}

Game.prototype.highlightCell = function (x, y) {
  this.cells[x][y].classList.add('scored')
}

Game.prototype.dimCell = function (x, y) {
  this.cells[x][y].classList.remove('scored')
}

Game.prototype.makeHint = function () {
  var b = this.board
  var w = b.width - 1
  var h = b.height - 1
  var x = randomIndex(b.width)
  var y = randomIndex(b.height)

  for (var i = b.width * b.height; i > 0; i--) {
    if (x < w && b.isScoringMove(x, y, x + 1, y)) {
      return {x1: x, y1: y, x2: x + 1, y2: y}
    }

    if (y < h && b.isScoringMove(x, y, x, y + 1)) {
      return {x1: x, y1: y, x2: x, y2: y + 1}
    }

    y++
    if (y > h) {
      y = 0
      x++
      if (x > w) {
        x = 0
      }
    }
  }

  return null
}

Game.prototype.updateHints = function (diff) {
  this.hintsLeft += diff
  this.hintBtn.value = 'Подсказка (' + this.hintsLeft + ')'
}

Game.prototype.addHint = function () {
  this.updateHints(1)
}

Game.prototype.takeHint = function () {
  this.updateHints(-1)
}

Game.prototype.showHint = function () {
  if (this.state != this.states.initial) {
    return
  }

  this.hideHint()
  if (!this.hintsLeft) {
    alert('У вас нет подсказок!')
    return
  }

  this.hint = this.makeHint()
  if (!this.hint) {
    alert('Нет ходов!')
    return
  }

  this.takeHint()
  this.highlightCell(this.hint.x1, this.hint.y1)
  this.highlightCell(this.hint.x2, this.hint.y2)
}

Game.prototype.hideHint = function () {
  if (!this.hint) {
    return
  }

  this.dimCell(this.hint.x1, this.hint.y1)
  this.dimCell(this.hint.x2, this.hint.y2)
  this.hint = null
}

Game.prototype.highlight = function () {
  for (var n in this.score.lines) {
    var l = this.score.lines[n]
    this.highlightCell(l.x0, l.y0)
    this.highlightCell(l.x1, l.y1)
    this.highlightCell((l.x0 + l.x1) >> 1, (l.y0 + l.y1) >> 1)
  }

  this.state = this.states.moved
  this.delay(this.timeouts.moved, this.clearLines)
}

Game.prototype.clearLines = function () {
  for (var n in this.score.lines) {
    var l = this.score.lines[n]
    this.board.clearLine(l)
    this.dimCell(l.x0, l.y0)
    this.dimCell(l.x1, l.y1)
    this.dimCell((l.x0 + l.x1) >> 1, (l.y0 + l.y1) >> 1)
    this.drawCell(l.x0, l.y0)
    this.drawCell(l.x1, l.y1)
    this.drawCell((l.x0 + l.x1) >> 1, (l.y0 + l.y1) >> 1)
  }

  this.state = this.states.cleared
  this.delay(this.timeouts.cleared, this.compactBoard)
}

Game.prototype.addScore = function (points) {
  this.totalScore += points
  this.scoreDisplay.innerText = this.totalScore

  while (this.totalScore >= this.nextLevelScore) {
    this.level++
    this.model.setFlavours(this.level + 2)
    this.nextLevelScore = this.levelScores[this.level] * 1 // undefined -> NaN
  }

  while (this.totalScore >= this.nextHintScore) {
    this.addHint()
    this.nextHintScore += this.hintCost
  }
}

Game.prototype.compactBoard = function () {
  var lowest = this.board.compact()
  this.drawBoard()

  this.score.newSet()
  var scored = false

  for (var x = 0; x < this.board.width; x++) {
    if (lowest[x] == undefined) {
      continue
    }

    for (var y = lowest[x]; y < this.board.height; y++) {
      if (this.board.getCell(x, y) == undefined) {
        break
      }

      var lines = this.board.getLines(x, y)
      if (lines.length) {
        scored = true
        this.score.scoreLines(lines)
      }
    }
  }

  if (scored) {
    this.state = this.states.moved
    this.delay(this.timeouts.moved, this.highlight)
  } else {
    this.addScore(this.score.total())
    this.score = null
    this.delay(this.timeouts.compacted, this.fillBoard)
  }
}

Game.prototype.getBaseConstraint = function () {
  var flavours = zeroArray(this.model.flavours)
  var colors = zeroArray(7)
  for (var x = 0; x < this.board.width; x++) {
    for (var y = 0; y < this.board.height; y++) {
      var q = this.board.getCell(x, y)
      if (q == undefined) {
        break
      }

      q = this.model.getQuark(q)
      flavours[q.flavour]++
      colors[q.color + 3]++
    }
  }

  var result = this.model.getConstraint()
  var dominant = this.model.getIndex(maxIndex(flavours), maxIndex(colors) - 3)
  result.exclude(dominant)
  return result
}

Game.prototype.fillBoard = function () {
  this.board.fill(this.getBaseConstraint())
  this.drawBoard()

  if (this.board.hasScoringMove()) {
    this.state = this.states.initial
  } else {
    this.state = this.states.final
    alert('Нет возможных ходов!')
  }
}

Game.prototype.makeMove = function (x1, y1, x2, y2) {
  this.hint = null
  this.board.swap(x1, y1, x2, y2)
  this.drawCell(x1, y1)
  this.drawCell(x2, y2)
  this.score = new GameScore()
  var lines = this.board.getLines(x1, y1).concat(this.board.getLines(x2, y2))
  this.score.scoreLines(lines)
  this.highlight()
}

Game.prototype.drawCell = function (x, y) {
  var cell = this.cells[x][y]
  var q = this.board.getCell(x, y)
  if (q == undefined) {
    cell.innerText = ''
  } else {
    cell.innerText = this.symbols[Math.floor(q / 6)]
    cell.className = 'col' + (q % 6)
  }
}

Game.prototype.drawBoard = function () {
  for (var x = 0; x < this.board.width; x++) {
    for (var y = 0; y < this.board.height; y++) {
      this.drawCell(x, y)
    }
  }
}

Game.prototype.reset = function () {
  var s = this.state
  var ss = this.states
  if (s != ss.initial && s != ss.selected && s != ss.final) {
    return
  }

  if (!confirm('Завершить игру?')) {
    return
  }

  this.board.reset()
  this.totalScore = 0
  this.scoreDisplay.innerText = '0'
  this.level = 0
  this.model.setFlavours(2)
  this.nextLevelScore = this.levelScores[0]
  this.hintsLeft = 0
  this.updateHints(0)
  this.nextHintScore = this.hintCost
  this.hideHint()
  this.score = null
  this.state = ss.initial
  this.run()
}

Game.prototype.run = function () {
  this.board.fill()
  while (!this.board.hasScoringMove()) {
    this.board.reset()
    this.board.fill()
  }

  this.drawBoard()
}
