import { SCORE_WEIGHTS } from '../config.js';
import { CHECK_TYPES } from './scoring.js';

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

  // 카드
  const ids = new Set();
  for (const card of level.cards) {
    if (!card.id || !card.text) problems.push(`카드에 id 또는 text 없음: ${JSON.stringify(card)}`);
    if (ids.has(card.id)) problems.push(`카드 id 중복: ${card.id}`);
    ids.add(card.id);
    if (!ROLES.includes(card.role)) problems.push(`카드 ${card.id}의 role이 잘못됨: ${card.role}`);
  }

  // 정답
  if (!Array.isArray(level.answers.accepted) || level.answers.accepted.length === 0) {
    problems.push('검증된 정답(answers.accepted)이 없음');
  } else {
    level.answers.accepted.forEach((answer, i) => {
      answer.forEach((id) => {
        if (!ids.has(id)) problems.push(`정답 ${i + 1}에 없는 카드 id: ${id}`);
      });
    });
  }

  // 채점 항목
  const checkIds = new Set();
  const sums = Object.fromEntries(Object.keys(SCORE_WEIGHTS).map((k) => [k, 0]));
  for (const check of level.checks) {
    if (checkIds.has(check.id)) problems.push(`채점 항목 id 중복: ${check.id}`);
    if (!CHECK_TYPES[check.type]) problems.push(`알 수 없는 채점 방식: ${check.type} (${check.id})`);
    if (!(check.category in SCORE_WEIGHTS)) problems.push(`알 수 없는 범주: ${check.category} (${check.id})`);
    else sums[check.category] += check.points;
    for (const role of check.requires || []) {
      if (!ROLES.includes(role)) problems.push(`${check.id}의 requires에 잘못된 성분: ${role}`);
    }
    // 성분 카드를 직접 확인하는 항목은 requires로 필요한 성분을 밝혀야 '확인 못 함' 처리가 정확해진다.
    const needed = { roleOrder: check.order, agreement: ['S', 'V'], roleMatches: [check.role] }[check.type] || [];
    for (const role of needed) {
      if (!(check.requires || []).includes(role)) problems.push(`${check.id}의 requires에 ${role}가 빠짐`);
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

  // 조건이 가리키는 채점 항목이 실제로 있는지
  // 특별 요청 사항: 건축 표현(text)과 영어 문장에서의 뜻(grammar)이 둘 다 있어야 한다.
  for (const cond of level.conditions || []) {
    if (!checkIds.has(cond.checkId)) problems.push(`조건 ${cond.id}가 없는 채점 항목 ${cond.checkId}를 가리킴`);
    if (!cond.text || !cond.grammar) problems.push(`조건 ${cond.id}에 text(건축 표현) 또는 grammar(문장에서의 뜻)가 없음`);
  }

  if (!Array.isArray(level.structure.clauses) || level.structure.clauses.length === 0) {
    problems.push('structure.clauses가 비어 있음');
  } else {
    level.structure.clauses.forEach((clause, i) => {
      if (!Array.isArray(clause.slots) || clause.slots.length === 0) problems.push(`${i + 1}번째 절에 필수 성분(slots)이 없음`);
      for (const role of clause.slots || []) {
        if (!['S', 'V', 'O', 'C'].includes(role)) problems.push(`${i + 1}번째 절의 필수 성분이 잘못됨: ${role}`);
      }
    });
  }
  if (!Array.isArray(level.hints.steps) || level.hints.steps.length === 0) {
    problems.push('단계별 힌트가 없음');
  }

  return problems;
}
