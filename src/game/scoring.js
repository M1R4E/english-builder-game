import { SCORE_WEIGHTS } from '../config.js';
import { analyzeSentence, CORE_ROLES, getCards } from './analyzeSentence.js';

// ── 채점 방식 ──
// 레벨 데이터의 checks(채점 항목)를 순서대로 확인한다.
// 각 항목의 결과는 다음 넷 중 하나:
//   pass    통과 → 배점 전부
//   partial 부분 통과 → partialPoints
//   fail    실패 → 0점, 고칠 점을 알려 준다
//   skipped 확인 보류 → 0점. 앞 항목(dependsOn)이 통과하지 못해 확인할 수 없는 경우.
//           오류 메시지를 따로 내지 않는다(같은 실수를 여러 번 지적하지 않기 위해).
// 같은 답안은 언제나 같은 점수가 나온다 (무작위 요소 없음).

const firstOf = (clause, role) => clause?.roles[role]?.[0];

// 확인 방법(type)별 구현. 새 종류의 조건이 필요하면 여기에 추가한다.
export const CHECK_TYPES = {
  // 이 절에 해당 성분이 있는가
  hasRole(check, { analysis }) {
    const card = firstOf(analysis.clauses[check.clause], check.role);
    return { ok: Boolean(card) };
  },

  // 성분들이 정해진 순서대로 놓였는가 (예: S → V)
  roleOrder(check, { analysis }) {
    const clause = analysis.clauses[check.clause];
    const cards = check.order.map((role) => firstOf(clause, role));
    const positions = cards.map((c) => clause.cards.indexOf(c));
    const ok = positions.every((p, i) => i === 0 || p > positions[i - 1]);
    return { ok, cardIds: ok ? [] : cards.map((c) => c.id) };
  },

  // 주어와 동사의 수 일치
  agreement(check, { analysis }) {
    const clause = analysis.clauses[check.clause];
    const subject = firstOf(clause, 'S');
    const verb = firstOf(clause, 'V');
    const key = `${subject.person}${subject.number}`; // 예: '3sg', '1sg', '3pl'
    let ok;
    if (verb.agree === 'any') ok = true;
    else if (verb.agree === '3sg') ok = key === '3sg';
    else if (verb.agree === 'base') ok = key !== '3sg';
    else ok = Array.isArray(verb.agree) && verb.agree.includes(key);
    return { ok, cardIds: ok ? [] : [verb.id] };
  },

  // 해당 성분 카드가 원하는 속성(뜻, 수, 시제 등)을 가졌는가
  roleMatches(check, { analysis }) {
    const card = firstOf(analysis.clauses[check.clause], check.role);
    const ok = Object.entries(check.match).every(([k, v]) => card[k] === v);
    return { ok, cardIds: ok ? [] : [card.id] };
  },

  // 한 절에 주어·동사·목적어·보어가 두 번 이상 들어가지 않았는가
  noExtraCards(check, { analysis }) {
    const extras = [];
    for (const clause of analysis.clauses) {
      for (const role of CORE_ROLES) {
        const list = clause.roles[role] || [];
        extras.push(...list.slice(1).map((c) => c.id));
      }
    }
    return { ok: extras.length === 0, cardIds: extras };
  },

  // 미리 검증한 정답 목록과 일치하는가 (일치하지 않으면 부분 점수)
  verifiedAnswer(check, { ids, level }) {
    const ok = level.answers.accepted.some(
      (answer) => answer.length === ids.length && answer.every((id, i) => id === ids[i]),
    );
    return ok ? { ok: true } : { ok: false, partial: true };
  },
};

export function scoreSentence(level, ids) {
  const cards = getCards(level, ids);
  const analysis = analyzeSentence(cards);
  const context = { analysis, ids: cards.map((c) => c.id), level };
  const checks = [];
  const byId = {};

  for (const check of level.checks) {
    const deps = check.dependsOnAll ? checks : (check.dependsOn || []).map((d) => byId[d]);
    let status;
    let cardIds = [];
    if (deps.some((d) => d.status !== 'pass')) {
      status = 'skipped';
    } else {
      const r = CHECK_TYPES[check.type](check, context);
      status = r.ok ? 'pass' : r.partial ? 'partial' : 'fail';
      cardIds = r.cardIds || [];
    }
    const earned = status === 'pass' ? check.points : status === 'partial' ? check.partialPoints || 0 : 0;
    const message =
      status === 'skipped' ? '앞의 문제를 고치면 확인할 수 있어요.' : check[status] || check.pass;
    const result = {
      id: check.id,
      category: check.category,
      target: check.target,
      clause: check.clause ?? 0,
      points: check.points,
      earned,
      status,
      message,
      cardIds,
    };
    checks.push(result);
    byId[check.id] = result;
  }

  const categories = {};
  for (const [cat, max] of Object.entries(SCORE_WEIGHTS)) {
    const earned = checks.filter((c) => c.category === cat).reduce((s, c) => s + c.earned, 0);
    categories[cat] = { earned: clamp(earned, 0, max), max };
  }
  const total = clamp(
    Object.values(categories).reduce((s, c) => s + c.earned, 0),
    0,
    100,
  );

  return {
    total,
    categories,
    checks,
    perfect: checks.every((c) => c.status === 'pass'),
    errorCardIds: [...new Set(checks.flatMap((c) => c.cardIds))],
  };
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
}
