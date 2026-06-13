(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var previousButton = hero.querySelector("[data-hero-prev]");
    var nextButton = hero.querySelector("[data-hero-next]");
    var currentIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      currentIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === currentIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === currentIndex);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(currentIndex + 1);
      }, 5000);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previousButton) {
      previousButton.addEventListener("click", function () {
        showSlide(currentIndex - 1);
        startTimer();
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        showSlide(currentIndex + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        showSlide(index);
        startTimer();
      });
    });

    hero.addEventListener("mouseenter", stopTimer);
    hero.addEventListener("mouseleave", startTimer);
    showSlide(0);
    startTimer();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var list = scope.querySelector("[data-movie-list]");
      if (!list) {
        list = document.querySelector("[data-movie-list]");
      }
      if (!list) {
        return;
      }

      var searchInput = panel.querySelector("[data-movie-search]");
      var regionSelect = panel.querySelector("[data-filter-region]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var genreSelect = panel.querySelector("[data-filter-genre]");
      var result = panel.querySelector("[data-filter-result]");
      var items = Array.prototype.slice.call(list.children);

      function itemMatches(item) {
        var query = normalize(searchInput && searchInput.value);
        var region = normalize(regionSelect && regionSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var genre = normalize(genreSelect && genreSelect.value);
        var haystack = normalize([
          item.getAttribute("data-title"),
          item.getAttribute("data-region"),
          item.getAttribute("data-year"),
          item.getAttribute("data-genre"),
          item.getAttribute("data-tags"),
          item.textContent
        ].join(" "));

        if (query && haystack.indexOf(query) === -1) {
          return false;
        }
        if (region && normalize(item.getAttribute("data-region")).indexOf(region) === -1) {
          return false;
        }
        if (year && normalize(item.getAttribute("data-year")) !== year) {
          return false;
        }
        if (genre && normalize(item.getAttribute("data-genre")).indexOf(genre) === -1) {
          return false;
        }
        return true;
      }

      function applyFilters() {
        var visibleCount = 0;
        items.forEach(function (item) {
          var visible = itemMatches(item);
          item.classList.toggle("hidden-card", !visible);
          if (visible) {
            visibleCount += 1;
          }
        });
        if (result) {
          result.textContent = "当前显示 " + visibleCount + " 部影片";
        }
      }

      [searchInput, regionSelect, yearSelect, genreSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilters);
          control.addEventListener("change", applyFilters);
        }
      });

      applyFilters();
    });
  }

  function initPlayers() {
    var videos = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
    videos.forEach(function (video) {
      var source = video.getAttribute("data-src");
      var wrap = video.closest(".player-wrap");
      var button = wrap ? wrap.querySelector("[data-play-button]") : null;
      var hlsInstance = null;
      var isLoaded = false;

      function hideButton() {
        if (button) {
          button.classList.add("hidden");
        }
      }

      function loadAndPlay() {
        if (!source) {
          return;
        }

        if (!isLoaded) {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().then(hideButton).catch(function () {
                hideButton();
              });
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (!data || !data.fatal) {
                return;
              }
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              } else {
                hlsInstance.destroy();
              }
            });
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.addEventListener("loadedmetadata", function () {
              video.play().then(hideButton).catch(hideButton);
            }, { once: true });
          } else {
            video.src = source;
            video.play().then(hideButton).catch(hideButton);
          }
          isLoaded = true;
        } else {
          video.play().then(hideButton).catch(hideButton);
        }
      }

      if (button) {
        button.addEventListener("click", loadAndPlay);
      }

      video.addEventListener("play", hideButton);
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
