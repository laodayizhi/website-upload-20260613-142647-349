(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupBackToTop() {
        document.querySelectorAll("[data-back-to-top]").forEach(function (button) {
            button.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot") || 0));
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupLocalFilter() {
        document.querySelectorAll("[data-local-filter]").forEach(function (input) {
            var list = document.querySelector("[data-filter-list]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.children);
            input.addEventListener("input", function () {
                var query = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = card.textContent.toLowerCase();
                    card.classList.toggle("is-hidden-by-filter", query && text.indexOf(query) === -1);
                });
            });
        });
    }

    function cardTemplate(movie) {
        return [
            '<article class="movie-card">',
            '    <a href="' + movie.url + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '        <div class="poster-wrap">',
            '            <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" data-fallback-title="' + escapeHtml(movie.title) + '">',
            '            <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
            '            <span class="poster-shade"></span>',
            '        </div>',
            '        <div class="movie-card-body">',
            '            <h3>' + escapeHtml(movie.title) + '</h3>',
            '            <div class="movie-meta-line">',
            '                <span>' + escapeHtml(movie.region) + '</span>',
            '                <span>' + escapeHtml(movie.type) + '</span>',
            '                <span>' + escapeHtml(movie.category) + '</span>',
            '            </div>',
            '        </div>',
            '    </a>',
            '</article>'
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupSearchPage() {
        var results = document.querySelector("[data-search-results]");
        var status = document.querySelector("[data-search-status]");
        var input = document.querySelector("[data-search-input]");
        if (!results || !status || !window.MOVIE_SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (input) {
            input.value = query;
        }
        renderSearch(query);

        function renderSearch(rawQuery) {
            var normalized = String(rawQuery || "").trim().toLowerCase();
            results.innerHTML = "";
            if (!normalized) {
                status.textContent = "输入关键词后展示结果。";
                return;
            }
            var terms = normalized.split(/\s+/).filter(Boolean);
            var matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
                var haystack = movie.searchText.toLowerCase();
                return terms.every(function (term) {
                    return haystack.indexOf(term) !== -1;
                });
            }).slice(0, 120);
            status.textContent = "共找到 " + matched.length + " 条相关结果" + (matched.length === 120 ? "，已展示前 120 条" : "") + "。";
            results.innerHTML = matched.map(cardTemplate).join("\n");
            setupImageFallbacks(results);
        }
    }

    function setupImageFallbacks(scope) {
        (scope || document).querySelectorAll("img[data-fallback-title]").forEach(function (img) {
            img.addEventListener("error", function () {
                var title = img.getAttribute("data-fallback-title") || "影视封面";
                var fallback = document.createElement("div");
                fallback.className = "image-fallback";
                fallback.textContent = title;
                img.replaceWith(fallback);
            }, { once: true });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupBackToTop();
        setupHeroCarousel();
        setupLocalFilter();
        setupSearchPage();
        setupImageFallbacks(document);
    });
})();
