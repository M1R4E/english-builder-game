// 레벨 2: 목적어가 있는 문장 (주어 + 동사 + 목적어)
// 작성법은 level01.js 맨 위 설명 참고

export default {
  id: 2,
  title: '강아지의 장난감 방',
  difficulty: 1,
  topic: '주어 + 동사 + 목적어',
  client: '공놀이 좋아하는 강아지 씨',

  request: '옆집 강아지 씨가 장난감을 넣어 둘 방이 있는 집을 주문했어요. 강아지 씨가 제일 좋아하는 물건을 방 안에 꼭 들여놓아 달래요.',
  buildNote: '이번 집에는 "목적어 방"이 있어요. 목적어 방에는 "무엇을"에 해당하는 말을 넣고, 마지막에 방의 출입문(전치사)을 달지 말지 정해요.',
  meaning: {
    text: '그 강아지는 그 공을 좋아한다.',
    details: ['강아지는 한 마리, 공도 하나예요.', '평소에 늘 그래요.'],
  },
  conditions: [
    {
      id: 'no-door',
      short: '목적어 앞에 전치사 없이',
      text: '강아지 씨는 공을 방 안에 바로 들여놓길 원해요. 목적어 방에는 출입문(to 같은 전치사)을 달지 말아 주세요.',
      grammar: 'like(좋아하다) 다음에는 전치사 없이 목적어를 바로 써요.',
      checkId: 'C1',
    },
    {
      id: 'present',
      short: '동사는 현재 시제',
      text: '강아지 씨는 지금도 매일 공놀이를 해요. 동사 방의 기둥은 "지금 자재"로 세워 주세요.',
      grammar: '평소에 늘 그런 일이므로 동사를 현재 시제로 써요.',
      checkId: 'C2',
    },
  ],
  scaffold: { showRoles: true },

  floors: [
    {
      comps: [
        { id: 'S', role: 'S', type: 'np', words: ['cat', 'dog', 'bird'], dets: ['a', 'the', 'none'] },
        { id: 'V', role: 'V', type: 'verb', words: ['kick', 'like', 'hate'] },
        { id: 'O', role: 'O', type: 'pp', words: ['bone', 'ball', 'shoe'], dets: ['the', 'a', 'none'], preps: ['to', 'none', 'with'] },
      ],
    },
  ],

  answers: {
    main: 'The dog likes the ball.',
    accepted: [
      {
        '0.S': { word: 'dog', form: 'sg', det: 'the' },
        '0.V': { word: 'like', form: 's' },
        '0.O': { word: 'ball', form: 'sg', det: 'the', prep: 'none' },
      },
    ],
  },

  checks: {
    meaning: [
      { id: 'M1', match: { '0.S': { 'word.sem': 'dog', 'form.number': 'sg' } }, pass: '"강아지 한 마리"가 주인공이에요.', fail: '주인공은 강아지 한 마리예요. 주어 방의 가구와 개수를 확인해 보세요.' },
      { id: 'M2', match: { '0.V': { 'word.sem': 'like' } }, pass: '"좋아한다"는 뜻이 잘 전달돼요.', fail: '강아지 씨는 공을 어떻게 생각하나요? 동사 방을 확인해 보세요.' },
      { id: 'M3', match: { '0.O': { 'word.sem': 'ball', 'form.number': 'sg' } }, pass: '좋아하는 물건이 "공 하나"라는 뜻이 잘 전달돼요.', fail: '강아지 씨가 좋아하는 물건이 무엇이고 몇 개인지 주문서를 다시 확인해 보세요.' },
    ],
    condition: [
      { id: 'C1', match: { '0.O': { 'prep.name': 'none' } }, pass: '목적어 방에 출입문(전치사)을 달지 않고 바로 들여놓았어요.', fail: 'like 다음에는 to 같은 전치사 없이 "무엇을"을 바로 써요. 목적어 방의 출입문을 확인해 보세요.' },
      { id: 'C2', match: { '0.V': { 'finite.tense': 'present' } }, pass: '동사 방을 "지금 자재"(현재)로 세웠어요.', fail: '평소에 늘 그런 일은 현재 시제로 나타내요. 동사의 형태를 확인해 보세요.' },
    ],
  },

  // 생각해 보기(자기 설명): 완공 후 짧은 질문. 점수와 관계없고 기록에만 남는다.
  selfExplain: {
    question: 'likes 뒤에 to를 쓰지 않은 이유는 무엇일까요?',
    options: [
      { text: 'like는 "무엇을"을 바로 뒤에 붙이는 동사라서', correct: true },
      { text: 'ball이 짧은 단어라서' },
      { text: '강아지가 한 마리라서' },
    ],
    explain: 'like(좋아하다)는 목적어를 바로 뒤에 써요. to는 "~으로" 같은 방향을 나타낼 때 써요.',
  },
  // 비교해 보기(대조 학습): 비슷하지만 뜻이나 문법이 다른 문장. mine: 이번 정답
  contrast: [
    { sentence: 'The dog likes the ball.', meaning: '그 강아지는 그 공을 좋아한다.', mine: true },
    { sentence: 'The dog runs to the ball.', meaning: '그 강아지는 그 공 쪽으로 달려간다.' },
  ],

  hints: {
    steps: [
      '"누가", "무엇을 하나", "무엇을"을 각각 찾아보세요. 세 가지가 주어 방, 동사 방, 목적어 방과 짝을 이뤄요.',
      '목적어 방에는 "~을/를"에 해당하는 말이 들어가요. like(좋아하다)는 목적어를 바로 뒤에 붙여요.',
      '"likes the ball"과 "likes to the ball"을 비교해 보세요. 주어가 한 마리이면 동사에 -s가 붙어요.',
    ],
  },
};
