/* Café Niloufer — homepage prototype scripts (no dependencies) */
(function () {
  'use strict';

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
     2. Header: sticky shadow + mobile menu
     ---------------------------------------------------------- */
  var header = document.getElementById('siteHeader');
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');

  function onScroll() {
    header.classList.toggle('is-stuck', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  navToggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  /* ----------------------------------------------------------
     2b. Hero slider
     Full width; height = screen height minus announcement + header.
     Autoplays every 6s, pauses on hover / focus / pause button,
     supports arrows, dots, keyboard and swipe.
     ---------------------------------------------------------- */
  var announce = document.querySelector('.announce');
  function setChromeHeight() {
    var h = header.offsetHeight + (announce ? announce.offsetHeight : 0);
    document.documentElement.style.setProperty('--chrome-h', h + 'px');
  }
  setChromeHeight();
  window.addEventListener('resize', setChromeHeight);
  window.addEventListener('load', setChromeHeight);

  var slider = document.getElementById('heroSlider');
  if (slider) {
    var slides = slider.querySelectorAll('.slide');
    var dots = slider.querySelectorAll('.dot');
    var pauseBtn = document.getElementById('sliderPause');
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

    /* swipe */
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
     3. Best-seller filter chips
     ---------------------------------------------------------- */
  var chips = document.querySelectorAll('.chip[data-filter]');
  var products = document.querySelectorAll('#productGrid .product');

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var filter = chip.dataset.filter;
      chips.forEach(function (c) {
        var active = c === chip;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-pressed', String(active));
      });
      products.forEach(function (p) {
        p.hidden = !(filter === 'all' || p.dataset.cat === filter);
      });
    });
  });

  /* ----------------------------------------------------------
     4. Add to cart (demo only — in Shopify, replace with a POST
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
      void cartCount.offsetWidth; // restart the animation
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
     5. Reels: play on hover / tap, pause when left
     ---------------------------------------------------------- */
  document.querySelectorAll('.reel').forEach(function (video) {
    video.addEventListener('mouseenter', function () { video.play().catch(function () {}); });
    video.addEventListener('mouseleave', function () { video.pause(); });
    video.addEventListener('click', function () {
      if (video.paused) { video.play().catch(function () {}); } else { video.pause(); }
    });
  });

  /* ----------------------------------------------------------
     6. Scroll reveal
     ---------------------------------------------------------- */
  var revealTargets = document.querySelectorAll(
    '.section-head, .cat, .product, .story-copy, .story-art, .gift-feature, .gift, .workshop-panel, .reel-rail li'
  );

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });

    revealTargets.forEach(function (el) {
      el.classList.add('reveal');
      io.observe(el);
    });
  }
})();
