/* ShareDeal marketing site — shared behaviour */
(function () {
  // ---- Language (persisted; both languages stay in DOM for SEO) ----
  function setLang(l) {
    document.documentElement.lang = l;
    try { localStorage.setItem('sd_lang', l); } catch (e) {}
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.lang === l);
    });
  }
  var saved = (location.search.match(/lang=(en|bn)/) || [])[1] ||
    (function () { try { return localStorage.getItem('sd_lang'); } catch (e) { return null; } })() || 'en';
  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang); });
  });
  setLang(saved);

  // ---- Sticky header shadow ----
  var hdr = document.getElementById('hdr');
  if (hdr) addEventListener('scroll', function () { hdr.classList.toggle('scrolled', scrollY > 8); });

  // ---- Mobile nav ----
  var burger = document.getElementById('burger');
  if (burger) burger.addEventListener('click', function () {
    var n = document.querySelector('.navlinks');
    var open = n.style.display === 'flex';
    n.style.cssText = open ? '' :
      'display:flex;position:absolute;top:100%;left:0;right:0;background:#fff;flex-direction:column;gap:0;padding:12px 24px;border-bottom:1px solid var(--border);box-shadow:var(--shadow)';
  });

  // ---- Scroll reveal (with safety so content never stays hidden) ----
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .08 });
    reveals.forEach(function (el) { io.observe(el); });
    var revealAll = function () { reveals.forEach(function (el) { el.classList.add('in'); }); };
    setTimeout(revealAll, 900);
    addEventListener('load', revealAll);
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  var yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();

  // ---- Count-up for stat numbers (runs when scrolled into view) ----
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  function fmt(v, b) {
    var dec = +b.getAttribute('data-dec') || 0;
    var s = dec ? v.toFixed(dec) : Math.round(v).toString();
    if (b.hasAttribute('data-comma')) s = Math.round(v).toLocaleString('en-US');
    return (b.getAttribute('data-prefix') || '') + s + (b.getAttribute('data-suffix') || '');
  }
  function countUp(b) {
    var to = parseFloat(b.getAttribute('data-to'));
    if (reduce) { b.textContent = fmt(to, b); return; }
    var dur = 1500, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3); // easeOutCubic
      b.textContent = fmt(to * e, b);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('b[data-to]');
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
      }, { threshold: .4 });
      counters.forEach(function (b) { cio.observe(b); });
    } else {
      counters.forEach(function (b) { countUp(b); });
    }
  }

  // ---- Hero phone parallax tilt (desktop, motion-OK only) ----
  var hero = document.querySelector('.hero');
  var phoneCol = document.querySelector('.phone-col');
  if (hero && phoneCol && !reduce && matchMedia('(min-width:981px)').matches) {
    var raf = 0;
    hero.addEventListener('mousemove', function (ev) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var r = hero.getBoundingClientRect();
        var px = (ev.clientX - r.left) / r.width - .5;
        var py = (ev.clientY - r.top) / r.height - .5;
        phoneCol.style.transform = 'perspective(1000px) rotateY(' + (px * 7).toFixed(2) + 'deg) rotateX(' + (-py * 7).toFixed(2) + 'deg)';
      });
    });
    hero.addEventListener('mouseleave', function () { phoneCol.style.transform = ''; });
  }

  // ---- App-install modal (the funnel gate) ----
  var bd = document.getElementById('appModal');
  function openModal(name, emoji, price) {
    if (!bd) return;
    var n = bd.querySelector('[data-pm-name]'), e = bd.querySelector('[data-pm-ic]'), p = bd.querySelector('[data-pm-price]');
    if (name && n) n.textContent = name;
    if (emoji && e) e.textContent = emoji;
    if (price && p) p.textContent = price;
    bd.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() { if (bd) { bd.classList.remove('show'); document.body.style.overflow = ''; } }
  window.SDopenInstall = openModal;
  if (bd) {
    bd.addEventListener('click', function (e) { if (e.target === bd || e.target.hasAttribute('data-close')) closeModal(); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  }
  // any element with [data-install] opens the gate
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-install]');
    if (!t) return;
    e.preventDefault();
    openModal(t.getAttribute('data-name'), t.getAttribute('data-emoji'), t.getAttribute('data-price'));
  });

  // ---- Decorative QR (drawn, no dependency) ----
  document.querySelectorAll('.qr').forEach(function (box) {
    var n = 25, s = 100 / n;
    function finder(x, y) {
      return '<rect x="' + x + '" y="' + y + '" width="' + (s * 7) + '" height="' + (s * 7) + '" fill="#0f1620"/>' +
        '<rect x="' + (x + s) + '" y="' + (y + s) + '" width="' + (s * 5) + '" height="' + (s * 5) + '" fill="#fff"/>' +
        '<rect x="' + (x + s * 2) + '" y="' + (y + s * 2) + '" width="' + (s * 3) + '" height="' + (s * 3) + '" fill="#236924"/>';
    }
    var m = '';
    for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
      if ((i < 8 && j < 8) || (i < 8 && j > n - 9) || (i > n - 9 && j < 8)) continue;
      if (Math.random() > 0.56) m += '<rect x="' + (i * s).toFixed(2) + '" y="' + (j * s).toFixed(2) + '" width="' + s.toFixed(2) + '" height="' + s.toFixed(2) + '" fill="#0f1620"/>';
    }
    box.innerHTML = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#fff"/>' +
      m + finder(0, 0) + finder(100 - s * 7, 0) + finder(0, 100 - s * 7) + '</svg>';
  });

  // ---- Live countdowns ----
  document.querySelectorAll('[data-mins]').forEach(function (el) {
    el.setAttribute('data-deadline', Date.now() + (+el.getAttribute('data-mins')) * 60000);
  });
  function tick() {
    document.querySelectorAll('[data-deadline]').forEach(function (el) {
      var end = +el.getAttribute('data-deadline');
      var s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
      el.textContent = (h ? h + 'h ' : '') + m + 'm ' + (h ? '' : ss + 's');
    });
  }
  if (document.querySelector('[data-deadline]')) { tick(); setInterval(tick, 1000); }

  // ---- Simulated live activity feed (product page) ----
  var feed = document.getElementById('liveFeed');
  if (feed) {
    var names = ['Sanjida', 'Rafi', 'Nusrat', 'Tania', 'Hasan', 'Rina', 'Karim', 'Farzana', 'Imran', 'Sadia'];
    var paras = ['Dhanmondi', 'Mirpur', 'Uttara', 'Mohammadpur', 'Gulshan', 'Banani'];
    var acts = [
      ['joined the group', '👋'], ['is viewing this deal', '👀'], ['shared on WhatsApp', '📤'],
      ['joined the group', '👋'], ['saved this product', '❤️'], ['joined the group', '👋']
    ];
    function rand(a) { return a[Math.floor(Math.random() * a.length)]; }
    function push() {
      var nm = rand(names), pa = rand(paras), ac = rand(acts);
      var row = document.createElement('div');
      row.className = 'act-item';
      row.innerHTML = '<span class="av">' + nm[0] + '</span><span class="at"><b>' + nm + '</b> from ' + pa + ' <em>' + ac[0] + '</em> ' + ac[1] + '</span><span class="ax">now</span>';
      feed.insertBefore(row, feed.firstChild);
      while (feed.children.length > 6) feed.removeChild(feed.lastChild);
      feed.querySelectorAll('.ax').forEach(function (x, i) { if (i > 0) x.textContent = (i * 7 + Math.floor(Math.random() * 5)) + 's ago'; });
    }
    push(); setInterval(push, 3200);
  }
})();
