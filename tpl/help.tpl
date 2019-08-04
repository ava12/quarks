var s: ''
@s

\{
  macros([:
    .'"': '«',
    .'""': '»',
    .--: '—',
  :])
}\

define а: '<p>'

define ц: function (color, text) {
  '<b class="col' color '">' text '</b>'
}

define л: function () {
  var i
  '<code>'
  for i: 1 .. count(arg), 2 do {
    ц(arg[i], arg[+(i, 1)])
  }
  '</code>'
}


%
%а% Цель игры: меняя местами соседние клетки, создавать выигрышные комбинации из \"\кварков\""\. Игра заканчивается, когда такую комбинацию составить невозможно.

%а% У каждого кварка есть аромат (обозначается формой), заряд (кварк/антикварк) и цвет. Кварки бывают %ц(0, "красные")%, %ц(1, "зеленые")% и %ц(2, "синие")%. Антикварки бывают %ц(3, "голубые")%, %ц(4, "пурпурные")% и %ц(5, "желтые")%. Изначально на поле присутствуют кварки двух ароматов, но в процессе игры будут добавляться новые ароматы.

%а% Есть два вида выигрышных комбинаций: пара кварк + антикварк одного аромата и противоположных цветов (%ц(0, "красный")% + %ц(3, "голубой")%, %ц(1, "зеленый")% + %ц(4, "пурпурный")%, %ц(2, "синий")% + %ц(5, "желтый")%); и линия из трех кварков либо трех антикварков трех разных цветов и двух разных ароматов.

%а% Примеры выигрышных комбинаций: %л(0, 1, 3, 1)%, %л(1, 1, 4, 1)%, %л(2, 1, 5, 1)%, %л(0, 1, 2, 1, 1, 2)%, %л(4, 1, 5, 2, 3, 1)%.

%а% Некорректные пары: %л(0, 1, 3, 2)% (разные ароматы), %л(4, 1, 3, 1)% (одинаковые заряды), %л(1, 1, 5, 1)% (недополняющие цвета).

%а% Некорректные тройки: %л(0, 1, 1, 1, 3, 2)% (разные заряды), %л(1, 1, 0, 1, 2, 1)% (все ароматы совпадают), %л(5, 1, 4, 2, 3, 3)% (все ароматы различны).

%а% Чтобы сделать ход, щелкните по любой клетке поля (она будет подсвечена), а затем по любой из четырех соседних клеток. Если ход не является корректным, то ничего не происходит. Если ход корректен, то выбранные кварки меняются местами, все комбинации, в которых они участвуют, удаляются с поля, а пустые клетки заполняются кварками из вышележащих клеток. Если при этом получились новые комбинации, то они тоже удаляются. Когда комбинаций больше нет, начисляются очки, и все пустые клетки заполняются (почти) случайными кварками. Если при этом получится, что возможных ходов нет, то игра завершается.

%а% За каждую 1000 очков вы получаете возможность воспользоваться подсказкой. При использовании подсказки будет подсвечена случайная пара клеток, дающая корректный ход.
%


var (f, re, match)
f: file('dst:index.html')
f.load()
re: regexp('<!-- begin -->(.*?)<!-- end -->', 's')
match: re.match(f.content)

if ~~(match) then {
  error("место для вставки не найдено")
}

match: match[1].sub[1]
f.content: {
  substr(f.content, 1, -(match.pos, 1))
  s
  substr(f.content, +(match.pos, length(match.match)))
}
f.save()
s: ''
