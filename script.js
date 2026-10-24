/* ================================================================
   ELLIE'S HAIR BAR — vanilla JS
   nav transition · scrollspy · reveals · lightbox · reviews slider
   ================================================================ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------- navbar: transparent → solid ---------------- */
  var nav = $('#mainNav');
  function onScroll () { nav.classList.toggle('solid', window.scrollY > 50); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- scrollspy ---------------- */
  var spyLinks = $$('[data-spy]');
  var spyMap = {};
  spyLinks.forEach(function (l) { spyMap[l.getAttribute('data-spy')] = l; });
  var spyObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var link = spyMap[e.target.id];
      if (link && e.isIntersecting) {
        spyLinks.forEach(function (l) { l.classList.remove('active'); });
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-38% 0px -57% 0px' });
  ['about', 'services', 'gallery', 'reviews', 'contact'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) spyObs.observe(el);
  });

  /* ---------------- fade-in on scroll ---------------- */
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal]').forEach(function (el) { revealObs.observe(el); });

  /* ---------------- gallery lightbox (pure vanilla) ---------------- */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCount = $('#lbCount');
  var items = $$('.g-item');
  var data = items.map(function (f) {
    var img = $('img', f);
    return { src: img.src, alt: img.alt || f.getAttribute('data-alt') };
  });
  var lbIndex = 0;

  function show (i) {
    lbIndex = (i + data.length) % data.length;
    lbImg.src = data[lbIndex].src;
    lbImg.alt = data[lbIndex].alt;
    lbCount.textContent = (lbIndex + 1) + ' / ' + data.length;
  }
  function open (i) {
    show(i);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lb-lock');
    $('.lb-close').focus();
  }
  function close () {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lb-lock');
  }
  items.forEach(function (f, i) {
    f.addEventListener('click', function () { open(i); });
    f.setAttribute('tabindex', '0');
    f.setAttribute('role', 'button');
    f.setAttribute('aria-label', 'View image: ' + data[i].alt);
    f.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });
  $('.lb-close').addEventListener('click', close);
  $('.lb-next').addEventListener('click', function () { show(lbIndex + 1); });
  $('.lb-prev').addEventListener('click', function () { show(lbIndex - 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(lbIndex + 1);
    if (e.key === 'ArrowLeft') show(lbIndex - 1);
  });
  var swX = null;
  lb.addEventListener('touchstart', function (e) { swX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (swX === null) return;
    var dx = e.changedTouches[0].clientX - swX;
    if (dx < -50) show(lbIndex + 1);
    else if (dx > 50) show(lbIndex - 1);
    swX = null;
  }, { passive: true });

  /* ---------------- reviews: dot slider on mobile, static 3-up on desktop ---------------- */
  var track = $('#revTrack'), viewport = $('#revViewport'), dotsWrap = $('#revDots');
  var cards = $$('.rev-card', track);
  var rr = { index: 0 };
  var isSlider = window.matchMedia('(max-width: 767.98px)');

  /* build dots */
  cards.forEach(function (_, i) {
    var b = document.createElement('button');
    b.setAttribute('aria-label', 'Go to review ' + (i + 1));
    b.addEventListener('click', function () { go(i); });
    dotsWrap.appendChild(b);
  });
  var dots = $$('button', dotsWrap);

  function paint () {
    track.style.transform = isSlider.matches ? 'translateX(' + (-rr.index * 100) + '%)' : 'none';
    dots.forEach(function (d, i) { d.classList.toggle('on', i === rr.index); });
  }
  function go (i) {
    rr.index = (i + cards.length) % cards.length;
    paint();
  }
  /* keep transforms in sync when crossing breakpoint */
  try { isSlider.addEventListener('change', paint); } catch (e) {}

  /* swipe on mobile */
  var rvX = null;
  viewport.addEventListener('pointerdown', function (e) { rvX = e.clientX; });
  viewport.addEventListener('pointerup', function (e) {
    if (rvX === null) return;
    var dx = e.clientX - rvX;
    if (isSlider.matches && dx < -40) go(rr.index + 1);
    else if (isSlider.matches && dx > 40) go(rr.index - 1);
    rvX = null;
  });

  paint();
})();
