(function () {
  "use strict";

  var STORAGE_KEY = "apretafotos_cookies";

  var $ = function (sel) { return document.querySelector(sel); };

  function gtagConsent(state) {
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;
    gtag("consent", "update", {
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state
    });
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
      gtagConsent("granted");
    } else if (choice !== "rejected") {
      showBanner();
    }

    var acceptBtn = $("#cookieAccept");
    var rejectBtn = $("#cookieReject");
    var settingsLink = $("#cookieSettingsLink");

    if (acceptBtn) acceptBtn.addEventListener("click", function () {
      try { localStorage.setItem(STORAGE_KEY, "accepted"); } catch (e) {}
      gtagConsent("granted");
      hideBanner();
    });
    if (rejectBtn) rejectBtn.addEventListener("click", function () {
      try { localStorage.setItem(STORAGE_KEY, "rejected"); } catch (e) {}
      gtagConsent("denied");
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
