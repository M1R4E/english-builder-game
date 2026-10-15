import * as THREE from 'three';
import { ROLE_LABELS } from '../game/labels.js';
import { makeLabel } from './labels.js';
import { MATERIALS } from './materials.js';

// ── 설계도 → 3D 부품 목록 ──
// 부품마다 key(이름표)와 sig(상태)를 붙인다.
// 렌더러는 key가 같고 sig도 같은 부품은 그대로 두고, 새로 생기거나 바뀐 부품만 다시 만든다.
// → 카드 하나를 바꿔도 건물 전체가 다시 튀어나오지 않고, 바뀐 부분만 애니메이션된다.
// 주의: 부품의 위치나 모양을 바꾸는 값은 모두 key 또는 sig에 넣어야 한다.
//       (빠뜨리면 이전 모양이 그대로 남는다. 예: 메인 화면 깃발이 떠 있던 문제)

// 크기 규칙 (모든 레벨 공통)
export const LAYOUT = {
  W: 4, // 가로
  D: 3, // 세로
  H: 2.2, // 층 높이
  SLAB: 0.25, // 층 사이 바닥 두께
  BASE: 0.3, // 기초 높이
};
const { W, D, H, SLAB, BASE } = LAYOUT;

const floorY = (f) => BASE + f * (H + SLAB);

function box(w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  if (material === MATERIALS.ghost) mesh.userData.noShadow = true;
  return mesh;
}

function group(...children) {
  const g = new THREE.Group();
  children.forEach((c) => g.add(c));
  return g;
}

// 자리 표지판 글자: 빈자리 "주어 ?", 카드가 놓이면 "주어 · the cat"
function slotLabel(role, state, word) {
  if (state === 'ghost' || !word) return `${ROLE_LABELS[role]} ?`;
  return `${ROLE_LABELS[role]} · ${word}`;
}

// 표지판 모양: 고르고 있는 자리는 노랑, 빈자리는 파랑, 채워진 자리는 흰색
const labelStyle = (state, active) => (active ? 'active' : state === 'ghost' ? 'ghost' : 'normal');

// 자리 부품 재질: 고르고 있는 자리는 노랑(깜빡임), 빈자리는 반투명 유령
const slotMaterial = (state, active, filledMaterial) =>
  active ? MATERIALS.active : state === 'ghost' ? MATERIALS.ghost : filledMaterial;

// 누를 수 있는 자리 부품에 자리 key를 붙여 둔다 → 렌더러가 클릭된 부품의 자리를 알아낸다
function asSlot(obj, key) {
  if (key) obj.userData.slotKey = key;
  return obj;
}

// 장식(수식어) 화분의 위치: 방 앞쪽에 한 줄로
const modX = (i, count) => (count <= 1 ? -0.4 : -1.2 + (i * 2.4) / Math.max(count - 1, 1));
// 방 칸(목적어·보어)의 위치
const roomX = (i, count) => (count === 1 ? 0 : -0.8 + i * 1.6);

// ── 부품 만들기 ──

function foundation() {
  return box(W + 0.6, BASE, D + 0.6, MATERIALS.foundation, 0, BASE / 2, 0);
}

function slab(f, state) {
  const mat = state === 'ghost' ? MATERIALS.ghost : MATERIALS.slab;
  return box(W + 0.4, SLAB, D + 0.4, mat, 0, floorY(f) - SLAB / 2, 0);
}

function pillars(f, role, state, active, word) {
  const x = role === 'S' ? -W / 2 : W / 2;
  const mat = slotMaterial(state, active, MATERIALS[`pillar${role}`]);
  const y = floorY(f) + H / 2;
  const label = makeLabel(slotLabel(role, state, word), labelStyle(state, active), 0.9);
  label.position.set(x, floorY(f) + H * 0.55, D / 2 + 0.55);
  // 고르는 중인 기둥은 조금 굵게 해서 눈에 띄게
  const t = active ? 0.45 : 0.35;
  return asSlot(group(box(t, H, t, mat, x, y, -D / 2), box(t, H, t, mat, x, y, D / 2), label), `${f}-${role}`);
}

// 벽: 앞쪽은 열어 두는 "인형의 집" 방식 → 방 안의 칸과 가구가 보인다.
function walls(f) {
  const y = floorY(f) + H / 2;
  const t = 0.14;
  const g = group(
    box(W, H, t, MATERIALS.wall, 0, y, -D / 2),
    box(t, H, D, MATERIALS.wall, -W / 2, y, 0),
    box(t, H, D, MATERIALS.wall, W / 2, y, 0),
  );
  // 옆벽 창문
  [-W / 2 - 0.08, W / 2 + 0.08].forEach((x) => {
    g.add(box(0.05, 0.6, 0.8, MATERIALS.window, x, y + 0.2, 0));
  });
  // 뒷벽 창문
  g.add(box(0.8, 0.6, 0.05, MATERIALS.window, 0, y + 0.25, -D / 2 + 0.09));
  return g;
}

// 목적어·보어 칸: 방 안쪽 뒤편에 놓이는 상자
function roomSlot(f, room, i, count, active, word) {
  const x = roomX(i, count);
  const mat = slotMaterial(room.state, active, MATERIALS[`room${room.role}`]);
  const label = makeLabel(slotLabel(room.role, room.state, word), labelStyle(room.state, active), 0.8);
  label.position.set(x, floorY(f) + 1.35, -D / 2 + 0.6);
  return asSlot(group(box(1.3, 0.9, 0.8, mat, x, floorY(f) + 0.45, -D / 2 + 0.6), label), room.key);
}

// 수식어 장식: 방 안의 화분. 자리(key)가 있으면 빈자리도 유령으로 보여 주고 누를 수 있다.
function furniture(f, i, count, { key = null, state = 'filled', active = false, word, labels = false } = {}) {
  const x = modX(i, count);
  const z = 0.45;
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.14, 0.3, 6),
    slotMaterial(state, active, MATERIALS.stairs),
  );
  pot.position.set(x, floorY(f) + 0.15, z);
  const leaves = new THREE.Mesh(
    new THREE.IcosahedronGeometry(active ? 0.34 : 0.28, 0),
    slotMaterial(state, active, MATERIALS.furniture),
  );
  leaves.position.set(x, floorY(f) + 0.5, z);
  const g = group(pot, leaves);
  if (labels) {
    const label = makeLabel(slotLabel('M', state, word), labelStyle(state, active), 0.75);
    label.position.set(x, floorY(f) + 0.95, z + 0.4);
    g.add(label);
  }
  return asSlot(g, key);
}

function roof(f, isTop) {
  const top = floorY(f) + H;
  if (isTop) {
    // 네 면짜리 원뿔을 45도 돌리면 각진 지붕이 된다.
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4), MATERIALS.roof);
    cone.rotation.y = Math.PI / 4;
    cone.scale.set((W + 1) * 0.72, 1.6, (D + 1) * 0.72);
    cone.position.set(0, top + 0.8, 0);
    return cone;
  }
  // 위층이 있으면 앞쪽에 처마 모양의 작은 지붕
  const eave = box(W + 0.8, 0.12, 0.8, MATERIALS.roof, 0, top + 0.02, D / 2 + 0.3);
  eave.rotation.x = 0.35;
  return eave;
}

// 접속사 계단: 건물 오른쪽 바깥에서 아래층과 위층을 잇는다.
function stairs(st, labels) {
  const active = Boolean(st.active);
  const mat = slotMaterial(st.state, active, MATERIALS.stairs);
  const steps = 8;
  const rise = (H + SLAB) / steps;
  const run = D / steps;
  const x = W / 2 + 0.75;
  const g = new THREE.Group();
  for (let k = 0; k < steps; k += 1) {
    g.add(box(active ? 1.1 : 0.9, 0.12, run + 0.02, mat, x, floorY(st.from) + (k + 1) * rise - 0.06, D / 2 - (k + 0.5) * run));
  }
  if (labels) {
    const label = makeLabel(slotLabel('CONJ', st.state, st.word), labelStyle(st.state, active), 0.8);
    label.position.set(x + 0.4, floorY(st.from) + (H + SLAB) / 2, 0);
    g.add(label);
  }
  return asSlot(g, st.key);
}

// 경고 표지판 위치: 가리키는 자리 부품 바로 위
function warningPosition(slot, bp) {
  if (slot.startsWith('L')) {
    const st = bp.stairs.find((s) => s.key === slot);
    return [W / 2 + 1.1, floorY(st?.from ?? 0) + H + 0.2, 0];
  }
  const f = Number(slot.split('-')[0]);
  const floor = bp.floors[f];
  const role = slot.split('-')[1];
  if (role === 'S' || role === 'V') return [role === 'S' ? -W / 2 : W / 2, floorY(f) + H + 0.35, D / 2 + 0.55];
  if (role === 'O' || role === 'C') {
    const i = Math.max(floor.rooms.findIndex((r) => r.key === slot), 0);
    return [roomX(i, floor.rooms.length), floorY(f) + 1.9, -D / 2 + 0.6];
  }
  const mods = floor.mods ?? [];
  const i = Math.max(mods.findIndex((m) => m.key === slot), 0);
  return [modX(i, mods.length), floorY(f) + 1.45, 0.85];
}

function warning(w, bp) {
  const role = w.slot.startsWith('L') ? 'CONJ' : w.slot.split('-')[1];
  const name = ROLE_LABELS[role] ?? '문장';
  const text = w.kind === 'missing' ? `${name} 없음` : `! ${name} 확인`;
  const label = makeLabel(text, 'warn', 1);
  label.position.set(...warningPosition(w.slot, bp));
  return label;
}

function fence() {
  const g = new THREE.Group();
  const z = D / 2 + 1.6;
  for (let i = -3; i <= 3; i += 1) {
    g.add(box(0.12, 0.55, 0.12, MATERIALS.fence, i * 0.75, 0.28, z));
  }
  g.add(box(4.6, 0.08, 0.06, MATERIALS.fence, 0, 0.42, z));
  g.add(box(4.6, 0.08, 0.06, MATERIALS.fence, 0, 0.2, z));
  return g;
}

function flag(topY) {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 5), MATERIALS.trunk);
  pole.position.set(0, topY + 0.6, 0);
  const cloth = box(0.6, 0.38, 0.03, MATERIALS.flag, 0.32, topY + 1.0, 0);
  return group(pole, cloth);
}

function tree() {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.8, 6), MATERIALS.trunk);
  // 주어 기둥을 가리지 않도록 건물 왼쪽 뒤편에 둔다.
  trunk.position.set(-W / 2 - 1.2, 0.4, -D / 2 - 1.2);
  const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 0), MATERIALS.leaves);
  leaves.position.set(-W / 2 - 1.2, 1.3, -D / 2 - 1.2);
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
// options.labels: false면 "주어", "동사 ?" 같은 글자 표지판을 붙이지 않는다.
export function buildParts(bp, { labels = true } = {}) {
  const parts = [];
  const add = (key, sig, create) =>
    parts.push({ key, sig: String(sig), create: labels ? create : () => withoutLabels(create()) });

  add('foundation', 1, foundation);
  add('tree', 1, tree);

  for (const fl of bp.floors) {
    const f = fl.index;
    if (f > 0) add(`f${f}-slab`, fl.hasCards ? 'filled' : 'ghost', () => slab(f, fl.hasCards ? 'filled' : 'ghost'));
    const words = fl.words ?? {};
    for (const role of ['S', 'V']) {
      const key = `${f}-${role}`;
      const state = fl.pillars[role];
      const active = fl.active === key;
      add(`f${f}-${role}`, `${state}-${active}-${words[key] ?? ''}`, () => pillars(f, role, state, active, words[key]));
    }
    fl.rooms.forEach((room, i) => {
      const active = Boolean(room.key) && fl.active === room.key;
      add(`f${f}-room-${room.role}`, `${room.state}-${i}-${fl.rooms.length}-${active}-${words[room.key] ?? ''}`, () =>
        roomSlot(f, room, i, fl.rooms.length, active, words[room.key]));
    });
    if (fl.coreComplete) add(`f${f}-walls`, 1, () => walls(f));
    // 장식: 게임에서는 자리(mods)마다, 메인 화면 견본에서는 개수(modifiers)만큼
    const mods = fl.mods ?? Array.from({ length: fl.modifiers ?? 0 }, () => ({ key: null, state: 'filled' }));
    mods.forEach((m, i) => {
      const active = Boolean(m.key) && fl.active === m.key;
      const word = words[m.key];
      add(`f${f}-furn-${i}`, `${m.state}-${i}-${mods.length}-${active}-${word ?? ''}`, () =>
        furniture(f, i, mods.length, { key: m.key, state: m.state, active, word, labels: Boolean(m.key) }));
    });
    if (fl.roomComplete) add(`f${f}-roof`, fl.isTop ? 'top' : 'eave', () => roof(f, fl.isTop));
  }

  for (const st of bp.stairs) {
    add(`stairs-${st.from}`, `${st.state}-${Boolean(st.active)}-${st.word ?? ''}`, () => stairs(st, Boolean(st.key)));
  }

  for (const w of bp.warnings) {
    // 경고 위치는 방 칸·장식 배치에 따라 달라지므로 그 배치도 sig에 넣는다
    const f = w.slot.startsWith('L') ? null : Number(w.slot.split('-')[0]);
    const layout = f === null ? '' : `${bp.floors[f].rooms.map((r) => r.key).join()}|${(bp.floors[f].mods ?? []).length}`;
    add(`warn-${w.slot}`, `${w.kind}-${layout}`, () => warning(w, bp));
  }

  const n = bp.floors.length;
  const top = floorY(n - 1) + H;
  const topFloorRoofed = bp.floors[n - 1].roomComplete;
  if (bp.conditionsMet) add('fence', 1, fence);
  // 깃발 높이는 층수에 따라 달라지므로 sig에 층수를 넣는다.
  // (넣지 않으면 메인 화면에서 집이 바뀔 때 깃발이 이전 집 높이에 그대로 남아 떠 있게 된다)
  if (bp.completed) {
    add('flag', `${n}-${topFloorRoofed ? 'roof' : 'flat'}`, () => flag(topFloorRoofed ? top + 1.45 : top));
  }

  // 카메라가 건물 전체를 담을 수 있도록 대략적인 크기를 알려 준다.
  const height = top + 1.8;
  const bounds = {
    center: new THREE.Vector3(0.2, height / 2, 0.4),
    radius: 0.5 * Math.sqrt(7 ** 2 + height ** 2 + 5 ** 2),
  };

  return { parts, bounds };
}
