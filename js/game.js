
function Game (width, height) {
  this.gameOver = false
  this.level = 0
  this.hiScore = 0
  this.totalScore = 0
  this.nextLevelScore = this.levelScores[0]
  this.hintsLeft = 0
  this.nextHintScore = this.hintCost
  this.flavors = 2
  this.board = new GameBoard(width, height)
}

Game.prototype.hintCost = 1000
Game.prototype.levelScores = [500, 1500, 3000, 5000, 7500, 10000]

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
}

Game.prototype.addHint = function () {
  this.updateHints(1)
  this.save()
}

Game.prototype.takeHint = function () {
  this.updateHints(-1)
  this.save()
}

Game.prototype.addScore = function (points) {
  this.totalScore += points

  while (this.totalScore >= this.nextLevelScore) {
    this.level++
    this.nextLevelScore = this.levelScores[this.level] * 1 // undefined -> NaN
  }
  this.flavors = this.level + 2

  while (this.totalScore >= this.nextHintScore) {
    this.addHint()
    this.nextHintScore += this.hintCost
  }
}

Game.prototype.getBaseConstraint = function () {
  var flavors = zeroArray(this.flavors)
  var colors = zeroArray(6)
  for (var x = 0; x < this.board.width; x++) {
    for (var y = 0; y < this.board.height; y++) {
      var q = this.board.getCell(x, y)
      if (q == undefined) {
        break
      }

      flavors[Quark.flavor(q)]++
      colors[Quark.color(q)]++
    }
  }

  var result = new QuarkSet(this.flavors)
  var dominant = Quark.make(maxIndex(flavors), maxIndex(colors))
  result.exclude(dominant)
  return result
}

Game.prototype.fillBoard = function () {
  this.board.fill(this.getBaseConstraint())

  this.gameOver = !this.board.hasScoringMove()
  if (this.gameOver) {
    this.hintsLeft = 0
    if (this.totalScore > this.hiScore) {
      this.hiScore = this.totalScore
      this.hiScoreDisplay.innerText = this.hiScore
    }
  }
  this.save()
}

Game.prototype.makeMove = function (x1, y1, x2, y2) {
  this.hint = null
  this.board.swap(x1, y1, x2, y2)
  var result = []
  var score = new GameScore()

  var lines = this.board.getLines(x1, y1).concat(this.board.getLines(x2, y2))
  var scored = !!lines.length
  if (!scored) {
    return result
  }

  result.push(lines)
  score.scoreLines(lines)
  this.board.clearLines(lines)

  while (scored) {
    var lowest = this.board.compact()
    score.newSet()
    scored = false
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
          result.push(lines)
          score.scoreLines(lines)
          this.board.clearLines(lines)
        }
      }
    }
  }

  this.addScore(score.total())
  this.fillBoard()
  return result
}

Game.prototype.reset = function () {
  this.board.reset()
  this.totalScore = 0
  this.level = 0
  this.flavors = 2
  this.nextLevelScore = this.levelScores[0]
  this.hintsLeft = 0
  this.updateHints(0)
  this.nextHintScore = this.hintCost
  this.hideHint()
  this.score = null
  this.state = ss.initial
  this.start()
  this.save()
}

Game.prototype.save = function () {
  var data = {
    hiScore: this.hiScore,
    score: this.totalScore,
    hints: this.hintsLeft,
    final: this.gameOver,
    board: this.board.serialize()
  }

  localStorage.setItem('quarks', JSON.stringify(data))
}

Game.prototype.load = function () {
  var data = localStorage.getItem('quarks')
  if (data == undefined) {
    return
  }

  data = JSON.parse(data)
  this.board.deserialize(data.board)
  this.hiScore = data.hiScore
  this.totalScore = data.score
  this.addScore(0)
  this.hintsLeft = data.hints
  this.gameOver = data.final
}

Game.prototype.start = function () {
  var qs = new QuarkSet(this.flavors)
  this.board.fill(qs)
  while (!this.board.hasScoringMove()) {
    this.board.reset()
    this.board.fill(qs)
  }

  this.save()
}
