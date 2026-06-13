(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupPlayer(player) {
    var video = player.querySelector("video[data-hls]");
    var button = player.querySelector(".play-overlay");
    if (!video || !button) {
      return;
    }
    var source = video.getAttribute("data-hls");
    var hls = null;
    var ready = false;

    function bindSource() {
      if (ready || !source) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      ready = true;
    }

    function start() {
      bindSource();
      player.classList.add("is-playing");
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (!ready || video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      player.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        player.classList.remove("is-playing");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  onReady(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
  });
})();
