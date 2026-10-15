import { lookup } from '../data/lexicon.js';

// ── 건물 구조와 공정 순서 ──
// 문법 ↔ 건축 대응
//   층(floor)  = 절(주어 + 동사 묶음) 하나. 1층(맨 아래)은 주절, 위층은 종속절이나 이어지는 절.
//   방(room)   = 문장 성분 하나 (주어 방, 동사 방, 목적어 방, 보어 방, 장식 방). 방은 문장 순서대로 왼쪽→오른쪽으로 놓인다.
//   방 안      = 단어 하나하나: 가구(중심 단어) · 가구 개수(단수·복수) · 문패(관사) · 카펫(꾸미는 형용사) · 출입문(전치사) · 받침대(be동사)
//   계단       = 접속사 (아래층과 위층을 잇는다)
//
// 레벨 데이터 예시
//   floors: [
//     { comps: [ { id: 'S', role: 'S', type: 'np', words: ['cat', 'dog'] }, { id: 'V', role: 'V', type: 'verb', words: ['sleep'] } ] },
//     { link: { words: ['but', 'so'] }, comps: [ ... ] },   // 2층과 그 아래를 잇는 계단
//   ],
//   sentence: [0, ',', 'L1', 1],   // (선택) 문장에서의 순서. 없으면 1층 → 계단 → 2층 …
//
// 방의 종류(type)와 공정 단계
//   np   명사 덩어리   : 단어 → 단수·복수 → 관사 → (꾸미는 형용사)
//   pp   전치사 덩어리 : 단어 → 단수·복수 → 관사 → (꾸미는 형용사) → 전치사
//   verb 동사         : 단어 → 형태(시제) → (be동사)
//   adj  형용사·부사   : 단어 → 형태(형용사/부사)
//   mod  자유 장식     : 단어(부사 또는 장소 명사) → 고른 단어에 따라 adj 또는 pp와 같은 단계
// 형태가 하나뿐인 단어는 형태 단계를, 대명사·이름은 관사 단계를 건너뛴다.
//
// 공정 순서: 층수 → 1층의 필수 방(주어·동사·목적어·보어) → 1층의 장식 방 → 계단 → 2층 … (같은 방식으로 반복)

export const ROOM_NAMES = { S: '주어 방', V: '동사 방', O: '목적어 방', C: '보어 방', M: '장식 방' };
export const REQUIRED_ROLES = ['S', 'V', 'O', 'C'];
const DEFAULT_DETS = ['the', 'a', 'an', 'none'];
export const FLOOR_OPTIONS = [1, 2, 3];

// 단계 이름 (자재 판 제목에 보여 준다): [건축 부품, 문법 이름]
const PART_LABELS = {
  word: ['가구', '단어'],
  form: ['규격', '형태'],
  det: ['문패', '관사'],
  adj: ['카펫', '꾸미는 말'],
  prep: ['출입문', '전치사'],
  aux: ['받침대', 'be동사'],
};
export const partLabel = (part, type, word) => {
  if (part === 'word' && type === 'verb') return ['기둥', '동사'];
  if (part === 'word' && type === 'conj') return ['계단', '접속사'];
  if (part === 'form') {
    if (type === 'verb') return ['자재', '시제·형태'];
    if (word?.pos === 'noun') return ['개수', '단수·복수'];
    return ['모양', '형용사·부사'];
  }
  return PART_LABELS[part];
};

const prefixOf = (type) => ({ np: 'n', pp: 'n', verb: 'v', adj: 'a' })[type];
const withPrefix = (value, prefix) => (value.includes(':') ? value : `${prefix}:${value}`);
const isNounish = (w) => w?.pos === 'noun' || w?.pos === 'pronoun';

export const compRef = (f, comp) => `${f}.${comp.id}`;
export const isRequired = (comp) => REQUIRED_ROLES.includes(comp.role);

// 층의 방을 공정 순서로: 필수 방 먼저, 그다음 장식 방 (각각 문장 순서 유지)
export const buildOrder = (floor) => [...floor.comps.filter(isRequired), ...floor.comps.filter((c) => !isRequired(c))];

export function roomName(level, f, comp) {
  const prefix = level.floors.length > 1 ? `${f + 1}층 ` : '';
  return `${prefix}${comp.name ?? ROOM_NAMES[comp.role]}`;
}

// 방의 공정 단계 목록 (고른 단어에 따라 달라진다)
export function compParts(comp, word) {
  const parts = ['word'];
  if (!word) return parts;
  const nounLike = comp.type === 'np' || comp.type === 'pp' || (comp.type === 'mod' && isNounish(word));
  if (nounLike) {
    if (word.forms.length > 1) parts.push('form');
    if (word.pos === 'noun' && word.count !== 'proper') parts.push('det');
    if (comp.adjs) parts.push('adj');
    if (comp.type === 'pp' || comp.type === 'mod') parts.push('prep');
  } else if (comp.type === 'verb') {
    if (word.forms.length > 1) parts.push('form');
    if (comp.auxes) parts.push('aux');
  } else if (word.forms.length > 1) {
    parts.push('form');
  }
  return parts;
}

// 단계 하나의 선택지 [{ value, entry }]
export function stepOptions(step, choices) {
  if (step.kind === 'floors') return FLOOR_OPTIONS.map((n) => ({ value: n, entry: { text: `${n}층`, gloss: `절 ${n}개` } }));
  if (step.kind === 'link') return step.link.words.map((w) => ({ value: `c:${w}`, entry: lookup(`c:${w}`) }));
  const { comp } = step;
  if (step.part === 'word') {
    return comp.words.map((w) => withPrefix(w, prefixOf(comp.type))).map((value) => ({ value, entry: lookup(value) }));
  }
  if (step.part === 'form') {
    const word = lookup(choices[`${step.ref}.word`]);
    return (word?.forms ?? []).map((form) => ({ value: form.id, entry: form }));
  }
  const list = { det: comp.dets ?? DEFAULT_DETS, adj: comp.adjs, prep: comp.preps, aux: comp.auxes }[step.part] ?? [];
  const prefix = { det: 'd', adj: 'a', prep: 'p', aux: 'x' }[step.part];
  return list.map((w) => ({ value: `${prefix}:${w}`, entry: lookup(`${prefix}:${w}`) }));
}

// 전체 공정 단계 목록 (공정 순서대로)
// 층수를 아직 바르게 고르지 않았으면 층수 단계만 있다.
export function getSteps(level, choices) {
  const steps = [{ key: 'floors', kind: 'floors', unit: 'floors', name: '층수 정하기' }];
  if (choices.floors !== level.floors.length) return steps;
  level.floors.forEach((floor, f) => {
    if (f > 0) {
      steps.push({ key: `L${f}.word`, kind: 'link', unit: `L${f}`, ref: `L${f}`, floor: f, link: floor.link, part: 'word', type: 'conj', name: `${f}층 → ${f + 1}층 계단` });
    }
    for (const comp of buildOrder(floor)) {
      const ref = compRef(f, comp);
      const word = lookup(choices[`${ref}.word`]);
      for (const part of compParts(comp, word)) {
        steps.push({ key: `${ref}.${part}`, kind: 'part', unit: ref, ref, floor: f, comp, part, type: comp.type, name: roomName(level, f, comp) });
      }
    }
  });
  return steps;
}

// 공정 단위(층수 / 방 / 계단) 목록 — 진행 상황 표시에 쓴다
export function getUnits(level, choices) {
  const units = [{ unit: 'floors', name: '층수', kind: 'floors' }];
  if (choices.floors !== level.floors.length) {
    return [...units, { unit: '?', name: '나머지 공정', kind: 'pending' }];
  }
  level.floors.forEach((floor, f) => {
    if (f > 0) units.push({ unit: `L${f}`, name: `${f}층→${f + 1}층 계단`, kind: 'link', floor: f });
    for (const comp of buildOrder(floor)) units.push({ unit: compRef(f, comp), name: roomName(level, f, comp), kind: 'room', role: comp.role, floor: f, comp });
  });
  return units;
}

export const isChosen = (step, choices) => stepOptions(step, choices).some((o) => o.value === choices[step.key]);
export const firstOpenStep = (level, choices) => getSteps(level, choices).find((s) => !isChosen(s, choices)) ?? null;
export const isComplete = (level, choices) => firstOpenStep(level, choices) === null;

// ── 고른 단어 풀어 보기 ──
// 방 하나 → { word, form, det, adj, prep, aux, finite, text, done }
//  finite: 문장의 시제와 수 일치를 정하는 말 (be동사가 있으면 be동사, 없으면 동사 형태)
export function resolveComp(level, f, comp, choices) {
  const ref = compRef(f, comp);
  const word = lookup(choices[`${ref}.word`]);
  const formId = choices[`${ref}.form`];
  let form = word?.forms.find((x) => x.id === formId) ?? null;
  if (!form && word?.forms.length === 1) form = word.forms[0];
  const pick = (part) => lookup(choices[`${ref}.${part}`]);
  const parts = compParts(comp, word);
  const r = {
    ref,
    comp,
    word,
    form,
    det: parts.includes('det') ? pick('det') : null,
    adj: parts.includes('adj') ? pick('adj') : null,
    prep: parts.includes('prep') ? pick('prep') : null,
    aux: parts.includes('aux') ? pick('aux') : null,
  };
  r.finite = r.aux && r.aux.tense ? r.aux : r.form;
  r.done = parts.every((p) => (p === 'form' ? Boolean(form) : p === 'word' ? Boolean(word) : Boolean(r[p])));
  r.text = compText(r);
  return r;
}

const textOf = (entry) => entry?.text ?? '';
function compText(r) {
  if (!r.word) return '';
  const head = r.form?.text ?? r.word.text;
  if (isNounish(r.word)) {
    const adjText = r.adj ? r.adj.forms[0].text : '';
    return [textOf(r.prep), textOf(r.det), adjText, head].filter(Boolean).join(' ');
  }
  if (r.comp.type === 'verb') return [textOf(r.aux), head].filter(Boolean).join(' ');
  return head;
}

// 레벨 전체 풀어 보기 → { floors: [{ comps: [resolved…] }], links: { L1: entry } }
export function resolveAll(level, choices) {
  return {
    floors: level.floors.map((floor, f) => ({ comps: floor.comps.map((comp) => resolveComp(level, f, comp, choices)) })),
    links: Object.fromEntries(level.floors.slice(1).map((_, i) => [`L${i + 1}`, lookup(choices[`L${i + 1}.word`])])),
  };
}

// ref('0.S', 'L1')로 풀어 둔 방이나 계단 찾기
export function findResolved(all, ref) {
  if (ref.startsWith('L')) return { ref, word: all.links[ref], link: true };
  const [f, id] = ref.split('.');
  return all.floors[Number(f)]?.comps.find((c) => c.comp.id === id) ?? null;
}

// 문장 순서 (레벨에 sentence가 없으면 1층 → 계단 → 2층 …)
export const sentenceOrder = (level) =>
  level.sentence ?? level.floors.flatMap((_, f) => (f === 0 ? [0] : [`L${f}`, f]));

// 고른 단어들 → 화면에 보여 줄 문장 (첫 글자 대문자, 끝에 마침표)
export function sentenceText(level, choices) {
  if (choices.floors !== level.floors.length) return '';
  const all = resolveAll(level, choices);
  const tokens = [];
  for (const t of sentenceOrder(level)) {
    if (t === ',') {
      if (tokens.length && tokens[tokens.length - 1] !== ',') tokens.push(',');
    } else if (typeof t === 'string') {
      if (all.links[t]) tokens.push(all.links[t].text);
    } else {
      for (const r of all.floors[t].comps) if (r.text) tokens.push(r.text);
    }
  }
  while (tokens[0] === ',') tokens.shift();
  while (tokens[tokens.length - 1] === ',') tokens.pop();
  if (tokens.length === 0) return '';
  let text = tokens.reduce((acc, t) => (acc === '' ? t : t === ',' ? `${acc},` : `${acc} ${t}`), '');
  text = text.charAt(0).toUpperCase() + text.slice(1);
  return `${text}.`;
}

// 레벨에 적은 정답(방별 묶음)을 공정 선택 목록으로 바꾼다
//  { '0.S': { word: 'cat', form: 'sg', det: 'the' }, L1: 'but' } → { floors: 1, '0.S.word': 'n:cat', … }
export function normalizeAnswer(level, answer) {
  const choices = { floors: level.floors.length };
  level.floors.forEach((floor, f) => {
    if (f > 0 && answer[`L${f}`]) choices[`L${f}.word`] = `c:${answer[`L${f}`]}`;
    for (const comp of floor.comps) {
      const ref = compRef(f, comp);
      const a = answer[ref];
      if (!a) continue;
      if (a.word) choices[`${ref}.word`] = withPrefix(a.word, prefixOf(comp.type) ?? 'a');
      if (a.form) choices[`${ref}.form`] = a.form;
      for (const [part, prefix] of [['det', 'd'], ['adj', 'a'], ['prep', 'p'], ['aux', 'x']]) {
        if (a[part]) choices[`${ref}.${part}`] = `${prefix}:${a[part]}`;
      }
    }
  });
  return choices;
}

// 두 선택이 같은 건물인지 (실제로 쓰이는 단계만 비교)
export function sameChoices(level, a, b) {
  const keysA = getSteps(level, a).map((s) => s.key);
  const keysB = getSteps(level, b).map((s) => s.key);
  if (keysA.length !== keysB.length || keysA.some((k, i) => k !== keysB[i])) return false;
  return keysA.every((k) => a[k] === b[k]);
}

// 단어를 바꾸면 그 방의 나머지 단계(형태, 관사 …)는 다시 골라야 한다
export function clearAfterWord(choices, ref) {
  const next = {};
  for (const [k, v] of Object.entries(choices)) {
    if (k.startsWith(`${ref}.`) && k !== `${ref}.word`) continue;
    next[k] = v;
  }
  return next;
}
