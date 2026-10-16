// 레벨 7: 여러 조건을 동시에 지키는 문장 (3인칭 단수 현재 + 빈도부사 + 셀 수 없는 명사와 형용사)
// 작성법은 level01.js 맨 위 설명 참고

export default {
  id: 7,
  title: '언니의 밤 부엌',
  difficulty: 3,
  topic: '여러 문법 조건을 동시에',
  client: '잠들기 전 우유를 마시는 언니',

  request: '언니가 작은 부엌이 딸린 집을 주문했어요. 언니는 잠들기 전에 거의 매일 따뜻한 우유를 마신대요. 그 습관이 잘 드러나는 부엌이면 좋겠대요.',
  buildNote: '이번에는 장식 방(얼마나 자주)이 주어 방과 동사 방 사이에 들어가요. 필수 방을 먼저 다 짓고 마지막에 장식 방을 지어요.',
  meaning: {
    text: '나의 언니는 보통 따뜻한 우유를 마신다.',
    details: ['언니는 한 명이에요.', '"보통, 대개" 그렇게 해요.', '차가운 우유가 아니라 따뜻한 우유예요.'],
  },
  conditions: [
    {
      id: 'present',
      short: '동사는 현재 시제',
      text: '지금도 매일 밤 하는 습관이에요. 동사 방의 기둥은 "지금 자재"로 세워 주세요.',
      grammar: '평소의 습관이므로 동사를 현재 시제로 써요.',
      checkId: 'C1',
    },
  ],
  scaffold: { showRoles: false },

  floors: [
    {
      comps: [
        { id: 'S', role: 'S', type: 'np', words: ['brother', 'sister', 'baby'], dets: ['the', 'a', 'my'] },
        { id: 'often', role: 'M', type: 'adj', name: '얼마나 자주 장식 방', words: ['never', 'usually', 'always'] },
        { id: 'V', role: 'V', type: 'verb', words: ['make', 'drink', 'eat'] },
        { id: 'O', role: 'O', type: 'np', words: ['water', 'juice', 'milk'], dets: ['a', 'none', 'the'], adjs: ['cold', 'warm', 'hot'] },
      ],
    },
  ],

  answers: {
    main: 'My sister usually drinks warm milk.',
    accepted: [
      {
        '0.S': { word: 'sister', form: 'sg', det: 'my' },
        '0.often': { word: 'usually', form: 'adv' },
        '0.V': { word: 'drink', form: 's' },
        '0.O': { word: 'milk', form: 'sg', det: 'none', adj: 'warm' },
      },
    ],
  },

  checks: {
    meaning: [
      { id: 'M1', match: { '0.S': { 'word.sem': 'sister', 'form.number': 'sg', 'det.name': ['my', 'none'] } }, pass: '"나의 언니 한 명"이 주인공이에요.', fail: '주인공은 "나의" 언니 한 명이에요. 주어 방의 가구, 개수, 문패를 확인해 보세요.' },
      { id: 'M2', match: { '0.often': { 'word.sem': 'usually' } }, pass: '"보통, 대개"라는 빈도가 잘 전달돼요.', fail: '언니는 거의 매일 우유를 마셔요. never(결코 ~않다), always(항상)와 비교해 보세요.' },
      { id: 'M3', match: { '0.V': { 'word.sem': 'drink' } }, pass: '"마신다"는 행동이 잘 전달돼요.', fail: '언니가 우유로 무엇을 하나요? 동사 방을 확인해 보세요.' },
      { id: 'M4', match: { '0.O': { 'word.sem': 'milk', 'adj.name': 'warm' } }, pass: '"따뜻한 우유"라는 뜻이 잘 전달돼요.', fail: '언니가 마시는 것은 어떤 음료인가요? 목적어 방의 가구와 카펫(꾸미는 말)을 확인해 보세요.' },
    ],
    condition: [
      { id: 'C1', match: { '0.V': { 'finite.tense': 'present' } }, pass: '동사 방을 "지금 자재"(현재)로 세웠어요.', fail: '지금도 하는 습관은 현재 시제로 나타내요. 동사의 형태를 확인해 보세요.' },
    ],
  },

  // 생각해 보기(자기 설명): 완공 후 짧은 질문. 점수와 관계없고 기록에만 남는다.
  selfExplain: {
    question: 'milk 앞에 a를 붙이지 않은 이유는 무엇일까요?',
    options: [
      { text: 'milk는 셀 수 없는 명사라서', correct: true },
      { text: 'warm이 앞에 있어서' },
      { text: '언니가 한 명이라서' },
    ],
    explain: 'milk, water, bread처럼 셀 수 없는 명사 앞에는 a/an을 붙이지 않고, -s도 붙이지 않아요.',
  },
  // 비교해 보기(대조 학습): 비슷하지만 뜻이나 문법이 다른 문장. mine: 이번 정답
  contrast: [
    { sentence: 'My sister usually drinks warm milk.', meaning: '언니는 보통 따뜻한 우유를 마신다.', mine: true },
    { sentence: 'My sister never drinks warm milk.', meaning: '언니는 따뜻한 우유를 절대 마시지 않는다.' },
  ],

  hints: {
    steps: [
      '확인할 것이 여러 가지예요: 누구의 언니인지, 얼마나 자주인지, 어떤 우유인지, 언제의 일인지.',
      '빈도부사(usually, never 등)는 보통 일반동사 앞에 와요. 주어가 한 명이고 현재형이면 동사에 -s가 붙어요. milk는 셀 수 없는 명사예요.',
      'usually(부사)와 usual(형용사)을 비교해 보세요. 셀 수 없는 명사 앞에는 a를 붙이지 않아요.',
    ],
  },
};
