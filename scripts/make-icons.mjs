// 앱 아이콘(PNG) 만들기: node scripts/make-icons.mjs
// 외부 프로그램 없이 점을 하나씩 칠해서 집 모양 아이콘을 그린다 (빨간 지붕, 주황·파랑 기둥, 하늘색 배경).
// 결과: public/icons/icon-192.png, icon-512.png, maskable-512.png, apple-touch-icon.png
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const C = {
  sky: hex('#dcecf5'),
  ground: hex('#b7d98b'),
  wall: hex('#fff6e5'),
  roof: hex('#d9584a'),
  pillarS: hex('#e58f65'),
  pillarV: hex('#5b8fd9'),
  door: hex('#9b6b43'),
  flag: hex('#ffd34d'),
};

// 0~1 좌표계에서 점(x, y)의 색을 정한다. pad: 가장자리 여백(마스크 아이콘은 넓게)
function colorAt(x, y, pad) {
  const u = (x - pad) / (1 - 2 * pad);
  const v = (y - pad) / (1 - 2 * pad);
  const inside = u >= 0 && u <= 1 && v >= 0 && v <= 1;
  if (inside) {
    // 깃발
    if (u > 0.5 && u < 0.62 && v > 0.1 && v < 0.17) return C.flag;
    if (u > 0.49 && u < 0.51 && v > 0.1 && v < 0.24) return C.door;
    // 지붕: 삼각형 (꼭대기 0.5, 0.22 → 아래 0.12~0.88, 0.46)
    if (v >= 0.22 && v <= 0.46) {
      const half = ((v - 0.22) / 0.24) * 0.38;
      if (Math.abs(u - 0.5) <= half) return C.roof;
    }
    if (v > 0.46 && v <= 0.82) {
      if (u >= 0.2 && u <= 0.28) return C.pillarS;
      if (u >= 0.72 && u <= 0.8) return C.pillarV;
      if (u > 0.43 && u < 0.57 && v > 0.6) return C.door;
      if (u > 0.2 && u < 0.8) return C.wall;
    }
    if (v > 0.82 && v <= 0.88 && u > 0.12 && u < 0.88) return C.ground;
  }
  return C.sky;
}

function png(size, pad) {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 3 + 1)] = 0; // 필터 없음
    for (let x = 0; x < size; x += 1) {
      const [r, g, b] = colorAt((x + 0.5) / size, (y + 0.5) / size, pad);
      const i = y * (size * 3 + 1) + 1 + x * 3;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
    }
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(td) >>> 0);
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // 색 깊이
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const out = path.resolve('public/icons');
fs.mkdirSync(out, { recursive: true });
const files = [
  ['icon-192.png', 192, 0.06],
  ['icon-512.png', 512, 0.06],
  ['maskable-512.png', 512, 0.18], // 둥글게 잘려도 집이 다 보이도록 여백을 넓게
  ['apple-touch-icon.png', 180, 0.08],
];
for (const [name, size, pad] of files) {
  fs.writeFileSync(path.join(out, name), png(size, pad));
  console.log('만듦', name);
}
