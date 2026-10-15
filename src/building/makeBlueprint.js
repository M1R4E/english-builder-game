import { COMPLETE_THRESHOLD } from '../config.js';
import { analyzeSentence, getCards } from '../game/analyzeSentence.js';

// ── 카드 → 건물 설계도 ──
// 3D 코드와 분리된 순수 계산이다. "어떤 부품이 어떤 상태인지"만 정한다.
//
// 문법 ↔ 건축 대응
//  절(clause)          → 층(floor) = 방 하나
//  주어(S) / 동사(V)    → 왼쪽 기둥 / 오른쪽 기둥
//  목적어(O) / 보어(C)  → 방 안쪽의 칸
//  수식어(M)            → 실내 장식(가구)
//  접속사(CONJ)         → 층과 층을 잇는 계단
//  방 완성(필수 자리가 모두 채워짐) → 그 층의 지붕 (정답 여부와 관계없음)
//  제출 결과 정답        → 울타리와 깃발
//
// 자리 상태: 'filled' 카드가 놓임 / 'ghost' 비어 있음(반투명으로 위치만 표시)

export function makeBlueprint(level, ids, result = null) {
  const analysis = analyzeSentence(getCards(level, ids));
  const required = level.structure.clauses;
  const floorCount = Math.max(required.length, analysis.clauses.length);

  const floors = [];
  for (let i = 0; i < floorCount; i += 1) {
    const clause = analysis.clauses[i] || { cards: [], roles: {} };
    const slots = required[i]?.slots ?? ['S', 'V'];
    const has = (role) => (clause.roles[role]?.length ?? 0) > 0;

    // 필요한 자리 + (필요 없지만) 플레이어가 넣은 목적어·보어 자리
    const roomRoles = ['O', 'C'].filter((r) => slots.includes(r) || has(r));

    floors.push({
      index: i,
      hasCards: clause.cards.length > 0,
      pillars: {
        S: has('S') ? 'filled' : 'ghost',
        V: has('V') ? 'filled' : 'ghost',
      },
      rooms: roomRoles.map((role) => ({ role, state: has(role) ? 'filled' : 'ghost' })),
      modifiers: clause.roles.M?.length ?? 0,
      coreComplete: has('S') && has('V'),
      roomComplete: slots.every(has),
      isTop: i === floorCount - 1,
    });
  }

  // 층 사이 연결(계단): 접속사가 있으면 'filled', 층이 여러 개인데 접속사가 없으면 'ghost'
  const stairs = [];
  const leading = analysis.clauses[0]?.leadingConnector;
  for (let i = 0; i < floorCount - 1; i += 1) {
    const linked = analysis.connectors.some((c) => c.between[0] === i) || (i === 0 && Boolean(leading));
    stairs.push({ from: i, to: i + 1, state: linked ? 'filled' : 'ghost' });
  }

  // 제출 결과의 실패 항목 → 건물 위 경고 표시
  const warnings = [];
  if (result) {
    // 빠진 필수 성분 → 그 자리에 경고
    for (const m of result.missing ?? []) {
      warnings.push({ floor: Math.min(m.clause, floorCount - 1), role: m.role, kind: 'missing' });
    }
    for (const check of result.checks) {
      if (check.status !== 'fail' || !check.target) continue;
      const floor = Math.min(check.clause, floorCount - 1);
      if (!warnings.some((w) => w.floor === floor && w.role === check.target)) {
        warnings.push({ floor, role: check.target, kind: 'check' });
      }
    }
  }

  const conditionChecks = result?.checks.filter((c) => c.category === 'condition') ?? [];

  return {
    floors,
    stairs,
    warnings,
    submitted: Boolean(result),
    // 특별 조건을 모두 지켰으면 울타리, 완공 점수 이상이면 깃발
    conditionsMet: conditionChecks.length > 0 && conditionChecks.every((c) => c.status === 'pass'),
    completed: Boolean(result && result.total >= COMPLETE_THRESHOLD),
    success: Boolean(result?.perfect),
  };
}
