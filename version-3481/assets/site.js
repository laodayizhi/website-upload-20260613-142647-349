(function () {
    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function initMenu() {
        const button = document.querySelector('[data-menu-button]');
        const panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHeaderSearch() {
        document.querySelectorAll('[data-search-form]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                const input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = 'search.html';
                }
            });
        });
    }

    function initHero() {
        const hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        const slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        let index = 0;
        let timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot, current) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(current);
                start();
            });
        });

        start();
    }

    function initFilters() {
        const panel = document.querySelector('[data-filter-panel]');
        const list = document.querySelector('[data-card-list]');
        if (!panel || !list) {
            return;
        }
        const searchInput = panel.querySelector('[data-local-search]');
        const typeFilter = panel.querySelector('[data-type-filter]');
        const yearFilter = panel.querySelector('[data-year-filter]');
        const categoryFilter = panel.querySelector('[data-category-filter]');
        const cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');
        if (query && searchInput) {
            searchInput.value = query;
        }

        function matches(card) {
            const text = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.tags
            ].join(' '));
            const keyword = normalize(searchInput ? searchInput.value : '');
            const typeValue = typeFilter ? typeFilter.value : '';
            const yearValue = yearFilter ? yearFilter.value : '';
            const categoryValue = categoryFilter ? categoryFilter.value : '';
            const typeOk = !typeValue || normalize(card.dataset.type).indexOf(normalize(typeValue)) !== -1;
            const yearOk = !yearValue || card.dataset.year === yearValue;
            const categoryOk = !categoryValue || card.dataset.category === categoryValue;
            const keywordOk = !keyword || text.indexOf(keyword) !== -1;
            return typeOk && yearOk && categoryOk && keywordOk;
        }

        function update() {
            cards.forEach(function (card) {
                card.classList.toggle('is-hidden', !matches(card));
            });
        }

        [searchInput, typeFilter, yearFilter, categoryFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', update);
                control.addEventListener('change', update);
            }
        });

        update();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHeaderSearch();
        initHero();
        initFilters();
    });
}());
