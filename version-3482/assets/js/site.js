(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    var menuButton = document.querySelector('[data-menu-button]');
    var mainNav = document.querySelector('[data-main-nav]');
    var topSearch = document.querySelector('.top-search');

    if (menuButton && mainNav && topSearch) {
      menuButton.addEventListener('click', function() {
        mainNav.classList.toggle('open');
        topSearch.classList.toggle('open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
          slide.classList.toggle('active', i === current);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle('active', i === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function() {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function(dot) {
        dot.addEventListener('click', function() {
          show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
          start();
        });
      });

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]')).forEach(function(area) {
      var input = area.querySelector('[data-filter-input]');
      var chips = Array.prototype.slice.call(area.querySelectorAll('[data-filter-chip]'));
      var parent = area.parentElement || document;
      var cards = Array.prototype.slice.call(parent.querySelectorAll('[data-card]'));
      var empty = parent.querySelector('[data-empty-state]');

      function apply(value) {
        var keyword = (value || '').trim().toLowerCase();
        var hasVisible = false;
        cards.forEach(function(card) {
          var text = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || ''
          ].join(' ').toLowerCase();
          var matched = !keyword || text.indexOf(keyword) !== -1;
          card.hidden = !matched;
          if (matched) {
            hasVisible = true;
          }
        });
        if (empty) {
          empty.hidden = hasVisible;
        }
      }

      if (input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
          input.value = q;
          apply(q);
        }
        input.addEventListener('input', function() {
          apply(input.value);
        });
      }

      chips.forEach(function(chip) {
        chip.addEventListener('click', function() {
          var value = chip.getAttribute('data-filter-chip') || chip.textContent || '';
          if (input) {
            input.value = value;
          }
          apply(value);
        });
      });
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function(player) {
      var video = player.querySelector('[data-player-video]');
      var button = player.querySelector('[data-player-button]');
      var hls = null;

      function attach() {
        if (!video) {
          return;
        }
        var streamUrl = video.getAttribute('data-stream') || '';
        if (!streamUrl || video.getAttribute('data-ready') === '1') {
          return;
        }
        video.setAttribute('data-ready', '1');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function play() {
        attach();
        if (button) {
          button.hidden = true;
        }
        if (video && video.play) {
          var action = video.play();
          if (action && action.catch) {
            action.catch(function() {});
          }
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('click', function() {
          if (!video.src && video.getAttribute('data-ready') !== '1') {
            play();
          }
        });
      }
      window.addEventListener('beforeunload', function() {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  });
})();
