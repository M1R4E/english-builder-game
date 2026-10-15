import * as THREE from 'three';
import { ROLE_LABELS } from '../game/labels.js';
import { makeLabel } from './labels.js';
import { ROOM_WIDTH } from './makeBlueprint.js';
import { MATERIALS } from './materials.js';

// ── 설계도 → 3D 부품 목록 ──
// 부품마다 key(이름표)와 sig(상태)를 붙인다.
// 렌더러는 key가 같고 sig도 같은 부품은 그대로 두고, 새로 생기거나 바뀐 부품만 다시 만든다.
// 주의: 부품의 위치나 모양을 바꾸는 값은 모두 key 또는 sig에 넣어야 한다.
//       (빠뜨리면 이전 모양이 그대로 남는다. 예: 메인 화면 깃발이 떠 있던 문제)
// 부품의 delay(초)는 등장 애니메이션을 그만큼 늦춘다 (완공 장식을 마지막에 등장시키기 위해).

export const LAYOUT = { D: 3, H: 2.2, SLAB: 0.25, BASE: 0.3 };
const { D, H, SLAB, BASE } = LAYOUT;
const floorY = (f) => BASE + f * (H + SLAB);

function box(w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  if (material === MATERIALS.ghost) mesh.userData.noShadow = true;
  return mesh;
}

function group(...children) {
  const g = new THREE.Group();
  children.filter(Boolean).forEach((c) => g.add(c));
  return g;
}

// 누를 수 있는 부품에 공정 단위(방 ref, 계단 ref)를 붙여 둔다 → 렌더러가 눌린 부품을 알아낸다
function asUnit(obj, ref) {
  if (ref) obj.userData.slotKey = ref;
  return obj;
}

const ROLE_MATERIAL = { S: 'pillarS', V: 'pillarV', O: 'roomO', C: 'roomC', M: 'furniture' };
const TENSE_MATERIAL = { present: 'tensePresent', past: 'tensePast', ing: 'tenseIng' };

// 방의 x 위치 (층의 가운데를 0으로)
function roomLayout(floor) {
  let x = -floor.width / 2;
  return floor.rooms.map((room) => {
    const w = ROOM_WIDTH[room.kind];
    const cx = x + w / 2;
    x += w;
    return { room, cx, w };
  });
}

// 방 이름표: 짓기 전 "주어 ?", 짓는 중·다 지은 뒤 "주어 · the cat"
function roomLabel(room) {
  const role = ROLE_LABELS[room.role];
  if (room.warn) return [`! ${role} 확인`, 'warn'];
  if (room.state === 'ghost') return [`${role} ?`, room.active ? 'active' : 'ghost'];
  return [room.text ? `${role} · ${room.text}` : role, room.active ? 'active' : 'normal'];
}

// 방의 뼈대: 바닥판 + 뒷벽 + 오른쪽 칸막이 벽(성분과 성분의 경계) + 주어·동사 방은 앞쪽 기둥
function roomShell(f, { room, cx, w }) {
  const y = floorY(f);
  const ghost = room.state === 'ghost';
  const floorMat = room.active ? MATERIALS.active : ghost ? MATERIALS.ghost : MATERIALS[ROLE_MATERIAL[room.role]];
  const wallMat = ghost ? MATERIALS.ghost : MATERIALS.wall;
  const g = group(
    box(w - 0.06, 0.08, D, floorMat, cx, y + 0.04, 0),
    box(w, H, 0.14, wallMat, cx, y + H / 2, -D / 2),
  );
  // 칸막이 벽 (마지막 방이면 바깥벽)
  g.add(box(0.12, H, D, wallMat, cx + w / 2, y + H / 2, 0));
  if (!ghost) g.add(box(0.7, 0.5, 0.05, MATERIALS.window, cx, y + H * 0.62, -D / 2 + 0.09));
  // 주어·동사 방: 문장의 뼈대라 앞쪽에 굵은 기둥
  if (room.role === 'S' || room.role === 'V') {
    const mat = ghost ? MATERIALS.ghost : MATERIALS[ROLE_MATERIAL[room.role]];
    g.add(box(0.32, H, 0.32, mat, cx - w / 2 + 0.2, y + H / 2, D / 2 - 0.2));
    g.add(box(0.32, H, 0.32, mat, cx + w / 2 - 0.2, y + H / 2, D / 2 - 0.2));
  }
  return asUnit(g, room.ref);
}

// 가구: 고른 단어. 명사가 복수면 2개. 동사는 기둥 모양이고 재질이 시제를 나타낸다.
function furniture(f, { room, cx }) {
  const y = floorY(f) + (room.aux ? 0.3 : 0.08);
  const g = new THREE.Group();
  if (room.role === 'V') {
    const mat = MATERIALS[TENSE_MATERIAL[room.tense] ?? 'tensePresent'];
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 1.3, 7), mat);
    col.position.set(cx, y + 0.65, -0.2);
    g.add(col);
  } else if (room.wordPos === 'adj' || room.wordPos === 'adv') {
    // 형용사·부사: 스탠드 조명
    g.add(box(0.1, 1.1, 0.1, MATERIALS.trunk, cx, y + 0.55, -0.2));
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.45, 6), MATERIALS[ROLE_MATERIAL[room.role]]);
    shade.position.set(cx, y + 1.2, -0.2);
    g.add(shade);
  } else {
    const mat = MATERIALS[ROLE_MATERIAL[room.role]];
    const xs = room.plural ? [cx - 0.42, cx + 0.42] : [cx];
    for (const x of xs) g.add(box(0.7, 0.75, 0.7, mat, x, y + 0.38, -0.2));
  }
  return asUnit(g, room.ref);
}

// 받침대: be동사
function platform(f, { room, cx }) {
  return asUnit(box(1.3, 0.22, 1.3, MATERIALS.stairs, cx, floorY(f) + 0.19, -0.2), room.ref);
}

// 카펫: 명사를 꾸미는 형용사
function rug(f, { room, cx, w }) {
  return asUnit(box(w - 0.6, 0.03, 1.5, MATERIALS.rug, cx, floorY(f) + 0.1, 0.1), room.ref);
}

// 문패: 관사·한정사 (방 앞 위쪽 작은 판)
function plate(f, { room, cx }) {
  return asUnit(box(0.7, 0.28, 0.06, MATERIALS.flag, cx, floorY(f) + H - 0.3, D / 2 + 0.02), room.ref);
}

// 출입문: 전치사 (방 앞쪽 문틀)
function door(f, { room, cx, w }) {
  const y = floorY(f);
  const x = cx - w / 2 + 0.55;
  return asUnit(
    group(
      box(0.1, 1.5, 0.1, MATERIALS.door, x - 0.35, y + 0.75, D / 2 - 0.05),
      box(0.1, 1.5, 0.1, MATERIALS.door, x + 0.35, y + 0.75, D / 2 - 0.05),
      box(0.8, 0.12, 0.12, MATERIALS.door, x, y + 1.5, D / 2 - 0.05),
    ),
    room.ref,
  );
}

function label(f, { room, cx }) {
  const [text, style] = roomLabel(room);
  const s = makeLabel(text, style, 0.8);
  s.position.set(cx, floorY(f) + H + 0.35, D / 2 + 0.3);
  return asUnit(s, room.ref);
}

function slab(f, width) {
  return box(width + 0.3, SLAB, D + 0.3, MATERIALS.slab, 0, floorY(f) - SLAB / 2, 0);
}

function roof(f, width, isTop) {
  const top = floorY(f) + H;
  if (isTop) {
    // 박공지붕: 세 면짜리 기둥(삼각기둥)을 눕혀 건물 가로 길이만큼 늘인다. → 방이 많아져도 지붕 모양이 자연스럽다
    // (z축으로 90° 돌려 축을 가로로 눕히고, x축으로 −90° 돌려 삼각형 꼭짓점을 위로)
    const prism = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 3), MATERIALS.roof);
    prism.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
    // 크기: 앞뒤 폭 = 건물 깊이 + 1, 길이 = 건물 가로 + 0.8, 높이 1.6 (꼭대기 = 지붕 시작 + 1.6)
    prism.scale.set((D + 1) / Math.sqrt(3), width + 0.8, 1.6 / 1.5);
    prism.position.set(0, top + 0.8 / 1.5, 0);
    return prism;
  }
  // 위층이 있으면 앞쪽에 처마 모양의 작은 지붕
  const eave = box(width + 0.6, 0.12, 0.8, MATERIALS.roof, 0, top + 0.02, D / 2 + 0.3);
  eave.rotation.x = 0.35;
  return eave;
}

// 접속사 계단: 건물 오른쪽 바깥에서 아래층과 위층을 잇는다.
function stairs(st, x, labels) {
  const mat = st.active ? MATERIALS.active : st.state === 'ghost' ? MATERIALS.ghost : MATERIALS.stairs;
  const steps = 8;
  const rise = (H + SLAB) / steps;
  const run = D / steps;
  const g = new THREE.Group();
  for (let k = 0; k < steps; k += 1) {
    g.add(box(0.9, 0.12, run + 0.02, mat, x, floorY(st.from) + (k + 1) * rise - 0.06, D / 2 - (k + 0.5) * run));
  }
  if (labels) {
    const text = st.warn ? '! 접속사 확인' : st.word ? `접속사 · ${st.word}` : '접속사 ?';
    const s = makeLabel(text, st.warn ? 'warn' : st.active ? 'active' : st.word ? 'normal' : 'ghost', 0.8);
    s.position.set(x + 0.3, floorY(st.from) + (H + SLAB) / 2, 0.4);
    g.add(s);
  }
  return asUnit(g, st.ref);
}

function foundation(width) {
  return box(width + 0.8, BASE, D + 0.8, MATERIALS.foundation, 0, BASE / 2, 0);
}

function fence(width) {
  const g = new THREE.Group();
  const z = D / 2 + 1.5;
  const half = width / 2 + 0.6;
  for (let x = -half; x <= half + 0.01; x += 0.75) g.add(box(0.12, 0.55, 0.12, MATERIALS.fence, x, 0.28, z));
  g.add(box(half * 2, 0.08, 0.06, MATERIALS.fence, 0, 0.42, z));
  g.add(box(half * 2, 0.08, 0.06, MATERIALS.fence, 0, 0.2, z));
  return g;
}

function flag(topY) {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 5), MATERIALS.trunk);
  pole.position.set(0, topY + 0.6, 0);
  const cloth = box(0.6, 0.38, 0.03, MATERIALS.flag, 0.32, topY + 1.0, 0);
  return group(pole, cloth);
}

function tree(width) {
  const x = -width / 2 - 1.3;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.8, 6), MATERIALS.trunk);
  trunk.position.set(x, 0.4, -D / 2 - 0.8);
  const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 0), MATERIALS.leaves);
  leaves.position.set(x, 1.3, -D / 2 - 0.8);
  return group(trunk, leaves);
}

// 글자 표지판(스프라이트)을 떼어 낸다. 메인 화면처럼 글자 없이 건물만 보여 줄 때 쓴다.
function withoutLabels(obj) {
  const sprites = [];
  obj.traverse((o) => {
    if (o.isSprite) sprites.push(o);
  });
  for (const s of sprites) {
    s.parent?.remove(s);
    s.material.map?.dispose();
    s.material.dispose();
  }
  return obj;
}

// ── 설계도 전체 → 부품 목록 ──
// options.labels: false면 글자 표지판을 붙이지 않는다.
export function buildParts(bp, { labels = true } = {}) {
  const parts = [];
  const add = (key, sig, create, delay = 0) =>
    parts.push({ key, sig: String(sig), delay, create: labels ? create : () => withoutLabels(create()) });

  const width = bp.maxWidth;
  add('foundation', width, () => foundation(width));

  for (const floor of bp.floors) {
    const f = floor.index;
    if (f > 0) add(`f${f}-slab`, floor.width, () => slab(f, floor.width));
    const layout = roomLayout(floor);
    layout.forEach((slot) => {
      const { room } = slot;
      const key = `room-${room.ref}`;
      const where = `${slot.cx.toFixed(2)}`; // 방 위치가 바뀌면 새로 만든다
      add(`${key}-shell`, `${room.state}-${room.active}-${where}`, () => roomShell(f, slot));
      if (room.word) add(`${key}-furn`, `${room.word}-${room.plural}-${room.tense}-${room.wordPos}-${Boolean(room.aux)}-${where}`, () => furniture(f, slot));
      if (room.aux) add(`${key}-aux`, where, () => platform(f, slot));
      if (room.adj) add(`${key}-rug`, `${room.adj}-${where}`, () => rug(f, slot));
      if (room.det) add(`${key}-det`, `${room.det}-${where}`, () => plate(f, slot));
      if (room.prep) add(`${key}-prep`, `${room.prep}-${where}`, () => door(f, slot));
      if (labels) {
        const [text, style] = roomLabel(room);
        add(`${key}-label`, `${text}-${style}-${where}`, () => label(f, slot));
      }
    });
    if (floor.roofed) add(`f${f}-roof`, `${floor.isTop}-${floor.width}`, () => roof(f, floor.width, floor.isTop));
  }

  const stairX = width / 2 + 0.75;
  for (const st of bp.stairs) {
    add(`stairs-${st.ref}`, `${st.state}-${st.active}-${st.word}-${st.warn}-${stairX}`, () => stairs(st, stairX, labels));
  }

  // 완공 장식: 깃발, 울타리, 나무는 건물이 다 지어진 다음에 마지막으로 등장한다
  const n = bp.floors.length;
  const topFloor = bp.floors[n - 1];
  const top = n > 0 ? floorY(n - 1) + H : BASE;
  if (bp.completed && topFloor) {
    const finale = 0.25;
    add('flag', `${n}-${topFloor.roofed}-${topFloor.width}`, () => flag(topFloor.roofed ? top + 1.45 : top), finale);
    add('fence', width, () => fence(width), finale + 0.1);
    add('tree', width, () => tree(width), finale + 0.2);
  }

  // 카메라가 건물 전체를 담을 수 있도록 대략적인 크기를 알려 준다.
  const height = top + 1.8;
  const spanX = width + 3.5;
  const bounds = {
    center: new THREE.Vector3(0, height / 2, 0.4),
    radius: 0.5 * Math.sqrt(spanX ** 2 + height ** 2 + 5 ** 2),
  };
  return { parts, bounds };
}
