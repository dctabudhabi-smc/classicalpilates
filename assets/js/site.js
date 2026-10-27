/* Roi Karpathiou - Classical Pilates | interactions */
(function () {
  'use strict';
  var root = document.documentElement;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (!hasGsap) root.classList.remove('motion');
  var motion = root.classList.contains('motion');
  var isDesktop = function () { return window.matchMedia('(min-width: 900px)').matches; };
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var touch = root.classList.contains('touch');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- split text into words ---------- */
  $$('[data-split]').forEach(function (el) {
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            var i = document.createElement('span'); i.textContent = p; w.appendChild(i);
            frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          if (n.classList.contains('w')) return;
          walk(n);
        }
      });
    };
    walk(el);
  });


  /* ---------- masonry (JS columns, keeps lazy-loading working) ---------- */
  var layoutMasonry = function () {
    $$('.masonry').forEach(function (m) {
      var cols = window.matchMedia('(min-width: 900px)').matches ? 3 : 2;
      if (m.dataset.cols === String(cols)) return;
      var items = m._items || (m._items = Array.prototype.slice.call(m.children).filter(function (c) { return !c.classList.contains('masonry__col'); }));
      items.forEach(function (it, i) { it.dataset.i = i; });
      m.innerHTML = '';
      var colEls = [], heights = [];
      for (var c = 0; c < cols; c++) { var d = document.createElement('div'); d.className = 'masonry__col'; m.appendChild(d); colEls.push(d); heights.push(0); }
      items.forEach(function (it) {
        var im = it.querySelector('img'); var r = im ? (im.getAttribute('height') / im.getAttribute('width')) : parseFloat(it.dataset.ratio || 1);
        var k = heights.indexOf(Math.min.apply(null, heights));
        colEls[k].appendChild(it); heights[k] += r;
      });
      m.dataset.cols = cols; m.classList.add('is-laid');
    });
  };
  layoutMasonry();
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastW) return; // ignore mobile toolbar show/hide
    lastW = window.innerWidth;
    clearTimeout(window._mT); window._mT = setTimeout(function () { layoutMasonry(); if (window.ScrollTrigger) ScrollTrigger.refresh(); }, 200);
  });

  /* ---------- nav ---------- */
  var nav = $('.nav');
  var lastY = null;
  var onScrollNav = function (y) {
    if (!nav) return;
    var heroH = nav.dataset.solidAfter ? parseInt(nav.dataset.solidAfter, 10) : window.innerHeight * 0.6;
    var solid = y > heroH - 80;
    if (solid !== lastY) { nav.classList.toggle('is-solid', solid); lastY = solid; }
  };

  /* ---------- progress ---------- */
  var progress = $('.progress');
  var onScrollProgress = function (y) {
    if (!progress) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0).toFixed(4) + ')';
  };

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (motion && window.Lenis && !touch) {
    lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    lenis.on('scroll', function (e) { ScrollTrigger.update(); onScrollNav(e.scroll); onScrollProgress(e.scroll); });
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  } else {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { ticking = false; onScrollNav(window.scrollY); onScrollProgress(window.scrollY); });
    }, { passive: true });
  }
  onScrollNav(window.scrollY);

  /* in-page anchors */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = $(id); if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -60 }); else t.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- menu ---------- */
  var menu = $('.menu'), burger = $('.burger');
  var menuTl = null;
  if (menu && burger) {
    var links = $$('.menu__list li a', menu);
    if (motion) {
      menuTl = gsap.timeline({ paused: true })
        .set(menu, { visibility: 'visible' })
        .to(menu, { clipPath: 'circle(150% at calc(100% - 45px) 40px)', duration: 0.9, ease: 'power3.inOut' })
        .from(links, { yPercent: 110, duration: 0.8, stagger: 0.06, ease: 'power3.out' }, '-=0.45')
        .from('.menu__foot', { opacity: 0, y: 20, duration: 0.6 }, '-=0.5');
    }
    var setMenu = function (open) {
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (menuTl) { open ? menuTl.timeScale(1).play() : menuTl.timeScale(1.6).reverse(); }
      else { menu.style.visibility = open ? 'visible' : 'hidden'; menu.style.clipPath = open ? 'none' : ''; }
      if (lenis) open ? lenis.stop() : lenis.start();
    };
    burger.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false); });
  }

  /* ---------- lightbox ---------- */
  (function () {
    var groups = {};
    $$('[data-lightbox]').forEach(function (a) {
      var g = a.getAttribute('data-lightbox');
      (groups[g] = groups[g] || []).push(a);
    });
    Object.keys(groups).forEach(function (g) { groups[g].sort(function (a, b) { return (+a.dataset.i || 0) - (+b.dataset.i || 0); }); });
    if (!Object.keys(groups).length) return;
    var lb = document.createElement('div');
    lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML = '<span class="lb__count"></span><img class="lb__img" alt=""><button class="lb__btn lb__close" aria-label="Close">&times;</button><button class="lb__btn lb__prev" aria-label="Previous">&#8592;</button><button class="lb__btn lb__next" aria-label="Next">&#8594;</button>';
    document.body.appendChild(lb);
    var img = $('.lb__img', lb), count = $('.lb__count', lb), cur = [], idx = 0, lastFocus = null, token = 0;
    var cache = {};
    var load = function (src) {
      if (!cache[src]) {
        cache[src] = new Promise(function (res) {
          var im = new Image();
          im.decoding = 'async';
          im.onload = function () { (im.decode ? im.decode() : Promise.resolve()).then(res, res); };
          im.onerror = res;
          im.src = src;
        });
      }
      return cache[src];
    };
    var srcAt = function (i) { return cur[(i + cur.length) % cur.length].getAttribute('href'); };
    var preloadAround = function () { if (cur.length > 1) { load(srcAt(idx + 1)); load(srcAt(idx - 1)); } };
    var show = function (i, dir) {
      idx = (i + cur.length) % cur.length;
      var a = cur[idx], src = a.getAttribute('href'), my = ++token;
      count.textContent = (idx + 1) + ' / ' + cur.length;
      var out = motion && dir ? gsap.to(img, { opacity: 0, x: -40 * dir, duration: 0.2, ease: 'power2.in' }) : null;
      Promise.all([load(src), out ? new Promise(function (r) { out.eventCallback('onComplete', r); }) : Promise.resolve()]).then(function () {
        if (my !== token) return; // a newer swipe happened
        img.src = src; img.alt = (a.querySelector('img') || {}).alt || '';
        if (motion) gsap.fromTo(img, { opacity: 0, x: dir ? 40 * dir : 0, scale: dir ? 1 : 0.96 }, { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: 'power3.out', overwrite: true });
        else img.style.opacity = 1;
        preloadAround();
      });
    };
    var open = function (g, i) {
      cur = groups[g]; lastFocus = document.activeElement;
      img.removeAttribute('src'); if (motion) gsap.set(img, { opacity: 0, x: 0 }); else img.style.opacity = 0;
      lb.classList.add('is-open'); show(i, 0);
      if (lenis) lenis.stop(); document.body.style.overflow = 'hidden';
      $('.lb__close', lb).focus({ preventScroll: true });
    };
    var close = function () {
      lb.classList.remove('is-open'); if (lenis) lenis.start(); document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    };
    Object.keys(groups).forEach(function (g) {
      groups[g].forEach(function (a, i) { a.addEventListener('click', function (e) { e.preventDefault(); open(g, i); }); });
    });
    $('.lb__close', lb).addEventListener('click', close);
    $('.lb__prev', lb).addEventListener('click', function () { show(idx - 1, -1); });
    $('.lb__next', lb).addEventListener('click', function () { show(idx + 1, 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(idx + 1, 1);
      if (e.key === 'ArrowLeft') show(idx - 1, -1);
    });
    var sx = null, dx = 0;
    lb.addEventListener('touchstart', function (e) { if (e.touches.length !== 1) return; sx = e.touches[0].clientX; dx = 0; }, { passive: true });
    lb.addEventListener('touchmove', function (e) {
      if (sx === null) return; dx = e.touches[0].clientX - sx;
      img.style.transform = 'translate3d(' + dx + 'px,0,0)'; img.style.opacity = String(1 - Math.min(Math.abs(dx) / 400, 0.5));
    }, { passive: true });
    lb.addEventListener('touchend', function () {
      if (sx === null) return; sx = null;
      if (Math.abs(dx) > 50) { var d = dx < 0 ? 1 : -1; if (motion) gsap.set(img, { x: dx, opacity: img.style.opacity }); else img.style.transform = ''; show(idx + d, d); }
      else if (motion) { gsap.set(img, { x: dx }); gsap.to(img, { x: 0, opacity: 1, duration: 0.3 }); } else { img.style.transform = ''; img.style.opacity = ''; }
      dx = 0;
    });
  })();


  /* ---------- format toggle (weekends / intensive) ---------- */
  $$('.fmt').forEach(function (f) {
    $$('.fmt__btn', f).forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.dataset.set; if (f.dataset.format === v) return;
        f.dataset.format = v;
        $$('.fmt__btn', f).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        if (window.gsap && root.classList.contains('motion')) {
          gsap.fromTo($$('[data-show="' + v + '"]', f), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.03, ease: 'power3.out' });
          $$('.path', f).forEach(function (pth) { if (pth._play) pth._play(); });
        }
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      });
    });
  });


  /* ---------- biography dialogs (CSS-driven, GPU transforms only) ---------- */
  $$('.bio-open').forEach(function (btn) {
    var dlg = document.getElementById(btn.dataset.dialog);
    if (!dlg || typeof dlg.showModal !== 'function') return;
    var inner = $('.bio__inner', dlg), bt = $('.bio__text', dlg), closing = false;
    var pic = $('.bio__img img', dlg);
    // warm the photo as soon as the presenter card is near the screen
    if ('IntersectionObserver' in window && pic) {
      var warm = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { if (pic.decode) pic.decode().catch(function () {}); warm.disconnect(); } }, { rootMargin: '400px' });
      warm.observe(btn);
    }
    var finish = function () { dlg.classList.remove('is-out'); dlg.close(); };
    var close = function () {
      if (closing || !dlg.open) return; closing = true;
      dlg.classList.remove('is-in'); dlg.classList.add('is-out');
      var done = false, end = function () { if (done) return; done = true; finish(); };
      inner.addEventListener('transitionend', function te(e) { if (e.target === inner) { inner.removeEventListener('transitionend', te); end(); } });
      setTimeout(end, 520);
    };
    btn.addEventListener('click', function () {
      closing = false;
      bt.scrollTop = 0;
      root.classList.add('modal-open'); if (lenis) lenis.stop();
      dlg.showModal();
      $('.bio__close', dlg).focus({ preventScroll: true });
      bt.scrollTop = 0;
      // two frames so the closed state paints first, then the sheet glides in
      requestAnimationFrame(function () { requestAnimationFrame(function () { dlg.classList.add('is-in'); }); });
    });
    // the presenter photo opens the same biography
    var card = btn.closest('.trainer'), photo = card && $('.trainer__img', card);
    if (photo) photo.addEventListener('click', function () { btn.click(); });
    $('.bio__close', dlg).addEventListener('click', close);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    dlg.addEventListener('close', function () {
      dlg.classList.remove('is-in', 'is-out');
      root.classList.remove('modal-open'); if (lenis) lenis.start();
      btn.focus({ preventScroll: true });
    });
  });


  /* ---------- conference day tabs ---------- */
  $$('[data-days]').forEach(function (w) {
    var tabs = $$('[role="tab"]', w);
    w.dataset.active = '1';
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        if (t.getAttribute('aria-selected') === 'true') return;
        tabs.forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
        w.dataset.active = String(i + 1);
        $$('[role="tabpanel"]', w).forEach(function (p) { p.hidden = p.id !== t.getAttribute('aria-controls'); });
        var p = $('#' + t.getAttribute('aria-controls'));
        var items = $$('.masonry__col > *', p);
        if (window.gsap && root.classList.contains('motion')) gsap.fromTo(items, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.05, ease: 'power3.out', overwrite: true });
        else items.forEach(function (it) { it.style.opacity = 1; it.style.transform = 'none'; });
        if (window.ScrollTrigger) ScrollTrigger.refresh();
        // if the reader is deep in the grid, bring the new day's first photos into view
        var navH = nav ? nav.offsetHeight : 0, top = w.getBoundingClientRect().top;
        if (top < navH) {
          var y = window.scrollY + top - navH - 10;
          if (lenis) lenis.scrollTo(y, { duration: 0.9 }); else window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    });

    /* keep the day switch within reach while browsing the photos:
       desktop - the switch is sticky under the header (CSS);
       mobile - a compact floating copy appears at the bottom, thumb-height, only while the grid is on screen */
    var sw = $('.days__switch', w);
    if (!sw) return;
    var fl = sw.cloneNode(true);
    fl.className = 'days__switch days__float'; fl.removeAttribute('role'); fl.removeAttribute('aria-label'); fl.removeAttribute('data-reveal'); fl.removeAttribute('style');
    fl.setAttribute('aria-hidden', 'true');
    var fbtns = $$('.days__btn', fl);
    fbtns.forEach(function (b, i) {
      b.removeAttribute('id'); b.removeAttribute('role'); b.removeAttribute('aria-controls'); b.tabIndex = -1;
      b.addEventListener('click', function () { tabs[i].click(); });
    });
    document.body.appendChild(fl); // outside any transformed parent so position: fixed holds
    var sync = function () { fl.dataset.active = w.dataset.active; fbtns.forEach(function (b, i) { b.setAttribute('aria-selected', tabs[i].getAttribute('aria-selected')); }); };
    sync();
    tabs.forEach(function (t) { t.addEventListener('click', sync); });
    var mq = window.matchMedia('(min-width: 900px)'), ticking = false;
    var check = function () {
      ticking = false;
      var navH = nav ? nav.offsetHeight : 0, vh = window.innerHeight;
      var r = w.getBoundingClientRect(), sr = sw.getBoundingClientRect();
      sw.classList.toggle('is-stuck', mq.matches && r.top < navH + 14 && r.bottom > navH + 120);
      fl.classList.toggle('is-on', !mq.matches && sr.bottom < navH && r.bottom > vh * 0.55);
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(check); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    check();
  });


  /* ---------- video popup ---------- */
  $$('[data-video-open]').forEach(function (btn) {
    var dlg = document.getElementById(btn.dataset.videoOpen);
    if (!dlg || typeof dlg.showModal !== 'function') return;
    var v = $('video', dlg), inner = $('.vmodal__inner', dlg);
    if (dlg.dataset.bound) { btn.addEventListener('click', function () { dlg._open(btn); }); return; }
    dlg.dataset.bound = '1';
    var last = null;
    var close = function () {
      v.pause();
      if (window.gsap && root.classList.contains('motion')) gsap.to(inner, { opacity: 0, scale: 0.94, duration: 0.3, ease: 'power2.in', onComplete: function () { dlg.close(); } });
      else dlg.close();
    };
    dlg._open = function (from) {
      last = from; dlg.showModal(); if (lenis) lenis.stop();
      $('.vmodal__close', dlg).focus({ preventScroll: true });
      if (window.gsap && root.classList.contains('motion')) gsap.fromTo(inner, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' });
      try { v.currentTime = 0; } catch (e) {}
      var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
    };
    btn.addEventListener('click', function () { dlg._open(btn); });
    $('.vmodal__close', dlg).addEventListener('click', close);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    dlg.addEventListener('close', function () { v.pause(); if (lenis) lenis.start(); if (window.gsap) gsap.set(inner, { clearProps: 'all' }); if (last) last.focus({ preventScroll: true }); });
  });

  /* ---------- tabs (repertoire) ---------- */
  $$('[data-tabs]').forEach(function (wrap) {
    var tabs = $$('[role="tab"]', wrap);
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
        $$('[role="tabpanel"]', wrap).forEach(function (p) { p.hidden = p.id !== t.getAttribute('aria-controls'); });
        var p = $('#' + t.getAttribute('aria-controls'));
        if (motion && p) gsap.fromTo($$('li', p).slice(0, 60), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.012, ease: 'power2.out' });
        if (hasGsap) ScrollTrigger.refresh();
      });
    });
  });

  /* ---------- videos ---------- */
  $$('.vid').forEach(function (v) {
    var video = $('video', v), btn = $('.vid__btn', v);
    if (!video || !btn) return;
    btn.addEventListener('click', function () { video.controls = true; video.muted = false; video.play(); v.classList.add('is-playing'); });
  });
  // autoplay background videos only when visible
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var vd = e.target; if (e.isIntersecting) { var p = vd.play(); if (p && p.catch) p.catch(function () {}); } else vd.pause(); });
    }, { threshold: 0.05 });
    $$('video[data-autoplay]').forEach(function (vd) { vd.muted = true; io.observe(vd); });
  }

  if (!motion) { $$('.loader').forEach(function (l) { l.classList.add('is-done'); }); return; }

  /* =================== GSAP motion =================== */
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });
  ScrollTrigger.config({ ignoreMobileResize: true, autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load' });

  var splitIn = function (el, delay) {
    return gsap.to($$('.w > span', el), { yPercent: 0, y: 0, duration: 1.1, stagger: 0.045, ease: 'power4.out', delay: delay || 0 });
  };

  /* hero entrance */
  var heroIn = function () {
    var hero = $('.hero, .phero');
    if (!hero) return;
    var media = $('.hero__media img, .hero__media video, .phero__media img, .phero__media video', hero);
    var tl = gsap.timeline();
    if (media) tl.to(media, { scale: 1, duration: 2.4, ease: 'power2.out' }, 0);
    $$('[data-split]', hero).forEach(function (el, i) {
      tl.to($$('.w > span', el), { y: 0, yPercent: 0, duration: 1.2, stagger: 0.06, ease: 'power4.out' }, 0.25 + i * 0.15);
    });
    var rv = $$('[data-reveal]', hero);
    if (rv.length) tl.to(rv, { opacity: 1, y: 0, duration: 1, stagger: 0.12 }, 0.7);
    $$('[data-split], [data-reveal]', hero).forEach(function (el) { el.dataset.done = '1'; });
    // gentle background parallax on desktop only
    if (media && !touch) gsap.to(media, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  };

  /* loader (home, once per session) */
  var loader = $('.loader');
  var seen = false;
  try { seen = sessionStorage.getItem('rk-intro') === '1'; } catch (e) {}
  if (loader && !seen) {
    if (lenis) lenis.stop();
    var lt = gsap.timeline({ onComplete: function () { loader.classList.add('is-done'); if (lenis) lenis.start(); try { sessionStorage.setItem('rk-intro', '1'); } catch (e) {} } });
    lt.to($('img', loader), { opacity: 1, duration: 0.7, ease: 'power2.out' })
      .to($('.loader__bar i', loader), { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, 0.1)
      .to($('img', loader), { y: -16, opacity: 0, duration: 0.45, ease: 'power2.in' }, '+=0.05')
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 0.85, ease: 'power4.inOut' }, '-=0.2')
      .add(heroIn, '-=0.55');
  } else {
    if (loader) loader.classList.add('is-done');
    heroIn();
  }

  /* generic reveals */
  ScrollTrigger.batch('[data-reveal]:not([data-done])', {
    start: 'top 88%', once: true,
    onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12, overwrite: true }); }
  });
  $$('[data-split]:not([data-done])').forEach(function (el) {
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: function () { splitIn(el); } });
  });
  $$('[data-stagger]').forEach(function (el) {
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: function () {
      var kids = el.classList.contains('is-laid') ? $$('.masonry__col > *', el) : el.children; gsap.to(kids, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 });
    } });
  });
  $$('[data-img]').forEach(function (el) {
    var im = $('img, video', el);
    var tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    if (touch) {
      tl.to(el, { opacity: 1, duration: 0.9, ease: 'power2.out' });
      if (im) tl.to(im, { scale: 1, duration: 1.4, ease: 'power3.out' }, 0);
    } else {
      tl.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'power4.inOut' });
      if (im) tl.to(im, { scale: 1, duration: 1.8, ease: 'power3.out' }, 0);
    }
  });

  /* parallax */
  if (!touch) $$('[data-speed]').forEach(function (el) {
    var s = parseFloat(el.dataset.speed) || 0.1;
    gsap.fromTo(el, { yPercent: -s * 100 }, { yPercent: s * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* counters */
  $$('[data-count]').forEach(function (el) {
    var end = parseFloat(el.dataset.count), o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: function () {
      gsap.to(o, { v: end, duration: 2, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v) + (el.dataset.suffix || ''); } });
    } });
  });

  /* marquee driven by scroll velocity */
  $$('.marquee__track').forEach(function (track) {
    var items = track.innerHTML; track.innerHTML = items + items;
    var x = 0, dir = -1, base = parseFloat(track.dataset.speed || '0.6');
    var w = function () { return track.scrollWidth / 2; };
    var vel = 0;
    ScrollTrigger.create({ trigger: track, start: 'top bottom', end: 'bottom top', onUpdate: function (self) { vel = self.getVelocity() / 300; dir = self.direction === 1 ? -1 : 1; } });
    gsap.ticker.add(function () {
      x += (base + Math.min(Math.abs(vel), 8)) * dir;
      vel *= 0.92;
      var W = w(); if (x <= -W) x += W; if (x > 0) x -= W;
      track.style.transform = 'translate3d(' + x + 'px,0,0)';
    });
  });

  /* horizontal pinned scroller (desktop) */
  var mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', function () {
    $$('[data-hpin]').forEach(function (sec) {
      var sc = $('.hscroll', sec), track = $('.hscroll__track', sec);
      if (!sc || !track) return;
      sc.classList.add('is-pinned');
      var dist = function () { return Math.max(0, track.scrollWidth - sc.clientWidth + 40); };
      var tw = gsap.to(track, { x: function () { return -dist(); }, ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true } });
      return function () { sc.classList.remove('is-pinned'); tw.kill(); gsap.set(track, { x: 0 }); };
    });
  });

  /* module path: line draws, dots pop in sequence */
  $$('.path').forEach(function (pth) {
    var line = $('.path__line', pth), dots = $$('.path__step i', pth), labels = $$('.path__step b, .path__step > span', pth);
    var exam = $('.path__step.exam i', pth);
    pth._play = function () {
      var tl = gsap.timeline();
      tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, 0);
      dots.forEach(function (d, i) {
        tl.fromTo(d, { scale: 0 }, { scale: 1, duration: 0.55, ease: 'back.out(2.6)' }, 0.1 + i * 0.4);
      });
      tl.fromTo(labels, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }, 0.2);
      if (exam) tl.fromTo(exam, { boxShadow: '0 0 0 0 rgba(181,61,198,.6)' }, { boxShadow: '0 0 0 12px rgba(181,61,198,0)', duration: 1, ease: 'power2.out' }, 1.5);
      return tl;
    };
    gsap.set(dots, { scale: 0 }); gsap.set(line, { scaleX: 0 });
    ScrollTrigger.create({ trigger: pth, start: 'top 88%', once: true, onEnter: function () { pth._play(); } });
  });

  /* journey line */
  $$('.journey').forEach(function (j) {
    var line = $('.journey__line', j);
    if (line) gsap.to(line, { height: 'calc(100% - 16px)', ease: 'none', scrollTrigger: { trigger: j, start: 'top 70%', end: 'bottom 70%', scrub: true } });
  });

  /* collage drift */
  /* collage: each photo slides into place as the section scrolls in */
  $$('.collage').forEach(function (col) {
    var from = [{ x: -70, y: 90 }, { x: 70, y: 140 }, { x: 60, y: 160 }, { x: -60, y: 200 }];
    var tl = gsap.timeline({ scrollTrigger: { trigger: col, start: 'top 95%', end: touch ? 'center 55%' : 'center 50%', scrub: touch ? 0.6 : 1 } });
    $$(':scope > *', col).forEach(function (c, i) {
      var f = from[i % from.length], im = $('img', c);
      tl.fromTo(c, { x: touch ? f.x * 0.5 : f.x, y: f.y, opacity: 0, clipPath: 'inset(18% 0 0 0)' }, { x: 0, y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', ease: 'power2.out', duration: 1 }, i * 0.18);
      if (im) tl.fromTo(im, { scale: 1.25 }, { scale: 1, ease: 'power2.out', duration: 1.2 }, i * 0.18);
    });
  });

  /* conference band zoom */
  $$('.conf').forEach(function (c) {
    var v = $('.conf__video video, .conf__video img', c);
    if (v && !touch) gsap.fromTo(v, { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'center center', scrub: true } });
  });

  /* magnetic buttons (desktop pointers only) */
  if (finePointer) {
    $$('.btn, .burger, .social a').forEach(function (b) {
      var xTo = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'power3' }), yTo = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'power3' });
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.25); yTo((e.clientY - r.top - r.height / 2) * 0.35); });
      b.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
    });
  }

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
