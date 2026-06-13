(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var hero = document.querySelector('[data-hero-carousel]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(active + 1);
      }, 5500);
    }
  }

  var searchInput = document.getElementById('search-page-input');
  var searchResults = document.getElementById('search-results');
  var searchSummary = document.getElementById('search-summary');

  if (searchInput && searchResults && window.SEARCH_DATA) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    searchInput.value = query;

    function escapeHtml(value) {
      return String(value).replace(/[&<>'"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#039;',
          '"': '&quot;'
        }[char];
      });
    }

    function card(movie) {
      var tags = movie.tags.slice(0, 4).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '<article class="movie-card">'
        + '<a class="card-cover" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">'
        + '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">'
        + '<span class="play-dot">▶</span>'
        + '</a>'
        + '<div class="card-body">'
        + '<div class="card-tags">' + tags + '</div>'
        + '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>'
        + '<p>' + escapeHtml(movie.oneLine) + '</p>'
        + '</div>'
        + '</article>';
    }

    if (query) {
      var lower = query.toLowerCase();
      var results = window.SEARCH_DATA.filter(function (movie) {
        return movie.title.toLowerCase().indexOf(lower) >= 0
          || movie.oneLine.toLowerCase().indexOf(lower) >= 0
          || movie.genre.toLowerCase().indexOf(lower) >= 0
          || movie.region.toLowerCase().indexOf(lower) >= 0
          || movie.tags.join(' ').toLowerCase().indexOf(lower) >= 0;
      }).slice(0, 120);

      searchSummary.textContent = results.length ? '搜索结果：' + query : '没有找到匹配影片';
      searchResults.innerHTML = results.length
        ? results.map(card).join('')
        : '<div class="story-card"><h2>换个关键词试试</h2><p>可以输入片名、年份、地区、类型或剧情关键词继续搜索。</p></div>';
    }
  }
})();

function bindMoviePlayer(videoId, buttonId, coverId, streamUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var cover = document.getElementById(coverId);
  var started = false;
  var hlsInstance = null;

  if (!video || !button || !cover || !streamUrl) {
    return;
  }

  function attachStream() {
    if (started) {
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function startPlayback(event) {
    if (event) {
      event.preventDefault();
    }

    attachStream();
    cover.classList.add('is-hidden');

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  button.addEventListener('click', startPlayback);
  cover.addEventListener('click', startPlayback);
  video.addEventListener('click', function () {
    if (!started) {
      startPlayback();
    }
  });
  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
