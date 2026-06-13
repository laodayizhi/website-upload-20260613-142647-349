(function () {
  var video = document.getElementById('movieVideo');
  if (!video) {
    return;
  }
  var source = video.querySelector('source');
  var src = source ? source.getAttribute('src') : '';
  var button = document.querySelector('[data-video-start]');
  var attached = false;
  function attach() {
    if (!src || attached) {
      return;
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }
  }
  function playVideo() {
    attach();
    if (button) {
      button.classList.add('is-hidden');
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }
  if (button) {
    button.addEventListener('click', playVideo);
  }
  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });
  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });
  attach();
})();
