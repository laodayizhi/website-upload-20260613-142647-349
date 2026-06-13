
(function () {
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function initMobileMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      var hidden = panel.style.display === 'block';
      panel.style.display = hidden ? 'none' : 'block';
      toggle.setAttribute('aria-expanded', String(!hidden));
    });
  }

  function initHeroSlider() {
    var root = qs('.hero-slider');
    if (!root) return;
    var slides = qsa('.hero-slide', root);
    var dots = qsa('.slider-dot', root);
    var prev = qs('[data-slider-prev]', root);
    var next = qs('[data-slider-next]', root);
    if (!slides.length) return;
    var current = 0;
    var timer = null;

    function show(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === current);
      });
    }

    function play() {
      stop();
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (prev) prev.addEventListener('click', function () { show(current - 1); play(); });
    if (next) next.addEventListener('click', function () { show(current + 1); play(); });
    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () { show(idx); play(); });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function initFilters() {
    qsa('[data-filter-input]').forEach(function (input) {
      var targetSel = input.getAttribute('data-filter-target');
      var grid = targetSel ? qs(targetSel) : null;
      if (!grid) return;
      var cards = qsa('[data-filter-item]', grid);
      var empty = targetSel ? qs(targetSel + ' .empty-state') : null;

      function normalize(s) {
        return (s || '').toLowerCase();
      }

      function apply() {
        var term = normalize(input.value);
        var activeChip = qs('.chip.active[data-filter-chip]');
        var chip = activeChip ? normalize(activeChip.getAttribute('data-filter-chip')) : '';
        if (chip === '全部') chip = '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var tags = normalize(card.getAttribute('data-tags'));
          var ok = (!term || text.indexOf(term) !== -1 || tags.indexOf(term) !== -1) &&
                   (!chip || normalize(card.getAttribute('data-chips') || '').indexOf(chip) !== -1);
          card.style.display = ok ? '' : 'none';
          if (ok) visible += 1;
        });
        if (empty) empty.style.display = visible ? 'none' : 'block';
      }

      input.addEventListener('input', apply);
      qsa('[data-filter-chip]').forEach(function (chip) {
        chip.addEventListener('click', function () {
          qsa('[data-filter-chip]').forEach(function (el) { el.classList.remove('active'); });
          chip.classList.add('active');
          apply();
        });
      });
      apply();
    });
  }

  function initPlayer() {
    qsa('video.movie-player').forEach(function (video) {
      var mp4 = video.getAttribute('data-mp4') || '';
      var m3u8 = video.getAttribute('data-m3u8') || '';
      var btn = video.closest('.player-box') ? qs('.player-play', video.closest('.player-box')) : null;

      function useMp4() {
        if (mp4) {
          video.src = mp4;
        }
      }

      function tryHls() {
        if (window.Hls && window.Hls.isSupported() && m3u8) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(m3u8);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              try { hls.destroy(); } catch (e) {}
              useMp4();
            }
          });
          return true;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl') && m3u8) {
          video.src = m3u8;
          return true;
        }

        useMp4();
        return false;
      }

      tryHls();

      if (btn) {
        btn.addEventListener('click', function () {
          var p = video.play();
          if (p && typeof p.catch === 'function') {
            p.catch(function () { tryHls(); video.play().catch(function () {}); });
          }
        });
      }

      video.addEventListener('click', function () {
        var p = video.play();
        if (p && typeof p.catch === 'function') {
          p.catch(function () {});
        }
      });
    });
  }

  function initBackToTop() {
    var btn = qs('[data-back-to-top]');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      btn.style.opacity = window.scrollY > 400 ? '1' : '0';
      btn.style.pointerEvents = window.scrollY > 400 ? 'auto' : 'none';
    });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroSlider();
    initFilters();
    initPlayer();
    initBackToTop();
  });
})();
