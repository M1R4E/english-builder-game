// 레벨 9: 복합 조건과 비슷한 선택지 (이유 부사절 + 불규칙 과거 + a/an과 형용사)
// 작성법은 level01.js 맨 위 설명 참고

export default {
  id: 9,
  title: '강가의 새 다리',
  difficulty: 4,
  topic: '복합 조건과 비슷한 선택지',
  client: '강 건너 마을 이장님',

  request: '마을 이장님이 다리 공사 기념관을 주문했어요. 지난해 마을의 낡은 다리 하나가 너무 오래되어서, 일꾼들이 새 다리를 지었대요. 그 이야기를 2층 기념관에 담아 달래요.',
  buildNote: '1층에는 중심 이야기(일꾼들이 새 다리를 지었다), 2층에는 그 이유를 지어요. 문장으로 읽을 때는 2층의 이유가 앞에 와요. 비슷한 선택지가 많으니 꼼꼼히 비교해 보세요.',
  meaning: {
    text: '그 다리가 낡았기 때문에, 그 일꾼들은 새 다리 하나를 지었다.',
    details: ['낡은 다리는 하나예요.', '일꾼은 여러 명이에요.', '지난해의 일이에요.'],
  },
  conditions: [
    {
      id: 'past',
      short: '1층 동사는 과거 시제',
      text: '지난해에 끝난 공사예요. 1층 동사 방의 기둥은 "옛날 자재"로 세워 주세요.',
      grammar: '지난 일이므로 동사를 과거 시제로 써요.',
      checkId: 'C1',
    },
  ],
  scaffold: { showRoles: false },

  floors: [
    {
      comps: [
        { id: 'S', role: 'S', type: 'np', words: ['carpenter', 'worker'], dets: ['a', 'the', 'none'] },
        { id: 'V', role: 'V', type: 'verb', words: ['break', 'build', 'make'] },
        { id: 'O', role: 'O', type: 'np', words: ['road', 'bridge'], dets: ['an', 'the', 'a'], adjs: ['old', 'new', 'big'] },
      ],
    },
    {
      link: { words: ['although', 'so', 'because', 'since'] },
      comps: [
        { id: 'S', role: 'S', type: 'np', words: ['road', 'bridge'], dets: ['a', 'the', 'none'] },
        { id: 'V', role: 'V', type: 'verb', words: ['be'] },
        { id: 'C', role: 'C', type: 'adj', words: ['new', 'tall', 'old'] },
      ],
    },
  ],
  sentence: ['L1', 1, ',', 0],

  answers: {
    main: 'Because the bridge was old, the workers built a new bridge.',
    accepted: ['because', 'since'].map((link) => ({
      '0.S': { word: 'worker', form: 'pl', det: 'the' },
      '0.V': { word: 'build', form: 'past' },
      '0.O': { word: 'bridge', form: 'sg', det: 'a', adj: 'new' },
      L1: link,
      '1.S': { word: 'bridge', form: 'sg', det: 'the' },
      '1.V': { word: 'be', form: 'was' },
      '1.C': { word: 'old' },
    })),
  },

  checks: {
    meaning: [
      { id: 'M1', match: { '0.S': { 'word.sem': 'worker', 'form.number': 'pl' } }, pass: '"일꾼들(여러 명)"이 주인공이에요.', fail: '다리를 지은 사람은 일꾼 여러 명이에요. 1층 주어 방을 확인해 보세요.' },
      { id: 'M2', match: { '0.V': { 'word.sem': 'build' } }, pass: '"지었다"는 뜻이 잘 전달돼요.', fail: '일꾼들이 다리에 무엇을 했나요? 1층 동사 방을 확인해 보세요.' },
      { id: 'M3', match: { '0.O': { 'word.sem': 'bridge', 'form.number': 'sg', 'adj.name': 'new' } }, pass: '"새 다리 하나"라는 뜻이 잘 전달돼요.', fail: '일꾼들이 지은 것은 어떤 다리이고 몇 개인가요? 목적어 방을 확인해 보세요.' },
      { id: 'M4', match: { L1: { 'word.sem': 'reason' } }, pass: '2층이 1층의 "이유"가 되도록 이었어요.', fail: '다리가 낡은 것은 새 다리를 지은 "이유"예요. although는 반대, so는 결과를 나타내요.' },
      { id: 'M5', match: { '1.S': { 'word.sem': 'bridge', 'form.number': 'sg' }, '1.C': { 'word.sem': 'old' } }, pass: '"그 다리가 낡았다"는 뜻이 잘 전달돼요.', fail: '원래 있던 다리 하나는 어떤 상태였나요? 2층 주어 방과 보어 방을 확인해 보세요.' },
    ],
    condition: [
      { id: 'C1', match: { '0.V': { 'finite.tense': 'past' } }, pass: '1층 동사 방을 "옛날 자재"(과거)로 세웠어요.', fail: '지난해의 일이므로 1층 동사를 과거 시제로 바꿔 보세요.' },
    ],
  },

  // 생각해 보기(자기 설명): 완공 후 짧은 질문. 점수와 관계없고 기록에만 남는다.
  selfExplain: {
    question: 'new bridge 앞에 an이 아니라 a를 쓴 이유는 무엇일까요?',
    options: [
      { text: '바로 뒤의 new가 자음 소리로 시작해서', correct: true },
      { text: 'bridge가 b로 시작해서' },
      { text: '다리가 하나라서 항상 a를 써서' },
    ],
    explain: 'a/an은 바로 뒤에 오는 단어의 첫소리로 정해요. an old bridge, a new bridge처럼요.',
  },
  // 비교해 보기(대조 학습): 비슷하지만 뜻이나 문법이 다른 문장. mine: 이번 정답
  contrast: [
    { sentence: 'Because the bridge was old, the workers built a new bridge.', meaning: '다리가 낡았기 때문에, 일꾼들은 새 다리를 지었다.', mine: true },
    { sentence: 'Although the bridge was old, the workers did not build a new bridge.', meaning: '다리가 낡았지만, 일꾼들은 새 다리를 짓지 않았다. (반대)' },
  ],

  hints: {
    steps: [
      '중심 이야기(일꾼들이 새 다리를 지었다)가 1층, 그 이유(다리가 낡았다)가 2층이에요. 계단이 두 층의 관계를 정해요.',
      '이유를 나타내는 접속사는 because와 since예요. build는 과거형이 불규칙하게 바뀌어요.',
      'a new bridge와 an new bridge를 비교해 보세요. a/an은 바로 뒤에 오는 단어(new)의 첫소리로 정해요.',
    ],
  },
};
