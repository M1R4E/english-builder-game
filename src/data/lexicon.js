// ── 단어 사전 ──
// 모든 레벨이 함께 쓰는 단어 목록. 단어마다 고를 수 있는 "어형(형태)"을 함께 적는다.
// 틀린 형태(예: sleeped, breads)도 일부러 넣어 두고 valid: false로 표시한다 → 채점에서 문법 오류로 알려 준다.
//
// 단어 key는 "종류:단어" 모양이다.
//   n: 명사·대명사   v: 동사   a: 형용사·부사   d: 관사·한정사   p: 전치사   c: 접속사   x: 조동사(be)
// 레벨 데이터에서는 보통 앞의 종류를 빼고 쓰고(예: 'cat'), 엔진이 자리 종류에 맞춰 붙인다.
//
// 꼬리표
//  sem    : 뜻 (의미 채점에 사용)
//  gloss  : 한국어 뜻 (화면 표시용)
//  count  : 명사의 종류 countable(셀 수 있음) / uncountable(셀 수 없음) / proper(이름)
//  vowel  : 첫소리가 모음 소리인지 (a / an 고르기에 사용)
//  number : sg 단수 / pl 복수        tense : present 현재 / past 과거 / ing 진행
//  agree  : 동사가 어울리는 주어 → '3sg'(3인칭 단수만), 'base'(3인칭 단수 이외), 'any'(모두), 또는 목록
//  pos    : 형용사·부사 형태의 품사 adj / adv
//  kind   : 부사의 종류 freq(빈도), place(장소), time(때)

const LEX = {};

// 명사: 단수·복수 형태
function noun(text, sem, gloss, { pl, plValid = true, count = 'countable', vowel = false, why, noDet, bad = [] } = {}) {
  const forms = [{ id: 'sg', text, number: 'sg', gloss: '하나 (단수)' }];
  if (pl) forms.push({ id: 'pl', text: pl, number: 'pl', valid: plValid, why, gloss: '여럿 (복수)' });
  bad.forEach(([t, w], i) => forms.push({ id: `bad${i}`, text: t, number: 'pl', valid: false, why: w, gloss: '여럿 (복수)' }));
  LEX[`n:${text.toLowerCase()}`] = { key: `n:${text.toLowerCase()}`, pos: 'noun', text, sem, gloss, count, vowel, forms, noDet };
}

// 대명사: 형태가 하나뿐이고 관사를 붙이지 않는다
function pronoun(text, sem, gloss, person, number) {
  LEX[`n:${text}`] = {
    key: `n:${text}`, pos: 'pronoun', text, sem, gloss, person, number,
    forms: [{ id: 'sg', text, number }],
  };
}

// 동사: 기본형, 3인칭 단수 현재형, 과거형, -ing형 + 틀린 형태
function verb(text, sem, gloss, { s, past, ing, bad = [] }) {
  const forms = [
    { id: 'base', text, tense: 'present', agree: 'base', gloss: '현재 (기본형)' },
    { id: 's', text: s, tense: 'present', agree: '3sg', gloss: '현재 (-s/-es)' },
    { id: 'past', text: past, tense: 'past', agree: 'any', gloss: '과거' },
    { id: 'ing', text: ing, tense: 'ing', agree: null, gloss: '-ing (진행)' },
    // 틀린 형태도 설명은 다른 형태와 똑같이 붙인다 (설명이 없어서 눈에 띄지 않도록)
    ...bad.map(([t, tense, why], i) => ({
      id: `bad${i}`, text: t, tense, agree: tense === 'past' ? 'any' : '3sg', valid: false, why,
      gloss: tense === 'past' ? '과거' : '현재 (-s/-es)',
    })),
  ];
  LEX[`v:${text}`] = { key: `v:${text}`, pos: 'verb', text, sem, gloss, forms };
}

// 형용사·부사: 형용사형과 부사형 (하나뿐인 단어도 있다)
function adj(text, sem, gloss, { adv, vowel = false, kind, extra = [] } = {}) {
  const forms = [{ id: 'adj', text, pos: 'adj', gloss: '형용사 (~한)' }];
  if (adv) forms.push({ id: 'adv', text: adv, pos: 'adv', gloss: '부사 (~하게)' });
  forms.push(...extra);
  LEX[`a:${text}`] = { key: `a:${text}`, pos: 'adj', text, sem, gloss, vowel, kind, forms };
}

function adverb(text, sem, gloss, kind, { adj: adjForm } = {}) {
  const forms = [];
  if (adjForm) forms.push({ id: 'adj', text: adjForm, pos: 'adj', gloss: '형용사 (~한)' });
  forms.push({ id: 'adv', text, pos: 'adv', gloss: '부사' });
  LEX[`a:${text}`] = { key: `a:${text}`, pos: 'adv', text, sem, gloss, kind, forms };
}

const simple = (prefix, list) => {
  for (const [text, props] of list) LEX[`${prefix}:${text}`] = { key: `${prefix}:${text}`, text, ...props };
};

// ── 관사·한정사 ──
simple('d', [
  ['the', { kind: 'def', gloss: '그 (정해진 것)' }],
  ['a', { kind: 'indef', gloss: '하나의 (자음 소리 앞)' }],
  ['an', { kind: 'indef', an: true, gloss: '하나의 (모음 소리 앞)' }],
  ['my', { kind: 'poss', gloss: '나의' }],
  ['our', { kind: 'poss', gloss: '우리의' }],
  ['every', { kind: 'every', gloss: '매 ~, 모든 ~ (단수와 함께)' }],
  ['none', { kind: 'none', text: '', label: '(없음)', gloss: '아무것도 붙이지 않음' }],
]);

// ── 전치사 ──
simple('p', [
  ['in', { sem: 'in', gloss: '~ 안에서' }],
  ['on', { sem: 'on', gloss: '~ 위에서' }],
  ['at', { sem: 'at', gloss: '~에서 (지점)' }],
  ['to', { sem: 'to', gloss: '~으로, ~에게' }],
  ['with', { sem: 'with', gloss: '~와 함께' }],
  ['none', { sem: 'none', text: '', label: '(없음)', gloss: '아무것도 붙이지 않음' }],
]);

// ── 접속사 ──
simple('c', [
  ['but', { sem: 'contrast', gloss: '그러나 (반대)' }],
  ['so', { sem: 'result', gloss: '그래서 (결과)' }],
  ['and', { sem: 'addition', gloss: '그리고 (더하기)' }],
  ['because', { sem: 'reason', gloss: '~ 때문에 (이유)' }],
  ['since', { sem: 'reason', gloss: '~이므로 (이유)' }],
  ['although', { sem: 'concession', gloss: '비록 ~이지만 (반대)' }],
  ['when', { sem: 'when', gloss: '~할 때' }],
  ['after', { sem: 'after', gloss: '~한 후에' }],
  ['before', { sem: 'before', gloss: '~하기 전에' }],
]);

// ── 조동사 be (진행형에 사용) ──
simple('x', [
  ['is', { tense: 'present', agree: '3sg', gloss: '~하고 있다 (하나, 현재)' }],
  ['are', { tense: 'present', agree: ['2sg', '1pl', '2pl', '3pl'], gloss: '~하고 있다 (여럿, 현재)' }],
  ['was', { tense: 'past', agree: ['1sg', '3sg'], gloss: '~하고 있었다 (하나, 과거)' }],
  ['were', { tense: 'past', agree: ['2sg', '1pl', '2pl', '3pl'], gloss: '~하고 있었다 (여럿, 과거)' }],
  ['none', { tense: null, text: '', label: '(없음)', gloss: '아무것도 붙이지 않음' }],
]);

// ── 명사 ──
noun('cat', 'cat', '고양이', { pl: 'cats' });
noun('dog', 'dog', '강아지', { pl: 'dogs' });
noun('bird', 'bird', '새', { pl: 'birds' });
noun('rabbit', 'rabbit', '토끼', { pl: 'rabbits' });
noun('ball', 'ball', '공', { pl: 'balls' });
noun('bone', 'bone', '뼈다귀', { pl: 'bones' });
noun('shoe', 'shoe', '신발', { pl: 'shoes' });
noun('baby', 'baby', '아기', { pl: 'babies' });
noun('room', 'room', '방', { pl: 'rooms' });
noun('car', 'car', '자동차', { pl: 'cars' });
noun('garden', 'garden', '정원', { pl: 'gardens' });
noun('carpenter', 'carpenter', '목수', { pl: 'carpenters' });
noun('painter', 'painter', '화가', { pl: 'painters' });
noun('work', 'work', '일', { pl: 'works', plValid: false, count: 'uncountable', why: 'work(일)는 셀 수 없는 명사라 -s를 붙이지 않아요.' });
noun('homework', 'homework', '숙제', { pl: 'homeworks', plValid: false, count: 'uncountable', why: 'homework는 셀 수 없는 명사라 -s를 붙이지 않아요.' });
noun('child', 'child', '아이', { pl: 'children', bad: [['childs', 'child의 복수형은 -s가 아니라 불규칙하게 바뀌어요.']] });
noun('rain', 'rain', '비', { count: 'uncountable' });
noun('snow', 'snow', '눈', { count: 'uncountable' });
noun('wind', 'wind', '바람', { pl: 'winds' });
noun('home', 'home', '집 (머무는 곳)', { count: 'uncountable' });
noun('house', 'house', '집 (건물)', { pl: 'houses' });
noun('sister', 'sister', '언니·누나·여동생', { pl: 'sisters' });
noun('brother', 'brother', '형·오빠·남동생', { pl: 'brothers' });
noun('milk', 'milk', '우유', { pl: 'milks', plValid: false, count: 'uncountable', why: 'milk는 셀 수 없는 명사라 -s를 붙이지 않아요.' });
noun('juice', 'juice', '주스', { count: 'uncountable' });
noun('water', 'water', '물', { count: 'uncountable' });
noun('Mina', 'mina', '미나 (이름)', { count: 'proper' });
noun('English', 'english', '영어', { count: 'uncountable', vowel: true, noDet: '언어 이름(English, Korean 등) 앞에는 a/an이나 the를 붙이지 않아요.' });
noun('math', 'math', '수학', { count: 'uncountable', noDet: '과목 이름 앞에는 a/an이나 the를 붙이지 않아요.' });
noun('library', 'library', '도서관', { pl: 'libraries' });
noun('park', 'park', '공원', { pl: 'parks' });
noun('bridge', 'bridge', '다리', { pl: 'bridges' });
noun('road', 'road', '길', { pl: 'roads' });
noun('worker', 'worker', '일꾼', { pl: 'workers' });
noun('grandmother', 'grandmother', '할머니', { pl: 'grandmothers' });
noun('bread', 'bread', '빵', { pl: 'breads', plValid: false, count: 'uncountable', why: 'bread는 보통 셀 수 없는 명사로 써서 -s를 붙이지 않아요.' });
noun('cake', 'cake', '케이크', { pl: 'cakes' });
noun('morning', 'morning', '아침', { pl: 'mornings' });
noun('night', 'night', '밤', { pl: 'nights' });
noun('apple', 'apple', '사과', { pl: 'apples', vowel: true });

pronoun('he', 'he', '그 (남자 한 명)', 3, 'sg');
pronoun('she', 'she', '그녀 (여자 한 명)', 3, 'sg');
pronoun('they', 'they', '그들 (여럿)', 3, 'pl');
pronoun('it', 'it', '그것 / 날씨를 말할 때의 주어', 3, 'sg');
pronoun('we', 'we', '우리', 1, 'pl');

// ── 동사 ──
verb('sleep', 'sleep', '자다', { s: 'sleeps', past: 'slept', ing: 'sleeping', bad: [['sleeped', 'past', 'sleep의 과거형은 -ed가 아니라 slept예요.']] });
verb('eat', 'eat', '먹다', { s: 'eats', past: 'ate', ing: 'eating', bad: [['eated', 'past', 'eat의 과거형은 불규칙하게 바뀌어요.']] });
verb('run', 'run', '달리다', { s: 'runs', past: 'ran', ing: 'running', bad: [['runned', 'past', 'run의 과거형은 불규칙하게 바뀌어요.']] });
verb('like', 'like', '좋아하다', { s: 'likes', past: 'liked', ing: 'liking' });
verb('kick', 'kick', '차다', { s: 'kicks', past: 'kicked', ing: 'kicking' });
verb('hate', 'hate', '싫어하다', { s: 'hates', past: 'hated', ing: 'hating' });
verb('be', 'be', '~이다, ~하다 (상태)', { s: 'is', past: 'was', ing: 'being' });
// be 동사는 형태가 특별해서 따로 고친다
LEX['v:be'].forms = [
  { id: 'is', text: 'is', tense: 'present', agree: '3sg', gloss: '현재 (하나)' },
  { id: 'are', text: 'are', tense: 'present', agree: ['2sg', '1pl', '2pl', '3pl'], gloss: '현재 (여럿)' },
  { id: 'was', text: 'was', tense: 'past', agree: ['1sg', '3sg'], gloss: '과거 (하나)' },
  { id: 'were', text: 'were', tense: 'past', agree: ['2sg', '1pl', '2pl', '3pl'], gloss: '과거 (여럿)' },
];
verb('feel', 'feel', '느끼다', { s: 'feels', past: 'felt', ing: 'feeling', bad: [['feeled', 'past', 'feel의 과거형은 felt예요.']] });
verb('finish', 'finish', '끝내다', { s: 'finishes', past: 'finished', ing: 'finishing', bad: [['finishs', 'present', 'sh로 끝나는 동사에는 -s가 아니라 -es를 붙여요.']] });
verb('start', 'start', '시작하다', { s: 'starts', past: 'started', ing: 'starting' });
verb('play', 'play', '놀다', { s: 'plays', past: 'played', ing: 'playing' });
verb('sing', 'sing', '노래하다', { s: 'sings', past: 'sang', ing: 'singing', bad: [['singed', 'past', 'sing의 과거형은 불규칙하게 바뀌어요.']] });
verb('stop', 'stop', '멈추다, 그치다', { s: 'stops', past: 'stopped', ing: 'stopping', bad: [['stoped', 'past', '"짧은 모음 + 자음"으로 끝나면 자음을 한 번 더 쓰고 -ed를 붙여요.']] });
verb('stay', 'stay', '머물다', { s: 'stays', past: 'stayed', ing: 'staying' });
verb('leave', 'leave', '떠나다', { s: 'leaves', past: 'left', ing: 'leaving', bad: [['leaved', 'past', 'leave의 과거형은 불규칙하게 바뀌어요.']] });
verb('rain', 'rain', '비가 오다', { s: 'rains', past: 'rained', ing: 'raining' });
verb('snow', 'snow', '눈이 오다', { s: 'snows', past: 'snowed', ing: 'snowing' });
verb('drink', 'drink', '마시다', { s: 'drinks', past: 'drank', ing: 'drinking', bad: [['drinked', 'past', 'drink의 과거형은 불규칙하게 바뀌어요.']] });
verb('make', 'make', '만들다', { s: 'makes', past: 'made', ing: 'making', bad: [['maked', 'past', 'make의 과거형은 불규칙하게 바뀌어요.']] });
verb('study', 'study', '공부하다', { s: 'studies', past: 'studied', ing: 'studying', bad: [['studys', 'present', '"자음 + y"로 끝나는 동사는 y를 i로 바꾸고 -es를 붙여요.']] });
verb('read', 'read', '읽다', { s: 'reads', past: 'read', ing: 'reading' });
verb('build', 'build', '짓다', { s: 'builds', past: 'built', ing: 'building', bad: [['builded', 'past', 'build의 과거형은 -ed가 아니라 불규칙하게 바뀌어요.']] });
verb('break', 'break', '부수다', { s: 'breaks', past: 'broke', ing: 'breaking', bad: [['breaked', 'past', 'break의 과거형은 불규칙하게 바뀌어요.']] });
verb('bake', 'bake', '굽다', { s: 'bakes', past: 'baked', ing: 'baking' });
verb('smell', 'smell', '~한 냄새가 나다', { s: 'smells', past: 'smelled', ing: 'smelling' });
verb('look', 'look', '~해 보이다', { s: 'looks', past: 'looked', ing: 'looking' });

// ── 형용사·부사 ──
adj('peaceful', 'peaceful', '평화로운', { adv: 'peacefully' });
adj('quiet', 'quiet', '조용한', { adv: 'quietly' });
adj('noisy', 'noisy', '시끄러운', { adv: 'noisily' });
adj('small', 'small', '작은');
adj('big', 'big', '큰');
adj('dark', 'dark', '어두운');
adj('tired', 'tired', '피곤한', {
  extra: [{ id: 'ing', text: 'tiring', pos: 'adj', feel: 'ing', gloss: '피곤하게 만드는' }],
});
LEX['a:tired'].forms[0].feel = 'ed';
LEX['a:tired'].forms[0].gloss = '피곤함을 느끼는';
adj('happy', 'happy', '행복한', { adv: 'happily' });
adj('warm', 'warm', '따뜻한', { adv: 'warmly' });
adj('cold', 'cold', '차가운', { adv: 'coldly' });
adj('hot', 'hot', '뜨거운', { adv: 'hotly' });
adj('old', 'old', '낡은, 오래된', { vowel: true });
adj('new', 'new', '새로운');
adj('tall', 'tall', '높은');
adj('sweet', 'sweet', '달콤한', { adv: 'sweetly' });
adj('sour', 'sour', '신, 시큼한', { adv: 'sourly' });
adj('outdoor', 'outside', '야외의 (명사 앞에 씀)');

adverb('outside', 'outside', '밖에서', 'place');
adverb('inside', 'inside', '안에서', 'place');
adverb('always', 'always', '항상', 'freq');
adverb('usually', 'usually', '보통, 대개', 'freq', { adj: 'usual' });
adverb('sometimes', 'sometimes', '가끔', 'freq');
adverb('never', 'never', '결코 ~않다', 'freq');

// 장소 명사에 종류 꼬리표 (레벨 8처럼 장식 자리에 놓을 때 사용)
for (const k of ['n:library', 'n:park', 'n:home', 'n:garden', 'n:room']) LEX[k].kind = 'place';
for (const k of ['n:morning', 'n:night']) LEX[k].kind = 'time';

// name: 종류를 뺀 이름 (예: 'd:the' → 'the'). 채점 조건에 쓴다.
for (const [key, entry] of Object.entries(LEX)) entry.name = key.split(':')[1];

export default LEX;

// 대문자로 시작하는 이름(Mina, English)도 찾을 수 있게 소문자로도 찾아본다
export function lookup(key) {
  if (typeof key !== 'string') return null;
  return LEX[key] ?? LEX[key.toLowerCase()] ?? null;
}

// 화면에 보이는 글자 (없음은 "(없음)")
export const optionLabel = (entry) => entry?.label ?? entry?.text ?? '';
