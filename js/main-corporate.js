/* Café Niloufer — "corporate" homepage scripts (no dependencies) */
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
     2. Header: measured height (sizes the hero) + mobile menu
     ---------------------------------------------------------- */
  var header = document.getElementById('siteHeader');
  var utility = document.getElementById('utilityBar');
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');

  function setChromeHeight() {
    root.style.setProperty('--chrome-h', (header.offsetHeight + (utility ? utility.offsetHeight : 0)) + 'px');
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
     The active tab's progress bar is a CSS animation lasting
     --slide-ms; when it ends we advance. Pausing the slider just
     pauses that animation (class .is-paused), so the bar and the
     timing can never drift apart.
     ---------------------------------------------------------- */
  var hero = document.getElementById('heroSlider');
  if (hero) {
    var slides = hero.querySelectorAll('.h-slide');
    var tabs = hero.querySelectorAll('.h-tab');
    var pauseBtn = document.getElementById('sliderPause');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var current = 0;
    var userPaused = reduceMotion;
    var hovering = false;
    var focused = false;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        var active = i === current;
        s.classList.toggle('is-active', active);
        s.setAttribute('aria-hidden', String(!active));
        if (active) { s.removeAttribute('inert'); } else { s.setAttribute('inert', ''); }
      });
      tabs.forEach(function (t, i) {
        t.classList.remove('is-active');
        t.removeAttribute('aria-current');
        if (i === current) {
          void t.offsetWidth; /* restart the progress animation */
          t.classList.add('is-active');
          t.setAttribute('aria-current', 'true');
        }
      });
    }

    function syncPaused() {
      hero.classList.toggle('is-paused', userPaused || hovering || focused);
      pauseBtn.setAttribute('aria-pressed', String(userPaused));
      pauseBtn.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { show(i); });
      tab.querySelector('.bar').addEventListener('animationend', function () { show(current + 1); });
    });
    pauseBtn.addEventListener('click', function () { userPaused = !userPaused; syncPaused(); });

    var slidesBox = hero.querySelector('.h-slides');
    slidesBox.addEventListener('mouseenter', function () { hovering = true; syncPaused(); });
    slidesBox.addEventListener('mouseleave', function () { hovering = false; syncPaused(); });
    hero.addEventListener('focusin', function () { focused = true; syncPaused(); });
    hero.addEventListener('focusout', function () { focused = false; syncPaused(); });
    hero.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(current - 1); }
      if (e.key === 'ArrowRight') { show(current + 1); }
    });

    var startX = null;
    slidesBox.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    slidesBox.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 48) { show(current + (dx < 0 ? 1 : -1)); }
      startX = null;
    }, { passive: true });

    show(0);
    syncPaused();
  }

  /* ----------------------------------------------------------
     4. Best-seller tabs
     ---------------------------------------------------------- */
  var filterTabs = document.querySelectorAll('.tab[data-filter]');
  var products = document.querySelectorAll('#productGrid .p-card');

  filterTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var filter = tab.dataset.filter;
      filterTabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-pressed', String(active));
      });
      products.forEach(function (p) {
        p.hidden = !(filter === 'all' || p.dataset.cat === filter);
      });
    });
  });

  /* ----------------------------------------------------------
     5. Add to cart (demo only — in Shopify, replace with a POST
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
      void cartCount.offsetWidth;
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
     6. Reels: play on hover / tap, pause when left
     ---------------------------------------------------------- */
  document.querySelectorAll('.reel').forEach(function (video) {
    video.addEventListener('mouseenter', function () { video.play().catch(function () {}); });
    video.addEventListener('mouseleave', function () { video.pause(); });
    video.addEventListener('click', function () {
      if (video.paused) { video.play().catch(function () {}); } else { video.pause(); }
    });
  });

  /* ----------------------------------------------------------
     7. Scroll reveal
     ---------------------------------------------------------- */
  var revealTargets = document.querySelectorAll(
    '.head, .facts-grid > *, .tile, .p-card, .about-art, .about-copy, .gift-intro, .gift, .event, .reel-row li, .newsletter, .footer-grid > *'
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
