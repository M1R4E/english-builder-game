// 레벨 1: 주어와 동사로 이루어진 기본 문장
//
// ── 카드에 들어가는 정보 ──
//  role   : 문장 성분 (S 주어, V 동사, O 목적어, C 보어, M 수식어, CONJ 접속사)
//  sem    : 뜻 꼬리표 (의미 채점에 사용)
//  person / number : 주어의 인칭(1·2·3)과 수(sg 단수, pl 복수)
//  agree  : 동사가 어울리는 주어 → '3sg'(3인칭 단수만), 'base'(3인칭 단수 이외), 'any'(모두)
//  tense  : 동사의 시제 (present 현재, past 과거)
//  gloss  : 단어 뜻 (단어 뜻 보기 설정에서 사용)
//
// ── 필수 성분 ──
//  structure.clauses[절].slots 에 적은 성분이 빠지면, 빠진 성분 하나마다 40점을 별도로 감점한다.
//  (점수는 src/config.js의 MISSING_ROLE_PENALTY에서 바꿀 수 있다)
//
// ── 채점 항목(checks) ──
//  각 항목은 한 가지 범주(category)에만 속한다. → 같은 실수를 두 범주에서 깎지 않는다.
//  requires  : 이 항목을 확인하는 데 필요한 성분. 빠져 있으면 '확인 못 함'(감점 없음)이 된다.
//  dependsOn : 앞 항목이 통과해야 확인할 수 있는 항목. 앞 항목이 실패하면 '확인 보류'(0점)가 된다.
//  target    : 실패했을 때 건물과 문장에서 표시할 성분

export default {
  id: 1,
  title: '고양이의 낮잠 집',
  difficulty: 1,
  topic: '주어 + 동사',
  client: '낮잠 좋아하는 고양이 씨',
  request: '고양이 한 마리를 위한 1층짜리 작은 집을 지어 주세요. 집의 기초가 될 문장은 "고양이는 잠을 잔다"예요.',
  meaningKo: '그 고양이(한 마리)는 잠을 잔다. — 평소에 늘 하는 일',
  conditions: [{ id: 'present', text: '평소에 하는 일이므로 현재 시제로 쓰기', checkId: 'C1' }],

  // 비계(도움) 설정: 첫 레벨이라 카드에 문장 성분 이름을 보여 준다.
  scaffold: { showRoles: true },

  // 카드 표시 순서는 정답 순서와 일부러 다르게 둔다.
  cards: [
    { id: 'sleep', text: 'sleep', role: 'V', sem: 'sleep', tense: 'present', agree: 'base', gloss: '자다' },
    { id: 'the-cat', text: 'the cat', role: 'S', sem: 'cat', person: 3, number: 'sg', gloss: '그 고양이 (한 마리)' },
    { id: 'slept', text: 'slept', role: 'V', sem: 'sleep', tense: 'past', agree: 'any', gloss: '잤다' },
    { id: 'the-cats', text: 'the cats', role: 'S', sem: 'cat', person: 3, number: 'pl', gloss: '그 고양이들 (여러 마리)' },
    { id: 'sleeps', text: 'sleeps', role: 'V', sem: 'sleep', tense: 'present', agree: '3sg', gloss: '자다 (-s가 붙은 형태)' },
  ],

  // 층(절)마다 꼭 채워야 하는 자리. 이 자리가 모두 채워지면 그 층의 방이 완성되고 지붕이 나타난다.
  structure: {
    clauses: [{ slots: ['S', 'V'] }],
  },

  answers: {
    main: 'The cat sleeps.',
    // 미리 검증한 정답 (카드 id 순서). 의미와 문법 조건을 모두 만족하는 다른 배열이 있으면 여기에 추가한다.
    accepted: [['the-cat', 'sleeps']],
  },

  checks: [
    {
      id: 'G1', category: 'grammar', points: 15, type: 'roleOrder', clause: 0, order: ['S', 'V'], target: 'V',
      requires: ['S', 'V'],
      pass: '주어 → 동사 순서가 맞아요.',
      fail: '영어 문장은 보통 주어가 동사보다 먼저 와요. 두 카드의 순서를 확인해 보세요.',
    },
    {
      id: 'G2', category: 'grammar', points: 15, type: 'agreement', clause: 0, target: 'V',
      requires: ['S', 'V'],
      pass: '주어와 동사의 모양이 서로 잘 맞아요.',
      fail: '주어가 한 명·한 마리(3인칭 단수)일 때, 현재형 동사의 모양이 어떻게 되는지 확인해 보세요.',
    },
    {
      id: 'M1', category: 'meaning', points: 15, type: 'roleMatches', clause: 0, role: 'S',
      match: { sem: 'cat', number: 'sg' }, target: 'S', requires: ['S'],
      pass: '"고양이 한 마리"라는 뜻이 잘 전달돼요.',
      fail: '의뢰는 고양이 "한 마리"에 대한 이야기예요. 주어가 몇 마리를 뜻하는지 확인해 보세요.',
    },
    {
      id: 'M2', category: 'meaning', points: 15, type: 'roleMatches', clause: 0, role: 'V',
      match: { sem: 'sleep' }, target: 'V', requires: ['V'],
      pass: '"잠을 잔다"라는 행동이 잘 전달돼요.',
      fail: '고양이가 하는 행동이 의뢰 내용과 같은지 확인해 보세요.',
    },
    {
      id: 'C1', category: 'condition', points: 25, type: 'roleMatches', clause: 0, role: 'V',
      match: { tense: 'present' }, target: 'V', requires: ['V'],
      pass: '현재 시제 조건을 지켰어요.',
      fail: '평소에 늘 하는 일은 현재 시제로 나타내요. 동사의 시제를 확인해 보세요.',
    },
    {
      id: 'N1', category: 'naturalness', points: 5, type: 'noExtraCards',
      pass: '필요 없는 카드 없이 깔끔해요.',
      fail: '같은 역할의 카드가 겹쳐 있어요. 꼭 필요한 카드만 남겨 보세요.',
    },
    {
      id: 'N2', category: 'naturalness', points: 10, partialPoints: 5, type: 'verifiedAnswer',
      dependsOnAll: true,
      pass: '미리 검증한 자연스러운 문장과 일치해요.',
      partial: '오류는 찾지 못했지만, 미리 검증한 답안 목록에 없는 표현이라 자연스러움은 확실히 판단하지 못했어요.',
    },
  ],

  hints: {
    steps: [
      '의뢰 내용에서 "누가"와 "무엇을 하나"를 찾아보세요. 각각 어떤 카드와 연결될까요?',
      '영어 문장은 보통 [주어] → [동사] 순서로 지어요. 주인공이 한 마리인지 여러 마리인지, 평소의 일인지 지난 일인지도 확인해 보세요.',
      '주어가 3인칭 단수(그·그녀·그것, 고양이 한 마리)이고 현재형이면, 일반동사 끝에 보통 -s가 붙어요. sleep · sleeps · slept 중 무엇이 알맞을지 비교해 보세요.',
    ],
  },
};
