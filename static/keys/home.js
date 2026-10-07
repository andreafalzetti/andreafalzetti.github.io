(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

// Liquido a particelle (Clavet et al. 2005, double density relaxation).
// Coordinate in unità del viewBox del tasto; y verso il basso.
function makeFluid(o) {
  const max = o.max, h = o.h, h2 = h * h;
  const shapes = o.shapes, margin = o.margin || 0;
  let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9;
  for (const s of shapes) {
    bx0 = Math.min(bx0, s.cx - s.hw); by0 = Math.min(by0, s.cy - s.hh);
    bx1 = Math.max(bx1, s.cx + s.hw); by1 = Math.max(by1, s.cy + s.hh);
  }
  const gx0 = bx0 - h, gy0 = by0 - h;
  const gw = Math.ceil((bx1 - bx0) / h) + 3, gh = Math.ceil((by1 - by0) / h) + 3, NC = gw * gh;
  const x = new Float32Array(max), y = new Float32Array(max);
  const px = new Float32Array(max), py = new Float32Array(max);
  const vx = new Float32Array(max), vy = new Float32Array(max);
  const cellStart = new Int32Array(NC + 1), cellCur = new Int32Array(NC);
  const sorted = new Int32Array(max), pcell = new Int32Array(max);
  const MAXN = 128, nb = new Int32Array(MAXN), nq = new Float32Array(MAXN);
  const nx = new Float32Array(MAXN), ny = new Float32Array(MAXN);
  const f = { x, y, vx, vy, n: 0, max, h,
    rho0: o.rho0, k: o.k, kNear: o.kNear, sigma: o.sigma || 0, beta: o.beta || 0, vmax: o.vmax || h * 0.5 };

  function cell(xx, yy) {
    let cx = ((xx - gx0) / h) | 0, cy = ((yy - gy0) / h) | 0;
    if (cx < 0) cx = 0; else if (cx >= gw) cx = gw - 1;
    if (cy < 0) cy = 0; else if (cy >= gh) cy = gh - 1;
    return cy * gw + cx;
  }
  function build() {
    const n = f.n;
    cellStart.fill(0);
    for (let i = 0; i < n; i++) { const c = cell(x[i], y[i]); pcell[i] = c; cellStart[c + 1]++; }
    for (let c = 0; c < NC; c++) cellStart[c + 1] += cellStart[c];
    for (let c = 0; c < NC; c++) cellCur[c] = cellStart[c];
    for (let i = 0; i < n; i++) sorted[cellCur[pcell[i]]++] = i;
  }
  // Distanza con segno dalla forma (negativa dentro), già ristretta del margine.
  function project(i) {
    let best = 1e9, bs = null, inside = false;
    for (let s = 0; s < shapes.length; s++) {
      const S = shapes[s], hw = S.hw - margin, hh = S.hh - margin, r = S.r - margin;
      const qx = Math.abs(x[i] - S.cx) - (hw - r), qy = Math.abs(y[i] - S.cy) - (hh - r);
      const ox = qx > 0 ? qx : 0, oy = qy > 0 ? qy : 0;
      const sd = Math.sqrt(ox * ox + oy * oy) + Math.min(Math.max(qx, qy), 0) - r;
      if (sd <= 0) { inside = true; break; }
      if (sd < best) { best = sd; bs = S; }
    }
    if (inside || !bs) return;
    const S = bs, hw = S.hw - margin, hh = S.hh - margin, r = S.r - margin;
    const dx = x[i] - S.cx, dy = y[i] - S.cy, sx = dx < 0 ? -1 : 1, sy = dy < 0 ? -1 : 1;
    const ax = hw - r, ay = hh - r, qx = Math.abs(dx) - ax, qy = Math.abs(dy) - ay;
    if (qx > 0 && qy > 0) {
      const d = Math.sqrt(qx * qx + qy * qy), s = r / d;
      x[i] = S.cx + sx * (ax + qx * s); y[i] = S.cy + sy * (ay + qy * s);
    } else {
      if (Math.abs(dx) > hw) x[i] = S.cx + sx * hw;
      if (Math.abs(dy) > hh) y[i] = S.cy + sy * hh;
    }
  }
  function viscosity() {
    const n = f.n, sig = f.sigma, bet = f.beta;
    for (let i = 0; i < n; i++) {
      const xi = x[i], yi = y[i], c = pcell[i], cy = (c / gw) | 0, cx = c - cy * gw;
      for (let oy = -1; oy <= 1; oy++) {
        const yy = cy + oy; if (yy < 0 || yy >= gh) continue;
        for (let ox = -1; ox <= 1; ox++) {
          const xx = cx + ox; if (xx < 0 || xx >= gw) continue;
          const cc = yy * gw + xx;
          for (let s = cellStart[cc], e = cellStart[cc + 1]; s < e; s++) {
            const j = sorted[s]; if (j <= i) continue;
            const dx = x[j] - xi, dy = y[j] - yi, r2 = dx * dx + dy * dy;
            if (r2 >= h2 || r2 < 1e-9) continue;
            const r = Math.sqrt(r2), q = 1 - r / h, ux = dx / r, uy = dy / r;
            const u = (vx[i] - vx[j]) * ux + (vy[i] - vy[j]) * uy;
            if (u <= 0) continue;
            const I = 0.5 * q * (sig * u + bet * u * u);
            vx[i] -= I * ux; vy[i] -= I * uy; vx[j] += I * ux; vy[j] += I * uy;
          }
        }
      }
    }
  }
  function relax() {
    const n = f.n, k = f.k, kN = f.kNear, rho0 = f.rho0;
    for (let i = 0; i < n; i++) {
      const xi = x[i], yi = y[i], c = cell(xi, yi), cy = (c / gw) | 0, cx = c - cy * gw;
      let rho = 0, rhoN = 0, m = 0;
      for (let oy = -1; oy <= 1; oy++) {
        const yy = cy + oy; if (yy < 0 || yy >= gh) continue;
        for (let ox = -1; ox <= 1; ox++) {
          const xx = cx + ox; if (xx < 0 || xx >= gw) continue;
          const cc = yy * gw + xx;
          for (let s = cellStart[cc], e = cellStart[cc + 1]; s < e; s++) {
            const j = sorted[s]; if (j === i) continue;
            const dx = x[j] - xi, dy = y[j] - yi, r2 = dx * dx + dy * dy;
            if (r2 >= h2) continue;
            const r = Math.sqrt(r2);
            const q = 1 - r / h;
            rho += q * q; rhoN += q * q * q;
            if (m < MAXN) {
              nb[m] = j; nq[m] = q;
              if (r > 1e-6) { nx[m] = dx / r; ny[m] = dy / r; } else { const a = Math.random() * 6.283; nx[m] = Math.cos(a); ny[m] = Math.sin(a); }
              m++;
            }
          }
        }
      }
      const P = k * (rho - rho0), PN = kN * rhoN;
      let dxi = 0, dyi = 0;
      for (let a = 0; a < m; a++) {
        const q = nq[a], D = 0.5 * (P * q + PN * q * q), ux = nx[a] * D, uy = ny[a] * D;
        const j = nb[a]; x[j] += ux; y[j] += uy; dxi -= ux; dyi -= uy;
      }
      x[i] += dxi; y[i] += dyi;
    }
  }
  // Un passo: gravità efficace (gx, gy) già nel riferimento del tasto, in unità/passo².
  f.step = function (gx, gy) {
    const n = f.n, vm = f.vmax, vm2 = vm * vm;
    for (let i = 0; i < n; i++) { vx[i] += gx; vy[i] += gy; }
    build();
    if (f.sigma || f.beta) viscosity();
    for (let i = 0; i < n; i++) {
      let a = vx[i], b = vy[i]; const v2 = a * a + b * b;
      if (v2 > vm2) { const s = vm / Math.sqrt(v2); a *= s; b *= s; }
      px[i] = x[i]; py[i] = y[i]; x[i] += a; y[i] += b;
    }
    build();
    relax();
    for (let i = 0; i < n; i++) project(i);
    for (let i = 0; i < n; i++) { vx[i] = x[i] - px[i]; vy[i] = y[i] - py[i]; }
  };
  f.add = function (ax, ay, avx, avy) {
    if (f.n >= max) return -1;
    const i = f.n++; x[i] = ax; y[i] = ay; vx[i] = avx || 0; vy[i] = avy || 0; project(i); return i;
  };
  // Densità di particelle attorno a un punto (per le bolle), e velocità media.
  f.probe = function (qx, qy, out) {
    const c = cell(qx, qy), cy = (c / gw) | 0, cx = c - cy * gw;
    let w = 0, sx = 0, sy = 0;
    for (let oy = -1; oy <= 1; oy++) {
      const yy = cy + oy; if (yy < 0 || yy >= gh) continue;
      for (let ox = -1; ox <= 1; ox++) {
        const xx = cx + ox; if (xx < 0 || xx >= gw) continue;
        const cc = yy * gw + xx;
        for (let s = cellStart[cc], e = cellStart[cc + 1]; s < e; s++) {
          const j = sorted[s], dx = x[j] - qx, dy = y[j] - qy, r2 = dx * dx + dy * dy;
          if (r2 >= h2) continue;
          const q = 1 - Math.sqrt(r2) / h; w += q * q; sx += vx[j] * q; sy += vy[j] * q;
        }
      }
    }
    out.rho = w; out.vx = w > 0 ? sx / w : 0; out.vy = w > 0 ? sy / w : 0;
    return out;
  };
  f.inside = function (qx, qy) {
    for (const S of shapes) {
      const qx2 = Math.abs(qx - S.cx) - (S.hw - S.r), qy2 = Math.abs(qy - S.cy) - (S.hh - S.r);
      const ox = qx2 > 0 ? qx2 : 0, oy = qy2 > 0 ? qy2 : 0;
      if (Math.sqrt(ox * ox + oy * oy) + Math.min(Math.max(qx2, qy2), 0) - S.r <= 0) return true;
    }
    return false;
  };
  // Riempie a reticolo esagonale fino al livello `level` (y), spaziatura s.
  f.fillTo = function (level, s, count) {
    const dy = s * 0.8660254;
    let row = 0;
    for (let yy = by1 - margin - s * 0.5; yy > level && f.n < (count || max); yy -= dy, row++) {
      for (let xx = bx0 + margin + s * 0.5 + (row & 1 ? s * 0.5 : 0); xx < bx1 - margin && f.n < (count || max); xx += s) {
        if (f.inside(xx, yy)) { const i = f.n++; x[i] = xx; y[i] = yy; vx[i] = 0; vy[i] = 0; }
      }
    }
  };
  return f;
}

// Inclinazione del telefono: la gravità proiettata sul piano dello schermo
// (x a destra, y in basso) e l'accelerazione di una scossa, in m/s².
// Su Android arriva da sola; su iPhone serve il permesso, chiesto in un tocco.
// Dove i sensori non rispondono (computer, anteprime in un iframe) resta spenta.
const Tilt = (() => {
  const T = { active: false, gx: 0, gy: 1, mag: 1, ax: 0, ay: 0, onchange: null, ask() {} };
  const touch = !matchMedia('(hover: hover) and (pointer: fine)').matches;
  const DOE = window.DeviceOrientationEvent, DME = window.DeviceMotionEvent;
  if (!touch || !DOE) return T;
  const angle = () => {
    const o = screen.orientation;
    const a = o && typeof o.angle === 'number' ? o.angle : (typeof window.orientation === 'number' ? window.orientation : 0);
    return a * Math.PI / 180;
  };
  const toScreen = (x, y) => { const a = angle(), c = Math.cos(a), s = Math.sin(a); return [x * c + y * s, -x * s + y * c]; };
  function orient(e) {
    if (e.beta == null || e.gamma == null) return;
    const b = e.beta * Math.PI / 180, g = e.gamma * Math.PI / 180;
    // Terza riga della matrice d'orientamento: il "giù" del mondo nel telefono.
    const v = toScreen(Math.cos(b) * Math.sin(g), Math.sin(b)), m = Math.hypot(v[0], v[1]);
    let x = 0, y = 1;
    if (m > 1e-3) {                       // quasi in piano: la direzione è incerta, si tende al basso
      const k = Math.min(1, m / 0.3);
      x = v[0] / m * k; y = v[1] / m * k + (1 - k);
    }
    T.gx += (x - T.gx) * 0.3; T.gy += (y - T.gy) * 0.3;
    const n = Math.hypot(T.gx, T.gy) || 1; T.gx /= n; T.gy /= n;
    T.mag = Math.max(0.5, Math.min(1, m));
    if (!T.active) { T.active = true; if (T.onchange) T.onchange(); }
  }
  function motion(e) {
    const a = e.acceleration;
    if (!a || a.x == null || a.y == null) return;
    const v = toScreen(a.x, -a.y);
    T.ax += (v[0] - T.ax) * 0.5; T.ay += (v[1] - T.ay) * 0.5;
  }
  const listen = () => { addEventListener('deviceorientation', orient); addEventListener('devicemotion', motion); };
  if (typeof DOE.requestPermission === 'function') {
    let asked = false;
    T.ask = () => {
      if (asked) return;
      asked = true;
      DOE.requestPermission().then(s => { if (s === 'granted') listen(); }, () => {});
      if (DME && typeof DME.requestPermission === 'function') DME.requestPermission().catch(() => {});
    };
  } else listen();
  return T;
})();

// ---------- Suono dei tasti (sintetizzato, parte solo dopo un gesto) ----------
const Sound = (() => {
  let ac = null, on = true, buf = null;
  try { on = localStorage.getItem('af-sound') !== '0'; } catch (e) {}
  function ctx() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  function noise(a) {
    if (buf) return buf;
    const len = Math.floor(a.sampleRate * 0.04);
    buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 5);
    return buf;
  }
  function key(down, vol = 1) {
    if (!on) return;
    const a = ctx(); if (!a) return;
    const t = a.currentTime + 0.002;
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(down ? 170 : 260, t);
    o.frequency.exponentialRampToValueAtTime(down ? 62 : 120, t + 0.07);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime((down ? 0.42 : 0.16) * vol, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + 0.12);
    const s = a.createBufferSource(), bp = a.createBiquadFilter(), g2 = a.createGain();
    s.buffer = noise(a); bp.type = 'bandpass'; bp.frequency.value = down ? 2100 : 3400; bp.Q.value = 0.9;
    g2.gain.value = (down ? 0.32 : 0.18) * vol;
    s.connect(bp).connect(g2).connect(a.destination); s.start(t);
  }
  return {
    key,
    get on() { return on; },
    set on(v) { on = v; try { localStorage.setItem('af-sound', v ? '1' : '0'); } catch (e) {} }
  };
})();

// ---------- Liquido: rendering WebGL a metaball ----------
const VS_PTS = 'attribute vec2 aP;uniform vec4 uBox;uniform float uSize;void main(){gl_Position=vec4((aP.x-uBox.x)/uBox.z*2.0-1.0,1.0-(aP.y-uBox.y)/uBox.w*2.0,0.0,1.0);gl_PointSize=uSize;}';
const FS_PTS = 'precision mediump float;uniform float uW;void main(){vec2 c=gl_PointCoord*2.0-1.0;float d=dot(c,c);if(d>1.0)discard;float f=1.0-d;gl_FragColor=vec4(f*f*uW);}';
const VS_FULL = 'attribute vec2 aP;uniform vec4 uBox;varying vec2 vP;void main(){gl_Position=vec4(aP,0.0,1.0);vP=vec2(uBox.x+(aP.x*0.5+0.5)*uBox.z,uBox.y+(0.5-aP.y*0.5)*uBox.w);}';
const fsComp = deriv => (deriv ? '#extension GL_OES_standard_derivatives : enable\n' : '') +
  'precision highp float;uniform sampler2D uD;uniform vec4 uBox;uniform float uT;uniform vec3 uCol;uniform float uPx;' +
  'uniform vec4 uC0;uniform float uR0;uniform vec4 uC1;uniform float uR1;uniform vec4 uB[16];varying vec2 vP;' +
  'float sdb(vec2 p,vec4 c,float r){vec2 q=abs(p-c.xy)-(c.zw-vec2(r));return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r;}' +
  'void main(){vec2 uv=vec2((vP.x-uBox.x)/uBox.z,1.0-(vP.y-uBox.y)/uBox.w);float d=texture2D(uD,uv).r;' +
  'float w=' + (deriv ? 'max(fwidth(d)*0.7,0.0015)' : '0.01') + ';float a=smoothstep(uT-w,uT+w,d);' +
  'float s=sdb(vP,uC0,uR0);if(uC1.z>0.0)s=min(s,sdb(vP,uC1,uR1));a*=1.0-smoothstep(-uPx,uPx,s);' +
  'for(int i=0;i<16;i++){vec4 b=uB[i];if(b.z>0.0){a*=smoothstep(-uPx,uPx,length(vP-b.xy)-b.z);}}' +
  'gl_FragColor=vec4(uCol*a,a);}';

function makeRenderer(canvas, o) {
  let gl = null;
  try { gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false }); } catch (e) {}
  if (!gl) return null;
  const deriv = !!gl.getExtension('OES_standard_derivatives');
  const sh = (type, src) => {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = (vs, fs) => {
    const p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'aP'); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  };
  let pP, pC;
  try { pP = prog(VS_PTS, FS_PTS); pC = prog(VS_FULL, fsComp(deriv)); } catch (e) { console.warn(e); return null; }
  const U = (p, n) => gl.getUniformLocation(p, n);
  const uP = { box: U(pP, 'uBox'), size: U(pP, 'uSize'), w: U(pP, 'uW') };
  const uC = { d: U(pC, 'uD'), box: U(pC, 'uBox'), t: U(pC, 'uT'), col: U(pC, 'uCol'), px: U(pC, 'uPx'),
    c0: U(pC, 'uC0'), r0: U(pC, 'uR0'), c1: U(pC, 'uC1'), r1: U(pC, 'uR1'), b: U(pC, 'uB') };
  const ptBuf = gl.createBuffer(), triBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const pts = new Float32Array(o.max * 2), bub = new Float32Array(64), box = o.box;
  const maxPt = (gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) || [1, 64])[1];
  let tex = null, fbo = null, fw = 2, fh = 2, ptSize = 1, upx = 0.1;

  function resize(cssW, cssH, dpr) {
    const W = Math.max(2, Math.round(cssW * dpr)), H = Math.max(2, Math.round(cssH * dpr));
    if (canvas.width === W && canvas.height === H && tex) return;
    canvas.width = W; canvas.height = H; upx = box[2] / W;
    let sc = 0.5; const want = 2 * o.rk * (W / box[2]);
    if (want * sc > maxPt) sc = maxPt / want;
    fw = Math.max(2, Math.round(W * sc)); fh = Math.max(2, Math.round(H * sc));
    ptSize = 2 * o.rk * (fw / box[2]);
    if (!tex) { tex = gl.createTexture(); fbo = gl.createFramebuffer(); }
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fw, fh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  function draw(f, bubbles) {
    const n = f.n;
    for (let i = 0; i < n; i++) { pts[2 * i] = f.x[i]; pts[2 * i + 1] = f.y[i]; }
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.viewport(0, 0, fw, fh);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf);
    if (n) {
      gl.useProgram(pP); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
      gl.bufferData(gl.ARRAY_BUFFER, pts.subarray(0, n * 2), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.uniform4f(uP.box, box[0], box[1], box[2], box[3]);
      gl.uniform1f(uP.size, ptSize); gl.uniform1f(uP.w, o.weight);
      gl.drawArrays(gl.POINTS, 0, n);
      gl.disable(gl.BLEND);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(pC);
    gl.bindBuffer(gl.ARRAY_BUFFER, triBuf);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(uC.d, 0);
    gl.uniform4f(uC.box, box[0], box[1], box[2], box[3]);
    gl.uniform1f(uC.t, o.threshold); gl.uniform3fv(uC.col, o.color); gl.uniform1f(uC.px, upx * 0.75);
    const c0 = o.clip[0], c1 = o.clip[1];
    gl.uniform4f(uC.c0, c0.cx, c0.cy, c0.hw, c0.hh); gl.uniform1f(uC.r0, c0.r);
    if (c1) { gl.uniform4f(uC.c1, c1.cx, c1.cy, c1.hw, c1.hh); gl.uniform1f(uC.r1, c1.r); }
    else { gl.uniform4f(uC.c1, 0, 0, 0, 0); gl.uniform1f(uC.r1, 0); }
    bub.fill(0);
    for (let i = 0; i < bubbles.length && i < 16; i++) {
      const b = bubbles[i]; bub[4 * i] = b.x; bub[4 * i + 1] = b.y; bub[4 * i + 2] = b.r * b.s;
    }
    gl.uniform4fv(uC.b, bub);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  return { resize, draw };
}

// ---------- Un tasto pieno di liquido: molla, inclinazione, trascinamento, pressione ----------
const SUB_HZ = 180;                          // sottopassi della simulazione al secondo
function liquidKey(el, cfg) {
  const canvas = $('canvas', el);
  const R = makeRenderer(canvas, cfg.render);
  if (!R) return null;
  const f = makeFluid(cfg.fluid);
  const st = { px: 0, py: 0, vx: 0, vy: 0, ax: 0, ay: 0, th: 0, om: 0, tilt: 0,
    pid: null, drag: false, moved: false, sx: 0, sy: 0, ox: 0, oy: 0, tx: 0, ty: 0,
    acc: 0, nextBubble: 0.4, pouring: false, visible: true, down: false };
  const bubbles = [], pr = { rho: 0, vx: 0, vy: 0 };
  const G = cfg.gravity;

  function spawnBubble(x, y, r) {
    if (bubbles.length >= 16) return;
    f.probe(x, y, pr);
    if (pr.rho < cfg.bubbleRho * 1.4) return;
    bubbles.push({ x, y, r, s: 0, ph: Math.random() * 6.283, life: 0, dying: false });
  }
  function stepBubbles() {
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      if (b.dying) { b.s -= 0.12; if (b.s <= 0) bubbles.splice(i, 1); continue; }
      if (b.s < 1) b.s = Math.min(1, b.s + 0.06);
      f.probe(b.x, b.y, pr);
      if (pr.rho < cfg.bubbleRho || b.life > 2400) { b.dying = true; continue; }
      b.life++;
      b.x += pr.vx + 0.05 * Math.sin(b.ph + b.life * 0.045);
      b.y += pr.vy - cfg.rise * (0.7 + 0.3 * b.r / 2.6);
    }
  }
  function bubbleBurst(k) {
    const z = cfg.bubbleZone;
    for (let i = 0; i < k; i++) spawnBubble(z[0] + Math.random() * (z[2] - z[0]), z[1] + Math.random() * (z[3] - z[1]), 1 + Math.random() * 1.8);
  }
  function settle() {
    f.n = 0; f.fillTo(cfg.level, cfg.spacing, cfg.count);
    for (let i = 0; i < 240; i++) f.step(0, G);
  }
  function pour() { f.n = 0; st.pouring = true; }
  function press(vol = 1) {
    if (st.down) return;
    st.down = true; el.classList.add('down');
    Sound.key(true, vol);
    const j = cfg.jump;
    let top = 1e9, bot = -1e9;
    for (let i = 0; i < f.n; i++) { if (f.y[i] < top) top = f.y[i]; if (f.y[i] > bot) bot = f.y[i]; }
    const span = Math.max(1, bot - top);
    for (let i = 0; i < f.n; i++) {
      const up = 1 - (f.y[i] - top) / span;
      f.vy[i] -= j * (0.3 + 0.95 * up * up + 0.3 * Math.random());
      f.vx[i] += (Math.random() - 0.5) * j * 0.5 * up;
    }
    bubbleBurst(7);
  }
  function release(vol = 1) {
    if (!st.down) return;
    st.down = false; el.classList.remove('down');
    Sound.key(false, vol);
  }

  // Trascinamento con un elastico: più lo tiri, più resiste.
  function rubber(dx, dy) {
    const Rm = el.clientWidth * 0.55, l = Math.hypot(dx, dy) || 1, k = 1 / (1 + l / Rm);
    return [dx * k, dy * k];
  }
  el.addEventListener('pointerdown', e => {
    if (e.button !== 0 || st.pid !== null) return;
    if (e.pointerType === 'mouse') e.preventDefault();   // niente anello di focus col mouse
    st.pid = e.pointerId; st.moved = false; st.drag = false;
    st.sx = e.clientX; st.sy = e.clientY; st.ox = st.px; st.oy = st.py;
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
    press();
  });
  el.addEventListener('pointermove', e => {
    if (e.pointerId !== st.pid) return;
    const dx = e.clientX - st.sx, dy = e.clientY - st.sy;
    if (!st.drag && dx * dx + dy * dy > 64) { st.drag = true; st.moved = true; el.classList.add('grab'); release(0.6); }
    if (st.drag) { const r = rubber(st.ox + dx, st.oy + dy); st.tx = r[0]; st.ty = r[1]; }
  });
  const end = e => {
    if (e.pointerId !== st.pid) return;
    st.pid = null; st.drag = false; st.tx = 0; st.ty = 0; el.classList.remove('grab');
    release();
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  el.addEventListener('lostpointercapture', end);
  el.addEventListener('click', e => {
    if (st.moved) { e.preventDefault(); st.moved = false; return; }
    if (e.detail === 0) { press(); setTimeout(release, 110); }   // da tastiera
    if (cfg.onClick) cfg.onClick(e);
  });

  function resize() {
    const w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    R.resize(w, h, Math.min(2, window.devicePixelRatio || 1));
  }

  function frame(dt, t) {
    // Molla della posizione: rigida mentre lo tieni, elastica quando lo lasci.
    const k = st.drag ? 520 : 140, c = 2 * Math.sqrt(k) * (st.drag ? 0.85 : 0.2);
    const ax = k * (st.tx - st.px) - c * st.vx, ay = k * (st.ty - st.py) - c * st.vy;
    st.vx += ax * dt; st.vy += ay * dt; st.px += st.vx * dt; st.py += st.vy * dt;
    // Rotazione: segue il mouse; mentre lo trascini oscilla con la velocità.
    const idle = reduce || Tilt.active ? 0 : (fine ? 0.012 : 0.035) * Math.sin(t * 0.8) + (fine ? 0.006 : 0.012) * Math.sin(t * 1.9);
    const thT = st.drag ? clamp(st.vx * 0.00032, -0.42, 0.42) : st.tilt + idle;
    const kr = 70, cr = 2 * Math.sqrt(kr) * 0.32;
    const al = kr * (thT - st.th) - cr * st.om;
    st.om += al * dt; st.th += st.om * dt;
    el.style.transform = `translate3d(${st.px.toFixed(2)}px,${st.py.toFixed(2)}px,0) rotate(${st.th.toFixed(4)}rad)`;

    // Gravità efficace nel riferimento del tasto (unità del viewBox per sottopasso²).
    const upx = cfg.vbw / (el.clientWidth || 1), conv = cfg.shake * upx / (SUB_HZ * SUB_HZ);
    let ix = -ax * conv, iy = -ay * conv;
    const il = Math.hypot(ix, iy), imax = G * 2.6;
    if (il > imax) { ix *= imax / il; iy *= imax / il; }
    // Col telefono inclinato la gravità cambia direzione; una scossa spinge il liquido.
    let gdx = 0, gdy = G;
    if (Tilt.active) {
      const sx = clamp(-Tilt.ax / 9.81 * 1.4, -2.5, 2.5), sy = clamp(-Tilt.ay / 9.81 * 1.4, -2.5, 2.5);
      gdx = G * (Tilt.mag * Tilt.gx + sx); gdy = G * (Tilt.mag * Tilt.gy + sy);
    }
    const gxw = ix + gdx, gyw = iy + gdy, cs = Math.cos(st.th), sn = Math.sin(st.th);
    const gx = cs * gxw + sn * gyw, gy = -sn * gxw + cs * gyw;

    st.acc = Math.min(st.acc + dt, 6 / SUB_HZ);
    while (st.acc >= 1 / SUB_HZ) {
      st.acc -= 1 / SUB_HZ;
      if (st.pouring) {
        const nz = cfg.nozzle;
        for (let i = 0; i < 3 && f.n < cfg.count; i++) f.add(nz[0] + (i - 1) * 2.4 + (Math.random() - 0.5) * 0.6, nz[1] + Math.random() * 0.8, (Math.random() - 0.5) * 0.08, 1.6);
        if (f.n >= cfg.count) st.pouring = false;
      }
      f.step(gx, gy);
      stepBubbles();
    }
    st.nextBubble -= dt;
    if (st.nextBubble <= 0 && !st.pouring && f.n > 40) {
      st.nextBubble = 0.5 + Math.random() * 0.9;
      const z = cfg.bubbleZone;
      spawnBubble(z[0] + Math.random() * (z[2] - z[0]), z[3] - Math.random() * 3, 1.1 + Math.random() * 1.6);
    }
    R.draw(f, bubbles);
  }
  return { el, st, f, frame, press, release, resize, settle, pour };
}

// ---------- Il tasto A e il tasto Invio ----------
const ORANGE = [1, 0x6B / 255, 0x35 / 255];
const fluidBase = { h: 6.9, rho0: 2.8, k: 0.25, kNear: 0.35, sigma: 0.3, beta: 0.3, margin: 0.4 };
const hero = liquidKey($('#key'), {
  vbw: 120, gravity: 0.0267, shake: 1.7, jump: 1.05, rise: 0.17, bubbleRho: 1.1, onClick: () => Tilt.ask(),
  count: 600, level: 66, spacing: 2.9, nozzle: [80, 17], bubbleZone: [22, 92, 98, 106],
  fluid: Object.assign({ max: 600, shapes: [{ cx: 60, cy: 60, hw: 51, hh: 51, r: 19 }] }, fluidBase),
  render: { max: 600, box: [0, 0, 120, 120], rk: 5.6, weight: 0.24, threshold: 0.16, color: ORANGE,
    clip: [{ cx: 60, cy: 60, hw: 57, hh: 57, r: 25 }] }
});
// Il tasto Invio è più grande in unità: stessa fisica, scalata di 1,25.
const L = 1.25;
const enter = liquidKey($('#invio'), {
  vbw: 180, gravity: 0.0267 * L, shake: 1.5, jump: 1.0 * L, rise: 0.17 * L, bubbleRho: 1.1,
  count: 680, level: 172, spacing: 2.9 * L, nozzle: [118, 30], bubbleZone: [52, 200, 160, 224],
  fluid: { max: 680, h: 6.9 * L, rho0: 2.8, k: 0.25 * L, kNear: 0.35 * L, sigma: 0.3, beta: 0.3 / L, margin: 0.5,
    shapes: [{ cx: 90, cy: 60, hw: 81, hh: 51, r: 19 }, { cx: 105, cy: 120, hw: 66, hh: 111, r: 19 }] },
  render: { max: 680, box: [0, 0, 180, 240], rk: 5.6 * L, weight: 0.24, threshold: 0.16, color: ORANGE,
    clip: [{ cx: 90, cy: 60, hw: 87, hh: 57, r: 25 }, { cx: 105, cy: 120, hw: 72, hh: 117, r: 25 }] }
});
const keys = [hero, enter].filter(Boolean);
if (keys.length) root.classList.add('gl');

function resizeAll() { keys.forEach(k => k.resize()); }
resizeAll();
addEventListener('resize', resizeAll);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(resizeAll);

// Si anima solo quello che si vede.
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    const k = keys.find(k => k.el === e.target); if (!k) return;
    k.st.visible = e.isIntersecting;
    if (e.isIntersecting && k === enter && !enter.started) {
      enter.started = true;
      if (reduce) enter.settle(); else enter.pour();
    }
  }), { rootMargin: '80px' });
  keys.forEach(k => io.observe(k.el));
} else if (enter) { enter.started = true; enter.settle(); }

// Il mouse inclina i tasti, poco.
addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  const t = clamp((e.clientX / innerWidth - 0.5) * 0.24, -0.12, 0.12);
  keys.forEach(k => { k.st.tilt = t; });
}, { passive: true });

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  for (const k of keys) if (k.st.visible) k.frame(dt, now / 1000);
  requestAnimationFrame(loop);
}
if (keys.length) requestAnimationFrame(loop);

// ---------- Apertura ----------
const at = (ms, fn) => setTimeout(fn, ms);
const legend = [...document.querySelectorAll('#key .ch')], word = [...document.querySelectorAll('.name .ch')];
const caret = $('#caret');
if (reduce || !hero) {
  if (hero) hero.settle();
  caret.remove();
} else {
  root.classList.add('intro');
  legend.forEach((c, i) => at(420 + i * 140, () => c.classList.add('on')));
  at(700, () => hero.pour());
  const typed = 980 + word.length * 110;
  word.forEach((c, i) => at(980 + i * 110, () => { c.classList.add('on'); caret.style.left = (c.offsetLeft + c.offsetWidth + c.offsetWidth * 0.08) + 'px'; }));
  at(typed + 80, () => root.classList.remove('intro'));
  at(typed + 1100, () => caret.remove());
}

// ---------- Tastiera fisica: A preme il tasto grande, Invio quello in fondo ----------
const hint = $('#hint');
const touchHint = !fine && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
if (touchHint) hint.textContent = 'Tap the key and shake it';
// Il suggerimento promette l'inclinazione solo quando i sensori rispondono davvero.
Tilt.onchange = () => { if (touchHint) hint.textContent = 'Tilt your phone'; };
if (Tilt.active) Tilt.onchange();
const kbds = () => hint.querySelectorAll('kbd');
let enterSeen = false;
if ('IntersectionObserver' in window && enter) {
  new IntersectionObserver(es => { enterSeen = es[0].isIntersecting; }, { threshold: 0.4 }).observe(enter.el);
}
const typing = el => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
const isA = e => e.key === 'a' || e.key === 'A';
addEventListener('keydown', e => {
  if (typing(document.activeElement)) return;
  if (isA(e) && !e.metaKey && !e.ctrlKey && !e.altKey) {
    e.preventDefault();
    kbds().forEach(k => k.classList.add('down'));
    if (!e.repeat && hero) hero.press();
  } else if (e.key === 'Enter' && enter && enterSeen && !e.repeat && document.activeElement === document.body) {
    enter.press();
  }
});
addEventListener('keyup', e => {
  if (isA(e)) { kbds().forEach(k => k.classList.remove('down')); if (hero) hero.release(); }
  else if (e.key === 'Enter' && enter && enter.st.down) { enter.release(); location.href = enter.el.href; }
});

// ---------- Tasti delle file: si premono e il liquido oscilla ----------
document.querySelectorAll('.svc .cap, .now-card .cap, .links .cap').forEach(cap => {
  cap.addEventListener('pointerdown', () => {
    cap.classList.add('down'); Sound.key(true, 0.8);
    cap.classList.remove('slosh'); void cap.getBoundingClientRect(); cap.classList.add('slosh');
  });
  const up = () => { if (cap.classList.contains('down')) { cap.classList.remove('down'); Sound.key(false, 0.8); } };
  cap.addEventListener('pointerup', up); cap.addEventListener('pointerleave', up); cap.addEventListener('pointercancel', up);
});

// ---------- Suono e copia ----------
const sound = $('#sound');
sound.setAttribute('aria-pressed', String(Sound.on));
sound.addEventListener('click', () => { Sound.on = !Sound.on; sound.setAttribute('aria-pressed', String(Sound.on)); if (Sound.on) Sound.key(true, 0.6); });
const copy = $('#copy');
copy.addEventListener('click', () => {
  const done = txt => { copy.textContent = txt; setTimeout(() => { copy.textContent = 'Copy'; }, 1800); };
  const sel = () => { const r = document.createRange(); r.selectNodeContents($('#mail')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); done('Selected'); };
  try { navigator.clipboard.writeText('andrea@falzetti.me').then(() => done('Copied'), sel); } catch (e) { sel(); }
});
})();
