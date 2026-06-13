(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(text) {
    return (text || "").toString().toLowerCase().trim();
  }

  function setupMobileNav() {
    var button = document.querySelector(".mobile-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var opened = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", opened ? "true" : "false");
      button.textContent = opened ? "×" : "☰";
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-go-slide]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("active", current === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-go-slide"), 10) || 0);
        restart();
      });
    });
    show(0);
    restart();
  }

  function setupHorizontalStrips() {
    var strips = Array.prototype.slice.call(document.querySelectorAll("[data-horizontal-strip]"));
    strips.forEach(function (strip) {
      var section = strip.closest(".scroll-section") || document;
      var left = section.querySelector("[data-scroll-left]");
      var right = section.querySelector("[data-scroll-right]");
      if (left) {
        left.addEventListener("click", function () {
          strip.scrollBy({ left: -420, behavior: "smooth" });
        });
      }
      if (right) {
        right.addEventListener("click", function () {
          strip.scrollBy({ left: 420, behavior: "smooth" });
        });
      }
    });
  }

  function setupFilters() {
    var input = document.querySelector("[data-filter-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var compactItems = Array.prototype.slice.call(document.querySelectorAll(".compact-item"));
    if (!input || (!cards.length && !compactItems.length)) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    var initialYear = params.get("year") || "";
    var activeCategory = "";
    var activeYear = initialYear;
    input.value = initialQuery;

    function matchElement(element, query) {
      var text = normalize([
        element.getAttribute("data-title"),
        element.getAttribute("data-tags"),
        element.getAttribute("data-year"),
        element.getAttribute("data-category"),
        element.getAttribute("data-genre"),
        element.textContent
      ].join(" "));
      var year = element.getAttribute("data-year") || "";
      var category = element.getAttribute("data-category") || "";
      var passQuery = !query || text.indexOf(query) !== -1;
      var passYear = !activeYear || year === activeYear;
      var passCategory = !activeCategory || category === activeCategory;
      return passQuery && passYear && passCategory;
    }

    function apply() {
      var query = normalize(input.value);
      cards.forEach(function (card) {
        card.classList.toggle("is-hidden", !matchElement(card, query));
      });
      compactItems.forEach(function (item) {
        item.classList.toggle("is-hidden", !matchElement(item, query));
      });
    }

    input.addEventListener("input", apply);
    document.querySelectorAll("[data-filter-category]").forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-filter-category") || "";
        activeCategory = activeCategory === value ? "" : value;
        document.querySelectorAll("[data-filter-category]").forEach(function (item) {
          item.classList.toggle("active", item.getAttribute("data-filter-category") === activeCategory);
        });
        apply();
      });
    });
    document.querySelectorAll("[data-filter-year]").forEach(function (button) {
      if (button.getAttribute("data-filter-year") === activeYear) {
        button.classList.add("active");
      }
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-filter-year") || "";
        activeYear = activeYear === value ? "" : value;
        document.querySelectorAll("[data-filter-year]").forEach(function (item) {
          item.classList.toggle("active", item.getAttribute("data-filter-year") === activeYear);
        });
        apply();
      });
    });
    document.querySelectorAll("[data-clear-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        input.value = "";
        activeCategory = "";
        activeYear = "";
        document.querySelectorAll(".category-filter button, .year-filter button").forEach(function (item) {
          item.classList.remove("active");
        });
        apply();
      });
    });
    apply();
  }

  function setupPlayer() {
    document.querySelectorAll("[data-player]").forEach(function (root) {
      var video = root.querySelector("video");
      var button = root.querySelector("[data-play-button]");
      if (!video || !button) {
        return;
      }
      var streamUrl = video.getAttribute("data-stream") || "";
      var attached = false;
      var hlsInstance = null;

      function attachStream() {
        if (attached || !streamUrl) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function playVideo() {
        attachStream();
        video.controls = true;
        button.classList.add("hidden");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            button.classList.remove("hidden");
          });
        }
      }

      button.addEventListener("click", playVideo);
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileNav();
    setupHero();
    setupHorizontalStrips();
    setupFilters();
    setupPlayer();
  });
})();
