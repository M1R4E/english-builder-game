import { SCORE_WEIGHTS } from '../config.js';
import { compRef, findResolved, isComplete, normalizeAnswer, resolveAll, sameChoices } from './structure.js';

// ── 채점 방식 ──
// 건물(공정 선택)을 다 지은 뒤 제출하면 점수를 계산한다.
//  문법(30)    : 자동 검사 + 레벨이 더한 문법 항목
//                 - 명사 덩어리: 관사와 단수·복수, 셀 수 있는지, a/an, 틀린 복수형
//                 - 동사: 틀린 형태(불규칙 변화 등), be동사와 -ing의 짝
//                 - 수 일치: 층(절)마다 주어와 동사(또는 be동사)
//                 - 품사: 보어 자리는 형용사, 동사를 꾸미는 장식은 부사
//  의미(30), 특별 요청(25): 레벨 데이터에 적은 항목
//  자연스러움(15): 미리 검증한 정답과 같은지. 다른 항목이 모두 통과해야 확인한다.
// 범주 안의 점수는 항목 수만큼 똑같이 나눈다. 같은 답은 언제나 같은 점수가 나온다.
//
// 항목 결과: pass 통과 / partial 부분 통과 / fail 고칠 점 / skipped 확인 보류(앞 항목 실패)
//
// 레벨에 적는 항목 모양
//   { id, match: { '0.S': { 'word.sem': 'cat', 'form.number': 'sg' } }, pass, fail }   // 모든 조건이 맞아야 통과
//   { id, any: ['0.front', '0.end'], expect: { 'word.sem': 'always' }, pass, fail }    // 여러 방 중 하나라도 맞으면 통과
//   { id, oneOf: [match1, match2], pass, fail }                                         // 여러 경우 중 하나가 맞으면 통과
// 경로: word / form / det / adj / prep / aux / finite 뒤에 꼬리표 이름 (예: 'det.name', 'finite.tense')
// 주의: 관사 뜻을 확인할 때는 'none'도 허용한다 (관사가 없는 것은 자동 문법 검사가 지적하므로 두 번 깎지 않기 위해)

// 값 꺼내기: 'form.number' → resolved.form.number
const valueAt = (r, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), r);

export function matches(r, expect) {
  if (!r) return false;
  return Object.entries(expect).every(([path, v]) => {
    const got = valueAt(r, path);
    return Array.isArray(v) ? v.includes(got) : got === v;
  });
}

// ── 자동 문법 검사 ──

// 명사 덩어리 (관사 + 형용사 + 명사)
export function checkNounPhrase(r) {
  const { word, form, det, adj } = r;
  if (!word || word.pos !== 'noun') return { ok: true };
  const nounText = word.text;
  if (form?.valid === false) return { ok: false, message: form.why ?? `${nounText}의 이 형태는 쓰지 않아요.` };
  const kind = det?.kind ?? 'none';
  if (word.noDet && kind !== 'none') return { ok: false, message: word.noDet };
  if (word.count === 'proper' && kind !== 'none') return { ok: false, message: `${nounText} 같은 이름 앞에는 관사를 붙이지 않아요.` };
  const plural = form?.number === 'pl';
  if (word.count === 'uncountable' && (kind === 'indef' || kind === 'every')) {
    return { ok: false, message: `${nounText}는 셀 수 없는 명사라 a/an이나 every를 붙이지 않아요.` };
  }
  if (plural && (kind === 'indef' || kind === 'every')) {
    return { ok: false, message: 'a/an과 every 뒤에는 하나(단수)를 나타내는 명사가 와요. 여럿이면 다른 관사를 써 보세요.' };
  }
  if (word.count === 'countable' && !plural && kind === 'none') {
    return { ok: false, message: '셀 수 있는 명사가 하나일 때는 앞에 a/an, the, my 같은 말이 필요해요.' };
  }
  if (kind === 'indef') {
    const next = adj ?? word;
    if (det.an && !next.vowel) return { ok: false, message: 'an은 모음 소리(a, e, i, o, u 소리) 앞에만 써요. 뒤에 오는 단어의 첫소리를 확인해 보세요.' };
    if (!det.an && next.vowel) return { ok: false, message: '모음 소리로 시작하는 단어 앞에서는 a가 아니라 an을 써요.' };
  }
  return { ok: true };
}

// 동사 (형태, be동사 + -ing)
export function checkVerb(r) {
  const { word, form, aux } = r;
  if (!word || !form) return { ok: true };
  if (form.valid === false) return { ok: false, message: form.why ?? `${word.text}의 이 형태는 쓰지 않아요.` };
  const hasAux = Boolean(aux?.tense);
  if (hasAux && form.tense !== 'ing') return { ok: false, message: 'be동사(is, was …) 뒤에서 "~하고 있다"를 나타내려면 동사를 -ing 모양으로 써요.' };
  if (!hasAux && form.tense === 'ing') return { ok: false, message: '-ing 모양만으로는 문장의 동사가 될 수 없어요. 앞에 be동사가 필요해요.' };
  return { ok: true };
}

// 주어의 인칭·수 (예: '3sg', '1pl')
export function subjectKey(s) {
  if (!s?.word) return null;
  if (s.word.pos === 'pronoun') return `${s.word.person}${s.word.number}`;
  return `3${s.form?.number === 'pl' ? 'pl' : 'sg'}`;
}

// 수 일치 (주어 ↔ 동사 또는 be동사)
export function checkAgreement(s, v) {
  const key = subjectKey(s);
  const finite = v?.finite;
  if (!key || !finite || finite.agree === undefined || finite.agree === null || finite.agree === 'any') return { ok: true };
  let ok;
  if (finite.agree === '3sg') ok = key === '3sg';
  else if (finite.agree === 'base') ok = key !== '3sg';
  else ok = Array.isArray(finite.agree) && finite.agree.includes(key);
  return ok ? { ok } : { ok, message: `주어(${s.text})가 ${key === '3sg' ? '하나(3인칭 단수)' : '여럿이거나 I·you·we'}일 때 어울리는 동사 모양을 확인해 보세요.` };
}

// 품사 (보어 자리는 형용사, 동사를 꾸미는 장식은 부사)
export function checkPos(r) {
  if (!r.form?.pos) return { ok: true };
  const want = r.comp.pos ?? (r.comp.role === 'C' ? 'adj' : 'adv');
  if (r.form.pos === want) return { ok: true };
  return {
    ok: false,
    message: want === 'adj'
      ? '이 자리는 주어의 상태를 설명하는 자리라 형용사가 와요. 부사(-ly 등)가 아니에요.'
      : '이 자리는 동사를 꾸미는 자리라 부사가 와요. 형용사는 명사를 꾸밀 때 써요.',
  };
}

// 레벨 구조에서 자동 문법 항목 목록 만들기
export function autoGrammarChecks(level) {
  const list = [];
  level.floors.forEach((floor, f) => {
    for (const comp of floor.comps) {
      const ref = compRef(f, comp);
      if (['np', 'pp', 'mod'].includes(comp.type)) list.push({ id: `G-${ref}-np`, auto: 'np', ref, pass: '명사 덩어리(관사·단수·복수)가 바르게 지어졌어요.' });
      if (comp.type === 'verb') list.push({ id: `G-${ref}-verb`, auto: 'verb', ref, pass: '동사의 형태가 바르게 지어졌어요.' });
      if (['adj', 'mod'].includes(comp.type)) list.push({ id: `G-${ref}-pos`, auto: 'pos', ref, pass: '이 자리에 맞는 품사(형용사·부사)를 골랐어요.' });
    }
    const s = floor.comps.find((c) => c.role === 'S');
    const v = floor.comps.find((c) => c.role === 'V');
    if (s && v) list.push({ id: `G-${f}-agree`, auto: 'agree', ref: compRef(f, v), subject: compRef(f, s), pass: `${level.floors.length > 1 ? `${f + 1}층의 ` : ''}주어와 동사의 수가 잘 맞아요.` });
  });
  return list;
}

// 모든 채점 항목 (범주, 배점 포함) — 레벨이 바뀌지 않으면 결과도 같다
export function allChecks(level) {
  const extra = level.checks ?? {};
  const groups = {
    grammar: [...autoGrammarChecks(level), ...(extra.grammar ?? [])],
    meaning: extra.meaning ?? [],
    condition: extra.condition ?? [],
    naturalness: [{ id: 'N1', type: 'verified', partialPoints: 7, pass: '미리 검증한 자연스러운 문장과 일치해요.', partial: '오류는 찾지 못했지만, 미리 검증한 정답 목록에 없는 표현이라 자연스러움은 확실히 판단하지 못했어요.' }],
  };
  const list = [];
  for (const [category, checks] of Object.entries(groups)) {
    const max = SCORE_WEIGHTS[category];
    const base = Math.floor(max / Math.max(checks.length, 1));
    checks.forEach((check, i) => {
      // 나누어떨어지지 않으면 남는 점수를 뒤쪽 항목부터 1점씩 더한다
      const points = base + (i >= checks.length - (max - base * checks.length) ? 1 : 0);
      list.push({ ...check, category, points });
    });
  }
  return list;
}

// 항목이 가리키는 방 (건물에 "!" 표시를 띄울 곳)
const targetOf = (check) =>
  check.target ?? check.ref ?? Object.keys(check.match ?? check.oneOf?.[0] ?? {})[0] ?? check.any?.[0] ?? null;

function evaluate(check, all, level, choices) {
  if (check.auto === 'np') return checkNounPhrase(findResolved(all, check.ref));
  if (check.auto === 'verb') return checkVerb(findResolved(all, check.ref));
  if (check.auto === 'pos') {
    const r = findResolved(all, check.ref);
    return r.word && (r.word.pos === 'adj' || r.word.pos === 'adv') ? checkPos(r) : { ok: true };
  }
  if (check.auto === 'agree') return checkAgreement(findResolved(all, check.subject), findResolved(all, check.ref));
  if (check.type === 'verified') {
    const ok = level.answers.accepted.some((a) => sameChoices(level, normalizeAnswer(level, a), choices));
    return ok ? { ok: true } : { ok: false, partial: true };
  }
  if (check.any) return { ok: check.any.some((ref) => matches(findResolved(all, ref), check.expect)) };
  const allMatch = (match) => Object.entries(match).every(([ref, expect]) => matches(findResolved(all, ref), expect));
  if (check.oneOf) return { ok: check.oneOf.some(allMatch) };
  return { ok: allMatch(check.match) };
}

export function scoreSentence(level, choices) {
  const all = resolveAll(level, choices);
  const checks = [];
  for (const check of allChecks(level)) {
    const failedBefore = check.type === 'verified' && checks.some((c) => c.status !== 'pass');
    let status;
    let message;
    if (failedBefore) {
      status = 'skipped';
      message = '앞의 고칠 점을 고치면 확인할 수 있어요.';
    } else {
      const r = evaluate(check, all, level, choices);
      status = r.ok ? 'pass' : r.partial ? 'partial' : 'fail';
      message = status === 'pass' ? check.pass : status === 'partial' ? check.partial : r.message ?? check.fail;
    }
    const earned = status === 'pass' ? check.points : status === 'partial' ? check.partialPoints : 0;
    checks.push({ id: check.id, category: check.category, target: targetOf(check), points: check.points, earned, status, message });
  }

  const categories = {};
  for (const [cat, max] of Object.entries(SCORE_WEIGHTS)) {
    const earned = checks.filter((c) => c.category === cat).reduce((s, c) => s + c.earned, 0);
    categories[cat] = { earned: clamp(earned, 0, max), max };
  }
  const total = clamp(Object.values(categories).reduce((s, c) => s + c.earned, 0), 0, 100);

  return {
    total,
    categories,
    checks,
    complete: isComplete(level, choices),
    perfect: checks.every((c) => c.status === 'pass'),
    // 고칠 점이 있는 방·계단
    errorRefs: [...new Set(checks.filter((c) => c.status === 'fail' && c.target).map((c) => c.target))],
  };
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
}
