/* Café Niloufer — "owner's cut" homepage scripts (no dependencies) */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
     2. Hero height + mobile menu
     --chrome-h = everything above the hero, so the slider ends
     exactly at the bottom of the screen.
     ---------------------------------------------------------- */
  var slider = document.getElementById('heroSlider');
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');

  function setChromeHeight() {
    if (!slider) return;
    var top = slider.getBoundingClientRect().top + window.scrollY;
    root.style.setProperty('--chrome-h', Math.round(top) + 'px');
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
     Each tab's progress bar is a CSS animation; when it finishes,
     the next slide shows. Hover, focus or Pause freezes it.
     ---------------------------------------------------------- */
  if (slider) {
    var slides = slider.querySelectorAll('.slide');
    var tabs = slider.querySelectorAll('.hero-tab');
    var pauseBtn = document.getElementById('sliderPause');
    var current = 0;
    var userPaused = reduceMotion;
    var hovering = false;
    var focused = false;

    function syncPaused() {
      slider.classList.toggle('is-paused', userPaused || hovering || focused);
    }

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        var active = i === current;
        s.classList.toggle('is-active', active);
        s.setAttribute('aria-hidden', String(!active));
        if (active) { s.removeAttribute('inert'); } else { s.setAttribute('inert', ''); }
      });
      tabs.forEach(function (t, i) {
        var bar = t.querySelector('.bar i');
        t.classList.remove('is-active');
        t.classList.toggle('is-done', i < current);
        if (i === current) { t.setAttribute('aria-current', 'true'); } else { t.removeAttribute('aria-current'); }
        void bar.offsetWidth; /* restart the animation */
      });
      tabs[current].classList.add('is-active');
    }

    tabs.forEach(function (tab, i) {
      tab.querySelector('.bar i').addEventListener('animationend', function () {
        if (i === current) show(current + 1);
      });
      tab.addEventListener('click', function () { show(i); });
    });

    pauseBtn.addEventListener('click', function () {
      userPaused = !userPaused;
      pauseBtn.setAttribute('aria-pressed', String(userPaused));
      pauseBtn.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
      syncPaused();
    });

    slider.addEventListener('mouseenter', function () { hovering = true; syncPaused(); });
    slider.addEventListener('mouseleave', function () { hovering = false; syncPaused(); });
    slider.addEventListener('focusin', function () { focused = true; syncPaused(); });
    slider.addEventListener('focusout', function () { focused = false; syncPaused(); });
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(current - 1); }
      if (e.key === 'ArrowRight') { show(current + 1); }
    });

    var startX = null;
    slider.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 48) { show(current + (dx < 0 ? 1 : -1)); }
      startX = null;
    }, { passive: true });

    if (reduceMotion) { pauseBtn.setAttribute('aria-pressed', 'true'); }
    syncPaused();
    show(0);
  }

  /* ----------------------------------------------------------
     4. Pair your chai: picking a blend shows its combo
     ---------------------------------------------------------- */
  var blends = document.querySelectorAll('.blend');
  var combos = document.querySelectorAll('.pair-result .combo');

  blends.forEach(function (blend) {
    blend.addEventListener('click', function () {
      var target = Number(blend.dataset.combo);
      blends.forEach(function (b) {
        var on = b === blend;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-checked', String(on));
      });
      combos.forEach(function (c, i) {
        var on = i === target;
        c.hidden = !on;
        c.classList.toggle('is-active', on);
      });
    });
  });

  /* ----------------------------------------------------------
     5. Bestsellers: filter tabs + carousel arrows
     ---------------------------------------------------------- */
  var tabBtns = document.querySelectorAll('.tab[data-filter]');
  var products = document.querySelectorAll('#productGrid .product');

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.dataset.filter;
      tabBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      products.forEach(function (p) {
        p.hidden = !(filter === 'all' || p.dataset.cat === filter || p.dataset.cat === 'all');
      });
      var rail = document.getElementById('productGrid');
      rail.scrollTo({ left: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* carousel arrows (same as index-dark.html) */
  document.querySelectorAll('.round-btn[data-rail]').forEach(function (btn) {
    var rail = document.getElementById(btn.dataset.rail);
    btn.addEventListener('click', function () {
      rail.scrollBy({ left: Number(btn.dataset.dir) * rail.clientWidth * 0.8, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ----------------------------------------------------------
     6. Add to cart (demo only — in Shopify, replace with a POST
        to /cart/add.js and read the count from /cart.js)
     ---------------------------------------------------------- */
  var cartCount = document.getElementById('cartCount');
  var cartCountBar = document.getElementById('cartCountBar');
  var toast = document.getElementById('toast');
  var toastTimer = null;
  var count = 0;

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 2200);
  }

  document.querySelectorAll('.add-to-cart').forEach(function (btn) {
    var label = btn.textContent;
    var isIcon = btn.classList.contains('add');
    btn.addEventListener('click', function () {
      count += 1;
      cartCount.textContent = String(count);
      cartCountBar.textContent = String(count);
      cartCount.classList.remove('bump');
      void cartCount.offsetWidth; /* restart the animation */
      cartCount.classList.add('bump');

      var card = btn.closest('.product, .combo, .gift-hero');
      var nameEl = card ? card.querySelector('h3') : null;
      showToast((nameEl ? nameEl.textContent.trim() : 'Item') + ' added to cart');

      btn.textContent = isIcon ? '✓' : 'Added';
      btn.classList.add('is-added');
      setTimeout(function () { btn.textContent = label; btn.classList.remove('is-added'); }, 1300);
    });
  });

  /* ----------------------------------------------------------
     7. Phone order bar: appears once the hero has scrolled away
     ---------------------------------------------------------- */
  var orderBar = document.getElementById('orderBar');
  if (orderBar && slider && 'IntersectionObserver' in window) {
    var barLinks = orderBar.querySelectorAll('a');
    new IntersectionObserver(function (entries) {
      var on = !entries[0].isIntersecting;
      orderBar.classList.toggle('is-on', on);
      orderBar.setAttribute('aria-hidden', String(!on));
      barLinks.forEach(function (a) { a.tabIndex = on ? 0 : -1; });
    }).observe(slider);
  }

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
     9. Scroll reveal
     ---------------------------------------------------------- */
  var revealTargets = document.querySelectorAll(
    '.head, .pair-copy, .pair-result, .product, .story-photos, .story-copy, .gift-hero, .gift-list li, .bulk, .outlet, .workshop, .reel-rail li, .footer-news, .footer-cols > *'
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

    revealTargets.forEach(function (node) {
      node.classList.add('reveal');
      io.observe(node);
    });
  }
})();
