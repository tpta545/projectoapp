(function () {
  "use strict";

  var ADSENSE_CLIENT = "ca-pub-8085702169119074";
  var STORAGE_KEY = "apretafotos_cookies";

  var $ = function (sel) { return document.querySelector(sel); };

  function loadAdsense() {
    if (document.querySelector("script[data-adsense]")) return;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + ADSENSE_CLIENT;
    s.crossOrigin = "anonymous";
    s.setAttribute("data-adsense", "1");
    document.head.appendChild(s);
  }

  function showBanner() {
    var b = $("#cookieBanner");
    if (b) b.hidden = false;
  }
  function hideBanner() {
    var b = $("#cookieBanner");
    if (b) b.hidden = true;
  }

  function boot() {
    var choice = null;
    try { choice = localStorage.getItem(STORAGE_KEY); } catch (e) {}

    if (choice === "accepted") {
      loadAdsense();
    } else if (choice !== "rejected") {
      showBanner();
    }

    var acceptBtn = $("#cookieAccept");
    var rejectBtn = $("#cookieReject");
    var settingsLink = $("#cookieSettingsLink");

    if (acceptBtn) acceptBtn.addEventListener("click", function () {
      try { localStorage.setItem(STORAGE_KEY, "accepted"); } catch (e) {}
      loadAdsense();
      hideBanner();
    });
    if (rejectBtn) rejectBtn.addEventListener("click", function () {
      try { localStorage.setItem(STORAGE_KEY, "rejected"); } catch (e) {}
      hideBanner();
    });
    if (settingsLink) settingsLink.addEventListener("click", function (e) {
      e.preventDefault();
      showBanner();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
