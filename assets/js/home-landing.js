(function () {
  var body = document.body;
  var landing = document.querySelector("[data-home-landing]");
  var landingTarget = document.querySelector("[data-home-main]");
  var scrollHint = document.querySelector("[data-home-scroll]");
  var hlsVideo = document.querySelector("[data-hls-video]");
  var touchStartY = null;
  var isSnapping = false;

  function safeAutoplay(video) {
    if (!video || typeof video.play !== "function") {
      return;
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        // Ignore autoplay rejections; the static poster remains visible.
      });
    }
  }

  function loadScriptOnce(src, onDone) {
    var existing = document.querySelector('script[data-dynamic-src="' + src + '"]');

    if (existing) {
      if (existing.dataset.loaded === "true") {
        onDone(true);
      } else {
        existing.addEventListener("load", function () {
          onDone(true);
        }, { once: true });
        existing.addEventListener("error", function () {
          onDone(false);
        }, { once: true });
      }
      return;
    }

    var script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.dataset.dynamicSrc = src;
    script.addEventListener("load", function () {
      script.dataset.loaded = "true";
      onDone(true);
    }, { once: true });
    script.addEventListener("error", function () {
      onDone(false);
    }, { once: true });
    document.head.appendChild(script);
  }

  function initHlsLandingVideo() {
    if (!hlsVideo) {
      return;
    }

    var hlsSource = hlsVideo.getAttribute("data-hls-src");
    if (!hlsSource) {
      return;
    }

    // Safari and other native-HLS browsers.
    if (hlsVideo.canPlayType("application/vnd.apple.mpegurl")) {
      hlsVideo.src = hlsSource;
      hlsVideo.load();
      hlsVideo.addEventListener("loadedmetadata", function () {
        safeAutoplay(hlsVideo);
      }, { once: true });
      return;
    }

    // Chromium/Firefox via hls.js.
    loadScriptOnce("https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js", function (loaded) {
      if (!loaded || !window.Hls || !window.Hls.isSupported()) {
        return;
      }

      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(hlsSource);
      hls.attachMedia(hlsVideo);

      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        safeAutoplay(hlsVideo);
      });

      hls.on(window.Hls.Events.ERROR, function (_event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }

        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }

        hls.destroy();
      });
    });
  }

  initHlsLandingVideo();

  if (!landing || !landingTarget) {
    return;
  }

  function isNearTop() {
    return (window.scrollY || 0) < 24 && !body.classList.contains("menu-open");
  }

  function snapToMain() {
    if (isSnapping) {
      return;
    }

    isSnapping = true;
    landingTarget.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(function () {
      isSnapping = false;
    }, 900);
  }

  if (scrollHint) {
    scrollHint.addEventListener("click", function (event) {
      event.preventDefault();
      snapToMain();
    });
  }

  window.addEventListener("wheel", function (event) {
    if (!isNearTop() || event.deltaY <= 8) {
      return;
    }

    event.preventDefault();
    snapToMain();
  }, { passive: false });

  window.addEventListener("touchstart", function (event) {
    if (!event.touches || event.touches.length === 0) {
      return;
    }

    touchStartY = event.touches[0].clientY;
  }, { passive: true });

  window.addEventListener("touchmove", function (event) {
    if (!isNearTop() || touchStartY === null || !event.touches || event.touches.length === 0) {
      return;
    }

    var deltaY = touchStartY - event.touches[0].clientY;

    if (deltaY <= 18) {
      return;
    }

    event.preventDefault();
    touchStartY = null;
    snapToMain();
  }, { passive: false });

  window.addEventListener("keydown", function (event) {
    if (document.body.classList.contains("menu-open")) {
      return;
    }

    var activeElement = document.activeElement;
    var activeTag = activeElement ? activeElement.tagName : "";
    var isTyping = activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT" || (activeElement && activeElement.isContentEditable);
    var shouldSnap =
      event.key === "ArrowDown" ||
      event.key === "Down" ||
      event.key === "PageDown" ||
      event.key === " " ||
      event.key === "Spacebar";

    if (!isNearTop() || isTyping || !shouldSnap) {
      return;
    }

    event.preventDefault();
    snapToMain();
  });
}());
