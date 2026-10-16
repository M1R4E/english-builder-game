import { lookup } from '../data/lexicon.js';
import { allChecks } from './scoring.js';
import { compRef, isComplete, normalizeAnswer, sentenceOrder } from './structure.js';

const ROLES = ['S', 'V', 'O', 'C', 'M'];
const TYPES = ['np', 'pp', 'verb', 'adj', 'mod'];
const PATH_PARTS = ['word', 'form', 'det', 'adj', 'prep', 'aux', 'finite'];
const REQUIRED_FIELDS = ['id', 'title', 'difficulty', 'client', 'request', 'buildNote', 'meaning', 'floors', 'answers', 'checks', 'hints'];
const WORD_PREFIX = { np: 'n', pp: 'n', verb: 'v', adj: 'a' };

// 레벨 데이터에 빠진 값이나 잘못된 값이 있는지 검사한다.
// 문제가 있으면 문제 설명 목록을 돌려준다 (문제가 없으면 빈 배열).
export function validateLevel(level) {
  const problems = [];
  if (!level || typeof level !== 'object') return ['레벨 데이터가 비어 있음'];
  for (const f of REQUIRED_FIELDS) if (level[f] === undefined) problems.push(`필수 항목 없음: ${f}`);
  if (problems.length) return problems;

  if (typeof level.meaning.text !== 'string' || !Array.isArray(level.meaning.details)) {
    problems.push('meaning에는 text(뜻)와 details(세부 사항 목록)가 있어야 함');
  }

  // ── 건물 구조 ──
  if (!Array.isArray(level.floors) || level.floors.length === 0) return [...problems, 'floors가 비어 있음'];
  const refs = new Set();
  const need = (key, what) => {
    if (!lookup(key)) problems.push(`${what}: 사전에 없는 단어 ${key}`);
  };
  level.floors.forEach((floor, f) => {
    const where = `${f + 1}층`;
    if (f === 0 && floor.link) problems.push('1층에는 계단(link)이 없어야 함');
    if (f > 0) {
      if (!floor.link?.words?.length) problems.push(`${where}에 계단(link.words)이 없음`);
      for (const w of floor.link?.words ?? []) need(`c:${w}`, `${where} 계단`);
      refs.add(`L${f}`);
    }
    const ids = new Set();
    for (const comp of floor.comps ?? []) {
      const ref = compRef(f, comp);
      if (ids.has(comp.id)) problems.push(`${where}의 방 id 중복: ${comp.id}`);
      ids.add(comp.id);
      refs.add(ref);
      if (!ROLES.includes(comp.role)) problems.push(`${ref}의 role이 잘못됨: ${comp.role}`);
      if (!TYPES.includes(comp.type)) problems.push(`${ref}의 type이 잘못됨: ${comp.type}`);
      if (comp.role === 'M' && !comp.name) problems.push(`${ref} 장식 방에 이름(name)이 없음`);
      if (!comp.words?.length) problems.push(`${ref}에 단어 목록(words)이 없음`);
      for (const w of comp.words ?? []) {
        const key = comp.type === 'mod' ? w : `${WORD_PREFIX[comp.type]}:${w}`;
        if (comp.type === 'mod' && !/^(n|a):/.test(w)) problems.push(`${ref}(mod)의 단어는 n: 또는 a:로 시작해야 함: ${w}`);
        need(key, ref);
        const entry = lookup(key);
        if (entry && comp.type === 'verb' && entry.pos !== 'verb') problems.push(`${ref}: ${w}는 동사가 아님`);
      }
      for (const [list, prefix] of [['dets', 'd'], ['adjs', 'a'], ['preps', 'p'], ['auxes', 'x']]) {
        for (const w of comp[list] ?? []) need(`${prefix}:${w}`, `${ref} ${list}`);
      }
    }
    if (!floor.comps?.some((c) => c.role === 'S') || !floor.comps?.some((c) => c.role === 'V')) {
      problems.push(`${where}에 주어(S)와 동사(V) 방이 모두 있어야 함`);
    }
  });

  // 문장 순서: 모든 층과 계단이 한 번씩
  const order = sentenceOrder(level).filter((t) => t !== ',');
  const expected = [...level.floors.map((_, f) => f), ...level.floors.slice(1).map((_, i) => `L${i + 1}`)];
  if (order.length !== expected.length || !expected.every((t) => order.includes(t))) {
    problems.push('sentence(문장 순서)에 모든 층과 계단이 한 번씩 들어가야 함');
  }
  if (problems.length) return problems;

  // ── 정답 ──
  if (!Array.isArray(level.answers.accepted) || level.answers.accepted.length === 0) {
    problems.push('검증된 정답(answers.accepted)이 없음');
  } else {
    level.answers.accepted.forEach((answer, i) => {
      for (const ref of Object.keys(answer)) if (!refs.has(ref)) problems.push(`정답 ${i + 1}에 없는 방: ${ref}`);
      if (!isComplete(level, normalizeAnswer(level, answer))) problems.push(`정답 ${i + 1}이 다 지어지지 않았거나 선택지에 없는 값이 있음`);
    });
  }

  // ── 채점 항목 ──
  for (const cat of ['meaning', 'condition']) {
    if (!level.checks[cat]?.length) problems.push(`checks.${cat}에 항목이 하나 이상 있어야 함`);
  }
  const ids = new Set();
  for (const check of allChecks(level)) {
    if (ids.has(check.id)) problems.push(`채점 항목 id 중복: ${check.id}`);
    ids.add(check.id);
    if (check.auto || check.type === 'verified') continue;
    if (!check.pass || !check.fail) problems.push(`${check.id}에 pass 또는 fail 메시지가 없음`);
    const conds = check.any
      ? check.any.map((ref) => [ref, check.expect])
      : check.oneOf
        ? check.oneOf.flatMap((m) => Object.entries(m))
        : Object.entries(check.match ?? {});
    if (conds.length === 0) problems.push(`${check.id}에 확인할 조건(match 또는 any)이 없음`);
    for (const [ref, expect] of conds) {
      if (!refs.has(ref)) problems.push(`${check.id}가 없는 방을 가리킴: ${ref}`);
      for (const path of Object.keys(expect ?? {})) {
        if (!PATH_PARTS.includes(path.split('.')[0])) problems.push(`${check.id}의 경로가 잘못됨: ${path}`);
      }
    }
  }

  // 특별 요청 사항: 건축 표현(text)과 영어 문장에서의 뜻(grammar)이 둘 다 있어야 한다.
  const conditionIds = new Set((level.checks.condition ?? []).map((c) => c.id));
  for (const cond of level.conditions || []) {
    for (const id of cond.checkIds ?? [cond.checkId]) {
      if (!conditionIds.has(id)) problems.push(`조건 ${cond.id}가 없는 특별 요청 항목 ${id}를 가리킴`);
    }
    if (!cond.text || !cond.grammar) problems.push(`조건 ${cond.id}에 text(건축 표현) 또는 grammar(문장에서의 뜻)가 없음`);
    if (!cond.short) problems.push(`조건 ${cond.id}에 짧은 요약(short)이 없음 (플레이 화면 요약 칸에 표시)`);
  }

  if (!Array.isArray(level.hints.steps) || level.hints.steps.length === 0) problems.push('단계별 힌트가 없음');

  // 생각해 보기(자기 설명)와 비교해 보기(대조 학습)는 선택이지만, 있으면 모양이 맞아야 한다
  const se = level.selfExplain;
  if (se) {
    if (!se.question || !se.explain) problems.push('selfExplain에 question 또는 explain이 없음');
    if (!Array.isArray(se.options) || se.options.length < 2) problems.push('selfExplain의 선택지가 2개 이상이어야 함');
    else if (!se.options.some((o) => o.correct)) problems.push('selfExplain에 좋은 설명(correct: true)이 하나 이상 있어야 함');
  }
  for (const c of level.contrast ?? []) {
    if (!c.sentence || !c.meaning) problems.push('contrast의 문장(sentence)과 뜻(meaning)이 모두 있어야 함');
  }
  if (level.contrast?.length && level.contrast.filter((c) => c.mine).length !== 1) {
    problems.push('contrast에 이번 정답 표시(mine: true)가 하나 있어야 함');
  }
  return problems;
}
