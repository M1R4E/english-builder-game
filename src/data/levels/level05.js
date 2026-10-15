// 레벨 5: 시간을 나타내는 부사절 (When / After / Before)
// 작성법은 level01.js 맨 위 설명 참고
// 1층(주절)을 먼저 짓고 2층(때를 나타내는 절)을 짓지만, 문장에서는 2층이 앞에 온다 (sentence).

export default {
  id: 5,
  title: '비 갠 날의 놀이터',
  difficulty: 3,
  topic: '시간 관계를 나타내는 부사절',
  client: '동네 어린이집 선생님',

  request: '어린이집 선생님이 놀이터가 보이는 2층 건물을 주문했어요. 어제 오후, 비가 그치자마자 아이들이 우르르 밖으로 나가 놀았던 장면을 기억하고 싶대요.',
  buildNote: '1층에는 중심이 되는 이야기(아이들이 놀았다)를, 2층에는 그 "때"(비가 그쳤을 때)를 지어요. 문장으로 읽을 때는 2층의 "때"가 앞에 와요.',
  meaning: {
    text: '비가 그쳤을 때, 그 아이들은 밖에서 놀았다.',
    details: ['비가 먼저 그치고, 그다음에 아이들이 놀았어요.', '아이들은 여러 명이에요.', '어제 오후의 일이에요.'],
  },
  conditions: [
    {
      id: 'past',
      text: '어제 오후의 장면이에요. 두 층의 동사 방 기둥을 모두 "옛날 자재"로 세워 주세요.',
      grammar: '지난 일이므로 두 절의 동사를 모두 과거 시제로 써요.',
      checkIds: ['C1', 'C2'],
    },
  ],
  scaffold: { showRoles: false },

  floors: [
    {
      comps: [
        { id: 'S', role: 'S', type: 'np', words: ['baby', 'child', 'bird'], dets: ['a', 'the', 'none'] },
        { id: 'V', role: 'V', type: 'verb', words: ['sing', 'sleep', 'play'] },
        { id: 'where', role: 'M', type: 'adj', name: '어디서 장식 방', words: ['inside', 'outdoor', 'outside'] },
      ],
    },
    {
      link: { words: ['before', 'when', 'because', 'after'] },
      comps: [
        { id: 'S', role: 'S', type: 'np', words: ['snow', 'rain', 'wind'], dets: ['a', 'the', 'none'] },
        { id: 'V', role: 'V', type: 'verb', words: ['start', 'stop', 'play'] },
      ],
    },
  ],
  sentence: ['L1', 1, ',', 0],

  answers: {
    main: 'When the rain stopped, the children played outside.',
    accepted: ['when', 'after'].map((link) => ({
      '0.S': { word: 'child', form: 'pl', det: 'the' },
      '0.V': { word: 'play', form: 'past' },
      '0.where': { word: 'outside' },
      L1: link,
      '1.S': { word: 'rain', det: 'the' },
      '1.V': { word: 'stop', form: 'past' },
    })),
  },

  checks: {
    meaning: [
      { id: 'M1', match: { '0.S': { 'word.sem': 'child', 'form.number': 'pl' } }, pass: '"아이들(여러 명)"이 주인공이에요.', fail: '밖에서 논 사람은 아이들 여러 명이에요. 1층 주어 방을 확인해 보세요.' },
      { id: 'M2', match: { '0.V': { 'word.sem': 'play' }, '0.where': { 'word.sem': 'outside' } }, pass: '"밖에서 놀았다"는 뜻이 잘 전달돼요.', fail: '아이들이 무엇을, 어디에서 했는지 1층의 동사 방과 장식 방을 확인해 보세요.' },
      { id: 'M3', match: { L1: { 'word.sem': ['when', 'after'] } }, pass: '"비가 그친 때(후)에"라는 시간 관계가 잘 전달돼요.', fail: '아이들은 비가 그친 "다음에" 놀았어요. before를 쓰면 순서가 반대가 되고, because는 이유를 나타내요.' },
      { id: 'M4', match: { '1.S': { 'word.sem': 'rain' }, '1.V': { 'word.sem': 'stop' } }, pass: '"비가 그쳤다"는 뜻이 잘 전달돼요.', fail: '무엇이 어떻게 되었나요? 2층의 주어 방과 동사 방을 확인해 보세요.' },
    ],
    condition: [
      { id: 'C1', match: { '0.V': { 'finite.tense': 'past' } }, pass: '1층 동사 방을 "옛날 자재"(과거)로 세웠어요.', fail: '1층 동사가 과거 시제가 아니에요. 어제 일이므로 과거 시제로 바꿔 보세요.' },
      { id: 'C2', match: { '1.V': { 'finite.tense': 'past' } }, pass: '2층 동사 방을 "옛날 자재"(과거)로 세웠어요.', fail: '2층 동사가 과거 시제가 아니에요. 어제 일이므로 과거 시제로 바꿔 보세요.' },
    ],
  },

  // 생각해 보기(자기 설명): 완공 후 짧은 질문. 점수와 관계없고 기록에만 남는다.
  selfExplain: {
    question: '계단에 when(또는 after)을 놓은 이유는 무엇일까요?',
    options: [
      { text: '비가 그친 뒤에 아이들이 놀았기 때문에', correct: true },
      { text: '아이들이 논 다음에 비가 그쳤기 때문에' },
      { text: '비 때문에 아이들이 놀았기 때문에' },
    ],
    explain: 'when·after는 "~할 때, ~한 후에", before는 "~하기 전에"를 나타내요. 두 사건의 순서를 생각해 보세요.',
  },
  // 비교해 보기(대조 학습): 비슷하지만 뜻이나 문법이 다른 문장. mine: 이번 정답
  contrast: [
    { sentence: 'When the rain stopped, the children played outside.', meaning: '비가 그쳤을 때, 아이들은 밖에서 놀았다.', mine: true },
    { sentence: 'Before the rain stopped, the children played outside.', meaning: '비가 그치기 전에, 아이들은 밖에서 놀았다. (순서가 반대)' },
  ],

  hints: {
    steps: [
      '두 사건 중 무엇이 중심 이야기이고, 무엇이 "때"를 알려 주나요? 중심 이야기(아이들이 놂)가 1층, "때"(비가 그침)가 2층이에요.',
      '계단에는 시간 관계를 나타내는 접속사가 와요. when(~할 때), after(~한 후에), before(~하기 전에)를 비교해 보세요. child의 복수형은 불규칙하게 바뀌어요.',
      '"비가 그친 후에 놀았다"이므로 when이나 after가 어울려요. outside(밖에서)는 동사를 꾸미는 부사, outdoor(야외의)는 명사 앞에 쓰는 형용사예요.',
    ],
  },
};
