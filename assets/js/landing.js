/* =========================================================================
   landing.js — поведение главной страницы.

   Четыре независимые части, у каждой своя функция:
     • initHexLayer     — анимированные соты на фоне;
     • initFloatingCta  — липкая полоса «Скачать» и кнопка «Наверх»;
     • initBackToTop    — плавный возврат наверх;
     • initNavHighlight — подсветка пункта меню текущей секции.

   Подключается с defer: DOM уже готов, первую отрисовку не задерживает.
   Каждая часть сама проверяет, есть ли на странице её элементы, — убрал
   блок из HTML, и скрипт молча пропустит его, а не упадёт.

   Слушателей scroll здесь нет намеренно: они срабатывают десятки раз в
   секунду и заставляют браузер пересчитывать вёрстку. Всё, что зависит
   от прокрутки, сделано через IntersectionObserver.
   ========================================================================= */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var canObserve = 'IntersectionObserver' in window;


  /* ---- Соты на фоне -----------------------------------------------------

     Геометрия обязана совпадать с плиткой фона в landing.css: сота
     радиусом 60 с плоской вершиной, шаг столбцов 90, шаг строк 103.923,
     нечётные столбцы сдвинуты вниз на полстроки. Тогда закрашенная сота
     ложится ровно в ячейку сетки.

     Раньше соты были вписаны в HTML готовыми координатами. Это ломалось
     двумя способами: страница на телефоне втрое длиннее, чем на
     компьютере, а координаты одни; и правый край был зашит числом
     1830 пикселей, то есть на экранах уже 1900 правых сот не было видно
     вовсе. Теперь раскладка считается под реальные размеры страницы. */

  var HEX = {
    radius: 60,
    colStep: 90,         // 1.5 × радиус
    rowStep: 103.923,    // √3 × радиус
  };

  var LAYER = {
    clusterEveryPx: 700,   // примерно одна вспышка на экран прокрутки
    cellsPerCluster: [4, 6],
    edgeCols: 4,           // насколько глубоко от края может начаться кластер
    rivalEvery: 3,         // каждый третий кластер — чужого цвета
    stepDelay: 1.3,        // с, между сотами одного кластера: захват «растекается»
    seed: 20261022,        // раскладка одинаковая при каждой загрузке
  };

  /* Детерминированный генератор (mulberry32). Math.random перемешивал бы
     соты при каждом открытии и каждом повороте телефона. */
  function createRandom(seed) {
    var state = seed >>> 0;
    return function () {
      state = (state + 0x6D2B79F5) >>> 0;
      var t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randomInt(random, min, max) {
    return min + Math.floor(random() * (max - min + 1));
  }

  /* Соседи соты в раскладке «нечётные столбцы ниже». У чётного столбца
     соседи слева и справа стоят на строку выше, у нечётного — ниже. */
  function neighbours(col, row) {
    var shift = col % 2 === 0 ? -1 : 1;
    return [
      [col, row - 1], [col, row + 1],
      [col - 1, row], [col + 1, row],
      [col - 1, row + shift], [col + 1, row + shift],
    ];
  }

  /* Левый верхний угол соты в пикселях документа. */
  function cellPosition(col, row) {
    var centerX = col * HEX.colStep;
    var centerY = row * HEX.rowStep + (col % 2 ? HEX.rowStep / 2 : 0);
    return {
      x: centerX - HEX.radius,
      y: centerY - HEX.rowStep / 2,
    };
  }

  /* Кластер: стартовая сота у края и случайное разрастание по соседям. */
  function growCluster(random, startCol, startRow, size, minCol, maxCol) {
    var taken = {};
    var cells = [[startCol, startRow]];
    taken[startCol + ':' + startRow] = true;

    for (var guard = 0; cells.length < size && guard < 40; guard++) {
      var from = cells[randomInt(random, 0, cells.length - 1)];
      var options = neighbours(from[0], from[1]);
      var next = options[randomInt(random, 0, options.length - 1)];
      var key = next[0] + ':' + next[1];
      if (taken[key] || next[0] < minCol || next[0] > maxCol || next[1] < 0) continue;
      taken[key] = true;
      cells.push(next);
    }
    return cells;
  }

  /* Вся раскладка: список сот с координатами, цветом и задержкой. */
  function planHexes(pageWidth, pageHeight) {
    var random = createRandom(LAYER.seed);
    var lastCol = Math.floor(pageWidth / HEX.colStep);
    var clusters = Math.max(1, Math.floor(pageHeight / LAYER.clusterEveryPx));
    var plan = [];

    for (var i = 0; i < clusters; i++) {
      var onLeft = i % 2 === 0;
      var depth = randomInt(random, 0, LAYER.edgeCols - 1);
      var startCol = onLeft ? depth : lastCol - depth;
      var centerY = (i + 0.5) * LAYER.clusterEveryPx;
      var startRow = Math.round(centerY / HEX.rowStep);
      var size = randomInt(random, LAYER.cellsPerCluster[0], LAYER.cellsPerCluster[1]);
      var minCol = onLeft ? 0 : lastCol - LAYER.edgeCols;
      var maxCol = onLeft ? LAYER.edgeCols : lastCol;
      var rival = i % LAYER.rivalEvery === LAYER.rivalEvery - 1;
      var baseDelay = random() * 2;

      growCluster(random, startCol, startRow, size, minCol, maxCol)
        .forEach(function (cell, order) {
          var pos = cellPosition(cell[0], cell[1]);
          plan.push({
            x: pos.x,
            y: pos.y,
            rival: rival,
            delay: baseDelay + order * LAYER.stepDelay,
          });
        });
    }
    return plan;
  }

  function renderHexes(layer, plan) {
    var fragment = document.createDocumentFragment();
    plan.forEach(function (hex) {
      var el = document.createElement('i');
      if (hex.rival) el.className = 'rival';
      el.style.setProperty('--x', hex.x.toFixed(1) + 'px');
      el.style.setProperty('--y', hex.y.toFixed(1) + 'px');
      el.style.setProperty('--delay', hex.delay.toFixed(1) + 's');
      fragment.appendChild(el);
    });
    layer.replaceChildren(fragment);
  }

  function initHexLayer() {
    var layer = document.querySelector('.hexlayer');
    if (!layer) return;

    var lastSignature = '';

    function rebuild() {
      var width = document.documentElement.clientWidth;
      var height = document.documentElement.scrollHeight;
      // Пересобираем, только когда изменилось число столбцов или
      // кластеров: при прокрутке на iOS высота окна дёргается из-за
      // панели Safari, и без этой проверки соты перерисовывались бы
      // на каждый жест.
      var signature = Math.floor(width / HEX.colStep) + 'x' +
                      Math.floor(height / LAYER.clusterEveryPx);
      if (signature === lastSignature) return;
      lastSignature = signature;
      renderHexes(layer, planHexes(width, height));
    }

    rebuild();

    var timer = null;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(rebuild, 200);
    });
  }


  /* ---- Липкая полоса и кнопка «Наверх» -----------------------------------

     Обе появляются, когда шапка ушла из виду: пока значок App Store в
     шапке виден, дублировать его незачем.

     Скрытые элементы помечаются inert: без этого невидимая ссылка и
     невидимая кнопка оставались в порядке Tab, и фокус клавиатуры уходил
     в пустоту. */

  function setShown(el, shown) {
    if (!el) return;
    el.classList.toggle('is-shown', shown);
    el.inert = !shown;
    el.setAttribute('aria-hidden', shown ? 'false' : 'true');
  }

  function initFloatingCta() {
    var hero = document.querySelector('.hero');
    var bar = document.getElementById('stickyCta');
    var toTop = document.getElementById('toTop');
    if (!hero || !canObserve) return;

    setShown(bar, false);
    setShown(toTop, false);

    new IntersectionObserver(function (entries) {
      var heroVisible = entries[0].isIntersecting;
      setShown(bar, !heroVisible);
      setShown(toTop, !heroVisible);
    }).observe(hero);
  }


  /* ---- Плавно наверх ------------------------------------------------------
     Тем же ходом, что и переходы по якорям. Системную просьбу убрать
     анимацию проверяем в момент нажатия: её могли включить, пока
     страница открыта. */

  function initBackToTop() {
    var toTop = document.getElementById('toTop');
    if (!toTop) return;

    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    });
  }


  /* ---- Подсветка пункта меню ----------------------------------------------

     Активной считаем секцию, которая попала в верхнюю треть экрана под
     навигацией. Нижняя отсечка −62% не даёт подсветиться сразу двум.

     Высоту навигации берём из scroll-padding-top в landing.css, а не
     дублируем числом: поменяют там — подсветка подстроится сама. */

  function initNavHighlight() {
    var links = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!links.length || !canObserve) return;

    var linkById = {};
    links.forEach(function (a) { linkById[a.hash.slice(1)] = a; });

    var navOffset = parseFloat(
      getComputedStyle(document.documentElement).scrollPaddingTop
    ) || 0;

    function activate(id) {
      links.forEach(function (a) {
        if (a === linkById[id]) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && linkById[entry.target.id]) {
          activate(entry.target.id);
        }
      });
    }, { rootMargin: -navOffset + 'px 0px -62% 0px' });

    Object.keys(linkById).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }


  initHexLayer();
  initFloatingCta();
  initBackToTop();
  initNavHighlight();
})();
