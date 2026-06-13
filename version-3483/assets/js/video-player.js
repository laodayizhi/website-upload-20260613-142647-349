(function () {
    "use strict";

    var HLS_CDN_URLS = [
        "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js",
        "https://unpkg.com/hls.js@1.5.20/dist/hls.min.js"
    ];

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function loadScriptSequentially(urls) {
        return new Promise(function (resolve, reject) {
            var index = 0;
            function next() {
                if (window.Hls) {
                    resolve(window.Hls);
                    return;
                }
                if (index >= urls.length) {
                    reject(new Error("HLS library could not be loaded"));
                    return;
                }
                var script = document.createElement("script");
                script.src = urls[index];
                script.async = true;
                script.onload = function () {
                    resolve(window.Hls);
                };
                script.onerror = function () {
                    index += 1;
                    next();
                };
                document.head.appendChild(script);
            }
            next();
        });
    }

    function initializePlayer(video) {
        var src = video.getAttribute("data-hls-src");
        var card = video.closest(".player-card");
        var message = card ? card.querySelector("[data-player-message]") : null;
        var playButton = card ? card.querySelector("[data-video-play]") : null;

        function setMessage(text) {
            if (message) {
                message.textContent = text;
            }
        }

        function attachNative() {
            video.src = src;
            setMessage("当前浏览器使用原生 HLS 播放。点击播放按钮即可观看。");
        }

        function attachHls(Hls) {
            if (!Hls || !Hls.isSupported()) {
                attachNative();
                return;
            }
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                setMessage("播放源加载完成。点击播放按钮即可观看。");
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setMessage("视频加载异常，请刷新页面或稍后重试。");
                }
            });
        }

        if (!src) {
            setMessage("未找到播放源。 ");
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            attachNative();
        } else {
            loadScriptSequentially(HLS_CDN_URLS)
                .then(attachHls)
                .catch(function () {
                    setMessage("浏览器未能加载 HLS 支持库，请更换浏览器或稍后重试。");
                });
        }

        if (playButton) {
            playButton.addEventListener("click", function () {
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        setMessage("浏览器阻止了自动播放，请使用视频控件再次点击播放。");
                    });
                }
            });
        }

        video.addEventListener("play", function () {
            if (card) {
                card.classList.add("is-playing");
            }
        });

        video.addEventListener("pause", function () {
            if (card) {
                card.classList.remove("is-playing");
            }
        });
    }

    ready(function () {
        document.querySelectorAll("video.movie-player").forEach(initializePlayer);
    });
})();
