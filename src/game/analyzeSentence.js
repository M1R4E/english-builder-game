// 자리에 놓인 카드를 분석해서 "절(층)"별로 정리하고, 화면에 보여 줄 문장을 만든다.
// React나 Three.js와 관계없는 순수 함수라서 자동 테스트하기 쉽다.
//
// placed: 자리 key → 카드 id  (예: { '0-S': 'the-cat', '0-V': 'sleeps' })

import { CORE_ROLES, ROLE_LABELS } from './labels.js';
import { getSlots } from './slots.js';

export { CORE_ROLES, ROLE_LABELS };

const cardMap = (level) => new Map(level.cards.map((c) => [c.id, c]));

// 자리 순서대로 놓인 카드 목록 [{ slot, card }]
export function placedCards(level, placed) {
  const byId = cardMap(level);
  return getSlots(level)
    .map((slot) => ({ slot, card: byId.get(placed[slot.key]) }))
    .filter((x) => x.card);
}

// placed → { clauses: [{ cards, roles, bySlot }], links: { [id]: card }, bySlot }
//  roles  : 성분별 카드 목록 (예: roles.S = [주어 카드])
//  bySlot : 자리 key별 카드
export function analyzePlaced(level, placed) {
  const clauses = level.structure.clauses.map(() => ({ cards: [], roles: {}, bySlot: {} }));
  const links = {};
  const bySlot = {};
  for (const { slot, card } of placedCards(level, placed)) {
    bySlot[slot.key] = card;
    if (slot.kind === 'link') {
      links[slot.key] = card;
      continue;
    }
    const clause = clauses[slot.clause];
    clause.cards.push(card);
    clause.bySlot[slot.key] = card;
    (clause.roles[card.role] ||= []).push(card);
  }
  return { clauses, links, bySlot };
}

// placed → 화면에 보여 줄 문장 (첫 글자 대문자, 끝에 마침표, 레벨 구조에 따른 쉼표)
export function sentenceText(level, placed) {
  const byId = cardMap(level);
  const { clauses } = level.structure;
  const slots = getSlots(level);
  const tokens = [];
  slots.forEach((slot, i) => {
    const card = byId.get(placed[slot.key]);
    if (card) {
      if (slot.kind === 'link' && slot.link.commaBefore && tokens.length > 0) tokens.push(',');
      tokens.push(card.text);
    }
    // 절이 끝나는 곳: commaAfter가 있으면 쉼표 (그 절에 카드가 하나라도 있을 때)
    const next = slots[i + 1];
    const clauseEnds = slot.clause !== null && (!next || next.clause !== slot.clause);
    if (clauseEnds && clauses[slot.clause].commaAfter) {
      const hasCard = slots.some((s) => s.clause === slot.clause && placed[s.key]);
      if (hasCard && tokens[tokens.length - 1] !== ',') tokens.push(',');
    }
  });
  while (tokens[tokens.length - 1] === ',') tokens.pop();
  if (tokens.length === 0) return '';
  let text = tokens.reduce((acc, t) => (acc === '' ? t : t === ',' ? `${acc},` : `${acc} ${t}`), '');
  text = text.charAt(0).toUpperCase() + text.slice(1);
  return /[.!?]$/.test(text) ? text : `${text}.`;
}
