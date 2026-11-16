const { mkdirSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');
const { deflateSync } = require('node:zlib');

const W = 512, H = 512;
const pixels = Buffer.alloc(W * H * 4);
const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
function put(x, y, c, a = 1) {
  if (x < 0 || y < 0 || x >= W || y >= H || a <= 0) return;
  const i = (y * W + x) * 4, aa = Math.max(0, Math.min(1, a));
  pixels[i] = clamp(c[0] * aa + pixels[i] * (1 - aa));
  pixels[i + 1] = clamp(c[1] * aa + pixels[i + 1] * (1 - aa));
  pixels[i + 2] = clamp(c[2] * aa + pixels[i + 2] * (1 - aa)); pixels[i + 3] = 255;
}
function ellipse(cx, cy, rx, ry, color, alpha = 1, feather = 0) {
  const x0 = Math.max(0, Math.floor(cx - rx - feather)), x1 = Math.min(W - 1, Math.ceil(cx + rx + feather));
  const y0 = Math.max(0, Math.floor(cy - ry - feather)), y1 = Math.min(H - 1, Math.ceil(cy + ry + feather));
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const d = Math.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2);
    if (d <= 1 + feather / Math.max(rx, ry)) put(x, y, color, alpha * (feather ? Math.max(0, Math.min(1, (1 + feather / Math.max(rx, ry) - d) * Math.max(rx, ry) / feather)) : 1));
  }
}
function line(x0, y0, x1, y1, width, color, alpha = 1) {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 1.5));
  for (let k = 0; k <= n; k++) { const t = k / n; ellipse(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, width / 2, width / 2, color, alpha); }
}
function bezier(a, b, c, d, t) { const u = 1 - t; return [u ** 3 * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t ** 3 * d[0], u ** 3 * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t ** 3 * d[1]]; }
function curve(a, b, c, d, width, color, alpha = 1) {
  let prev = a; for (let i = 1; i <= 100; i++) { const p = bezier(a, b, c, d, i / 100); line(prev[0], prev[1], p[0], p[1], width, color, alpha); prev = p; }
}
function poly(points, color, alpha = 1) {
  const minY = Math.max(0, Math.floor(Math.min(...points.map(p => p[1])))), maxY = Math.min(H - 1, Math.ceil(Math.max(...points.map(p => p[1]))));
  for (let y = minY; y <= maxY; y++) { const xs = []; for (let i = 0; i < points.length; i++) { const p = points[i], q = points[(i + 1) % points.length]; if ((p[1] <= y && q[1] > y) || (q[1] <= y && p[1] > y)) xs.push(p[0] + (y - p[1]) * (q[0] - p[0]) / (q[1] - p[1])); } xs.sort((a, b) => a - b); for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.max(0, Math.ceil(xs[i])); x <= Math.min(W - 1, xs[i + 1]); x++) put(x, y, color, alpha); }
}
// A deep-water dusk gradient, with the portal's light pooling into the sea.
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const glow = Math.max(0, 1 - Math.hypot((x - 257) / 300, (y - 183) / 280));
  const horizon = Math.max(0, 1 - Math.abs(y - 308) / 155);
  put(x, y, [5 + glow * 8 + horizon * 4, 12 + glow * 25 + horizon * 13, 32 + glow * 45 + horizon * 23]);
}
// Distant stars and drifting plankton, deterministic by construction.
let seed = 1701; function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
for (let i = 0; i < 140; i++) { const x = rnd() * W, y = rnd() * 290, r = rnd() * 1.1 + 0.35; ellipse(x, y, r, r, i % 4 ? [128, 225, 236] : [255, 205, 145], 0.35 + rnd() * 0.5); }
// Portal halo and aperture: a luminous vertical tear between ocean and sky.
ellipse(256, 211, 174, 133, [12, 198, 231], 0.13, 30);
ellipse(256, 207, 157, 116, [34, 136, 209], 0.28, 15);
ellipse(256, 202, 147, 106, [5, 19, 48], 1);
ellipse(256, 201, 137, 97, [9, 37, 70], 1);
ellipse(256, 198, 124, 84, [21, 91, 123], 0.68);
ellipse(256, 192, 108, 70, [14, 35, 80], 0.92);
// Concentric incomplete arcs lend the gateway a sense of rotation.
for (let k = 0; k < 3; k++) {
  let prev = null;
  for (let deg = 206; deg <= 515; deg += 2) { const t = deg * Math.PI / 180, p = [256 + (155 - k * 8) * Math.cos(t), 202 + (114 - k * 7) * Math.sin(t)]; if (prev) line(prev[0], prev[1], p[0], p[1], k === 0 ? 1.7 : 0.8, k === 0 ? [109, 248, 242] : [51, 174, 228], k === 0 ? 0.8 : 0.42); prev = p; }
}
// A distant impossible sun inside the opening.
ellipse(258, 205, 30, 30, [255, 180, 100], 0.18, 19); ellipse(258, 205, 17, 17, [255, 201, 127], 0.92);
ellipse(258, 205, 10, 10, [255, 239, 194], 1);
// Ocean shelf and sweeping current bands.
poly([[0, 318], [82, 297], [167, 311], [249, 291], [334, 311], [431, 295], [512, 316], [512, 512], [0, 512]], [5, 20, 43]);
for (let i = 0; i < 9; i++) { const y = 329 + i * 17; curve([-22, y + 10,], [130, y - 14], [335, y + 22], [533, y - 3], 1.1, [33, 129, 162], 0.24); }
for (let i = 0; i < 15; i++) { const x = rnd() * W, y = 326 + rnd() * 170; ellipse(x, y, rnd() * 1.6 + 0.5, rnd() * 1.6 + 0.5, [102, 244, 219], 0.35); }
// Bioluminescent manta: broad sculptural wings, body, and long tail.
const cyan = [69, 255, 231], blue = [43, 183, 224];
// Wing shadow and outer luminous edge.
curve([256, 262], [206, 220], [151, 240], [78, 293], 28, [4, 17, 42], 1);
curve([256, 262], [306, 220], [361, 240], [434, 293], 28, [4, 17, 42], 1);
curve([256, 258], [207, 213], [148, 233], [76, 292], 3.4, cyan, 0.92);
curve([256, 258], [305, 213], [364, 233], [436, 292], 3.4, cyan, 0.92);
// Fin surfaces.
poly([[256, 253], [230, 246], [175, 230], [116, 251], [75, 293], [151, 279], [218, 275]], [11, 57, 91], 0.95);
poly([[256, 253], [282, 246], [337, 230], [396, 251], [437, 293], [361, 279], [294, 275]], [11, 57, 91], 0.95);
// Wing rib fans arc from the shoulders to the tips; each rib has a bright core and soft outer trace.
for (let side of [-1, 1]) for (let i = 0; i < 9; i++) {
  const t = i / 8, endX = 256 + side * (48 + t * 166), endY = 261 + t * 34;
  const ctrl1 = [256 + side * (20 + t * 43), 239 - t * 13], ctrl2 = [256 + side * (28 + t * 114), 222 + t * 17];
  curve([256 + side * 7, 257], ctrl1, ctrl2, [endX, endY], i % 3 === 0 ? 2.1 : 1.25, i % 3 === 0 ? [140, 255, 237] : blue, i % 3 === 0 ? 0.9 : 0.76);
}
// Manta head, cephalic lobes, and body highlight.
ellipse(256, 258, 27, 20, [5, 27, 57]);
poly([[231, 250], [242, 239], [250, 252], [245, 262]], [81, 255, 229], 0.9);
poly([[281, 250], [270, 239], [262, 252], [267, 262]], [81, 255, 229], 0.9);
poly([[237, 256], [247, 247], [256, 244], [265, 247], [275, 256], [268, 271], [256, 278], [244, 271]], [14, 103, 141]);
curve([241, 255], [248, 247], [264, 247], [271, 255], 1.7, [168, 255, 227], 0.96);
ellipse(246, 258, 1.8, 1.8, [255, 230, 167]); ellipse(266, 258, 1.8, 1.8, [255, 230, 167]);
curve([256, 274], [252, 300], [261, 308], [256, 334], 2.2, [90, 230, 215], 0.82);
// Glowing wake arcs burst behind the animal.
for (let i = 0; i < 7; i++) { const y = 278 + i * 6; curve([256, y], [229, y + 15], [180 - i * 3, y + 20], [139 - i * 5, y + 12], 0.8, [70, 205, 224], 0.28); curve([256, y], [283, y + 15], [332 + i * 3, y + 20], [373 + i * 5, y + 12], 0.8, [70, 205, 224], 0.28); }
// Fine frame and typographic lockup, drawn with a compact custom pixel font.
const glyph = {
  'A':['01110','10001','10001','11111','10001','10001','10001'],'B':['11110','10001','10001','11110','10001','10001','11110'],'C':['01111','10000','10000','10000','10000','10000','01111'],'D':['11110','10001','10001','10001','10001','10001','11110'],'E':['11111','10000','10000','11110','10000','10000','11111'],'F':['11111','10000','10000','11110','10000','10000','10000'],'G':['01111','10000','10000','10111','10001','10001','01111'],'H':['10001','10001','10001','11111','10001','10001','10001'],'I':['11111','00100','00100','00100','00100','00100','11111'],'J':['00111','00010','00010','00010','10010','10010','01100'],'K':['10001','10010','10100','11000','10100','10010','10001'],'L':['10000','10000','10000','10000','10000','10000','11111'],'M':['10001','11011','10101','10101','10001','10001','10001'],'N':['10001','11001','10101','10011','10001','10001','10001'],'O':['01110','10001','10001','10001','10001','10001','01110'],'P':['11110','10001','10001','11110','10000','10000','10000'],'Q':['01110','10001','10001','10001','10101','10010','01101'],'R':['11110','10001','10001','11110','10100','10010','10001'],'S':['01111','10000','10000','01110','00001','00001','11110'],'T':['11111','00100','00100','00100','00100','00100','00100'],'U':['10001','10001','10001','10001','10001','10001','01110'],'V':['10001','10001','10001','10001','10001','01010','00100'],'W':['10001','10001','10001','10101','10101','10101','01010'],'X':['10001','10001','01010','00100','01010','10001','10001'],'Y':['10001','10001','01010','00100','00100','00100','00100'],'Z':['11111','00001','00010','00100','01000','10000','11111'],'0':['01110','10001','10011','10101','11001','10001','01110'],'1':['00100','01100','00100','00100','00100','00100','01110']
};
function text(str, y, scale, color, spacing = 2) { const width = str.length * (5 * scale + spacing) - spacing; let x = (W - width) / 2; for (const ch of str) { const bits = glyph[ch]; if (bits) for (let row = 0; row < 7; row++) for (let col = 0; col < 5; col++) if (bits[row][col] === '1') for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) put(x + col * scale + dx, y + row * scale + dy, color); x += 5 * scale + spacing; } }
text('THE SKY HAS A PULSE', 31, 2, [210, 250, 246], 3);
line(161, 53, 351, 53, 1, [89, 220, 222], 0.7);
text('PELAGIC 01', 67, 1, [117, 217, 228], 3);
text('WHEN THE OCEAN LEARNED TO FLY', 461, 1, [169, 222, 224], 2);
// Corner registration ticks and a fine lower caption rule.
for (const [x, sx] of [[22, 1], [490, -1]]) { line(x, 22, x + sx * 15, 22, 1, [87, 203, 211], 0.7); line(x, 22, x, 37, 1, [87, 203, 211], 0.7); line(x, 490, x + sx * 15, 490, 1, [87, 203, 211], 0.7); }
line(112, 450, 400, 450, 0.8, [75, 157, 183], 0.6);
function crc32(buf) { let c = 0xffffffff; for (const b of buf) { c ^= b; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; } return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) { const name = Buffer.from(type), len = Buffer.alloc(4), crc = Buffer.alloc(4); len.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(Buffer.concat([name, data]))); return Buffer.concat([len, name, data, crc]); }
const raw = Buffer.alloc(H * (1 + W * 4)); for (let y = 0; y < H; y++) { raw[y * (1 + W * 4)] = 0; pixels.copy(raw, y * (1 + W * 4) + 1, y * W * 4, (y + 1) * W * 4); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 6;
const png = Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output'; mkdirSync(outDir, { recursive: true }); writeFileSync(join(outDir, 'entry.png'), png);
