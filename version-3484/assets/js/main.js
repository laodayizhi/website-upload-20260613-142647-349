(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupLocalFilter() {
    var input = document.querySelector("[data-filter-input]");
    var list = document.querySelector("[data-filter-list]");
    var empty = document.querySelector("[data-empty-state]");
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var terms = (card.getAttribute("data-terms") || "").toLowerCase();
        var matched = !keyword || terms.indexOf(keyword) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    });
  }

  function renderSearchCard(movie) {
    return [
      "<article class=\"movie-card\">",
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\">",
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"quality-badge\">高清</span>",
      "</a>",
      "<div class=\"card-body\">",
      "<div class=\"card-meta\"><a href=\"" + escapeHtml(movie.categoryUrl) + "\">" + escapeHtml(movie.category) + "</a><span>" + escapeHtml(movie.year) + "</span></div>",
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "<p>" + escapeHtml(movie.oneLine) + "</p>",
      "</div>",
      "</article>"
    ].join("");
  }

  function setupSearchPage() {
    var root = document.querySelector("[data-search-results]");
    if (!root || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get("q") || "").trim();
    var input = document.querySelector("[data-search-input]");
    var title = document.querySelector("[data-search-title]");
    var empty = document.querySelector("[data-search-empty]");
    if (input) {
      input.value = keyword;
    }
    if (!keyword) {
      if (empty) {
        empty.classList.add("is-visible");
      }
      return;
    }
    var lower = keyword.toLowerCase();
    var results = window.SEARCH_MOVIES.filter(function (movie) {
      var text = [movie.title, movie.oneLine, movie.year, movie.region, movie.type, movie.genre, movie.tags].join(" ").toLowerCase();
      return text.indexOf(lower) !== -1;
    });
    if (title) {
      title.textContent = "关键词：“" + keyword + "”";
    }
    root.innerHTML = results.slice(0, 240).map(renderSearchCard).join("");
    if (empty) {
      empty.textContent = results.length ? "" : "没有找到匹配的影片";
      empty.classList.toggle("is-visible", results.length === 0);
    }
  }

  onReady(function () {
    setupMenu();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
  });
})();
