import { COMPLETE_THRESHOLD } from '../config.js';
import { analyzePlaced } from '../game/analyzeSentence.js';
import { getSlots } from '../game/slots.js';

// ── 자리 배치 → 건물 설계도 ──
// 3D 코드와 분리된 순수 계산이다. "어떤 부품이 어떤 상태인지"만 정한다.
//
// 문법 ↔ 건축 대응
//  절(clause)          → 층(floor) = 방 하나
//  주어(S) / 동사(V)    → 왼쪽 기둥 / 오른쪽 기둥
//  목적어(O) / 보어(C)  → 방 안쪽의 칸
//  수식어(M)            → 실내 장식(화분)
//  접속사(CONJ)         → 층과 층을 잇는 계단
//  방 완성(필수 자리가 모두 채워짐) → 그 층의 지붕 (정답 여부와 관계없음)
//  제출 결과: 특별 요청 사항 충족 → 울타리, 완공 → 깃발
//
// 자리 상태: 'filled' 카드가 놓임 / 'ghost' 비어 있음(반투명으로 위치만 표시)
// 모든 자리 부품에는 자리 key가 붙어 있어, 3D 화면에서 눌러 고를 수 있다.
// options.activeSlot: 지금 카드를 고르고 있는 자리 key. 그 부품을 강조한다.

export function makeBlueprint(level, placed, result = null, { activeSlot = null } = {}) {
  const slots = getSlots(level);
  const analysis = analyzePlaced(level, placed);
  const state = (key) => (analysis.bySlot[key] ? 'filled' : 'ghost');
  const word = (key) => analysis.bySlot[key]?.text;

  const floors = level.structure.clauses.map((_, i) => {
    const mine = slots.filter((s) => s.clause === i);
    const words = {};
    for (const s of mine) if (word(s.key)) words[s.key] = word(s.key);
    return {
      index: i,
      hasCards: mine.some((s) => analysis.bySlot[s.key]),
      pillars: { S: state(`${i}-S`), V: state(`${i}-V`) },
      rooms: mine.filter((s) => s.role === 'O' || s.role === 'C').map((s) => ({ role: s.role, key: s.key, state: state(s.key) })),
      mods: mine.filter((s) => s.kind === 'mod').map((s) => ({ key: s.key, state: state(s.key) })),
      words,
      active: mine.some((s) => s.key === activeSlot) ? activeSlot : null,
      coreComplete: Boolean(analysis.bySlot[`${i}-S`] && analysis.bySlot[`${i}-V`]),
      roomComplete: mine.filter((s) => s.required).every((s) => analysis.bySlot[s.key]),
      isTop: i === level.structure.clauses.length - 1,
    };
  });

  // 층 사이 계단(접속사). 문장 맨 앞 접속사(before: 0)도 1층과 2층을 잇는다.
  const stairs = slots
    .filter((s) => s.kind === 'link')
    .map((s) => {
      const from = s.link.after ?? s.link.before;
      return { from, to: from + 1, key: s.key, state: state(s.key), word: word(s.key), active: s.key === activeSlot };
    });

  // 제출 결과 → 건물 위 경고 표시 (빈 필수 자리, 실패한 항목이 가리키는 자리)
  const warnings = [];
  if (result) {
    for (const m of result.missing ?? []) warnings.push({ slot: m.slot, kind: 'missing' });
    for (const check of result.checks) {
      if (check.status !== 'fail' || !check.target) continue;
      if (!warnings.some((w) => w.slot === check.target)) warnings.push({ slot: check.target, kind: 'check' });
    }
  }

  const conditionIds = new Set((level.conditions ?? []).flatMap((c) => c.checkIds ?? [c.checkId]));
  const conditionChecks = result?.checks.filter((c) => conditionIds.has(c.id) || c.category === 'condition') ?? [];

  return {
    floors,
    stairs,
    warnings,
    submitted: Boolean(result),
    // 특별 요청 사항을 모두 지켰으면 울타리, 완공 점수 이상이면 깃발
    conditionsMet: conditionChecks.length > 0 && conditionChecks.every((c) => c.status === 'pass'),
    completed: Boolean(result && result.total >= COMPLETE_THRESHOLD),
    success: Boolean(result?.perfect),
  };
}
