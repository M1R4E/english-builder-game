import { buildParts } from './buildParts.js';

// 메인 화면·우편함 화면 뒤에 보여 줄 견본 건물들.
// 실제 게임과 똑같은 부품(buildParts)으로 만들고, 설계도만 미리 정해 둔다.

const room = (role) => ({ role, state: 'filled' });

function floor(index, { isTop = false, rooms = [], modifiers = 0 } = {}) {
  return {
    index,
    hasCards: true,
    pillars: { S: 'filled', V: 'filled' },
    rooms,
    modifiers,
    coreComplete: true,
    roomComplete: true,
    isTop,
  };
}

const stairs = (...froms) => froms.map((from) => ({ from, to: from + 1, state: 'filled' }));

function blueprint(floors, { stairsFrom = [], fence = false, flag = false } = {}) {
  return {
    floors,
    stairs: stairs(...stairsFrom),
    warnings: [],
    submitted: true,
    conditionsMet: fence,
    completed: flag,
    success: flag,
  };
}

export const SHOWCASE_BLUEPRINTS = [
  // 1층 기본 집
  blueprint([floor(0, { isTop: true })]),
  // 1층 + 목적어 칸 + 화분
  blueprint([floor(0, { isTop: true, rooms: [room('O')], modifiers: 2 })], { fence: true }),
  // 2층 + 계단
  blueprint([floor(0, { rooms: [room('O')] }), floor(1, { isTop: true, modifiers: 1 })], { stairsFrom: [0], flag: true }),
  // 3층 + 계단 두 개
  blueprint(
    [floor(0, { modifiers: 2 }), floor(1, { rooms: [room('C')] }), floor(2, { isTop: true, rooms: [room('O')], modifiers: 1 })],
    { stairsFrom: [0, 1], fence: true, flag: true },
  ),
  // 2층 + 방 칸 여러 개 + 가구 많이
  blueprint(
    [floor(0, { rooms: [room('O'), room('C')], modifiers: 3 }), floor(1, { isTop: true, rooms: [room('C')], modifiers: 2 })],
    { stairsFrom: [0], fence: true },
  ),
];

// 가장 큰(3층) 견본에 맞춘 카메라 범위. 건물이 바뀌어도 카메라가 흔들리지 않게 고정해서 쓴다.
export const SHOWCASE_BOUNDS = buildParts(SHOWCASE_BLUEPRINTS[3], { labels: false }).bounds;
