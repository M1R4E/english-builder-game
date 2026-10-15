import { ROLE_LABELS } from './analyzeSentence.js';

// ── 건축 자리(슬롯) ──
// 플레이어는 카드를 아무 데나 늘어놓는 대신, 건물의 "자리"(주어 기둥, 동사 기둥 등)를 하나 고르고
// 그 자리에 들어갈 카드를 고른다. 자리의 순서가 곧 문장의 순서다.
//
// 자리 key 규칙: "<층 번호>-<성분>"  예) '0-S' = 1층 주어 기둥, '0-V' = 1층 동사 기둥
// 레벨 데이터의 structure.clauses[층].slots 에 적힌 순서대로 자리를 만든다.
// (여러 층을 잇는 접속사 계단 자리는 3단계에서 해당 레벨을 만들 때 추가한다)

// 성분 → 건축 부품 이름
export const PART_NAMES = {
  S: '주어 기둥',
  V: '동사 기둥',
  O: '목적어 칸',
  C: '보어 칸',
};

export const slotKey = (clause, role) => `${clause}-${role}`;

// 레벨 → 자리 목록 (문장 순서대로)
export function getSlots(level) {
  const clauses = level.structure.clauses;
  return clauses.flatMap((clause, i) =>
    clause.slots.map((role) => ({
      key: slotKey(i, role),
      clause: i,
      role,
      name: `${clauses.length > 1 ? `${i + 1}층 ` : ''}${PART_NAMES[role] ?? ROLE_LABELS[role]}`,
      roleName: ROLE_LABELS[role],
    })),
  );
}

// 자리에 놓인 카드 → 문장 순서대로 늘어놓은 카드 id 목록 (채점과 설계도는 이 목록을 쓴다)
export function idsFromPlaced(slots, placed) {
  return slots.map((s) => placed[s.key]).filter(Boolean);
}

// 이 자리에 놓을 수 있는 카드: 같은 성분의 카드
export function cardsForSlot(level, slot) {
  if (!slot) return [];
  return level.cards.filter((c) => c.role === slot.role);
}

// 다음에 채울 자리: from 다음의 빈자리 → 없으면 앞쪽의 빈자리 → 모두 찼으면 null
export function nextEmptySlot(slots, placed, fromKey = null) {
  const start = slots.findIndex((s) => s.key === fromKey) + 1;
  const ordered = [...slots.slice(start), ...slots.slice(0, start)];
  return ordered.find((s) => !placed[s.key])?.key ?? null;
}
