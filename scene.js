// Supanova 20s product demo — v2. Every frame is a pure function of t (seconds).
// Rule for v2: nothing appears out of thin air — every element grows from, slides out of,
// or is revealed by the interface element it belongs to.
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

// world-space anchors (Figma 1x coordinates)
const SEND_BTN = [405, 283], MODAL_C = [720, 416];
const STAT = [494, 414], STAT_CHECKS = [[19.5, 91.8], [19, 157.8], [19.5, 219.8]];
const SWST = [494, 432], SWST_CHECKS = [[20.5, 85.1], [20, 145.4]];
const SHARE_BTN = [660, 247], POP_C = [720, 381.5], APP_ICON = [568.8, 226.8], COPY_ICON = [872.5, 314.5];

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
  [8.20, 8.70, { cx: 719, cy: 530, z: 1.42 }, 'inOutCubic'],
  [8.70, 9.50, { cx: 719, cy: 535, z: 1.72 }, 'inOutSine'],
  [9.50, 10.0, { cx: STAT[0] + 19.5, cy: STAT[1] + 219.8, z: 7.5 }, 'inCubic'],
], t);
const camB = t => evalCam({ cx: 720, cy: 414, z: 1.0 }, [
  [10.75, 10.85, { cx: 720, cy: 414, z: 1.02 }, 'lin'],
  [10.85, 11.25, { cx: 660, cy: 276, z: 2.2 }, 'outExpo'],
  [11.25, 11.40, { cx: 664, cy: 278, z: 2.25 }, 'inOutSine'],
  [11.40, 12.00, { cx: 664, cy: 410, z: 2.2 }, 'inOutCubic'],
  [12.15, 12.50, { cx: 720, cy: 420, z: 1.3 }, 'inOutCubic'],
  [12.60, 13.05, { cx: 720, cy: 500, z: 1.42 }, 'inOutCubic'],
  [13.05, 13.50, { cx: 720, cy: 505, z: 1.52 }, 'inOutSine'],
  [13.50, 13.82, { cx: 1900, cy: 505, z: 1.52 }, 'inCubic'],
], t);
const camC = t => evalCam({ cx: 560, cy: 238, z: 2.0 }, [
  [14.55, 15.10, { cx: 592, cy: 244, z: 2.1 }, 'inOutSine'],
  [15.10, 15.60, { cx: 720, cy: 381, z: 1.55 }, 'inOutCubic'],
  [15.60, 16.00, { cx: 720, cy: 381, z: 1.6 }, 'inOutSine'],
  [16.00, 16.60, { cx: 758, cy: 318, z: 2.4 }, 'outExpo'],
  [16.60, 17.00, { cx: 764, cy: 320, z: 2.5 }, 'inOutSine'],
  [17.00, 17.38, { cx: APP_ICON[0], cy: APP_ICON[1], z: 11 }, 'inCubic'],
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
  ['markP', 'markG', 'markS'].forEach(id => $(id).setAttribute('d', d[0]));
  const host = $('logo');
  for (let i = 1; i < d.length; i++) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 566 98'); s.setAttribute('class', 'abs'); s.style.width = '700px'; s.style.height = (700 * 98 / 566) + 'px';
    s.innerHTML = `<path d="${d[i]}" fill="#fff"/>`; host.insertBefore(s, $('tag')); LET.push(s);
  }
  $('letters').remove();
}

// ---------- helpers ----------
function ring(el, list, t) {
  let shown = false;
  for (const [a, x, y] of list) { if (t >= a && t < a + 0.5) { const p = P(t, a, a + 0.5), s = 16 + 44 * E.outCubic(p); Object.assign(el.style, { left: (x - s / 2) + 'px', top: (y - s / 2) + 'px', width: s + 'px', height: s + 'px', opacity: 0.75 * (1 - p), display: 'block' }); shown = true; } }
  if (!shown) el.style.display = 'none';
}
function typed(el, full, t0, per, t, caretOn, h) {
  const n = clamp(Math.floor((t - t0) / per) + 1, 0, full.length);
  const s = full.slice(0, n);
  el.innerHTML = s.replace(/&/g, '&amp;') + (caretOn ? `<span class="caret" style="height:${h}px"></span>` : '');
  return s;
}
const blink = (t, typing) => typing || Math.floor(t * 3.2) % 2 === 0;
// element grows out of an anchor point (world coords) into its resting place
function grow(el, from, to, e, s0 = 0.1) {
  el.style.transform = `translate(${(1 - e) * (from[0] - to[0])}px,${(1 - e) * (from[1] - to[1])}px) scale(${lerp(s0, 1, e)})`;
}

// ---------- logo (intro draw-on + outro match-cut) ----------
function renderLogo(t) {
  const intro = t < 10;
  const on = intro ? t < 2.88 : t >= 17.3;
  show($('logo'), on); if (!on) return;
  const LY = intro ? 540 : 505;
  const lockL = 610, lockT = LY - 60.6, lockMark = [lockL + 54.15, lockT + 54.15], lockSize = 108.3;
  const hero = intro ? [960, 540] : [960, 520];
  let size = 260, rot = 0, draw = 1, fill = 1, strokeOp = 0, blur = 0, Tmove, Tlet, gloss;
  if (intro) {
    draw = E.inOutCubic(P(t, 0.25, 1.15));
    rot = -14 * (1 - E.outCubic(P(t, 0.25, 1.25)));
    size = 260 * (0.92 + 0.08 * E.outCubic(P(t, 0.25, 1.3)));
    fill = E.inOutSine(P(t, 0.9, 1.35));
    strokeOp = P(t, 0.25, 0.4) * (1 - P(t, 1.15, 1.45));
    Tmove = 1.6; Tlet = 1.68; gloss = P(t, 1.2, 1.6);
  } else {
    const e = E.outExpo(P(t, 17.3, 17.85));
    size = 260 * lerp(1.35, 1, e); blur = (1 - P(t, 17.3, 17.6)) * 10;
    Tmove = 18.0; Tlet = 18.08; gloss = P(t, 19.1, 19.55);
  }
  const q = E.inOutCubic(P(t, Tmove, Tmove + 0.26));
  const cx = lerp(hero[0], lockMark[0], q), cy = lerp(hero[1], lockMark[1], q); size = lerp(size, lockSize, q);
  Object.assign($('mark').style, { left: (cx - size / 2) + 'px', top: (cy - size / 2) + 'px', width: size + 'px', height: size + 'px', opacity: 1, filter: `blur(${blur}px) drop-shadow(0 0 ${12 + 34 * fill * (1 - q)}px rgba(110,200,210,${0.55 * fill}))`, transform: `rotate(${rot}deg)` });
  $('markS').setAttribute('stroke-dashoffset', 1 - draw); $('markS').style.opacity = strokeOp;
  $('markP').style.opacity = fill; $('markG').style.opacity = fill;
  const gs = lerp(-0.25, 1.25, gloss);
  $('g0').setAttribute('offset', clamp(gs - 0.12, 0, 1)); $('g1').setAttribute('offset', clamp(gs, 0, 1)); $('g2').setAttribute('offset', clamp(gs + 0.12, 0, 1));
  const ga = intro ? E.inOutSine(P(t, 0.8, 1.45)) : P(t, 17.3, 17.7);
  Object.assign($('glowL').style, { left: (cx - 450) + 'px', top: (cy - 450) + 'px', opacity: ga * (1 - 0.5 * q) });
  LET.forEach((s, i) => { const lp = E.outCubic(P(t, Tlet + i * 0.03, Tlet + i * 0.03 + 0.3)); Object.assign(s.style, { left: lockL + 'px', top: lockT + 'px', opacity: lp, filter: `blur(${(1 - lp) * 10}px)`, transform: `translateX(${(1 - lp) * 26}px)` }); });
  const tg = $('tag'); const tp = E.outCubic(P(t, 18.45, 18.8)); show(tg, !intro);
  Object.assign(tg.style, { top: '598px', opacity: tp, transform: `translateY(${(1 - tp) * 14}px)`, filter: `blur(${(1 - tp) * 6}px)` });
  let sc, ox, oy;
  if (intro) { sc = (1 + 0.04 * P(t, 1.9, 2.62)) * lerp(1, 7, E.inCubic(P(t, 2.62, 2.88))); ox = lockMark[0]; oy = lockMark[1]; }
  else { sc = 1 + 0.08 * E.inOutSine(P(t, 18.0, 20)); ox = 960; oy = 540; }
  $('logo').style.transformOrigin = `${ox}px ${oy}px`; $('logo').style.transform = `scale(${sc})`;
}

// ---------- render ----------
function render(t) {
  $('stars').style.transform = `translate(${-30 + 2.2 * t}px,${-10 + 0.8 * t}px) scale(1.06)`;
  $('flash').style.opacity = Math.max(
    P(t, 2.68, 2.86) * (1 - P(t, 2.86, 3.12)),
    P(t, 9.72, 9.98) * (1 - P(t, 10.0, 10.38)),
    P(t, 17.12, 17.36) * (1 - P(t, 17.38, 17.8)));
  $('black').style.opacity = Math.max(1 - E.inOutSine(P(t, 0, 0.45)), E.inOutSine(P(t, 19.7, 20.0)));
  renderLogo(t);

  // ---------- WORLD A: dashboard + send ----------
  const onA = t >= 2.82 && t < 10.0; show($('wA'), onA);
  if (onA) {
    $('bal').textContent = '$' + (15468.54 * E.outCubic(P(t, 2.86, 3.5))).toFixed(2);
    for (let i = 1; i < 4; i++) { const b = $('btn' + i); b.style.opacity = 1; b.style.transform = 'none'; }
    $('btn0').style.opacity = 1;
    $('btn0').style.filter = `brightness(${1 + 0.22 * P(t, 5.2, 5.32)})`;
    $('btn0').style.transform = `scale(${1 - 0.035 * bump(t, 5.36, 5.5)})`;
    $('sendbg').style.opacity = E.inOutSine(P(t, 5.42, 5.68));
    const md = $('modal'); show(md, t >= 5.46);
    grow(md, SEND_BTN, MODAL_C, E.outExpo(P(t, 5.48, 5.95)), 0.08);
    const dim = E.outCubic(P(t, 8.2, 8.45));
    md.style.opacity = P(t, 5.48, 5.6);
    md.style.filter = dim > 0 ? `brightness(${1 - 0.58 * dim}) blur(${5 * dim}px)` : 'none';
    $('mFull').style.opacity = P(t, 7.72, 7.86);
    $('mFull').style.filter = `brightness(${1 + 0.22 * bump(t, 8.1, 8.24)})`;
    let amt = '';
    if (t < 5.95) $('amt').innerHTML = '0.00';
    else amt = typed($('amt'), '100.1232', 5.95, 0.055, t, t < 6.8 && blink(t, t < 6.45), 26);
    $('usd').textContent = '$' + fmt((parseFloat(amt) || 0) * 77.75);
    if (t < 6.85) { $('addr').innerHTML = 'Enter Recipient Address'; addrCaretX = 558.3; }
    else { typed($('addr'), '0xd0B55120f3AdE8B89e1aA5A6bcE5Da1b07E4', 6.85, 0.0235, t, t < 7.85 && blink(t, t < 7.75), 17); addrCaretX = 558.3 + $('addr').offsetWidth; }
    const sw = P(t, 7.95, 8.35); $('sweepA').style.display = sw > 0 && sw < 1 ? 'block' : 'none';
    $('sweepA').firstElementChild.style.left = (-150 + 720 * E.inOutSine(sw)) + 'px';
    const st = $('stat'); show(st, t >= 8.2);
    st.style.transform = `translateY(${(1 - E.outExpo(P(t, 8.22, 8.75))) * 190}px)`; st.style.opacity = P(t, 8.22, 8.34);
    $('stc3').style.opacity = P(t, 8.85, 8.98); $('stc4').style.opacity = P(t, 9.22, 9.35);
    ring($('ringA'), [[8.6, ...STAT_CHECKS[0]], [8.98, ...STAT_CHECKS[1]], [9.35, ...STAT_CHECKS[2]]], t);
    applyCam($('wA'), camA(t));
  }

  // ---------- WORLD B: swap ----------
  const onB = t >= 10.62 && t < 13.95; show($('wB'), onB);
  if (onB) {
    $('wB').style.opacity = E.inOutSine(P(t, 10.62, 10.86));
    const sc = $('scard'); const dim = E.outCubic(P(t, 12.6, 12.85));
    sc.style.opacity = 1; sc.style.transform = 'none';
    sc.style.filter = `brightness(${(1 + 0.18 * bump(t, 12.46, 12.58)) * (1 - 0.58 * dim)}) blur(${5 * dim}px)`;
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
    const ss = $('swst'); show(ss, t >= 12.6);
    ss.style.transform = `translateY(${(1 - E.outExpo(P(t, 12.62, 13.12))) * 170}px)`; ss.style.opacity = P(t, 12.62, 12.74);
    $('swc2').style.opacity = P(t, 13.05, 13.18); $('swc3').style.opacity = P(t, 13.3, 13.42);
    ring($('ringB'), [[13.18, ...SWST_CHECKS[0]], [13.42, ...SWST_CHECKS[1]]], t);
    applyCam($('wB'), camB(t));
  }

  // ---------- WORLD C: referral ----------
  const onC = t >= 14.6 && t < 17.4; show($('wC'), onC);
  const cC = camC(t);
  if (onC) {
    $('wC').style.opacity = E.inOutSine(P(t, 14.6, 14.82));
    $('refbg').style.opacity = E.inOutSine(P(t, 15.12, 15.36));
    const pop = $('pop'); show(pop, t >= 15.1);
    grow(pop, SHARE_BTN, POP_C, E.outExpo(P(t, 15.12, 15.6)), 0.08); pop.style.opacity = P(t, 15.12, 15.24);
    for (let i = 0; i < 4; i++) {
      const p = P(t, 15.42 + i * 0.06, 15.82 + i * 0.06), e = E.outCubic(p);
      Object.assign($('tl' + i).style, { opacity: e, transform: `translateY(${(1 - e) * 16}px) scale(${0.72 + 0.28 * E.outBack(p)})` });
    }
    $('copyok').style.opacity = P(t, 16.62, 16.7);
    const cp = P(t, 16.65, 16.9), cb = E.outBack(cp);
    Object.assign($('copied').style, { opacity: P(t, 16.65, 16.75), transform: `translate(${(1 - cb) * 12}px,${(1 - cb) * 22}px) scale(${0.4 + 0.6 * cb})`, transformOrigin: '75% 100%' });
    applyCam($('wC'), cC);
  }

  // ---------- headings & text cards ----------
  setHead($('h1'), t, 4.35, 5.18, 0.07);
  setHead($('h2'), t, 8.04, 8.62, 0.08);
  setHead($('card1'), t, 10.06, 10.56, 0.1, 0.45);
  $('card1').style.transform = `scale(${1 + 0.05 * P(t, 10.0, 10.8)})`;
  const c2 = $('card2'); c2.style.transform = `translateX(${1500 * (1 - E.outCubic(P(t, 13.66, 14.0)))}px)`;
  setHead(c2, t, 13.78, 14.24, 0.07, 0.42);

  // ---------- cursor ----------
  const cur = $('cursor'); let cs = null;
  const seg = (a, b, from, to, pressA, fadeIn, fadeOut) => { const k = E.inOutCubic(P(t, a, b)); return { x: lerp(from[0], to[0], k), y: lerp(from[1], to[1], k), op: P(t, fadeIn[0], fadeIn[1]) * (1 - P(t, fadeOut[0], fadeOut[1])), pr: bump(t, pressA, pressA + 0.13) }; };
  if (t >= 4.7 && t < 5.7) { const c = camA(t); cs = seg(4.7, 5.32, [1500, 960], w2s(c, ...SEND_BTN), 5.36, [4.7, 4.86], [5.55, 5.7]); }
  else if (t >= 7.72 && t < 8.4) { const c = camA(t); cs = seg(7.75, 8.05, w2s(c, 880, 760), w2s(c, 720, 630), 8.08, [7.72, 7.85], [8.25, 8.4]); }
  else if (t >= 12.1 && t < 12.7) { const c = camB(t); cs = seg(12.12, 12.42, w2s(c, 880, 720), w2s(c, 720, 604), 12.45, [12.1, 12.22], [12.56, 12.7]); }
  else if (t >= 14.7 && t < 15.35) { cs = seg(14.72, 15.04, [1560, 880], w2s(cC, ...SHARE_BTN), 15.06, [14.7, 14.82], [15.2, 15.35]); }
  else if (t >= 16.12 && t < 17.0) { cs = seg(16.15, 16.55, [1640, 990], w2s(cC, ...COPY_ICON), 16.56, [16.12, 16.25], [16.85, 17.0]); }
  if (cs && cs.op > 0) Object.assign(cur.style, { display: 'block', left: (cs.x - 4) + 'px', top: (cs.y - 3) + 'px', opacity: cs.op, transform: `scale(${1 - 0.18 * cs.pr})` });
  else cur.style.display = 'none';
}

window.MB = [[2.62, 2.95], [4.2, 4.6], [5.45, 5.95], [5.92, 6.2], [7.8, 8.12], [8.22, 8.5], [9.55, 10.0], [10.85, 11.15], [12.15, 12.45], [12.62, 12.9], [13.45, 14.05], [15.1, 15.5], [16.0, 16.3], [17.0, 17.4]];
window.render = render;
window.ready = (async () => {
  drawStars();
  heading($('h1'), 'One wallet for everything onchain', 'onchain');
  heading($('h2'), 'Send in seconds', 'seconds');
  heading($('card1'), 'Swap instantly', 'instantly');
  heading($('card2'), 'Earn when friends join', 'join');
  await setupLogo();
  await document.fonts.load('600 32px Friends'); await document.fonts.load('400 16px Friends');
  await Promise.all([...document.images].map(i => i.decode().catch(() => null)));
  render(0); return true;
})();
