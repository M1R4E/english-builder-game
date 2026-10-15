// ── 건축 자리(슬롯) ──
// 플레이어는 카드를 아무 데나 늘어놓는 대신, 건물의 "자리"(주어 기둥, 동사 기둥, 계단 등)를 하나 고르고
// 그 자리에 들어갈 카드를 고른다. 자리의 순서가 곧 문장의 순서다.
//
// 레벨 데이터의 structure 예시
//   structure: {
//     clauses: [
//       { slots: ['S', 'V', { role: 'M', id: 'how', name: '어떻게 장식' }], commaAfter: false },
//       { slots: ['S', 'V', 'O'] },
//     ],
//     links: [{ id: 'L0', after: 0, commaBefore: true }],  // 1층 뒤에 오는 접속사 (… , but …)
//     // links: [{ id: 'L0', before: 0 }],                  // 문장 맨 앞의 접속사 (When …, …)
//   }
//
// 자리 key 규칙
//   '0-S'      1층 주어 기둥 (S·V·O·C는 '<층>-<성분>')
//   '0-M-how'  1층 장식 자리 (수식어는 '<층>-M-<id>')
//   'L0'       층을 잇는 계단 (접속사는 links의 id)
//
// 필수 자리: 주어·동사·목적어·보어 자리와 계단. 비어 있으면 누락 감점을 받는다.
// 장식(수식어) 자리는 선택이다. 필요한지는 레벨의 채점 항목(특별 요청 사항 등)이 정한다.

import { ROLE_LABELS } from './labels.js';

export { ROLE_LABELS };

// 성분 → 건축 부품 이름
export const PART_NAMES = {
  S: '주어 기둥',
  V: '동사 기둥',
  O: '목적어 칸',
  C: '보어 칸',
  M: '장식',
  CONJ: '계단',
};

export const slotKey = (clause, role, id) => (role === 'M' ? `${clause}-M-${id}` : `${clause}-${role}`);

// 레벨 → 자리 목록 (문장 순서대로)
export function getSlots(level) {
  const { clauses, links = [] } = level.structure;
  const multi = clauses.length > 1;
  const floorName = (i) => (multi ? `${i + 1}층 ` : '');
  const linkSlot = (link) => ({
    key: link.id,
    kind: 'link',
    clause: null,
    link,
    role: 'CONJ',
    required: true,
    name: link.name ?? '접속사 계단',
    roleName: ROLE_LABELS.CONJ,
  });

  const slots = [];
  clauses.forEach((clause, i) => {
    for (const link of links.filter((l) => l.before === i)) slots.push(linkSlot(link));
    clause.slots.forEach((entry) => {
      const spec = typeof entry === 'string' ? { role: entry } : entry;
      const isMod = spec.role === 'M';
      slots.push({
        key: slotKey(i, spec.role, spec.id),
        kind: isMod ? 'mod' : 'core',
        clause: i,
        role: spec.role,
        id: spec.id ?? null,
        required: !isMod,
        name: `${floorName(i)}${spec.name ?? PART_NAMES[spec.role]}`,
        roleName: ROLE_LABELS[spec.role],
      });
    });
    for (const link of links.filter((l) => l.after === i)) slots.push(linkSlot(link));
  });
  return slots;
}

// 이 카드를 이 자리에 놓을 수 있는가: 성분이 같고, 카드에 자리 제한(slots)이 있으면 그 안에 있어야 한다
export function fitsSlot(card, slot) {
  return card.role === slot.role && (!card.slots || card.slots.includes(slot.key));
}

// 이 자리에 놓을 수 있는 카드 목록
export function cardsForSlot(level, slot) {
  if (!slot) return [];
  return level.cards.filter((c) => fitsSlot(c, slot));
}

// 자리에 놓인 카드 → 문장 순서대로 늘어놓은 카드 id 목록
export function idsFromPlaced(slots, placed) {
  return slots.map((s) => placed[s.key]).filter(Boolean);
}

// 두 배치가 같은지 (빈자리 포함)
export function samePlaced(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((k) => (a[k] ?? null) === (b[k] ?? null));
}

// 다음에 채울 자리: from 다음의 빈자리 → 없으면 앞쪽의 빈자리 → 모두 찼으면 null
export function nextEmptySlot(slots, placed, fromKey = null) {
  const start = slots.findIndex((s) => s.key === fromKey) + 1;
  const ordered = [...slots.slice(start), ...slots.slice(0, start)];
  return ordered.find((s) => !placed[s.key])?.key ?? null;
}
