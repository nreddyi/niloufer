/* Café Niloufer — "dark storefront" homepage scripts (no dependencies) */
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
     2. Hero height: screen height minus everything above the hero
     (ticker + header + category tabs)
     ---------------------------------------------------------- */
  var slider = document.getElementById('heroSlider');

  function setChromeHeight() {
    if (!slider) return;
    var top = slider.getBoundingClientRect().top + window.scrollY;
    root.style.setProperty('--chrome-h', Math.round(top) + 'px');
  }
  setChromeHeight();
  window.addEventListener('resize', setChromeHeight);
  window.addEventListener('load', setChromeHeight);

  /* ----------------------------------------------------------
     3. Search: rotating placeholder
     ---------------------------------------------------------- */
  var searchInput = document.getElementById('searchInput');
  var searchTerms = ['tea powder', 'Osmania biscuits', 'gift hampers', 'chai biscuit combos', 'fruit biscuits'];

  if (searchInput && !reduceMotion) {
    var term = 0, pos = 0, deleting = false;
    (function type() {
      var word = searchTerms[term];
      if (document.activeElement !== searchInput) {
        pos += deleting ? -1 : 1;
        searchInput.placeholder = 'Search for ' + word.slice(0, pos);
      }
      var wait = deleting ? 45 : 95;
      if (!deleting && pos >= word.length) { deleting = true; wait = 1600; }
      else if (deleting && pos <= 0) { deleting = false; term = (term + 1) % searchTerms.length; wait = 350; }
      setTimeout(type, wait);
    })();
  }

  /* ----------------------------------------------------------
     4. Hero carousel
     Autoplays every 6s; pauses on hover / focus / pause button;
     arrows, dots, keyboard and swipe.
     ---------------------------------------------------------- */
  if (slider) {
    var slides = slider.querySelectorAll('.slide');
    var dots = slider.querySelectorAll('.dot');
    var pauseBtn = document.getElementById('sliderPause');
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

    slider.querySelectorAll('.hero-arrow').forEach(function (btn) {
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
     5. Carousel arrows (bestsellers)
     ---------------------------------------------------------- */
  document.querySelectorAll('.round-btn[data-rail]').forEach(function (btn) {
    var rail = document.getElementById(btn.dataset.rail);
    btn.addEventListener('click', function () {
      rail.scrollBy({ left: Number(btn.dataset.dir) * rail.clientWidth * 0.8, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ----------------------------------------------------------
     6. Drawers (menu + cart)
     ---------------------------------------------------------- */
  var overlay = document.getElementById('overlay');
  var openDrawer = null;
  var lastFocus = null;

  function open(drawer) {
    if (openDrawer) close();
    lastFocus = document.activeElement;
    openDrawer = drawer;
    drawer.hidden = false;
    overlay.hidden = false;
    document.body.classList.add('is-locked');
    /* next frame so the slide-in transition runs */
    requestAnimationFrame(function () {
      drawer.classList.add('is-open');
      overlay.classList.add('is-open');
      var first = drawer.querySelector('[data-close]');
      if (first) first.focus();
    });
  }

  function close() {
    if (!openDrawer) return;
    var drawer = openDrawer;
    openDrawer = null;
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    setTimeout(function () {
      if (openDrawer !== drawer) drawer.hidden = true;
      if (!openDrawer) overlay.hidden = true;
    }, reduceMotion ? 0 : 320);
    if (lastFocus) lastFocus.focus();
  }

  var menuDrawer = document.getElementById('menuDrawer');
  var cartDrawer = document.getElementById('cartDrawer');
  document.getElementById('menuOpen').addEventListener('click', function () { open(menuDrawer); });
  document.getElementById('cartOpen').addEventListener('click', function () { open(cartDrawer); });
  overlay.addEventListener('click', close);
  document.querySelectorAll('[data-close]').forEach(function (btn) { btn.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
    /* keep Tab inside the open drawer */
    if (e.key === 'Tab' && openDrawer) {
      var focusables = openDrawer.querySelectorAll('a[href], button:not([disabled])');
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ----------------------------------------------------------
     7. Cart (demo only, kept in memory — in Shopify, replace with
        /cart/add.js, /cart/change.js and /cart.js)
     ---------------------------------------------------------- */
  var cart = [];  /* [{ name, price, qty }] */
  var cartCount = document.getElementById('cartCount');
  var cartLines = document.getElementById('cartLines');
  var cartEmpty = document.getElementById('cartEmpty');
  var cartTotal = document.getElementById('cartTotal');

  function rupees(n) { return '₹' + n.toLocaleString('en-IN'); }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderCart() {
    var count = 0, total = 0;
    cartLines.textContent = '';

    cart.forEach(function (item, index) {
      count += item.qty;
      total += item.qty * item.price;

      var line = el('li', 'cart-line');
      line.appendChild(el('span', 'cart-line-name', item.name));
      line.appendChild(el('span', 'cart-line-price', rupees(item.price * item.qty)));

      var qty = el('div', 'qty');
      var minus = el('button', '', '−');
      minus.setAttribute('aria-label', 'Decrease quantity of ' + item.name);
      minus.addEventListener('click', function () { changeQty(index, -1); });
      var plus = el('button', '', '+');
      plus.setAttribute('aria-label', 'Increase quantity of ' + item.name);
      plus.addEventListener('click', function () { changeQty(index, 1); });
      qty.appendChild(minus);
      qty.appendChild(el('span', '', String(item.qty)));
      qty.appendChild(plus);
      line.appendChild(qty);

      var remove = el('button', 'cart-remove', 'Remove');
      remove.setAttribute('aria-label', 'Remove ' + item.name);
      remove.addEventListener('click', function () { changeQty(index, -item.qty); });
      line.appendChild(remove);

      cartLines.appendChild(line);
    });

    cartEmpty.hidden = cart.length > 0;
    cartTotal.textContent = rupees(total);
    cartCount.textContent = String(count);
  }

  function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    renderCart();
  }

  document.querySelectorAll('.add-to-cart').forEach(function (btn) {
    var label = btn.textContent;
    btn.addEventListener('click', function () {
      var name = btn.dataset.name;
      var existing = cart.filter(function (i) { return i.name === name; })[0];
      if (existing) { existing.qty += 1; } else { cart.push({ name: name, price: Number(btn.dataset.price), qty: 1 }); }
      renderCart();

      cartCount.classList.remove('bump');
      void cartCount.offsetWidth; /* restart the animation */
      cartCount.classList.add('bump');

      btn.textContent = 'Added';
      btn.classList.add('is-added');
      setTimeout(function () { btn.textContent = label; btn.classList.remove('is-added'); }, 1200);

      open(cartDrawer);
    });
  });

  renderCart();

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
    '.head, .tagline h2, .grid .card, .brand-media, .brand-copy, .event, .tile, .outlets li, .big-links li, .footer-cols > *'
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
