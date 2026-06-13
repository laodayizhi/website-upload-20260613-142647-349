(function () {
  var toggle = document.querySelector('.menu-toggle');
  var mobile = document.querySelector('.mobile-nav');
  if (toggle && mobile) {
    toggle.addEventListener('click', function () {
      mobile.classList.toggle('is-open');
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
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === current);
      });
    }
    function next() {
      show(current + 1);
    }
    function start() {
      timer = window.setInterval(next, 5000);
    }
    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }
    var prevButton = hero.querySelector('[data-hero-prev]');
    var nextButton = hero.querySelector('[data-hero-next]');
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        show(idx);
        restart();
      });
    });
    show(0);
    start();
  }

  var searchForms = Array.prototype.slice.call(document.querySelectorAll('[data-local-search]'));
  searchForms.forEach(function (form) {
    var input = form.querySelector('input');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    function apply() {
      var q = (input.value || '').trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('is-hidden', q && text.indexOf(q) === -1);
      });
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });
    input.addEventListener('input', apply);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      input.value = query;
      apply();
    }
  });

  var groups = Array.prototype.slice.call(document.querySelectorAll('[data-filter-group]'));
  groups.forEach(function (group) {
    var buttons = Array.prototype.slice.call(group.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-filter') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        cards.forEach(function (card) {
          var tags = card.getAttribute('data-tags') || '';
          card.classList.toggle('is-hidden', value !== 'all' && tags.indexOf(value) === -1);
        });
      });
    });
  });
})();
