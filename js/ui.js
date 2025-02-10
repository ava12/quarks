function Ui(width, height) {
  this.game = new Game(width, height)
  this.board = new GameBoard(width, height)
  this.cells = new Array(width)
  this.hiScoreDisplay = document.getElementById('hiscore')
  this.scoreDisplay = document.getElementById('score')
  this.hintBtn = document.getElementById('hint-btn')
  this.alertPopup = document.getElementById('alert')
  this.alertMessage = document.getElementById('message')
  this.confirmPopup = document.getElementById('confirm')
  this.panels = {
    menu: document.getElementById('menu'),
    board: document.getElementById('board'),
    help: document.getElementById('help')
  }

  this.state = this.states.initial
  this.currentPanel = 'menu'
  this.selected = null
  this.modals = 0
  this.hint = null // {x1, y1, x2, y2}
  this.moveResult = null

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

  var dom = this.panels.board
  for (y = height - 1; y >= 0; y--) {
    dom.appendChild(rows[y])
  }
}

Ui.prototype.symbols = ['A', 'V', 'X', '@', '8', '0', '%', '$']
Ui.prototype.states = {
  initial: 'initial',
  selected: 'selected',
  moving: 'moving'
}
Ui.prototype.timeouts = {
  moved: 500,
  cleared: 500,
  compacted: 500,
  hint: 2000
}

Ui.prototype.drawCell = function (x, y) {
  var cell = this.cells[x][y]
  var q = this.board.getCell(x, y)
  if (q == undefined) {
    cell.innerText = ''
  } else {
    cell.innerText = this.symbols[Math.floor(q / 6)]
    cell.className = 'col' + (q % 6)
  }
}

Ui.prototype.drawBoard = function () {
  for (var x = 0; x < this.board.width; x++) {
    for (var y = 0; y < this.board.height; y++) {
      this.drawCell(x, y)
    }
  }

  if (!this.game.gameOver) {
    this.hintBtn.value = 'Подсказка (' + this.game.hintsLeft + ')'
  } else {
    this.hintBtn.value = '---'
  }
  this.scoreDisplay.innerText = this.game.totalScore
  this.hiScoreDisplay.innerText = this.game.hiScore
}

Ui.prototype.onClick = function (cell) {
  if (this.modals) {
    return
  }

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
        this.state = this.states.moving
        this.makeMove(sx, sy, cx, cy)
      }

      break
  }
}

Ui.prototype.delay = function (delay, func) {
  var t = this
  setTimeout(function () {
    func.call(t)
  }, delay)
}

Ui.prototype.selectCell = function (x, y) {
  this.cells[x][y].classList.add('selected')
}

Ui.prototype.deselectCell = function (x, y) {
  this.cells[x][y].classList.remove('selected')
}

Ui.prototype.highlightCell = function (x, y) {
  this.cells[x][y].classList.add('scored')
}

Ui.prototype.dimCell = function (x, y) {
  this.cells[x][y].classList.remove('scored')
}

Ui.prototype.showHint = function () {
  if (this.state != this.states.initial) {
    return
  }

  this.hideHint()
  if (!this.game.hintsLeft) {
    this.alert('У вас нет подсказок!')
    return
  }

  this.hint = this.game.makeHint()
  if (!this.hint) {
    this.alert('Нет ходов!')
    return
  }

  this.game.takeHint()
  this.highlightCell(this.hint.x1, this.hint.y1)
  this.highlightCell(this.hint.x2, this.hint.y2)
  this.hintBtn.value = 'Подсказка (' + this.game.hintsLeft + ')'
}

Ui.prototype.hideHint = function () {
  if (!this.hint) {
    return
  }

  this.dimCell(this.hint.x1, this.hint.y1)
  this.dimCell(this.hint.x2, this.hint.y2)
  this.hint = null
}

Ui.prototype.show = function (dom, modalType) {
  dom.classList.remove('hidden')
  if (modalType) {
    this.modals |= modalType
  }
}

Ui.prototype.hide = function (dom, modalType) {
  dom.classList.add('hidden')
  if (modalType) {
    this.modals &= (~modalType)
  }
}

Ui.prototype.showPanel = function (id) {
  var nextPanel = this.panels[id]
  this.hide(this.panels[this.currentPanel])
  this.show(nextPanel)
  this.currentPanel = id
}

Ui.prototype.alert = function (msg) {
  this.alertMessage.innerText = msg
  this.show(this.alertPopup, 1)
}

Ui.prototype.reset = function (confirmed) {
  var s = this.state
  var ss = this.states
  if (s != ss.initial && s != ss.selected && !this.game.gameOver) {
    return
  }

  if (!confirmed) {
    this.show(this.confirmPopup, 2)
    return
  }

  this.game.reset()
  this.drawBoard()
}

Ui.prototype.confirmReset = function (confirmed) {
  this.hide(this.confirmPopup, 2)
  if (confirmed) {
    this.reset(true)
  }
}

Ui.prototype.start = function () {
  try {
    this.game.load()
  } catch (e) {
    if (e instanceof Error) {
      e = e.message
    }
    this.alert('Ошибка: ' + e)
  }
  this.game.start()
  this.board = this.game.board.copy()
  this.drawBoard()
}

Ui.prototype.makeMove = function (x1, y1, x2, y2) {
  this.hideHint()
  this.dimCell(x1, y1)
  this.dimCell(x2, y2)
  this.moveResult = this.game.makeMove(x1, y1, x2, y2)
  if (!this.moveResult.length) {
    return
  }

  this.board.swap(x1, y1, x2, y2)
  this.drawCell(x1,y1)
  this.drawCell(x2,y2)
  this.highlight()
}

Ui.prototype.highlight = function () {
  var lines = this.moveResult[0]
  for (var n in lines) {
    var l = lines[n]
    this.highlightCell(l.x0, l.y0)
    this.highlightCell(l.x1, l.y1)
    this.highlightCell((l.x0 + l.x1) >> 1, (l.y0 + l.y1) >> 1)
  }
  this.delay(this.timeouts.cleared, this.clearLines)
}

Ui.prototype.clearLines = function (lines) {
  var lines = this.moveResult[0]
  for (var n in lines) {
    var l = lines[n]
    this.board.clearLine(l)
    this.dimCell(l.x0, l.y0)
    this.dimCell(l.x1, l.y1)
    this.dimCell((l.x0 + l.x1) >> 1, (l.y0 + l.y1) >> 1)
    this.drawCell(l.x0, l.y0)
    this.drawCell(l.x1, l.y1)
    this.drawCell((l.x0 + l.x1) >> 1, (l.y0 + l.y1) >> 1)
  }

  this.delay(this.timeouts.cleared, this.compactBoard)
}

Ui.prototype.compactBoard = function () {
  this.board.compact()
  this.drawBoard()
  this.moveResult.shift()
  if (this.moveResult.length) {
    this.delay(this.timeouts.moved, this.highlight)
  } else {
    this.delay(this.timeouts.compacted, this.fillBoard)
  }
}

Ui.prototype.fillBoard = function () {
  this.board = this.game.board.copy()
  this.drawBoard()
  this.state = this.states.initial
}
