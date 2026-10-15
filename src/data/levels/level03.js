// 레벨 3: 수식어(부사, 장소를 나타내는 말)로 문장 꾸미기
// 작성법은 level01.js 맨 위 설명 참고

export default {
  id: 3,
  title: '아기의 꿈나라 방',
  difficulty: 2,
  topic: '수식어: 부사와 형용사',
  client: '갓난아기를 키우는 부부',

  request: '갓난아기를 키우는 부부가 아기 방이 있는 집을 주문했어요. 아기가 얼마나 편안하게, 어디에서 자는지 집 안 장식으로 보여 주고 싶대요.',
  buildNote: '필수 방(주어·동사)을 먼저 짓고, 그다음 장식 방 두 개(어떻게, 어디서)를 지어요. 장식 방에는 문장을 꾸며 주는 말이 들어가요.',
  meaning: {
    text: '그 아기는 그 작은 방 안에서 평화롭게 잔다.',
    details: ['아기는 한 명이에요.', '"어떻게" 자는지와 "어디서" 자는지를 모두 나타내요.', '평소에 늘 그래요.'],
  },
  conditions: [
    {
      id: 'present',
      text: '아기는 매일 이 방에서 자요. 동사 방의 기둥은 "지금 자재"로 세워 주세요.',
      grammar: '평소에 늘 하는 일이므로 동사를 현재 시제로 써요.',
      checkId: 'C1',
    },
  ],
  scaffold: { showRoles: true },

  floors: [
    {
      comps: [
        { id: 'S', role: 'S', type: 'np', words: ['dog', 'baby', 'cat'], dets: ['a', 'the', 'none'] },
        { id: 'V', role: 'V', type: 'verb', words: ['run', 'eat', 'sleep'] },
        { id: 'how', role: 'M', type: 'adj', name: '어떻게 장식 방', words: ['noisy', 'peaceful', 'happy'] },
        {
          id: 'where', role: 'M', type: 'pp', name: '어디서 장식 방',
          words: ['car', 'garden', 'room'], dets: ['a', 'the', 'none'], adjs: ['big', 'small', 'dark'], preps: ['on', 'in', 'to'],
        },
      ],
    },
  ],

  answers: {
    main: 'The baby sleeps peacefully in the small room.',
    accepted: [
      {
        '0.S': { word: 'baby', form: 'sg', det: 'the' },
        '0.V': { word: 'sleep', form: 's' },
        '0.how': { word: 'peaceful', form: 'adv' },
        '0.where': { word: 'room', form: 'sg', det: 'the', adj: 'small', prep: 'in' },
      },
    ],
  },

  checks: {
    meaning: [
      { id: 'M1', match: { '0.S': { 'word.sem': 'baby', 'form.number': 'sg' } }, pass: '"아기 한 명"이 주인공이에요.', fail: '주인공은 아기 한 명이에요. 주어 방을 확인해 보세요.' },
      { id: 'M2', match: { '0.V': { 'word.sem': 'sleep' } }, pass: '"잔다"는 행동이 잘 전달돼요.', fail: '아기가 하는 행동이 주문서와 같은지 동사 방을 확인해 보세요.' },
      { id: 'M3', match: { '0.how': { 'word.sem': 'peaceful' } }, pass: '"평화롭게"라는 뜻이 담겼어요.', fail: '아기는 어떻게 자나요? 어떻게 장식 방의 단어를 확인해 보세요.' },
      { id: 'M4', match: { '0.where': { 'word.sem': 'room', 'adj.name': 'small' } }, pass: '"작은 방"이라는 뜻이 잘 전달돼요.', fail: '아기가 자는 곳은 어떤 곳인가요? 어디서 장식 방의 가구와 카펫(꾸미는 말)을 확인해 보세요.' },
      { id: 'M5', match: { '0.where': { 'prep.name': 'in' } }, pass: '"방 안에서"라는 위치가 잘 전달돼요.', fail: '방 "안에서" 자는 것을 나타내는 출입문(전치사)은 무엇일까요?' },
    ],
    condition: [
      { id: 'C1', match: { '0.V': { 'finite.tense': 'present' } }, pass: '동사 방을 "지금 자재"(현재)로 세웠어요.', fail: '평소에 늘 하는 일은 현재 시제로 나타내요. 동사의 형태를 확인해 보세요.' },
    ],
  },

  // 생각해 보기(자기 설명): 완공 후 짧은 질문. 점수와 관계없고 기록에만 남는다.
  selfExplain: {
    question: '"평화롭게"를 peacefully로 쓴 이유는 무엇일까요?',
    options: [
      { text: '자는 모습(동사)을 꾸미는 말이라서 부사를 썼다', correct: true },
      { text: '아기(명사)를 꾸미는 말이라서' },
      { text: '문장 끝에 오는 말은 항상 -ly라서' },
    ],
    explain: '동사를 꾸밀 때는 부사(-ly), 명사를 꾸밀 때는 형용사를 써요.',
  },
  // 비교해 보기(대조 학습): 비슷하지만 뜻이나 문법이 다른 문장. mine: 이번 정답
  contrast: [
    { sentence: 'The baby sleeps peacefully.', meaning: '그 아기는 평화롭게 잔다. (자는 모습을 꾸밈)', mine: true },
    { sentence: 'The peaceful baby sleeps.', meaning: '그 평화로운 아기가 잔다. (아기를 꾸밈)' },
  ],

  hints: {
    steps: [
      '먼저 주어 방과 동사 방을 짓고, 장식 방 두 개(어떻게, 어디서)를 채워 보세요.',
      '"어떻게"는 동사를 꾸미는 말이라 부사를 써요. 형용사는 명사를 꾸며요. "작은 방"의 "작은"은 방(명사)을 꾸미는 카펫이에요.',
      'peaceful(평화로운)과 peacefully(평화롭게)를 비교해 보세요. "방 안에서"는 in, "~ 위에서"는 on이에요.',
    ],
  },
};
