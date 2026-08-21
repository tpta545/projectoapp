(function () {
  function initReveal() {
    var els = document.querySelectorAll('.mt-reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(function (el) { el.classList.add('mt-visible'); });
      return;
    }
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('mt-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach(function (el) { obs.observe(el); });
  }

  function initCarruseles() {
    var wraps = document.querySelectorAll('[data-mt-carrusel]');
    wraps.forEach(function (wrap) {
      var track = wrap.querySelector('.mt-carrusel');
      var prev = wrap.querySelector('[data-mt-prev]');
      var next = wrap.querySelector('[data-mt-next]');
      if (!track || !prev || !next) return;
      var paso = function () {
        var card = track.querySelector('.mt-resena');
        return card ? card.getBoundingClientRect().width + 20 : 320;
      };
      prev.addEventListener('click', function () { track.scrollBy({ left: -paso(), behavior: 'smooth' }); });
      next.addEventListener('click', function () { track.scrollBy({ left: paso(), behavior: 'smooth' }); });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initReveal();
    initCarruseles();
  });
})();
