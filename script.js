// =====================================================
// Shared settings
// =====================================================
const WHATSAPP_NUMBER = '917887906179';      // country code + number, no + or spaces
const CONTACT = {
  name: 'Nikhil Malviya',
  org: 'Malviya Consultancy',
  title: 'Financial Advisor',
  phone: '+917887906179',
  email: 'nikhilmalviya997@gmail.com',
  address: 'M.B. Estate, Virar West, Palghar, Maharashtra 401303'
};

// =====================================================
// Premium estimator (illustrative formula only, not real LIC rates)
// =====================================================
function estimate() {
  const out = document.getElementById('out');
  if (!out) return;                                         // not on this page
  const age = Math.min(65, Math.max(18, +document.getElementById('age').value || 30));
  const cover = +document.getElementById('cov').value;      // in lakh
  const term = Math.min(40, Math.max(10, +document.getElementById('term').value || 30));
  const rate = (0.35 + Math.max(0, age - 25) * 0.035) * (1 + (term - 20) * 0.004);
  const premium = Math.round(cover * 100 * rate / 10) * 10;
  out.textContent = '₹' + premium.toLocaleString('en-IN') + ' / year';
}

// =====================================================
// Contact form -> opens WhatsApp with a prefilled message
// =====================================================
function sendRequest() {
  const name = document.getElementById('n').value.trim();
  const phone = document.getElementById('p').value.trim();
  const interest = document.getElementById('i').value;
  const msg = document.getElementById('msg');
  const digits = phone.replace(/\D/g, '');
  if (!name || digits.length < 10) {
    msg.textContent = 'Please enter your name and a valid 10-digit mobile number.';
    return;
  }
  msg.textContent = 'Opening WhatsApp…';
  const text = `Hi Nikhil, I’m ${name} (${phone}). I’m interested in ${interest}.`;
  window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

(function () {
  const estBtn = document.getElementById('estBtn');
  const sendBtn = document.getElementById('sendBtn');
  if (estBtn) {
    estBtn.addEventListener('click', estimate);
    ['age', 'cov', 'term'].forEach(id => document.getElementById(id).addEventListener('input', estimate));
    estimate();
  }
  if (sendBtn) sendBtn.addEventListener('click', sendRequest);
})();

// =====================================================
// Digital card – Save contact (.vcf) and WhatsApp
// =====================================================
(function () {
  const save = document.getElementById('saveContact');
  const wa = document.getElementById('dcWhats');
  if (wa) {
    wa.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi Nikhil, I’d like to know more about LIC plans.')}`;
    wa.target = '_blank';
    wa.rel = 'noopener';
  }
  if (!save) return;
  save.addEventListener('click', () => {
    const c = CONTACT;
    const vcf = [
      'BEGIN:VCARD', 'VERSION:3.0',
      `FN:${c.name}`, `N:Malviya;Nikhil;;;`,
      `ORG:${c.org}`, `TITLE:${c.title}`,
      `TEL;TYPE=CELL:${c.phone}`, `EMAIL:${c.email}`,
      `ADR;TYPE=WORK:;;${c.address.replace(/,/g, '\\,')};;;;`,
      'END:VCARD'
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([vcf], { type: 'text/vcard' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'Nikhil-Malviya.vcf';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
})();

// =====================================================
// Plan carousel (home) – duplicate the cards once for a seamless loop
// =====================================================
(function () {
  const track = document.querySelector('.mq-track');
  if (!track || track.dataset.cloned) return;
  track.dataset.cloned = '1';
  Array.from(track.children).forEach(card => {
    const copy = card.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    copy.querySelectorAll('a').forEach(a => { a.tabIndex = -1; });
    track.appendChild(copy);
  });
})();

// =====================================================
// Hero typewriter animation
// =====================================================
(function () {
  if (!document.getElementById('typeLine1')) return;   // not on this page
  const parts = [
    { el: document.getElementById('typeLine1'), text: 'Plan Today.' },
    { el: document.getElementById('typeLine2'), text: 'Live Better' },
    { el: document.getElementById('typeLine3'), text: 'Tomorrow.' }
  ];
  const hero = document.querySelector('.hero-bg');
  let p = 0, i = 0;

  function type() {
    document.querySelectorAll('.cursor').forEach(e => e.classList.remove('cursor'));
    if (p >= parts.length) {
      if (hero) hero.classList.add('ready');
      return;
    }
    const part = parts[p];
    part.el.classList.add('cursor');
    if (i < part.text.length) {
      part.el.textContent += part.text.charAt(i++);
      setTimeout(type, 70);          // typing speed (smaller = faster)
    } else {
      p++; i = 0;
      setTimeout(type, 250);         // pause between lines
    }
  }
  type();
})();
// =====================================================
// How it works – accordion gallery
// (vanilla JS port of React Bits AccordionGallery, needs GSAP)
// =====================================================
(function () {
  const root = document.getElementById('stepsGallery');
  if (!root || !window.gsap) return;

  // Settings you can change
  const cfg = {
    defaultIndex: 0,      // which step is open on load (0 = first)
    expandRatio: 0.5,     // share of the row the open panel takes (0.2 – 0.9)
    tilt: 8,              // 3D tilt of closed panels, in degrees
    duration: 0.6,        // animation time in seconds
    ease: 'power3.out',
    parallax: 0.5,        // sideways drift of the number/icon (0 = off)
    stagger: 0.06,
    trigger: 'hover'      // 'hover' or 'click'
  };

  const panels = Array.from(root.querySelectorAll('.ag-panel'));
  const count = panels.length;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.matchMedia('(max-width: 520px)').matches;
  let active = Math.min(Math.max(cfg.defaultIndex, 0), count - 1);
  let tl = null;

  function goToQuote() {
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  }

  function layout(animate) {
    if (tl) tl.kill();
    const dur = animate && !reduced ? cfg.duration : 0;
    const mobile = isMobile();
    const r = Math.min(Math.max(cfg.expandRatio, 0.2), 0.9);
    const grow = (r * (count - 1)) / (1 - r);
    tl = gsap.timeline();

    panels.forEach((panel, i) => {
      const isActive = i === active;
      const art = panel.querySelector('.ag-art');
      const bar = panel.querySelector('.ag-bar');
      const text = panel.querySelector('.ag-text');

      if (mobile) {
        gsap.set(panel, { clearProps: 'flexGrow,transform' });
        tl.to(panel, { height: isActive ? 250 : 84, duration: dur, ease: cfg.ease }, 0);
      } else {
        gsap.set(panel, { clearProps: 'height' });
        const rot = isActive ? 0 : i < active ? cfg.tilt : -cfg.tilt;
        tl.to(panel, { flexGrow: isActive ? grow : 1, rotateY: rot, duration: dur, ease: cfg.ease }, 0);
      }

      // colour / dimming on closed panels
      tl.to(panel, { '--ag-gray': isActive ? 0 : 0.7, '--ag-dim': isActive ? 0 : 0.3, duration: dur, ease: cfg.ease }, 0);

      // parallax drift of number + icon
      const drift = Math.max(-1.5, Math.min(1.5, active - i));
      tl.to(art, { x: mobile ? 0 : drift * cfg.parallax * 36, duration: dur, ease: cfg.ease }, 0);

      // caption reveal
      if (isActive) {
        tl.to([bar, text], { opacity: 1, x: 0, duration: dur, ease: cfg.ease, stagger: reduced ? 0 : cfg.stagger }, 0);
      } else {
        tl.to([bar, text], { opacity: 0, x: -14, duration: dur * 0.6, ease: cfg.ease }, 0);
      }
    });
  }

  function setActive(i) {
    if (i === active) return;
    active = i;
    layout(true);
  }

  panels.forEach((panel, i) => {
    panel.addEventListener('mouseenter', () => { if (cfg.trigger === 'hover') setActive(i); });

    // One click / tap goes straight to the Get a Quote section
    // On phones: first tap opens the step, a second tap goes to the quote section
    let wasActive = false;
    panel.addEventListener('pointerdown', () => { wasActive = (i === active); });
    panel.addEventListener('click', () => {
      if (isMobile() && !wasActive) return;
      goToQuote();
    });

    panel.addEventListener('focus', () => setActive(i));

    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goToQuote();
        return;
      }
      let n = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % count;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + count) % count;
      if (n !== null) { e.preventDefault(); panels[n].focus(); }
    });
  });

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => layout(false), 150);
  });

  layout(false);
})();


// =====================================================
// Plans page – category filter chips
// Also opens with a filter preselected from the URL,
// e.g. plans.html#protection, plans.html#child, plans.html#retire
// =====================================================
(function () {
  const chipsWrap = document.getElementById('chips');
  const grid = document.getElementById('pgrid');
  if (!chipsWrap || !grid) return;

  const chips = Array.from(chipsWrap.querySelectorAll('.chip'));
  const cards = Array.from(grid.querySelectorAll('.pcard'));
  const valid = chips.map(c => c.dataset.filter);

  function applyFilter(f) {
    chips.forEach(c => c.classList.toggle('active', c.dataset.filter === f));
    cards.forEach(card => { card.hidden = !(f === 'all' || card.dataset.cat === f); });
  }

  chips.forEach(chip => chip.addEventListener('click', () => {
    applyFilter(chip.dataset.filter);
    history.replaceState(null, '', chip.dataset.filter === 'all' ? location.pathname : '#' + chip.dataset.filter);
  }));

  // Preselect from the URL hash and scroll to the plans list
  const fromHash = location.hash.replace('#', '');
  if (valid.includes(fromHash) && fromHash !== 'all') {
    applyFilter(fromHash);
    chipsWrap.scrollIntoView();
  } else {
    applyFilter('all');
  }
})();

// =====================================================
// Why insurance matters – auto-cycling glass card carousel
// =====================================================
(function () {
  const root = document.getElementById('fx');
  if (!root) return;

  const cards = Array.from(root.querySelectorAll('.fx-card'));
  const dots = Array.from(root.querySelectorAll('.fx-dot'));
  const n = cards.length;
  const INTERVAL = 4500;     // time per card in milliseconds
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = 0, timer = null;

  function render() {
    cards.forEach((card, k) => {
      let d = k - i;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      card.dataset.pos = Math.abs(d) > 1 ? 'x' : String(d);
      card.setAttribute('aria-hidden', d === 0 ? 'false' : 'true');
    });
    dots.forEach((dot, k) => dot.classList.toggle('on', k === i));
  }

  function go(k) { i = (k + n) % n; render(); }
  function start() { if (!reduced) { stop(); timer = setInterval(() => go(i + 1), INTERVAL); } }
  function stop() { if (timer) clearInterval(timer); timer = null; }

  document.getElementById('fxPrev').addEventListener('click', () => { go(i - 1); start(); });
  document.getElementById('fxNext').addEventListener('click', () => { go(i + 1); start(); });
  dots.forEach((dot, k) => dot.addEventListener('click', () => { go(k); start(); }));
  cards.forEach((card, k) => card.addEventListener('click', () => { if (k !== i) { go(k); start(); } }));

  // pause while the pointer or keyboard focus is inside
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', start);

  render();
  start();
})();

// Open the card named in the address (e.g. plans.html#pension)
(function () {
  // address word -> words to look for in the card title
  const titles = {
    term: 'Term', child: 'Child', pension: 'Pension', endowment: 'Endowment',
    moneyback: 'Money-Back', wholelife: 'Whole Life', health: 'Health',
    general: 'General', mutual: 'Mutual', event: 'Event', pet: 'Pet'
  };

  function findCard(key) {
    const byId = document.getElementById(key);
    if (byId && byId.classList.contains('pcard')) return byId;
    const word = titles[key];
    if (!word) return null;
    return Array.from(document.querySelectorAll('.pcard')).find(c => {
      const h = c.querySelector('h3');
      return h && h.textContent.toLowerCase().includes(word.toLowerCase());
    }) || null;
  }

  function openFromHash() {
    const key = location.hash.slice(1);
    if (!key) return;
    const card = findCard(key);
    if (!card) return;

    // switch to the filter that matches this card's category
    const chip = document.querySelector('.chip[data-filter="' + card.dataset.cat + '"]');
    if (chip) chip.click();

    setTimeout(() => {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('flash');
      setTimeout(() => card.classList.remove('flash'), 2200);
    }, 150);
  }

  window.addEventListener('load', openFromHash);
  window.addEventListener('hashchange', openFromHash);
})();

// =====================================================
// Hanging business card – elastic rope physics
// =====================================================
(function () {
  const lny = document.getElementById('lny');
  const swing = document.getElementById('lnySwing');
  const strap = document.getElementById('lnyStrap');
  const hang = document.getElementById('lnyHang');
  const card = document.getElementById('lnyCard');
  const hint = document.getElementById('lnyHint');
  if (!lny || !swing || !strap || !hang || !card) return;

  // ---- settings you can tweak ----
  const L = 300;          // rope length in px (make it smaller for short screens)
  const G = 2200;         // gravity
  const K = 150;          // rope stiffness (higher = tighter snap-back)
  const CD = 6;           // damping along the rope
  const AIR = 0.9;        // air drag (higher = settles sooner)
  const MAX_STRETCH = 120;// how far the rope can be pulled past its length
  // --------------------------------

  const restY = L + G / K;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let x = reduced ? 0 : 110, y = reduced ? restY : L - 20;
  let vx = 0, vy = 0, ca = 0, prevTh = 0;
  let dragging = false, running = false, last = 0;
  let piv = { x: 0, y: 0 }, off = { x: 0, y: 0 }, lastP = { t: 0 };
  const vel = { x: 0, y: 0 };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // stop the card swinging past the right edge of the screen
  function keepOnScreen() {
    const maxX = Math.max(0, window.innerWidth * 0.03 - 6);   // room to the right of the card
    if (x > maxX) { x = maxX; if (vx > 0) vx = -vx * 0.3; }
  }

  function draw() {
    const d = Math.hypot(x, y);
    const th = Math.atan2(x, y);
    swing.style.transform = 'rotate(' + (-th) + 'rad)';
    strap.style.height = (d + 80) + 'px';
    hang.style.transform = 'translateY(' + d + 'px)';
    card.style.transform = 'rotate(' + ca + 'rad)';
  }

  function step(dt) {
    if (dragging) return;
    let ax = 0, ay = G;
    const d = Math.hypot(x, y) || 1;
    if (d > L) {
      const ux = x / d, uy = y / d;
      const a = -K * (d - L) - CD * (vx * ux + vy * uy);
      ax += a * ux; ay += a * uy;
    }
    ax -= AIR * vx; ay -= AIR * vy;
    vx += ax * dt; vy += ay * dt;
    x += vx * dt; y += vy * dt;
    if (y < 60) { y = 60; vy = Math.abs(vy) * 0.25; }
    keepOnScreen();
  }

  function frame(t) {
    const dt = Math.min((t - last) / 1000 || 0.016, 0.033);
    last = t;
    for (let i = 0; i < 3; i++) step(dt / 3);

    const th = Math.atan2(x, y);
    const w = (th - prevTh) / dt;             // angular speed
    prevTh = th;
    ca += ((w * 0.1) - ca) * Math.min(1, dt * 10);    // card lags behind the swing
    draw();

    const still = !dragging && Math.abs(x) < 0.3 && Math.abs(y - restY) < 0.5 &&
      Math.hypot(vx, vy) < 3 && Math.abs(ca) < 0.001;
    if (still) { x = 0; y = restY; vx = vy = ca = 0; draw(); running = false; }
    else requestAnimationFrame(frame);
  }

  function run() {
    if (running) return;
    running = true; last = performance.now(); requestAnimationFrame(frame);
  }

  card.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a')) return;   // let links (email / phone) be clicked normally
    dragging = true; vx = vy = 0;
    card.setPointerCapture(e.pointerId);
    card.classList.add('grabbing');
    if (hint) hint.classList.add('gone');
    const r = lny.getBoundingClientRect();
    piv = { x: r.left + r.width / 2, y: r.top };
    off = { x: e.clientX - (piv.x + x), y: e.clientY - (piv.y + y) };
    vel.x = vel.y = 0; lastP.t = performance.now();
    run();
  });

  card.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    let nx = e.clientX - piv.x - off.x;
    let ny = e.clientY - piv.y - off.y;
    const max = L + MAX_STRETCH, d = Math.hypot(nx, ny);
    if (d > max) { nx *= max / d; ny *= max / d; }
    if (ny < 60) ny = 60;
    const now = performance.now(), dt = (now - lastP.t) / 1000;
    if (dt > 0) {
      vel.x = vel.x * 0.6 + ((nx - x) / dt) * 0.4;
      vel.y = vel.y * 0.6 + ((ny - y) / dt) * 0.4;
    }
    x = nx; y = ny; lastP.t = now;
    keepOnScreen();
  });

  function release() {
    if (!dragging) return;
    dragging = false;
    card.classList.remove('grabbing');
    if (performance.now() - lastP.t > 80) { vel.x = vel.y = 0; }   // held still = no throw
    vx = clamp(vel.x, -2500, 2500);
    vy = clamp(vel.y, -2500, 2500);
    run();
  }
  card.addEventListener('pointerup', release);
  card.addEventListener('pointercancel', release);

  draw();
  run();                                       // gentle swing on page load
})();

// About section – sliding images, one after another
(function () {
  const root = document.getElementById('abSlider');
  if (!root) return;

  const track = root.querySelector('.ab-track');
  const bars = Array.from(root.querySelectorAll('.ab-bar'));
  const n = bars.length;
  const INTERVAL = 4500;      // time per photo in milliseconds
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = 0, timer = null;

  root.style.setProperty('--ab-time', INTERVAL + 'ms');

  function show(k) {
    i = (k + n) % n;
    track.style.transform = 'translateX(' + (-100 * i) + '%)';
    bars.forEach((bar, idx) => {
      bar.classList.remove('on', 'done');
      if (idx < i) bar.classList.add('done');
    });
    void root.offsetWidth;                 // restart the progress animation
    bars[i].classList.add('on');
  }

  function start() {
    if (reduced) return;
    clearInterval(timer);
    timer = setInterval(() => show(i + 1), INTERVAL);
  }

  // Progress bars: click to jump to a photo
  bars.forEach((bar, k) => bar.addEventListener('click', () => { show(k); start(); }));

  // Previous / next arrows
  const prevBtn = root.querySelector('.ab-prev');
  const nextBtn = root.querySelector('.ab-next');
  if (prevBtn) prevBtn.addEventListener('click', () => { show(i - 1); start(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { show(i + 1); start(); });

  show(0);
  start();
})();

// =====================================================
// Digital card – click to flip and see all insurance plans
// Works for both the hanging card (desktop) and the digital card (mobile)
// Edit the list below to add / remove / rename plans.
// =====================================================
(function () {
  const PLANS = [
    ['🛡️', 'Term Insurance', 'term'],
    ['🧒', 'Child & Education Plans', 'child'],
    ['🌴', 'Pension & Annuity Plans', 'pension'],
    ['💰', 'Endowment Plans', 'endowment'],
    ['🔁', 'Money-Back Plans', 'moneyback'],
    ['🏠', 'Whole Life Plans', 'wholelife'],
    ['📈', 'ULIPs', 'ULIP'],
    ['🏥', 'Health & Critical Illness', 'health'],
    ['📊', 'Mutual Funds', 'mutual'],
    ['🚗', 'General Insurance', 'general'],
    ['🎉', 'Event Insurance', 'event'],
    ['🐶', 'Pet Insurance', 'pet']
  ];

  function build(front) {
    const flip = document.createElement('div');
    flip.className = 'flip';
    flip.tabIndex = 0;
    flip.setAttribute('role', 'button');
    flip.setAttribute('aria-pressed', 'false');
    flip.setAttribute('aria-label', 'Business card. Press to see all insurance plans');

    const inner = document.createElement('div');
    inner.className = 'flip-inner';

    const f = document.createElement('div');
    f.className = 'flip-face flip-front';

    const b = document.createElement('div');
    b.className = 'flip-face flip-back';
    b.setAttribute('inert', '');
    b.innerHTML =
      '<div class="bcard bcard-back">' +
      '<h4>All insurance plans</h4>' +
      '<ul class="bc-plans">' +
      PLANS.map(p => '<li><a href="plans.html#' + p[2] + '"><i>' + p[0] + '</i>' + p[1].replace(/&/g, '&amp;') + '</a></li>').join('') +
      '</ul>' +
      '<div class="bc-foot">↻ Click to flip back</div>' +
      '</div>';

    front.parentNode.insertBefore(flip, front);
    f.appendChild(front);
    inner.appendChild(f);
    inner.appendChild(b);
    flip.appendChild(inner);

    function set(on) {
      flip.classList.toggle('is-flipped', on);
      flip.setAttribute('aria-pressed', String(on));
      if (on) { f.setAttribute('inert', ''); b.removeAttribute('inert'); }
      else { b.setAttribute('inert', ''); f.removeAttribute('inert'); }
    }

    // A click is a press + release that barely moved (so dragging the hanging card doesn't flip it)
    const host = flip.closest('.lny-card') || flip;
    let down = null;
    host.addEventListener('pointerdown', (e) => {
      down = { x: e.clientX, y: e.clientY, t: performance.now(), onLink: !!e.target.closest('a') };
    });
    host.addEventListener('pointerup', (e) => {
      if (!down) return;
      const d = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      const quick = performance.now() - down.t < 500;
      const ok = !down.onLink && d < 6 && quick;
      down = null;
      if (ok) set(!flip.classList.contains('is-flipped'));
    });
    host.addEventListener('pointercancel', () => { down = null; });
    flip.addEventListener('keydown', (e) => {
      if (e.target !== flip) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(!flip.classList.contains('is-flipped')); }
    });
  }

  document.querySelectorAll('.lny-card > .bcard, .dcard > .bcard').forEach(build);
})();