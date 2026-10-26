// Supanova product demo — v8: 'Send in seconds.' text card, swap max zoom 2.0, level dashboard glide.
// v7: fewer camera moves per screen, arrow push-in on swap, pasted address, Figma-exact radii.
// v6 (GSAP). Camera grammar: 3 shot sizes, log-space zoom, locked targets, one ease, no overlaps, gentle drift between moves.
// (v5 notes:) v4 + real spinners, live swap conversion, spring flip, pointer hand, refined refer camera.
// v2's structure and pace + v3's smooth GSAP camera and one-at-a-time entrances.
// No 3D tilts. More lateral camera pans. Micro-interactions: shines, hovers, presses, shimmer.
const K = 1920 / 1440;
const $ = id => document.getElementById(id);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, p) => a + (b - a) * p;
const fmt = v => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const show = (el, on) => { el.style.display = on ? '' : 'none'; };

const SEND_BTN = [405, 283], MODAL_C = [720, 416];
const STAT_CHECKS = [[19.5, 91.8], [19, 157.8], [19.5, 219.8]];
const SWST_CHECKS = [[20.5, 85.1], [20, 145.4]];
const SHARE_BTN = [660, 247], POP_C = [720, 381.5], APP_ICON = [568.8, 226.8], COPY_ICON = [872.5, 314.5];
const ADDR = '0xd0B55120f3AdE8B89e1aA5A6bcE5Da1b07E4';
const SHINES = ['shPoints', 'shSend', 'sweepA', 'sweepB', 'shT0', 'shT1', 'shT2', 'shT3'];
const SPIN_X = 424;
const ARROW_C = [495 + 207 + 18, 196 + 123 + 18];   // swap arrows centre in world B
const DUR = 27.03; // spinner centre inside status cards (aligned with the card's right padding)

const cam = (cx, cy, z) => ({ cx, cy, z });
const S = {
  black: 1, flash: 0, shimmer: 0,
  logoOn: 1, outro: 0, draw: 0, strokeOp: 0, fill: 0, markRot: -12, markSize: 240, lockQ: 0, glow: 0, gloss: -0.25,
  logoScale: 1, logoOp: 1, markBlur: 0, tag: 0,
  A: 0, camA: cam(400, 205, 3.4), bal: 0, hover: 0, press: 0, sendbg: 0,
  modalE: 0, modalOp: 0, paste: 0, modalDim: 0, mFull: 0, ctaFlash: 0, amtN: 0, addrN: 0, caretAmt: 0, caretAddr: 0,
  statE: 0, statOp: 0, stc2: 0, stc3: 0, stc4: 0, rA: { 0: 0, 1: 0, 2: 0 },
  B: 0, camB: cam(600, 414, 1.35), sFromN: 0, caretFrom: 0, sToV: 0, flip: 0, flipPop: 0, swPress: 0, swDim: 0,
  swE: 0, swOp: 0, swc2: 0, swc3: 0, arS: 0, rB: { 0: 0, 1: 0 },
  C: 0, camC: cam(522, 247, 1.35), shareHover: 0, sharePress: 0, refbg: 0, popE: 0, popOp: 0, copyok: 0, copied: 0, Cblur: 0,
  cur: { w: 'A', x: 1150, y: 640, op: 0, press: 0, hand: 0 },
  sh: Object.fromEntries(SHINES.map(k => [k, 0])),
};
let LET = [], tl;
const TILE_IDS = ['tl0', 'tl1', 'tl2', 'tl3'];

// ---------------- static setup ----------------
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
  el.innerHTML = text.split(' ').map(w => w.replace('.', '') === gradWord
    ? `<span class="gw" style="background:linear-gradient(100deg,#6cc3cf 0%,#e3995f 35%,#fff4e6 50%,#6cc3cf 65%,#e3995f 100%);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent">${w}</span>`
    : `<span>${w}</span>`).join(' ');
  [...el.children].forEach(s => { s.style.opacity = 0; });
}
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

// ---------------- timeline helpers ----------------
const move = (obj, to, at, dur, ease = 'power3.inOut') => tl.to(obj, { ...to, duration: dur, ease }, at);
const set = (obj, props, at) => tl.set(obj, props, at);
// ---- camera grammar ----
const WIDE = 0.64, MED = 1.35, CLOSE = 2.3;          // the three shot sizes
const DETAIL = 2.0;                                   // swap screen's max zoom: arrows → status
const CAM_EASE = 'power2.inOut', CUT_EASE = 'power3.in', DRIFT = 0.018;   // drift: +1.8 %/s slow push while holding
const KEYS = { A: [], B: [], C: [] }, INIT = { A: cam(400, 205, 3.4), B: cam(600, 414, MED), C: cam(522, 247, MED) };
const camId = c => (c === S.camA ? 'A' : c === S.camB ? 'B' : 'C');
const pan = (c, to, at, dur, ease = CAM_EASE) => { const L = KEYS[camId(c)]; const prev = L.length ? L[L.length - 1].to : INIT[camId(c)]; L.push({ t: at, d: dur, to: { ...prev, ...to }, ease }); };
function interpCam(a, b, p) {
  const z = Math.exp(lerp(Math.log(a.z), Math.log(b.z), p));
  if (b.z >= a.z) {                       // zoom in / pan: destination travels in a straight line to frame centre
    const ox = (b.cx - a.cx) * K * a.z * (1 - p), oy = (b.cy - a.cy) * K * a.z * (1 - p);
    return { cx: b.cx - ox / (K * z), cy: b.cy - oy / (K * z), z };
  }                                       // zoom out: the current subject travels in a straight line to its final spot
  const ox = (a.cx - b.cx) * K * b.z * p, oy = (a.cy - b.cy) * K * b.z * p;
  return { cx: a.cx - ox / (K * z), cy: a.cy - oy / (K * z), z };
}
const drift = (s, dt) => ({ ...s, z: s.z * Math.exp(DRIFT * Math.max(0, dt)) });
function camAt(id, t) {
  let st = INIT[id], tEnd = null;
  for (const k of KEYS[id]) {
    const s0 = tEnd === null ? st : drift(st, k.t - tEnd);
    if (t < k.t) return tEnd === null ? st : drift(st, t - tEnd);
    if (t < k.t + k.d) return interpCam(s0, k.to, gsap.parseEase(k.ease)((t - k.t) / k.d));
    st = k.to; tEnd = k.t + k.d;
  }
  return tEnd === null ? st : drift(st, t - tEnd);
}
function headIn(el, at, st = 0.09, dur = 0.7) { tl.fromTo(el.children, { opacity: 0, y: 22, filter: 'blur(14px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: dur, ease: 'power2.out', stagger: st }, at); }
function headOut(el, at, dur = 0.45) { tl.to(el.children, { opacity: 0, y: -12, filter: 'blur(12px)', duration: dur, ease: 'power2.in', stagger: 0.03 }, at); }
const shine = (k, at, dur = 0.55) => tl.fromTo(S.sh, { [k]: 0 }, { [k]: 1, duration: dur, ease: 'sine.inOut', immediateRender: false }, at);
const tap = (obj, k, at) => { move(obj, { [k]: 1 }, at, 0.07, 'power1.out'); move(obj, { [k]: 0 }, at + 0.07, 0.14, 'power1.in'); };
function cursorTo(w, from, to, at, dur) { set(S.cur, { w, x: from[0], y: from[1], op: 0, hand: 0 }, at); move(S.cur, { op: 1 }, at, 0.18, 'none'); move(S.cur, { x: to[0], y: to[1] }, at + 0.02, dur, 'power2.inOut'); move(S.cur, { hand: 1 }, at + dur * 0.78, 0.12, 'none'); }

function build() {
  tl = gsap.timeline({ paused: true });
  move(S, { shimmer: 1 }, 0, DUR, 'none');

  // ===== INTRO 0–3.0: mark draws itself, wordmark, zoom-through =====
  move(S, { black: 0 }, 0, 0.5, 'sine.inOut');
  move(S, { strokeOp: 1 }, 0.15, 0.2, 'none');
  move(S, { draw: 1 }, 0.15, 1.05, 'power2.inOut');
  move(S, { markRot: 0, markSize: 260 }, 0.15, 1.3, 'power3.out');
  move(S, { fill: 1 }, 0.95, 0.45, 'sine.inOut');
  move(S, { strokeOp: 0 }, 1.2, 0.3, 'none');
  move(S, { glow: 1 }, 0.9, 0.6, 'sine.inOut');
  move(S, { gloss: 1.25 }, 1.25, 0.45, 'power1.inOut');
  move(S, { lockQ: 1 }, 1.6, 0.42, 'power3.inOut');
  tl.fromTo(LET, { opacity: 0, x: 24, filter: 'blur(10px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.45, ease: 'power2.out', stagger: 0.035 }, 1.68);
  move(S, { logoScale: 1.04 }, 1.9, 0.75, 'sine.inOut');
  move(S, { logoScale: 7 }, 2.65, 0.3, 'power3.in');
  move(S, { flash: 1 }, 2.72, 0.2, 'power1.in');
  set(S, { logoOn: 0 }, 2.95);

  // ===== DASHBOARD 2.95–6.55 — three moves: land, one glide, pull back =====
  set(S, { A: 1 }, 2.92);
  move(S, { flash: 0 }, 2.95, 0.35, 'power2.out');
  pan(S.camA, cam(400, 245, CLOSE), 2.95, 0.5);                        // lands on balance + action row together (close)
  move(S, { bal: 1 }, 2.98, 0.75, 'power2.out');
  pan(S.camA, cam(965, 245, CLOSE), 3.55, 1.35);                       // one level glide left → right across Send · Receive · Deposit · Swap
  pan(S.camA, cam(720, 368, WIDE), 4.95, 0.95);                        // pull back to the whole wallet (wide)
  headIn($('h1'), 5.4, 0.075, 0.6);
  shine('shPoints', 5.95, 0.55);
  cursorTo('A', [1060, 600], SEND_BTN, 5.84, 0.56);
  move(S, { hover: 1 }, 6.3, 0.12, 'none');
  shine('shSend', 6.27, 0.32);
  tap(S, 'press', 6.45); tap(S.cur, 'press', 6.45);
  headOut($('h1'), 6.25);

  // zoom-through the Send button → its own text card
  pan(S.camA, cam(SEND_BTN[0], SEND_BTN[1], 7.5), 6.55, 0.65, CUT_EASE);
  move(S.cur, { op: 0 }, 6.55, 0.18, 'none');
  move(S, { flash: 1 }, 6.95, 0.25, 'power1.in');
  set(S, { A: 0 }, 7.2);

  // ===== TEXT: Send in seconds. =====
  const X0 = 7.21;
  move(S, { flash: 0 }, X0 + 0.05, 0.38, 'power2.out');
  headIn($('card0'), X0 + 0.11, 0.1, 0.5);
  headOut($('card0'), X0 + 0.6, 0.35);

  // ===== SEND — modal grows out of the Send button, one close-up on both fields, settle, zoom-through =====
  const T = X0 + 0.92;
  set(S, { sendbg: 1 }, T - 0.02);
  pan(S.camA, cam(720, 416, MED), T - 0.02, 0.01, 'none');           // cut (hidden by the text card)
  move(S, { A: 1 }, T, 0.3, 'sine.inOut');
  move(S, { modalOp: 1 }, T + 0.03, 0.14, 'none');
  move(S, { modalE: 1 }, T + 0.03, 0.62, 'expo.out');
  pan(S.camA, cam(720, 350, CLOSE), T + 0.75, 0.55);                   // close on From + To together — no hunting around
  move(S, { caretAmt: 1 }, T + 1.2, 0.01, 'none');
  move(S, { amtN: 8 }, T + 1.25, 0.48, 'none');                        // amount is typed
  move(S, { caretAmt: 0 }, T + 1.85, 0.01, 'none');
  move(S, { caretAddr: 1 }, T + 1.95, 0.01, 'none');
  set(S, { addrN: ADDR.length }, T + 2.3);                              // address is pasted in one go
  move(S, { paste: 1 }, T + 2.3, 0.06, 'none'); move(S, { paste: 0 }, T + 2.36, 0.55, 'power2.out');
  move(S, { mFull: 1 }, T + 2.42, 0.14, 'none');
  move(S, { caretAddr: 0 }, T + 2.9, 0.01, 'none');
  pan(S.camA, cam(720, 418, MED), T + 2.75, 0.6);                      // settle: modal + room for the status panel (medium)
  cursorTo('A', [900, 770], [720, 630], T + 3.2, 0.55);
  shine('sweepA', T + 3.3, 0.55);
  tap(S, 'ctaFlash', T + 3.83); tap(S.cur, 'press', T + 3.83);
  move(S.cur, { op: 0 }, T + 4.0, 0.2, 'none');
  move(S, { modalDim: 1 }, T + 3.95, 0.35, 'power2.out');
  move(S, { statOp: 1 }, T + 3.97, 0.14, 'none');
  move(S, { statE: 1 }, T + 3.97, 0.7, 'expo.out');                     // status rises from under the modal; camera holds
  move(S, { stc2: 1 }, T + 4.43, 0.12, 'none'); move(S.rA, { 0: 1 }, T + 4.53, 0.5, 'power2.out');
  move(S, { stc3: 1 }, T + 4.83, 0.12, 'none'); move(S.rA, { 1: 1 }, T + 4.93, 0.5, 'power2.out');
  move(S, { stc4: 1 }, T + 5.23, 0.12, 'none'); move(S.rA, { 2: 1 }, T + 5.33, 0.5, 'power2.out');
  pan(S.camA, cam(494 + 19.5, 414 + 219.8, 7.5), T + 5.6, 0.5, CUT_EASE);   // zoom-through the final check
  move(S, { flash: 1 }, T + 5.85, 0.25, 'power1.in');
  set(S, { A: 0 }, T + 6.11);

  // ===== TEXT: Swap instantly. =====
  const X1 = T + 6.12;
  move(S, { flash: 0 }, X1 + 0.05, 0.38, 'power2.out');
  headIn($('card1'), X1 + 0.11, 0.1, 0.5);
  headOut($('card1'), X1 + 0.75, 0.35);

  // ===== SWAP — glide in, press, push in on the arrows, pan down at that zoom to the status =====
  const W = X1 + 0.83;
  move(S, { B: 1 }, W, 0.25, 'sine.inOut');
  pan(S.camB, cam(720, 414, MED), W, 1.1);                            // gentle left → centre glide onto the card (medium)
  move(S, { caretFrom: 1 }, W + 0.5, 0.01, 'none');
  move(S, { sFromN: 3 }, W + 0.55, 0.25, 'none');                     // To converts live
  move(S, { caretFrom: 0 }, W + 1.15, 0.01, 'none');
  cursorTo('B', [900, 740], [720, 604], W + 1.05, 0.5);
  shine('sweepB', W + 1.15, 0.5);
  tap(S, 'swPress', W + 1.6); tap(S.cur, 'press', W + 1.6);
  move(S, { flip: 1 }, W + 1.62, 0.38, 'power2.inOut');              // arrows flip
  move(S.cur, { op: 0 }, W + 1.85, 0.2, 'none');
  pan(S.camB, cam(ARROW_C[0], ARROW_C[1], DETAIL), W + 2.0, 0.65);    // push in on the arrows (close)
  move(S, { arS: 1 }, W + 2.45, 0.09, 'power2.out'); move(S, { arS: 0 }, W + 2.54, 0.7, 'elastic.out(1.1, 0.32)');
  move(S, { swOp: 1 }, W + 2.95, 0.12, 'none');
  move(S, { swE: 1 }, W + 2.95, 0.7, 'expo.out');                  // status rises into the bottom of the frame
  move(S, { swDim: 1 }, W + 3.1, 0.35, 'power2.out');
  pan(S.camB, cam(720, 532, DETAIL), W + 3.05, 0.6);                 // pan straight down, same zoom, onto the status
  move(S, { swc2: 1 }, W + 3.75, 0.12, 'none'); move(S.rB, { 0: 1 }, W + 3.87, 0.5, 'power2.out');
  move(S, { swc3: 1 }, W + 4.15, 0.12, 'none'); move(S.rB, { 1: 1 }, W + 4.27, 0.5, 'power2.out');
  pan(S.camB, cam(1950, 537, DETAIL), W + 4.42, 0.3, 'power2.in');     // whip pan right
  move(S, { B: 0 }, W + 4.6, 0.12, 'none');

  // ===== TEXT: Earn when friends join. =====
  const X2 = W + 4.53;
  tl.fromTo($('card2'), { x: 1500 }, { x: 0, duration: 0.4, ease: 'power3.out' }, X2);
  headIn($('card2'), X2 + 0.08, 0.07, 0.45);
  headOut($('card2'), X2 + 0.56, 0.3);

  // ===== REFER =====
  const R = X2 + 1.0;
  move(S, { C: 1 }, R, 0.3, 'sine.inOut');
  pan(S.camC, cam(628, 248, CLOSE), R + 0.28, 0.66);                    // one smooth push + pan along the link to Share
  cursorTo('C', [800, 400], SHARE_BTN, R + 0.5, 0.5);
  tap(S.cur, 'press', R + 1.05);
  move(S.cur, { op: 0 }, R + 1.2, 0.2, 'none');
  move(S, { refbg: 1 }, R + 1.1, 0.32, 'sine.inOut');
  move(S, { popOp: 1 }, R + 1.12, 0.14, 'none');
  move(S, { popE: 1 }, R + 1.12, 0.62, 'expo.out');
  pan(S.camC, cam(720, 381, MED), R + 1.12, 0.72);                      // pop-up (medium)
  tl.fromTo(TILE_IDS.map($), { opacity: 0, y: 16, scale: 0.72 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.6)', stagger: 0.07 }, R + 1.48);
  ['shT0', 'shT1', 'shT2', 'shT3'].forEach((k, i) => shine(k, R + 1.95 + i * 0.07, 0.4));
  pan(S.camC, cam(758, 318, CLOSE), R + 2.0, 0.55);                     // link (close)
  cursorTo('C', [1010, 420], COPY_ICON, R + 2.25, 0.42);
  tap(S.cur, 'press', R + 2.72);
  move(S, { copyok: 1 }, R + 2.75, 0.08, 'none');
  move(S, { copied: 1 }, R + 2.8, 0.35, 'back.out(1.8)');
  move(S.cur, { op: 0 }, R + 3.0, 0.2, 'none');
  pan(S.camC, cam(APP_ICON[0], APP_ICON[1], 11), R + 3.05, 0.42, CUT_EASE);  // zoom-through the app icon
  move(S, { flash: 1 }, R + 3.25, 0.22, 'power1.in');
  set(S, { C: 0 }, R + 3.48);
  window.TIMES = { X0, T, X1, W, X2, R, O: R + 3.47 };
  window.MB = [[2.62, 3.05], [6.85, 7.25], [T + 5.6, T + 6.15], [W + 4.42, W + 4.95], [R + 3.0, R + 3.55]];

  // ===== OUTRO 23.45–26.4 =====
  const O = R + 3.47;
  set(S, { logoOn: 1, outro: 1, logoOp: 1, logoScale: 1, lockQ: 0, fill: 1, draw: 1, strokeOp: 0, markRot: 0, markSize: 340, markBlur: 10, glow: 1, gloss: -0.25 }, O);
  tl.set(LET, { opacity: 0, x: 24, filter: 'blur(10px)' }, O);
  move(S, { flash: 0 }, O + 0.03, 0.45, 'power2.out');
  move(S, { markSize: 260, markBlur: 0 }, O, 0.6, 'expo.out');
  move(S, { lockQ: 1 }, O + 0.72, 0.42, 'power3.inOut');
  tl.to(LET, { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.45, ease: 'power2.out', stagger: 0.035 }, O + 0.8);
  move(S, { tag: 1 }, O + 1.25, 0.5, 'power2.out');
  move(S, { logoScale: 1.06 }, O + 0.6, 2.35, 'sine.inOut');
  move(S, { gloss: 1.25 }, O + 1.85, 0.55, 'power1.inOut');
  move(S, { black: 1 }, O + 2.5, 0.45, 'sine.inOut');
  tl.set({}, {}, O + 2.95);
}

// ---------------- apply ----------------
const applyCam = (el, c) => { el.style.transform = `translate(960px,540px) scale(${K * c.z}) translate(${-c.cx}px,${-c.cy}px)`; };
const w2s = (c, x, y) => [960 + (x - c.cx) * K * c.z, 540 + (y - c.cy) * K * c.z];
function grow(el, from, to, e, s0 = 0.08) { el.style.transform = `translate(${(1 - e) * (from[0] - to[0])}px,${(1 - e) * (from[1] - to[1])}px) scale(${lerp(s0, 1, e)})`; }
function caretHTML(s, on, h) { return s.replace(/&/g, '&amp;') + (on ? `<span class="caret" style="height:${h}px"></span>` : ''); }
const blinkOn = t => Math.floor(t * 3) % 2 === 0;
function ringApply(el, arr, pts) {
  let idx = -1; Object.values(arr).forEach((p, i) => { if (p > 0 && p < 1) idx = i; });
  if (idx < 0) { el.style.display = 'none'; return; }
  const p = arr[idx], [x, y] = pts[idx], s = 16 + 44 * p;
  Object.assign(el.style, { display: 'block', left: (x - s / 2) + 'px', top: (y - s / 2) + 'px', width: s + 'px', height: s + 'px', opacity: 0.75 * (1 - p) });
}
function spinApply(el, row, pts, t) {
  if (row < 0) { el.style.display = 'none'; return; }
  Object.assign(el.style, { display: 'block', left: (SPIN_X - 10) + 'px', top: (pts[row][1] - 10) + 'px', transform: `rotate(${(t * 400) % 360}deg)` });
}
function shineApply(k) {
  const el = $(k), p = S.sh[k]; if (!el) return;
  if (p <= 0 || p >= 1) { el.style.display = 'none'; return; }
  const w = el.offsetWidth || parseFloat(el.style.width), bw = Math.max(26, w * 0.32);
  el.style.display = 'block';
  Object.assign(el.firstElementChild.style, { width: bw + 'px', left: (-bw * 1.4 + (w + bw * 2.8) * p) + 'px' });
}

function applyLogo() {
  show($('logo'), S.logoOn > 0); if (!S.logoOn) return;
  const outro = S.outro > 0, LY = outro ? 505 : 540;
  const lockL = 610, lockT = LY - 60.6, lockMark = [lockL + 54.15, lockT + 54.15];
  const hero = outro ? [960, 520] : [960, 540];
  const q = S.lockQ, cx = lerp(hero[0], lockMark[0], q), cy = lerp(hero[1], lockMark[1], q), size = lerp(S.markSize, 108.3, q);
  Object.assign($('mark').style, { left: (cx - size / 2) + 'px', top: (cy - size / 2) + 'px', width: size + 'px', height: size + 'px', filter: `blur(${S.markBlur}px) drop-shadow(0 0 ${12 + 34 * S.fill * (1 - q)}px rgba(110,200,210,${0.55 * S.fill}))`, transform: `rotate(${S.markRot}deg)` });
  $('markS').setAttribute('stroke-dashoffset', 1 - S.draw); $('markS').style.opacity = S.strokeOp;
  $('markP').style.opacity = S.fill; $('markG').style.opacity = S.fill;
  const gs = S.gloss;
  $('g0').setAttribute('offset', clamp(gs - 0.12, 0, 1)); $('g1').setAttribute('offset', clamp(gs, 0, 1)); $('g2').setAttribute('offset', clamp(gs + 0.12, 0, 1));
  Object.assign($('glowL').style, { left: (cx - 450) + 'px', top: (cy - 450) + 'px', opacity: S.glow * (1 - 0.5 * q) });
  LET.forEach(s => { s.style.left = lockL + 'px'; s.style.top = lockT + 'px'; });
  const tg = $('tag'); show(tg, outro);
  Object.assign(tg.style, { top: '598px', opacity: S.tag, transform: `translateY(${(1 - S.tag) * 14}px)`, filter: `blur(${(1 - S.tag) * 6}px)` });
  const ox = outro ? 960 : lockMark[0], oy = outro ? 540 : lockMark[1];
  Object.assign($('logo').style, { transformOrigin: `${ox}px ${oy}px`, transform: `scale(${S.logoScale})`, opacity: S.logoOp });
}

function render(t) {
  tl.time(t, false);
  Object.assign(S.camA, camAt('A', t)); Object.assign(S.camB, camAt('B', t)); Object.assign(S.camC, camAt('C', t));
  $('stars').style.transform = `translate(${-30 + 2 * t}px,${-10 + 0.7 * t}px) scale(1.06)`;
  $('flash').style.opacity = S.flash;
  $('black').style.opacity = S.black;
  document.querySelectorAll('.gw').forEach(g => { g.style.backgroundPosition = `${100 - (S.shimmer * DUR * 40) % 100}% 0`; });
  applyLogo();
  SHINES.forEach(shineApply);

  show($('wA'), S.A > 0.001);
  if (S.A > 0.001) {
    $('wA').style.opacity = S.A;
    $('bal').textContent = '$' + (15468.54 * S.bal).toFixed(2);
    $('btn0').style.filter = `brightness(${1 + 0.22 * S.hover})`;
    $('btn0').style.transform = `scale(${1 - 0.035 * S.press})`;
    $('shSend').style.transform = `scale(${1 - 0.035 * S.press})`;
    $('sendbg').style.opacity = S.sendbg;
    const md = $('modal'); show(md, S.modalOp > 0);
    grow(md, SEND_BTN, MODAL_C, S.modalE); md.style.opacity = S.modalOp;
    md.style.filter = S.modalDim > 0.001 ? `brightness(${1 - 0.58 * S.modalDim}) blur(${5 * S.modalDim}px)` : 'none';
    $('mFull').style.opacity = S.mFull; $('mFull').style.filter = `brightness(${1 + 0.22 * S.ctaFlash})`;
    const n = Math.floor(S.amtN + 1e-6), amt = '100.1232'.slice(0, n);
    $('amt').innerHTML = n === 0 ? '0.00' : caretHTML(amt, S.caretAmt > 0.5 && (S.amtN < 8 || blinkOn(t)), 26);
    $('usd').textContent = '$' + fmt((parseFloat(amt) || 0) * 77.75);
    const an = Math.floor(S.addrN + 1e-6);
    $('addr').innerHTML = an === 0 && S.caretAddr < 0.5 ? 'Enter Recipient Address' : (S.paste > 0.002 && an ? `<span style="background:rgba(127,208,216,${0.42 * S.paste});border-radius:3px;box-shadow:0 0 0 2px rgba(127,208,216,${0.42 * S.paste})">${ADDR.slice(0, an)}</span>` + (S.caretAddr > 0.5 && blinkOn(t) ? '<span class="caret" style="height:17px"></span>' : '') : caretHTML(ADDR.slice(0, an), S.caretAddr > 0.5 && (S.addrN < ADDR.length || blinkOn(t)), 17));
    const st = $('stat'); show(st, S.statOp > 0);
    st.style.transform = `translateY(${(1 - S.statE) * 190}px)`; st.style.opacity = S.statOp;
    $('stc2').style.opacity = S.stc2; $('stc3').style.opacity = S.stc3; $('stc4').style.opacity = S.stc4;
    ringApply($('ringA'), S.rA, STAT_CHECKS);
    spinApply($('spA'), S.stc4 > 0.5 ? -1 : S.stc3 > 0.5 ? 2 : S.stc2 > 0.5 ? 1 : 0, STAT_CHECKS, t);
    applyCam($('wA'), S.camA);
  }
  show($('wB'), S.B > 0.001);
  if (S.B > 0.001) {
    $('wB').style.opacity = S.B;
    $('scard').style.filter = `brightness(${(1 + 0.18 * S.swPress) * (1 - 0.58 * S.swDim)}) blur(${5 * S.swDim}px)`;
    const fn = Math.floor(S.sFromN + 1e-6), fr = '200'.slice(0, fn);
    if (fn === 0) { $('sFrom').innerHTML = caretHTML('0', false, 26); $('sFrom').style.opacity = 0.35; }
    else { $('sFrom').style.opacity = 1; $('sFrom').innerHTML = caretHTML(fr, S.caretFrom > 0.5 && (S.sFromN < 3 || blinkOn(t)), 26); }
    $('sFromU').textContent = '$' + fmt((parseFloat(fr) || 0) * 77.75);
    const toV = (parseFloat(fr) || 0) * 77.75;                    // To converts live as From is typed
    $('sTo').textContent = fmt(toV); $('sTo').style.opacity = toV <= 0 ? 0.35 : 1;
    $('sToU').textContent = '$' + fmt(toV);
    $('arrows').style.transform = `perspective(160px) rotateY(${180 * S.flip}deg)`;
    $('arUp').setAttribute('transform', `translate(0 ${-3.2 * S.arS})`); $('arDn').setAttribute('transform', `translate(0 ${3.2 * S.arS})`);
    const ss = $('swst'); show(ss, S.swOp > 0);
    ss.style.transform = `translateY(${(1 - S.swE) * 170}px)`; ss.style.opacity = S.swOp;
    $('swc2').style.opacity = S.swc2; $('swc3').style.opacity = S.swc3;
    ringApply($('ringB'), S.rB, SWST_CHECKS);
    spinApply($('spB'), S.swc3 > 0.5 ? -1 : S.swc2 > 0.5 ? 1 : 0, SWST_CHECKS, t);
    applyCam($('wB'), S.camB);
  }
  show($('wC'), S.C > 0.001);
  if (S.C > 0.001) {
    $('wC').style.opacity = S.C;
    $('refbg').style.opacity = S.refbg;
    const pop = $('pop'); show(pop, S.popOp > 0);
    grow(pop, SHARE_BTN, POP_C, S.popE); pop.style.opacity = S.popOp;
    $('copyok').style.opacity = S.copyok;
    const cb = S.copied;
    Object.assign($('copied').style, { opacity: clamp(cb * 3, 0, 1), transform: `translate(${(1 - cb) * 12}px,${(1 - cb) * 22}px) scale(${0.4 + 0.6 * cb})`, transformOrigin: '75% 100%' });
    applyCam($('wC'), S.camC);
  }
  ['h1', 'h2', 'card0', 'card1', 'card2'].forEach(id => { const el = $(id); show(el, [...el.children].some(s => parseFloat(s.style.opacity || 0) > 0.001)); });

  const cur = $('cursor'), cs = S.cur;
  if (cs.op > 0.001) {
    const c = cs.w === 'A' ? S.camA : cs.w === 'B' ? S.camB : S.camC;
    const [x, y] = w2s(c, cs.x, cs.y);
    Object.assign(cur.style, { display: 'block', left: x + 'px', top: y + 'px', opacity: cs.op, transform: `scale(${1 - 0.16 * cs.press})`, transformOrigin: '0 0' });
    $('curArrow').style.opacity = 1 - cs.hand; $('curHand').style.opacity = cs.hand;
  } else cur.style.display = 'none';
}

window.DURATION = DUR;

window.render = render;
window.ready = (async () => {
  drawStars();
  heading($('h1'), 'One wallet for everything onchain.', 'onchain');
  heading($('h2'), 'Send in seconds.', 'seconds');
  heading($('card0'), 'Send in seconds.', 'seconds');
  heading($('card1'), 'Swap instantly.', 'instantly');
  heading($('card2'), 'Earn when friends join.', 'join');
  await setupLogo();
  TILE_IDS.map($).forEach(e => { e.style.opacity = 0; });
  build();
  await document.fonts.load('600 32px Friends'); await document.fonts.load('400 16px Friends');
  await Promise.all([...document.images].map(i => i.decode().catch(() => null)));
  render(0); return true;
})();
