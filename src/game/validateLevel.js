import { SCORE_WEIGHTS } from '../config.js';
import { CHECK_TYPES } from './scoring.js';
import { fitsSlot, getSlots } from './slots.js';

const ROLES = ['S', 'V', 'O', 'C', 'M', 'CONJ'];
const REQUIRED_FIELDS = ['id', 'title', 'client', 'request', 'buildNote', 'meaning', 'cards', 'structure', 'answers', 'checks', 'hints'];

// 레벨 데이터에 빠진 값이나 잘못된 값이 있는지 검사한다.
// 문제가 있으면 문제 설명 목록을 돌려준다 (문제가 없으면 빈 배열).
export function validateLevel(level) {
  const problems = [];
  if (!level || typeof level !== 'object') return ['레벨 데이터가 비어 있음'];

  for (const f of REQUIRED_FIELDS) {
    if (level[f] === undefined) problems.push(`필수 항목 없음: ${f}`);
  }
  if (problems.length) return problems;

  if (typeof level.meaning.text !== 'string' || !Array.isArray(level.meaning.details)) {
    problems.push('meaning에는 text(뜻)와 details(세부 사항 목록)가 있어야 함');
  }

  // ── 건물 구조 (층, 자리, 계단) ──
  const { clauses, links = [] } = level.structure;
  if (!Array.isArray(clauses) || clauses.length === 0) return [...problems, 'structure.clauses가 비어 있음'];
  clauses.forEach((clause, i) => {
    if (!Array.isArray(clause.slots) || clause.slots.length === 0) problems.push(`${i + 1}번째 절에 자리(slots)가 없음`);
    const modIds = new Set();
    for (const entry of clause.slots || []) {
      const spec = typeof entry === 'string' ? { role: entry } : entry;
      if (!['S', 'V', 'O', 'C', 'M'].includes(spec.role)) problems.push(`${i + 1}번째 절의 자리 성분이 잘못됨: ${spec.role}`);
      if (spec.role === 'M') {
        if (!spec.id) problems.push(`${i + 1}번째 절의 장식 자리에 id가 없음`);
        if (modIds.has(spec.id)) problems.push(`${i + 1}번째 절의 장식 자리 id 중복: ${spec.id}`);
        modIds.add(spec.id);
      }
    }
    if (!(clause.slots || []).includes('S') || !(clause.slots || []).includes('V')) {
      problems.push(`${i + 1}번째 절에 주어(S)와 동사(V) 자리가 모두 있어야 함`);
    }
  });
  if (links.length !== clauses.length - 1) problems.push(`층이 ${clauses.length}개이면 계단(links)은 ${clauses.length - 1}개여야 함`);
  for (const link of links) {
    if (!/^L\d+$/.test(link.id ?? '')) problems.push(`계단 id는 L0, L1 …이어야 함: ${link.id}`);
    const from = link.after ?? link.before;
    // 계단은 from층과 from+1층을 잇는다
    if (!Number.isInteger(from) || from < 0 || from >= clauses.length - 1) {
      problems.push(`계단 ${link.id}의 위치(after/before)가 잘못됨`);
    }
  }
  if (problems.length) return problems;

  const slots = getSlots(level);
  const slotKeys = new Set(slots.map((s) => s.key));
  if (slotKeys.size !== slots.length) problems.push('자리 key가 겹침');

  // ── 카드 ──
  const ids = new Set();
  for (const card of level.cards) {
    if (!card.id || !card.text) problems.push(`카드에 id 또는 text 없음: ${JSON.stringify(card)}`);
    if (ids.has(card.id)) problems.push(`카드 id 중복: ${card.id}`);
    ids.add(card.id);
    if (!ROLES.includes(card.role)) problems.push(`카드 ${card.id}의 role이 잘못됨: ${card.role}`);
    for (const key of card.slots || []) {
      if (!slotKeys.has(key)) problems.push(`카드 ${card.id}의 자리 제한에 없는 자리: ${key}`);
    }
    if (!slots.some((s) => fitsSlot(card, s))) problems.push(`카드 ${card.id}를 놓을 수 있는 자리가 없음`);
  }
  for (const slot of slots) {
    if (!level.cards.some((c) => fitsSlot(c, slot))) problems.push(`자리 ${slot.key}에 놓을 수 있는 카드가 없음`);
  }

  // ── 정답 ──
  const cardById = new Map(level.cards.map((c) => [c.id, c]));
  if (!Array.isArray(level.answers.accepted) || level.answers.accepted.length === 0) {
    problems.push('검증된 정답(answers.accepted)이 없음');
  } else {
    level.answers.accepted.forEach((answer, i) => {
      for (const [key, id] of Object.entries(answer)) {
        const slot = slots.find((s) => s.key === key);
        if (!slot) problems.push(`정답 ${i + 1}에 없는 자리: ${key}`);
        else if (!cardById.has(id)) problems.push(`정답 ${i + 1}에 없는 카드 id: ${id}`);
        else if (!fitsSlot(cardById.get(id), slot)) problems.push(`정답 ${i + 1}: 카드 ${id}는 자리 ${key}에 놓을 수 없음`);
      }
      for (const slot of slots.filter((s) => s.required)) {
        if (!answer[slot.key]) problems.push(`정답 ${i + 1}에 필수 자리 ${slot.key}가 비어 있음`);
      }
    });
  }

  // ── 채점 항목 ──
  const checkIds = new Set();
  const sums = Object.fromEntries(Object.keys(SCORE_WEIGHTS).map((k) => [k, 0]));
  const needSlot = (check, key, what) => {
    if (!slotKeys.has(key)) problems.push(`${check.id}의 ${what}에 없는 자리: ${key}`);
  };
  for (const check of level.checks) {
    if (checkIds.has(check.id)) problems.push(`채점 항목 id 중복: ${check.id}`);
    if (!CHECK_TYPES[check.type]) problems.push(`알 수 없는 채점 방식: ${check.type} (${check.id})`);
    if (!(check.category in SCORE_WEIGHTS)) problems.push(`알 수 없는 범주: ${check.category} (${check.id})`);
    else sums[check.category] += check.points;
    if (check.clause !== undefined && !(check.clause >= 0 && check.clause < clauses.length)) {
      problems.push(`${check.id}의 clause가 잘못됨: ${check.clause}`);
    }
    for (const key of check.requires || []) needSlot(check, key, 'requires');
    if (check.target) needSlot(check, check.target, 'target');
    if (check.slot) needSlot(check, check.slot, 'slot');
    for (const key of check.slots || []) needSlot(check, key, 'slots');
    for (const key of Object.keys(check.expect || {})) needSlot(check, key, 'expect');
    // 성분 카드를 직접 확인하는 항목은 requires로 필요한 자리를 밝혀야 '확인 못 함' 처리가 정확해진다.
    const c = check.clause;
    const needed = {
      roleOrder: (check.order || []).map((r) => `${c}-${r}`),
      agreement: [`${c}-S`, `${c}-V`],
      roleMatches: [`${c}-${check.role}`],
    }[check.type] || [];
    for (const key of needed) {
      if (!(check.requires || []).includes(key)) problems.push(`${check.id}의 requires에 ${key}가 빠짐`);
    }
    if (check.type === 'slotMatches' && slots.find((s) => s.key === check.slot)?.required && !(check.requires || []).includes(check.slot)) {
      problems.push(`${check.id}의 requires에 필수 자리 ${check.slot}가 빠짐`);
    }
    for (const dep of check.dependsOn || []) {
      if (!checkIds.has(dep)) problems.push(`${check.id}가 앞에 없는 항목 ${dep}에 의존함`);
    }
    if (!check.pass) problems.push(`${check.id}에 통과 메시지 없음`);
    if (check.type !== 'verifiedAnswer' && !check.fail) problems.push(`${check.id}에 실패 메시지 없음`);
    checkIds.add(check.id);
  }
  for (const [cat, max] of Object.entries(SCORE_WEIGHTS)) {
    if (sums[cat] !== max) problems.push(`${cat} 배점 합계가 ${max}이 아니라 ${sums[cat]}임`);
  }

  // 특별 요청 사항: 건축 표현(text)과 영어 문장에서의 뜻(grammar)이 둘 다 있어야 한다.
  for (const cond of level.conditions || []) {
    for (const id of cond.checkIds ?? [cond.checkId]) {
      if (!checkIds.has(id)) problems.push(`조건 ${cond.id}가 없는 채점 항목 ${id}를 가리킴`);
    }
    if (!cond.text || !cond.grammar) problems.push(`조건 ${cond.id}에 text(건축 표현) 또는 grammar(문장에서의 뜻)가 없음`);
  }

  if (!Array.isArray(level.hints.steps) || level.hints.steps.length === 0) {
    problems.push('단계별 힌트가 없음');
  }

  return problems;
}
