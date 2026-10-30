/* Braiin — shared site script (header/footer includes, nav, reveal, video) */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var page = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';

  function include(id, url, done) {
    var el = document.getElementById(id);
    if (!el) return;
    fetch(url).then(function (r) { return r.text(); }).then(function (html) {
      el.innerHTML = html;
      if (done) done(el);
    }).catch(function () {});
  }

  function initNav() {
    var nav = document.getElementById('navbar');
    var burger = document.getElementById('hamburger');
    var menu = document.getElementById('mobileMenu');
    if (!nav) return;

    // Active state
    nav.querySelectorAll('[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === page) { a.classList.add('is-active'); a.setAttribute('aria-current', 'page'); }
    });
    nav.querySelectorAll('[data-nav-group]').forEach(function (b) {
      if (b.getAttribute('data-nav-group').split(' ').indexOf(page) > -1) b.classList.add('is-active');
    });

    // Scroll shadow
    var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Dropdown (click / keyboard; hover handled in CSS)
    nav.querySelectorAll('[data-dd]').forEach(function (dd) {
      var btn = dd.querySelector('button');
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = !dd.classList.contains('is-open');
        dd.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
      });
      dd.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { dd.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
      });
    });
    document.addEventListener('click', function () {
      nav.querySelectorAll('[data-dd].is-open').forEach(function (dd) {
        dd.classList.remove('is-open');
        dd.querySelector('button').setAttribute('aria-expanded', 'false');
      });
    });

    // Mobile menu
    if (burger && menu) {
      var setOpen = function (open) {
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menu.classList.toggle('is-open', open);
        document.body.classList.toggle('nav-open', open);
      };
      burger.addEventListener('click', function () { setOpen(burger.getAttribute('aria-expanded') !== 'true'); });
      menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
      window.addEventListener('resize', function () { if (window.innerWidth > 1140) setOpen(false); });
    }
  }

  function initReveal(root) {
    var els = (root || document).querySelectorAll('.reveal:not(.is-in),.reveal-stagger:not(.is-in)');
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-in', 'v'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in', 'v'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  function initVideo() {
    document.querySelectorAll('[data-video]').forEach(function (wrap) {
      var v = wrap.querySelector('video');
      var overlay = wrap.querySelector('.video__overlay');
      var toggle = wrap.querySelector('[data-video-toggle]');
      var mute = wrap.querySelector('[data-video-mute]');
      var bar = wrap.querySelector('.video__bar');
      var fill = wrap.querySelector('.video__fill');
      var time = wrap.querySelector('.video__time');
      if (!v) return;
      var fmt = function (s) { s = Math.floor(s || 0); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); };
      var sync = function () {
        var playing = !v.paused && !v.ended;
        wrap.classList.toggle('is-playing', playing);
        if (toggle) {
          toggle.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
          toggle.querySelector('.i-play').style.display = playing ? 'none' : '';
          toggle.querySelector('.i-pause').style.display = playing ? '' : 'none';
        }
      };
      var play = function () { wrap.classList.add('is-started'); v.play(); };
      if (overlay) overlay.addEventListener('click', play);
      if (toggle) toggle.addEventListener('click', function () { v.paused ? play() : v.pause(); });
      if (mute) mute.addEventListener('click', function () {
        v.muted = !v.muted;
        mute.setAttribute('aria-label', v.muted ? 'Unmute' : 'Mute');
        mute.querySelector('.i-vol').style.display = v.muted ? 'none' : '';
        mute.querySelector('.i-mute').style.display = v.muted ? '' : 'none';
      });
      if (bar) bar.addEventListener('click', function (e) {
        var r = bar.getBoundingClientRect();
        if (v.duration) v.currentTime = ((e.clientX - r.left) / r.width) * v.duration;
      });
      v.addEventListener('play', sync);
      v.addEventListener('pause', sync);
      v.addEventListener('ended', sync);
      v.addEventListener('click', function () { v.paused ? play() : v.pause(); });
      v.addEventListener('timeupdate', function () {
        if (v.duration && fill) fill.style.width = (v.currentTime / v.duration * 100) + '%';
        if (time) time.textContent = fmt(v.currentTime);
      });
    });
  }

  function boot() {
    include('header-placeholder', 'header.html', initNav);
    include('footer-placeholder', 'footer.html', function (el) {
      var y = el.querySelector('[data-year]');
      if (y) y.textContent = new Date().getFullYear();
    });
    initReveal();
    initVideo();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.Braiin = { initReveal: initReveal };
})();
