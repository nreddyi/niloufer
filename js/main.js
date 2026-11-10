/* Café Niloufer — homepage v2 scripts (no dependencies) */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ----------------------------------------------------------
     1. Image fallback
     Images load from /images first. Until that folder is filled
     (run download-images.bat), each <img data-remote="file.ext">
     falls back to the live store's CDN copy.
     ---------------------------------------------------------- */
  var CDN = 'https://cafeniloufer.com/cdn/shop/files/';

  function useRemote(img) {
    if (img.dataset.fallbackDone) return;
    img.dataset.fallbackDone = '1';
    img.src = CDN + img.dataset.remote + '?width=' + (img.dataset.w || 900);
  }

  document.querySelectorAll('img[data-remote]').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) {
      useRemote(img);
    } else {
      img.addEventListener('error', function () { useRemote(img); });
    }
  });

  /* ----------------------------------------------------------
     2. Header: measured heights + mobile menu
     --chrome-h (ticker + header) sizes the hero slider;
     --header-h positions the sticky best-seller panel.
     ---------------------------------------------------------- */
  var header = document.getElementById('siteHeader');
  var ticker = document.querySelector('.ticker');
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');

  function setChromeHeight() {
    var h = header.offsetHeight;
    root.style.setProperty('--header-h', h + 'px');
    root.style.setProperty('--chrome-h', (h + (ticker ? ticker.offsetHeight : 0)) + 'px');
  }
  setChromeHeight();
  window.addEventListener('resize', setChromeHeight);
  window.addEventListener('load', setChromeHeight);

  navToggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  /* ----------------------------------------------------------
     3. Hero slider
     Autoplays every 6s; pauses on hover / focus / pause button;
     arrows, dots, keyboard and swipe.
     ---------------------------------------------------------- */
  var slider = document.getElementById('heroSlider');
  if (slider) {
    var slides = slider.querySelectorAll('.slide');
    var dots = slider.querySelectorAll('.dot');
    var pauseBtn = document.getElementById('sliderPause');
    var slideNow = document.getElementById('slideNow');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var DELAY = 6000;
    var current = 0;
    var timer = null;
    var userPaused = reduceMotion;
    var hovering = false;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        var active = i === current;
        s.classList.toggle('is-active', active);
        s.setAttribute('aria-hidden', String(!active));
        if (active) { s.removeAttribute('inert'); } else { s.setAttribute('inert', ''); }
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === current);
        if (i === current) { d.setAttribute('aria-current', 'true'); } else { d.removeAttribute('aria-current'); }
      });
      if (slideNow) { slideNow.textContent = (current < 9 ? '0' : '') + (current + 1); }
    }

    function stop() { clearInterval(timer); timer = null; }
    function start() {
      stop();
      if (userPaused || hovering) return;
      timer = setInterval(function () { show(current + 1); }, DELAY);
    }
    function syncPauseBtn() {
      pauseBtn.setAttribute('aria-pressed', String(userPaused));
      pauseBtn.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
    }

    slider.querySelectorAll('.slider-btn[data-dir]').forEach(function (btn) {
      btn.addEventListener('click', function () { show(current + Number(btn.dataset.dir)); start(); });
    });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); start(); });
    });
    pauseBtn.addEventListener('click', function () { userPaused = !userPaused; syncPauseBtn(); start(); });

    slider.addEventListener('mouseenter', function () { hovering = true; stop(); });
    slider.addEventListener('mouseleave', function () { hovering = false; start(); });
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', start);
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(current - 1); }
      if (e.key === 'ArrowRight') { show(current + 1); }
    });
    document.addEventListener('visibilitychange', function () { if (document.hidden) { stop(); } else { start(); } });

    var startX = null;
    slider.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 48) { show(current + (dx < 0 ? 1 : -1)); start(); }
      startX = null;
    }, { passive: true });

    show(0);
    syncPauseBtn();
    start();
  }

  /* ----------------------------------------------------------
     4. Category strip: the panel under the pointer / focus widens
     (desktop only — on phones the strip is a swipe rail)
     ---------------------------------------------------------- */
  var panels = document.querySelectorAll('#catStrip .cat-panel');
  panels.forEach(function (panel) {
    function activate() {
      panels.forEach(function (p) { p.classList.toggle('is-active', p === panel); });
    }
    panel.addEventListener('mouseenter', activate);
    panel.addEventListener('focusin', activate);
  });

  /* ----------------------------------------------------------
     5. Best-seller filter chips
     ---------------------------------------------------------- */
  var chips = document.querySelectorAll('.chip[data-filter]');
  var grid = document.getElementById('productGrid');
  var products = grid ? grid.querySelectorAll('.product') : [];

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var filter = chip.dataset.filter;
      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-pressed', String(active));
      });
      grid.classList.toggle('is-filtered', filter !== 'all'); /* turns the stagger off */
      products.forEach(function (p) {
        p.hidden = !(filter === 'all' || p.dataset.cat === filter);
      });
    });
  });

  /* ----------------------------------------------------------
     6. Add to cart (demo only — in Shopify, replace with a POST
        to /cart/add.js and read the count from /cart.js)
     ---------------------------------------------------------- */
  var cartCount = document.getElementById('cartCount');
  var count = 0;

  document.querySelectorAll('.add-to-cart').forEach(function (btn) {
    var label = btn.textContent;
    btn.addEventListener('click', function () {
      count += 1;
      cartCount.textContent = String(count);
      cartCount.classList.remove('bump');
      void cartCount.offsetWidth; /* restart the animation */
      cartCount.classList.add('bump');

      btn.textContent = 'Added';
      btn.classList.add('is-added');
      setTimeout(function () {
        btn.textContent = label;
        btn.classList.remove('is-added');
      }, 1400);
    });
  });

  /* ----------------------------------------------------------
     7. Gift rail arrows
     ---------------------------------------------------------- */
  document.querySelectorAll('.round-btn[data-rail]').forEach(function (btn) {
    var rail = document.getElementById(btn.dataset.rail);
    btn.addEventListener('click', function () {
      rail.scrollBy({ left: Number(btn.dataset.dir) * rail.clientWidth * 0.7, behavior: 'smooth' });
    });
  });

  /* ----------------------------------------------------------
     8. Reels: play on hover / tap, pause when left
     ---------------------------------------------------------- */
  document.querySelectorAll('.reel').forEach(function (video) {
    video.addEventListener('mouseenter', function () { video.play().catch(function () {}); });
    video.addEventListener('mouseleave', function () { video.pause(); });
    video.addEventListener('click', function () {
      if (video.paused) { video.play().catch(function () {}); } else { video.pause(); }
    });
  });

  /* ----------------------------------------------------------
     9. Scroll reveal (uses the `translate` property so it never
        fights the rotate / hover transforms on cards)
     ---------------------------------------------------------- */
  var revealTargets = document.querySelectorAll(
    '.head, .story-copy, .collage, .stats li, .outlets, .cat-strip, .best-side, .product, .gift, .ticket, .reel-fan li, .footer-top > *'
  );

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px' });

    revealTargets.forEach(function (el) {
      el.classList.add('reveal');
      io.observe(el);
    });
  }
})();
