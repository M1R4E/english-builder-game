import { MISSING_ROLE_PENALTY, SCORE_WEIGHTS } from '../config.js';
import { analyzePlaced, CORE_ROLES } from './analyzeSentence.js';
import { getSlots, samePlaced } from './slots.js';

// ── 채점 방식 ──
// placed(자리 key → 카드 id)를 받아 점수를 계산한다.
// 1) 필수 자리 누락 (별도 기준)
//    주어·동사·목적어·보어 자리와 계단(접속사)이 비어 있으면, 빈자리 하나마다 MISSING_ROLE_PENALTY점을 총점에서 뺀다.
// 2) 채점 항목(checks)
//    레벨 데이터의 checks를 순서대로 확인한다. 결과는 다음 중 하나:
//      pass    통과 → 배점 전부
//      partial 부분 통과 → partialPoints
//      fail    실패 → 0점, 고칠 점을 알려 준다
//      blocked 확인 못 함 → 배점 전부. 확인에 필요한 자리(requires)가 비어 있는 경우.
//              빈 필수 자리는 이미 누락 감점을 했고, 빈 장식 자리는 특별 요청 사항 등 다른 항목에서 따로 확인하므로
//              여기서는 깎지 않는다 (같은 실수를 두 번 깎지 않기 위해).
//      skipped 확인 보류 → 0점. 앞 항목(dependsOn)이 실패해서 확인할 수 없는 경우.
// 같은 답안은 언제나 같은 점수가 나온다 (무작위 요소 없음).

// 성분 설명 (누락 안내 문구에 사용)
const ROLE_DESCRIPTIONS = {
  S: '주어(누가·무엇이)',
  V: '동사(~하다·~이다)',
  O: '목적어(~을·를)',
  C: '보어(주어를 설명하는 말)',
  CONJ: '접속사(두 절을 잇는 말)',
};

const firstOf = (clause, role) => clause?.roles[role]?.[0];

// 카드가 조건에 맞는가. 값이 배열이면 그중 하나와 같으면 된다.
//  예) { tense: 'past' }, { sem: ['when', 'after'] }
export function cardMatches(card, match) {
  if (!card) return false;
  return Object.entries(match).every(([k, v]) => (Array.isArray(v) ? v.includes(card[k]) : card[k] === v));
}

// 확인 방법(type)별 구현. 새 종류의 조건이 필요하면 여기에 추가한다.
export const CHECK_TYPES = {
  // 성분들이 정해진 순서대로 놓였는가 (자리 방식에서는 자리 순서가 정해져 있어 항상 통과한다)
  roleOrder(check, { analysis }) {
    const clause = analysis.clauses[check.clause];
    const cards = check.order.map((role) => firstOf(clause, role));
    if (cards.some((c) => !c)) return { ok: false };
    const positions = cards.map((c) => clause.cards.indexOf(c));
    const ok = positions.every((p, i) => i === 0 || p > positions[i - 1]);
    return { ok, cardIds: ok ? [] : cards.map((c) => c.id) };
  },

  // 주어와 동사의 수 일치
  agreement(check, { analysis }) {
    const clause = analysis.clauses[check.clause];
    const subject = firstOf(clause, 'S');
    const verb = firstOf(clause, 'V');
    if (!subject || !verb) return { ok: false };
    const key = `${subject.person}${subject.number}`; // 예: '3sg', '1sg', '3pl'
    let ok;
    if (verb.agree === 'any' || verb.agree === undefined) ok = true;
    else if (verb.agree === '3sg') ok = key === '3sg';
    else if (verb.agree === 'base') ok = key !== '3sg';
    else ok = Array.isArray(verb.agree) && verb.agree.includes(key);
    return { ok, cardIds: ok ? [] : [verb.id] };
  },

  // 이 절의 해당 성분 카드가 원하는 속성(뜻, 수, 시제 등)을 가졌는가
  roleMatches(check, { analysis }) {
    const card = firstOf(analysis.clauses[check.clause], check.role);
    const ok = cardMatches(card, check.match);
    return { ok, cardIds: ok || !card ? [] : [card.id] };
  },

  // 한 자리에 놓인 카드가 원하는 속성을 가졌는가 (비어 있으면 실패)
  slotMatches(check, { analysis }) {
    const card = analysis.bySlot[check.slot];
    const ok = cardMatches(card, check.match);
    return { ok, cardIds: ok || !card ? [] : [card.id] };
  },

  // 자리가 채워졌는가
  slotFilled(check, { analysis }) {
    return { ok: Boolean(analysis.bySlot[check.slot]) };
  },

  // 여러 자리 중 하나라도 원하는 카드가 있는가 (위치는 따지지 않음)
  anySlotMatches(check, { analysis }) {
    return { ok: check.slots.some((key) => cardMatches(analysis.bySlot[key], check.match)) };
  },

  // 채워진 자리마다 그 자리에 맞는 카드인가 (예: 빈도부사는 동사 앞 자리, 장소는 끝 자리)
  // 하나도 채워지지 않았으면 실패
  slotsMatch(check, { analysis }) {
    const filled = Object.keys(check.expect).filter((key) => analysis.bySlot[key]);
    const wrong = filled.filter((key) => !cardMatches(analysis.bySlot[key], check.expect[key]));
    return { ok: filled.length > 0 && wrong.length === 0, cardIds: wrong.map((key) => analysis.bySlot[key].id) };
  },

  // 한 절에 주어·동사·목적어·보어가 두 번 이상 들어가지 않았는가 (자리 방식에서는 항상 통과)
  noExtraCards(check, { analysis }) {
    const extras = [];
    for (const clause of analysis.clauses) {
      for (const role of CORE_ROLES) extras.push(...(clause.roles[role] || []).slice(1).map((c) => c.id));
    }
    return { ok: extras.length === 0, cardIds: extras };
  },

  // 미리 검증한 정답 목록과 일치하는가 (일치하지 않으면 부분 점수)
  verifiedAnswer(check, { placed, level }) {
    const ok = level.answers.accepted.some((answer) => samePlaced(answer, placed));
    return ok ? { ok: true } : { ok: false, partial: true };
  },
};

export function scoreSentence(level, placed) {
  const slots = getSlots(level);
  const byId = new Set(level.cards.map((c) => c.id));
  // 없는 카드 id는 무시한다 (잘못된 값이 들어와도 멈추지 않게)
  const clean = Object.fromEntries(Object.entries(placed).filter(([k, id]) => byId.has(id) && slots.some((s) => s.key === k)));
  const analysis = analyzePlaced(level, clean);
  const context = { analysis, placed: clean, level };
  const isEmpty = (key) => !analysis.bySlot[key];

  // 1) 필수 자리 누락 확인
  const missing = slots
    .filter((slot) => slot.required && isEmpty(slot.key))
    .map((slot) => ({
      slot: slot.key,
      clause: slot.clause,
      role: slot.role,
      penalty: MISSING_ROLE_PENALTY,
      message: `${slot.name}이 비어 있어요. ${ROLE_DESCRIPTIONS[slot.role]} 카드를 놓아야 문장이 완성돼요.`,
    }));

  // 2) 채점 항목 확인
  const checks = [];
  const byCheckId = {};
  for (const check of level.checks) {
    const deps = check.dependsOnAll ? checks : (check.dependsOn || []).map((d) => byCheckId[d]);
    let status;
    let cardIds = [];
    // 필수 자리가 빈 미완성 문장은 "검증된 자연스러운 문장"인지 판단하지 않는다 (누락 감점에 이미 포함)
    const unfinished = check.type === 'verifiedAnswer' && missing.length > 0;
    if ((check.requires || []).some(isEmpty)) {
      status = 'blocked';
    } else if (deps.some((d) => d.status !== 'pass' && d.status !== 'blocked')) {
      status = 'skipped';
    } else if (unfinished || deps.some((d) => d.status === 'blocked')) {
      status = 'blocked';
    } else {
      const r = CHECK_TYPES[check.type](check, context);
      status = r.ok ? 'pass' : r.partial ? 'partial' : 'fail';
      cardIds = r.cardIds || [];
    }
    const earned =
      status === 'pass' || status === 'blocked' ? check.points : status === 'partial' ? check.partialPoints || 0 : 0;
    const message =
      status === 'skipped'
        ? '앞의 문제를 고치면 확인할 수 있어요.'
        : status === 'blocked'
          ? '필요한 자리가 비어 있어 확인하지 못했어요. (빈자리는 따로 확인하므로 여기서는 깎지 않아요)'
          : check[status] || check.pass;
    const result = {
      id: check.id,
      category: check.category,
      target: check.target ?? null, // 실패했을 때 건물에 표시할 자리 key
      points: check.points,
      earned,
      status,
      message,
      cardIds,
    };
    checks.push(result);
    byCheckId[check.id] = result;
  }

  const categories = {};
  for (const [cat, max] of Object.entries(SCORE_WEIGHTS)) {
    const earned = checks.filter((c) => c.category === cat).reduce((s, c) => s + c.earned, 0);
    categories[cat] = { earned: clamp(earned, 0, max), max };
  }
  const penalty = missing.reduce((s, m) => s + m.penalty, 0);
  const total = clamp(Object.values(categories).reduce((s, c) => s + c.earned, 0) - penalty, 0, 100);

  return {
    total,
    categories,
    checks,
    missing, // 빈 필수 자리 목록
    penalty, // 누락 감점 합계
    perfect: missing.length === 0 && checks.every((c) => c.status === 'pass'),
    errorCardIds: [...new Set(checks.flatMap((c) => c.cardIds))],
  };
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
}
