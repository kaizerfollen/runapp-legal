/* =========================================================================
   landing.js — поведение главной страницы.

   Пять независимых частей, у каждой своя функция:
     • initHexLayer     — анимированные соты на фоне;
     • initFloatingCta  — липкая полоса «Скачать» и кнопка «Наверх»;
     • initBackToTop    — плавный возврат наверх;
     • initNavHighlight — подсветка пункта меню текущей секции;
     • initSliders      — стрелки, точки и перетаскивание мышью у лент
                          скриншотов.

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


  /* ---- Слайдеры скриншотов ----------------------------------------------

     Лента — обычная горизонтальная прокрутка со scroll-snap (см.
     landing.css). Пальцем она листается и без скрипта. Здесь добавляется
     то, чего не хватает на компьютере:
       • стрелки — шаг на один кадр;
       • точки — сколько кадров всего и какие сейчас видны целиком;
       • перетаскивание мышью — то же движение, что свайп на телефоне.

     Колесо мыши нарочно не перехватывается: человек крутит колесо, чтобы
     листать страницу вниз, и лента, которая вдруг «съедает» прокрутку,
     раздражает сильнее, чем помогает.

     Какие кадры видны, узнаём через IntersectionObserver с корнем в самой
     ленте — по той же причине, что и везде здесь: без слушателя scroll. */

  // Кадр считается видимым, когда на экране не меньше 90% его ширины.
  var SLIDE_VISIBLE_RATIO = 0.9;
  // Сдвиг мышью, после которого жест считается перетаскиванием, а не
  // щелчком.
  var DRAG_START_PX = 4;
  // Короткий рывок мышью тоже листает на кадр — как свайп пальцем.
  var FLICK_SHARE = 0.15;

  function createElement(tag, className, attrs) {
    var el = document.createElement(tag);
    el.className = className;
    Object.keys(attrs || {}).forEach(function (name) {
      el.setAttribute(name, attrs[name]);
    });
    return el;
  }

  function buildSliderControls(count) {
    var root = createElement('div', 'slider-controls');
    var dotsBox = createElement('div', 'slider-dots');
    var dots = [];
    for (var i = 0; i < count; i++) {
      var dot = createElement('button', 'slider-dot', {
        type: 'button',
        'aria-label': 'Screenshot ' + (i + 1) + ' of ' + count,
      });
      dots.push(dot);
      dotsBox.appendChild(dot);
    }
    var prev = createElement('button', 'slider-btn', { type: 'button', 'aria-label': 'Previous' });
    var next = createElement('button', 'slider-btn', { type: 'button', 'aria-label': 'Next' });
    prev.textContent = '\u2190';
    next.textContent = '\u2192';
    root.appendChild(dotsBox);
    root.appendChild(prev);
    root.appendChild(next);
    return { root: root, dots: dots, prev: prev, next: next };
  }

  function setupSlider(slider) {
    var track = slider.querySelector('.carousel');
    if (!track) return;
    var slides = Array.prototype.slice.call(track.children);
    if (slides.length < 2) return;

    var controls = buildSliderControls(slides.length);
    slider.appendChild(controls.root);
    slider.classList.add('is-enhanced');

    var visible = {};       // индексы кадров, видимых целиком
    var firstVisible = 0;

    function offsetOf(index) {
      return slides[index].offsetLeft - slides[0].offsetLeft;
    }

    function goTo(index) {
      var target = Math.max(0, Math.min(slides.length - 1, index));
      track.scrollTo({
        left: offsetOf(target),
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
      });
    }

    function nearestIndex(scrollLeft) {
      var best = 0;
      slides.forEach(function (_, i) {
        if (Math.abs(offsetOf(i) - scrollLeft) < Math.abs(offsetOf(best) - scrollLeft)) best = i;
      });
      return best;
    }

    function updateControls() {
      var shown = Object.keys(visible).map(Number).sort(function (a, b) { return a - b; });
      // Посреди анимации может не быть ни одного кадра целиком —
      // тогда оставляем прежнее состояние, чтобы точки не мигали.
      if (!shown.length) return;
      firstVisible = shown[0];
      controls.dots.forEach(function (dot, i) {
        if (visible[i]) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      controls.prev.disabled = !!visible[0];
      controls.next.disabled = !!visible[slides.length - 1];
    }

    // Стрелки и точки.
    controls.prev.addEventListener('click', function () { goTo(firstVisible - 1); });
    controls.next.addEventListener('click', function () { goTo(firstVisible + 1); });
    controls.dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goTo(i); });
    });

    // Какие кадры видны.
    if (canObserve) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var index = slides.indexOf(entry.target);
          if (entry.intersectionRatio >= SLIDE_VISIBLE_RATIO) visible[index] = true;
          else delete visible[index];
        });
        updateControls();
      }, { root: track, threshold: [0, SLIDE_VISIBLE_RATIO, 1] });
      slides.forEach(function (slide) { observer.observe(slide); });
    }

    // Если все кадры и так помещаются, управление прячем: листать нечего.
    function updateStatic() {
      slider.classList.toggle('is-static', track.scrollWidth <= track.clientWidth + 1);
    }
    updateStatic();
    if ('ResizeObserver' in window) new ResizeObserver(updateStatic).observe(track);

    // Перетаскивание мышью. Только мышь: палец и стилус браузер листает
    // сам, и вмешательство только испортило бы инерцию свайпа.
    var drag = null;

    track.addEventListener('pointerdown', function (event) {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      drag = { x: event.clientX, startLeft: track.scrollLeft, moved: false, id: event.pointerId };
    });

    track.addEventListener('pointermove', function (event) {
      if (!drag) return;
      var dx = event.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < DRAG_START_PX) return;
        drag.moved = true;
        track.setPointerCapture(drag.id);
        track.classList.add('is-dragging');
      }
      track.scrollLeft = drag.startLeft - dx;
    });

    function endDrag(event) {
      if (!drag) return;
      var finished = drag;
      drag = null;
      if (!finished.moved) return;

      var dx = event.clientX - finished.x;
      var from = nearestIndex(finished.startLeft);
      var flick = slides[0].offsetWidth * FLICK_SHARE;
      var target = dx <= -flick ? from + 1
                 : dx >= flick ? from - 1
                 : nearestIndex(track.scrollLeft);

      track.classList.remove('is-dragging');
      goTo(target);
    }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    // Браузер по умолчанию тащит картинку как файл — это перебивало жест.
    track.addEventListener('dragstart', function (event) { event.preventDefault(); });
  }

  function initSliders() {
    document.querySelectorAll('.slider').forEach(setupSlider);
  }


  initHexLayer();
  initFloatingCta();
  initBackToTop();
  initNavHighlight();
  initSliders();
})();
