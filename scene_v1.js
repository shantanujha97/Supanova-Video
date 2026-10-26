// Supanova 20s product demo — every frame is a pure function of t (seconds).
const K = 1920 / 1440;
const $ = id => document.getElementById(id);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const P = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const lerp = (a, b, p) => a + (b - a) * p;
const E = {
  lin: p => p,
  outExpo: p => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  inCubic: p => p * p * p,
  outCubic: p => 1 - Math.pow(1 - p, 3),
  inOutCubic: p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  inOutSine: p => -(Math.cos(Math.PI * p) - 1) / 2,
  outBack: (p, s = 1.70158) => 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2),
  follow: () => 1,
};
const bump = (t, a, b) => (t < a || t > b ? 0 : Math.sin(Math.PI * P(t, a, b)));
const fmt = v => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const show = (el, on) => { el.style.display = on ? '' : 'none'; };

// ---------- camera ----------
function evalCam(start, segs, t) {
  let s = { ...start };
  for (const [a, b, to, ease] of segs) {
    const target = typeof to === 'function' ? to(Math.min(t, b)) : to;
    if (t >= b) { s = { ...target }; continue; }
    if (t > a) { const p = (E[ease] || E.lin)(P(t, a, b)); s = { cx: lerp(s.cx, target.cx, p), cy: lerp(s.cy, target.cy, p), z: lerp(s.z, target.z, p) }; }
    break;
  }
  return s;
}
const applyCam = (el, c) => { el.style.transform = `translate(960px,540px) scale(${K * c.z}) translate(${-c.cx}px,${-c.cy}px)`; };
const w2s = (c, x, y) => [960 + (x - c.cx) * K * c.z, 540 + (y - c.cy) * K * c.z];

let addrCaretX = 558.3;
const followCam = () => ({ cx: clamp(addrCaretX + 30, 640, 880), cy: 397, z: 2.5 });
const camA = t => evalCam({ cx: 400, cy: 205, z: 3.4 }, [
  [2.80, 3.25, { cx: 400, cy: 205, z: 2.5 }, 'outExpo'],
  [3.25, 3.50, { cx: 404, cy: 207, z: 2.42 }, 'inOutSine'],
  [3.50, 4.20, { cx: 720, cy: 283, z: 1.6 }, 'inOutCubic'],
  [4.20, 4.65, { cx: 720, cy: 365, z: 0.62 }, 'outExpo'],
  [4.65, 5.45, { cx: 720, cy: 372, z: 0.665 }, 'inOutSine'],
  [5.45, 5.92, { cx: 720, cy: 416, z: 1.8 }, 'outExpo'],
  [5.92, 6.32, { cx: 690, cy: 300, z: 2.5 }, 'outExpo'],
  [6.32, 6.75, { cx: 698, cy: 302, z: 2.56 }, 'inOutSine'],
  [6.75, 6.98, followCam, 'inOutCubic'],
  [6.98, 7.80, followCam, 'follow'],
  [7.80, 8.20, { cx: 720, cy: 420, z: 1.25 }, 'inOutCubic'],
  [8.20, 8.60, { cx: 719, cy: 537, z: 1.42 }, 'inOutCubic'],
  [8.60, 9.50, { cx: 719, cy: 537, z: 1.72 }, 'inOutSine'],
  [9.50, 10.0, { cx: 514, cy: 634, z: 7.5 }, 'inCubic'],
], t);
const camB = t => evalCam({ cx: 720, cy: 414, z: 1.0 }, [
  [10.75, 10.85, { cx: 720, cy: 414, z: 1.02 }, 'lin'],
  [10.85, 11.25, { cx: 660, cy: 276, z: 2.2 }, 'outExpo'],
  [11.25, 11.40, { cx: 664, cy: 278, z: 2.25 }, 'inOutSine'],
  [11.40, 12.00, { cx: 664, cy: 410, z: 2.2 }, 'inOutCubic'],
  [12.15, 12.50, { cx: 720, cy: 414, z: 1.3 }, 'inOutCubic'],
  [12.60, 13.00, { cx: 719, cy: 524, z: 1.42 }, 'inOutCubic'],
  [13.00, 13.50, { cx: 719, cy: 524, z: 1.52 }, 'inOutSine'],
  [13.50, 13.82, { cx: 1900, cy: 524, z: 1.52 }, 'inCubic'],
], t);
const camC = t => evalCam({ cx: 720, cy: 381, z: 1.55 }, [
  [15.25, 16.0, { cx: 720, cy: 381, z: 1.6 }, 'inOutSine'],
  [16.0, 16.6, { cx: 758, cy: 318, z: 2.4 }, 'outExpo'],
  [16.6, 17.4, { cx: 764, cy: 320, z: 2.5 }, 'inOutSine'],
], t);

// ---------- static setup ----------
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function drawStars() {
  const c = $('stars'), g = c.getContext('2d');
  g.fillStyle = '#05060a'; g.fillRect(0, 0, 1920, 1080);
  const neb = (x, y, r, col, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080); };
  neb(1450, 230, 800, '70,150,170', 0.10); neb(420, 940, 700, '200,110,60', 0.06); neb(960, 540, 600, '40,60,90', 0.10);
  for (let i = 0; i < 950; i++) {
    const x = rnd() * 1920, y = rnd() * 1080, big = rnd() < 0.06, r = big ? 1.1 + rnd() * 0.9 : 0.35 + rnd() * 0.7;
    const tint = rnd(); const col = tint < 0.12 ? '160,220,230' : tint < 0.2 ? '240,190,150' : '255,255,255';
    g.fillStyle = `rgba(${col},${0.18 + rnd() * (big ? 0.75 : 0.55)})`; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
}
// particle sphere
const N = 680, PTS = [];
for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963; PTS.push([Math.cos(th) * r, y, Math.sin(th) * r, rnd()]); }
function drawParticles(t) {
  const c = $('parts'), g = c.getContext('2d'); g.clearRect(0, 0, 1920, 1080);
  if (t > 1.9) return;
  const col = P(t, 1.2, 1.8), ec = E.inCubic(col);
  const R = t < 1.2 ? 240 * (1 + 0.02 * Math.sin(t * 3)) : 240 * (1 - ec) + 2;
  const cx = lerp(1010, 960, E.inOutCubic(col)), cy = 540;
  const a = t * 0.75 + ec * 4.0, tilt = 0.38;
  const fade = P(t, 0, 0.35);
  for (const [x, y, z, k] of PTS) {
    const x1 = x * Math.cos(a) + z * Math.sin(a), z1 = -x * Math.sin(a) + z * Math.cos(a);
    const y2 = y * Math.cos(tilt) - z1 * Math.sin(tilt), z2 = y * Math.sin(tilt) + z1 * Math.cos(tilt);
    const f = 1 / (1 - z2 * 0.28), d = (z2 + 1) / 2;
    const sx = cx + R * x1 * f, sy = cy + R * y2 * f;
    const m = (x1 + 1) / 2;
    const rr = Math.round(lerp(108, 227, m)), gg = Math.round(lerp(195, 153, m)), bb = Math.round(lerp(207, 95, m));
    const al = clamp((0.18 + 0.82 * d) * (1 + col * 1.2) * fade, 0, 1);
    const s = (1.0 + 2.6 * d) * f * (0.8 + 0.4 * k) * (1 + col * 0.4);
    g.fillStyle = `rgba(${rr},${gg},${bb},${al})`;
    if (s > 2.6) { g.beginPath(); g.moveTo(sx, sy - s * 1.3); g.lineTo(sx + s * 0.35, sy - s * 0.35); g.lineTo(sx + s * 1.3, sy); g.lineTo(sx + s * 0.35, sy + s * 0.35); g.lineTo(sx, sy + s * 1.3); g.lineTo(sx - s * 0.35, sy + s * 0.35); g.lineTo(sx - s * 1.3, sy); g.lineTo(sx - s * 0.35, sy - s * 0.35); g.closePath(); g.fill(); }
    else { g.beginPath(); g.arc(sx, sy, s * 0.6, 0, Math.PI * 2); g.fill(); }
  }
  // core glow during collapse
  const gl = P(t, 1.25, 1.82); if (gl > 0) { const r = 20 + 170 * gl; const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, `rgba(255,255,255,${0.9 * gl})`); gr.addColorStop(0.35, `rgba(170,225,232,${0.5 * gl})`); gr.addColorStop(1, 'rgba(100,190,205,0)'); g.fillStyle = gr; g.fillRect(cx - r, cy - r, r * 2, r * 2); }
}
function heading(el, text, gradWord) {
  el.innerHTML = text.split(' ').map(w => w === gradWord
    ? `<span style="background:linear-gradient(100deg,#6cc3cf,#e3995f);-webkit-background-clip:text;background-clip:text;color:transparent">${w}</span>`
    : `<span>${w}</span>`).join(' ');
}
function setHead(el, t, tIn, tOut, st = 0.08, dur = 0.42) {
  const sp = el.children; let any = false;
  for (let i = 0; i < sp.length; i++) {
    const p = E.outCubic(P(t, tIn + i * st, tIn + i * st + dur)), q = E.inCubic(P(t, tOut + i * 0.03, tOut + i * 0.03 + 0.28));
    const op = p * (1 - q); if (op > 0.001) any = true;
    sp[i].style.opacity = op; sp[i].style.filter = `blur(${(1 - p) * 16 + q * 16}px)`;
    sp[i].style.transform = `translateY(${(1 - p) * 22 - q * 14}px)`;
  }
  show(el, any);
}
let LET = [];
async function setupLogo() {
  const txt = await (await fetch('assets/wordmark.svg')).text();
  const d = [...txt.matchAll(/<path d="([^"]+)"/g)].map(m => m[1]);
  $('markP').setAttribute('d', d[0]); $('markG').setAttribute('d', d[0]);
  const host = $('logo');
  for (let i = 1; i < d.length; i++) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 566 98'); s.setAttribute('class', 'abs'); s.style.width = '700px'; s.style.height = (700 * 98 / 566) + 'px';
    s.innerHTML = `<path d="${d[i]}" fill="#fff"/>`; host.insertBefore(s, $('tag')); LET.push(s);
  }
  $('letters').remove();
}
const TILE_IMGS = ['twitter', 'whatsapp', 'telegram', 'email'];
const LAYERS = { near: [150, 0, 1, 1.0], mid: [104, 3, 0.75, 0.62], far: [66, 7, 0.45, 0.34] };
const CLOUD = [
  // [img, layer, x0, y, rot]
  [0, 'near', 1180, 300, -10], [1, 'near', 1600, 690, 8], [2, 'near', 2050, 380, -6], [3, 'near', 1380, 860, 12],
  [1, 'mid', 900, 190, 6], [3, 'mid', 1320, 520, -8], [0, 'mid', 1750, 160, 10], [2, 'mid', 2100, 820, -12], [0, 'mid', 820, 760, 4],
  [2, 'far', 700, 420, 0], [3, 'far', 1050, 960, 0], [1, 'far', 1500, 90, 0], [0, 'far', 1900, 560, 0], [3, 'far', 2250, 260, 0], [2, 'far', 1200, 640, 0],
];
const SLOTS = [[574, 378.5], [671.33, 378.5], [768.67, 378.5], [866, 378.5]];
let TILES = [];
function setupTiles() {
  const host = $('tiles');
  CLOUD.forEach(c => { const im = document.createElement('img'); im.src = `assets/tile_${TILE_IMGS[c[0]]}.png`; im.className = 'tile'; host.appendChild(im); TILES.push(im); });
}

// ---------- render ----------
function setWorldVis(el, on) { el.style.display = on ? 'block' : 'none'; }
function ring(el, list, t) {
  let shown = false;
  for (const [a, x, y] of list) { if (t >= a && t < a + 0.5) { const p = P(t, a, a + 0.5), s = 14 + 46 * E.outCubic(p); Object.assign(el.style, { left: (x - s / 2) + 'px', top: (y - s / 2) + 'px', width: s + 'px', height: s + 'px', opacity: 0.75 * (1 - p), display: 'block' }); shown = true; } }
  if (!shown) el.style.display = 'none';
}
function typed(el, full, t0, per, t, caretOn, h) {
  const n = clamp(Math.floor((t - t0) / per) + 1, 0, full.length);
  const s = full.slice(0, n);
  el.innerHTML = s.replace(/&/g, '&amp;') + (caretOn ? `<span class="caret" style="height:${h}px"></span>` : '');
  return s;
}
const blink = (t, typing) => typing || Math.floor(t * 3.2) % 2 === 0;

function render(t) {
  // stars drift
  $('stars').style.transform = `translate(${-30 + 2.2 * t}px,${-10 + 0.8 * t}px) scale(1.06)`;
  // intro particles
  drawParticles(t);
  const pPush = t < 1.2 ? 1 + 0.05 * P(t, 0, 1.2) : 1.05 + 0.25 * E.inCubic(P(t, 1.2, 1.8));
  $('parts').style.transform = `scale(${pPush})`; show($('parts'), t < 1.9);

  // ---------- flash ----------
  const fl = Math.max(
    0.85 * P(t, 1.76, 1.82) * (1 - P(t, 1.82, 2.05)),
    P(t, 2.68, 2.86) * (1 - P(t, 2.86, 3.12)),
    P(t, 9.72, 9.98) * (1 - P(t, 10.0, 10.38)),
    0.35 * P(t, 17.05, 17.35) * (1 - P(t, 17.35, 17.8)));
  $('flash').style.opacity = fl;
  $('black').style.opacity = E.inOutSine(P(t, 19.7, 20.0));

  // ---------- logo (intro + outro) ----------
  const logoOn = (t >= 1.76 && t < 2.88) || t >= 17.35;
  show($('logo'), logoOn);
  if (logoOn) {
    const intro = t < 10;
    const LY = intro ? 540 : 505;
    const lockL = 610, lockT = LY - 60.6, lockMark = [lockL + 54.15, lockT + 54.15], lockSize = 108.3;
    const hero = intro ? [960, 540] : [960, 520];
    const T0 = intro ? 1.8 : 17.45, Tmove = intro ? 2.38 : 18.2, Tlet = intro ? 2.44 : 18.28;
    let size, rot, op, blur, cx, cy;
    const p = P(t, T0, T0 + (intro ? 0.45 : 0.6));
    size = 250 * ((intro ? 0.35 : 0.45) + (intro ? 0.65 : 0.55) * E.outBack(p));
    rot = (intro ? -30 : -35) * (1 - E.outCubic(P(t, T0, T0 + 0.55)));
    op = P(t, T0, T0 + (intro ? 0.1 : 0.25)); blur = (1 - P(t, T0, T0 + (intro ? 0.2 : 0.35))) * (intro ? 8 : 14);
    const q = E.inOutCubic(P(t, Tmove, Tmove + (intro ? 0.22 : 0.28)));
    cx = lerp(hero[0], lockMark[0], q); cy = lerp(hero[1], lockMark[1], q); size = lerp(size, lockSize, q);
    const m = $('mark'); Object.assign(m.style, { left: (cx - size / 2) + 'px', top: (cy - size / 2) + 'px', width: size + 'px', height: size + 'px', opacity: op, filter: `blur(${blur}px) drop-shadow(0 0 ${18 + 30 * (1 - q)}px rgba(110,200,210,.55))`, transform: `rotate(${rot}deg)` });
    // gloss sweep
    const gs = intro ? lerp(-0.25, 1.25, P(t, 1.95, 2.35)) : lerp(-0.25, 1.25, P(t, 19.2, 19.65));
    $('g0').setAttribute('offset', clamp(gs - 0.12, 0, 1)); $('g1').setAttribute('offset', clamp(gs, 0, 1)); $('g2').setAttribute('offset', clamp(gs + 0.12, 0, 1));
    // glow behind mark
    const gw = $('glowL'); const ga = intro ? P(t, 1.8, 2.0) : P(t, 17.3, 17.9);
    Object.assign(gw.style, { left: (cx - 450) + 'px', top: (cy - 450) + 'px', opacity: ga * (1 - 0.5 * q) });
    // letters
    LET.forEach((s, i) => { const lp = E.outCubic(P(t, Tlet + i * 0.03, Tlet + i * 0.03 + 0.3)); Object.assign(s.style, { left: lockL + 'px', top: lockT + 'px', opacity: lp, filter: `blur(${(1 - lp) * 10}px)`, transform: `translateX(${(1 - lp) * 26}px)` }); });
    // tagline
    const tg = $('tag'); const tp = E.outCubic(P(t, 18.62, 18.95)); show(tg, !intro);
    Object.assign(tg.style, { top: '598px', opacity: tp, transform: `translateY(${(1 - tp) * 14}px)`, filter: `blur(${(1 - tp) * 6}px)` });
    // whole-logo camera
    let sc, ox, oy;
    if (intro) { sc = (1 + 0.04 * P(t, 2.4, 2.65)) * lerp(1, 7, E.inCubic(P(t, 2.62, 2.88))); ox = lockMark[0]; oy = lockMark[1]; }
    else { sc = 1 + 0.08 * E.inOutSine(P(t, 18.2, 20)); ox = 960; oy = 540; }
    $('logo').style.transformOrigin = `${ox}px ${oy}px`; $('logo').style.transform = `scale(${sc})`;
  }

  // ---------- WORLD A: dashboard + send ----------
  const onA = t >= 2.82 && t < 10.0; setWorldVis($('wA'), onA);
  if (onA) {
    $('bal').textContent = '$' + (15468.54 * E.outCubic(P(t, 2.86, 3.5))).toFixed(2);
    for (let i = 0; i < 4; i++) {
      const p = P(t, 3.5 + i * 0.07, 3.85 + i * 0.07), e = E.outCubic(p);
      const press = i === 0 ? 1 - 0.035 * bump(t, 5.36, 5.5) : 1;
      Object.assign($('btn' + i).style, { opacity: e, transform: `translateY(${(1 - e) * 8}px) scale(${(0.94 + 0.06 * E.outBack(p)) * press})` });
    }
    $('sendbg').style.opacity = E.inOutSine(P(t, 5.36, 5.58));
    const mp = E.outExpo(P(t, 5.56, 5.98));
    const md = $('modal'); show(md, t >= 5.48 && t < 8.42);
    const mo = P(t, 8.18, 8.3); Object.assign(md.style, { opacity: P(t, 5.56, 5.72) * (1 - mo), filter: mo > 0 ? `blur(${mo * 8}px)` : 'none', transform: `translateY(${(1 - mp) * 50}px) scale(${(0.97 + 0.03 * mp) * (1 - 0.04 * mo)})` });
    $('mFull').style.opacity = P(t, 7.72, 7.86);
    $('mFull').style.filter = `brightness(${1 + 0.22 * bump(t, 8.1, 8.24)})`;
    // amount
    let amt = '';
    if (t < 5.95) $('amt').innerHTML = '0.00';
    else amt = typed($('amt'), '100.1232', 5.95, 0.055, t, t < 6.8 && blink(t, t < 6.45), 26);
    $('usd').textContent = '$' + fmt((parseFloat(amt) || 0) * 77.75);
    // address
    if (t < 6.85) { $('addr').innerHTML = 'Enter Recipient Address'; addrCaretX = 558.3; }
    else { typed($('addr'), '0xd0B55120f3AdE8B89e1aA5A6bcE5Da1b07E4', 6.85, 0.0235, t, t < 7.85 && blink(t, t < 7.75), 17); addrCaretX = 558.3 + $('addr').offsetWidth; }
    const sw = P(t, 7.95, 8.35); $('sweepA').style.display = sw > 0 && sw < 1 ? 'block' : 'none';
    $('sweepA').firstElementChild.style.left = (-150 + 720 * E.inOutSine(sw)) + 'px';
    $('st2').style.opacity = E.outCubic(P(t, 8.26, 8.42)); $('st3').style.opacity = P(t, 8.8, 8.95); $('st4').style.opacity = P(t, 9.2, 9.35);
    ring($('ringA'), [[8.42, 514, 505], [8.95, 513, 572], [9.35, 514, 634]], t);
    applyCam($('wA'), camA(t));
    $('wA').style.opacity = 1;
  }

  // ---------- WORLD B: swap ----------
  const onB = t >= 10.72 && t < 13.95; setWorldVis($('wB'), onB);
  if (onB) {
    $('wB').style.opacity = P(t, 10.72, 10.9);
    const sc = $('scard'); const ce = E.outExpo(P(t, 10.75, 11.15));
    Object.assign(sc.style, { opacity: E.outCubic(P(t, 10.75, 11.05)) * (1 - P(t, 12.6, 12.78)), transform: `scale(${0.94 + 0.06 * ce})`, filter: `brightness(${1 + 0.18 * bump(t, 12.46, 12.58)})` });
    show(sc, t < 12.8);
    let fr = '';
    if (t < 11.0) { $('sFrom').innerHTML = '0'; $('sFrom').style.opacity = 0.35; }
    else { $('sFrom').style.opacity = 1; fr = typed($('sFrom'), '200', 11.0, 0.06, t, t < 11.42 && blink(t, t < 11.2), 26); }
    $('sFromU').textContent = '$' + fmt((parseFloat(fr) || 0) * 77.75);
    const v = 15550 * E.outCubic(P(t, 11.5, 12.1));
    $('sTo').textContent = fmt(v); $('sTo').style.opacity = t < 11.5 ? 0.35 : 1;
    $('sToU').textContent = '$' + fmt(v);
    $('flip').style.transform = `rotate(${180 * E.inOutCubic(P(t, 11.38, 11.72))}deg)`;
    const sw = P(t, 12.18, 12.55); $('sweepB').style.display = sw > 0 && sw < 1 ? 'block' : 'none';
    $('sweepB').firstElementChild.style.left = (-150 + 720 * E.inOutSine(sw)) + 'px';
    $('sw1').style.opacity = P(t, 12.6, 12.8); $('sw2').style.opacity = P(t, 12.95, 13.1); $('sw3').style.opacity = P(t, 13.25, 13.4);
    $('pB1').style.opacity = $('pB2').style.opacity = P(t, 12.6, 12.8);
    ring($('ringB'), [[13.1, 515, 517], [13.4, 514, 577]], t);
    applyCam($('wB'), camB(t));
  }

  // ---------- WORLD C: referral ----------
  const onC = t >= 15.25 && t < 17.42; setWorldVis($('wC'), onC);
  const cC = camC(t);
  const dis = P(t, 17.0, 17.4);
  if (onC) {
    $('wC').style.opacity = P(t, 15.25, 15.5) * (1 - E.inCubic(dis));
    $('wC').style.filter = dis > 0 ? `blur(${18 * dis}px)` : 'none';
    const pp = P(t, 15.35, 15.8);
    Object.assign($('pop').style, { opacity: P(t, 15.35, 15.55), transform: `translateY(${(1 - E.outBack(pp, 1.2)) * 40}px)` });
    for (let i = 0; i < 4; i++) $('lb' + i).style.opacity = P(t, 15.85 + i * 0.04, 16.1 + i * 0.04);
    $('copyok').style.opacity = P(t, 16.62, 16.7);
    const cp = P(t, 16.65, 16.9);
    Object.assign($('copied').style, { opacity: P(t, 16.65, 16.75), transform: `translateY(${(1 - E.outBack(cp)) * 6}px) scale(${0.6 + 0.4 * E.outBack(cp)})`, transformOrigin: '50% 100%' });
    applyCam($('wC'), cC);
  }
  // share tiles (screen space)
  const tilesOn = t >= 14.42 && t < 17.42; show($('tiles'), tilesOn);
  if (tilesOn) {
    const p = (t - 14.45) / 0.95;
    const landC = camC(15.85);
    CLOUD.forEach((c, i) => {
      const [img, layer, x0, y, r0] = c; const [size, bl, op, spd] = LAYERS[layer];
      const hero = i < 4;
      let x = x0 - spd * Math.min(p, 1.6) * 1100, yy = y, s = size, rot = r0 * (1 - 0.3 * clamp(p, 0, 1)), o = op * P(t, 14.42 + i * 0.012, 14.62 + i * 0.012), b = bl;
      if (hero) {
        const k = E.inOutCubic(P(t, 15.35, 15.85));
        const cc = t < 15.85 ? landC : cC; const [tx, ty] = w2s(cc, SLOTS[img][0], SLOTS[img][1]); const ts = 58 * K * cc.z;
        x = lerp(x, tx, k); yy = lerp(yy, ty, k); s = lerp(s, ts, k); rot = lerp(rot, 0, k);
        if (t >= 15.85) { x = tx; yy = ty; s = ts; rot = 0; }
        o = o * (1 - E.inCubic(dis)); b = dis * 18;
      } else {
        const f = P(t, 15.25, 15.55); o *= 1 - f; s *= 1 - 0.3 * f;
      }
      Object.assign(TILES[i].style, { left: (x - s / 2) + 'px', top: (yy - s / 2) + 'px', width: s + 'px', height: (s * 171 / 174) + 'px', opacity: o, transform: `rotate(${rot}deg)`, filter: b > 0.05 ? `blur(${b}px)` : 'none', zIndex: layer === 'near' ? 3 : layer === 'mid' ? 2 : 1 });
    });
  }

  // ---------- headings & text cards ----------
  setHead($('h1'), t, 4.35, 5.18, 0.07);
  setHead($('h2'), t, 8.04, 8.62, 0.08);
  setHead($('card1'), t, 10.06, 10.6, 0.1, 0.45);
  const c2 = $('card2'); c2.style.transform = `translateX(${1500 * (1 - E.outCubic(P(t, 13.66, 14.0)))}px)`;
  setHead(c2, t, 13.78, 14.38, 0.07, 0.42);
  // gentle drift on text cards
  if (t > 10 && t < 10.8) $('card1').style.transform = `scale(${1 + 0.05 * P(t, 10.0, 10.8)})`;

  // ---------- cursor ----------
  const cur = $('cursor'); let cs = null;
  const seg = (a, b, from, to, pressA, fadeIn, fadeOut) => { const k = E.inOutCubic(P(t, a, b)); return { x: lerp(from[0], to[0], k), y: lerp(from[1], to[1], k), op: P(t, fadeIn[0], fadeIn[1]) * (1 - P(t, fadeOut[0], fadeOut[1])), pr: bump(t, pressA, pressA + 0.13) }; };
  if (t >= 0.15 && t < 1.3) cs = seg(0.15, 1.1, [470, 290], [985, 530], 99, [0.15, 0.32], [1.12, 1.3]);
  else if (t >= 4.7 && t < 5.7) { const c = camA(t); cs = seg(4.7, 5.32, [1360, 840], w2s(c, 405, 283), 5.36, [4.7, 4.86], [5.55, 5.7]); }
  else if (t >= 7.72 && t < 8.4) { const c = camA(t); cs = seg(7.75, 8.05, w2s(c, 880, 760), w2s(c, 720, 630), 8.08, [7.72, 7.85], [8.25, 8.4]); }
  else if (t >= 12.1 && t < 12.7) { const c = camB(t); cs = seg(12.12, 12.42, w2s(c, 880, 720), w2s(c, 720, 604), 12.45, [12.1, 12.22], [12.56, 12.7]); }
  else if (t >= 16.12 && t < 17.0) { cs = seg(16.15, 16.55, [1640, 990], w2s(cC, 872.5, 314.5), 16.56, [16.12, 16.25], [16.85, 17.0]); }
  if (cs && cs.op > 0) { Object.assign(cur.style, { display: 'block', left: (cs.x - 4) + 'px', top: (cs.y - 3) + 'px', opacity: cs.op, transform: `scale(${1 - 0.18 * cs.pr})` }); }
  else cur.style.display = 'none';
}

// motion-blur hint for the renderer: ranges with fast camera moves
window.MB = [[2.62, 2.95], [4.2, 4.6], [5.45, 5.85], [5.92, 6.2], [7.8, 8.12], [9.55, 10.0], [10.85, 11.15], [12.15, 12.45], [13.45, 14.05], [16.0, 16.3]];
window.render = render;
window.ready = (async () => {
  drawStars();
  heading($('h1'), 'One wallet for everything onchain', 'onchain');
  heading($('h2'), 'Send in seconds', 'seconds');
  heading($('card1'), 'Swap instantly', 'instantly');
  heading($('card2'), 'Earn when friends join', 'join');
  await setupLogo(); setupTiles();
  await document.fonts.load('600 32px Friends'); await document.fonts.load('400 16px Friends');
  await Promise.all([...document.images].map(i => i.decode().catch(() => null)));
  render(0); return true;
})();
