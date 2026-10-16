// 레벨 4: 접속사로 두 절 잇기 (but / so / because 비교)
// 작성법은 level01.js 맨 위 설명 참고

export default {
  id: 4,
  title: '목수 아저씨의 2층 작업실',
  difficulty: 2,
  topic: '접속사로 두 절 연결',
  client: '부지런한 목수 아저씨',

  request: '목수 아저씨가 2층짜리 작업실을 주문했어요. 어제 몹시 피곤했는데도 일을 끝까지 마친 날을 기억하고 싶대요. 1층과 2층에 그날의 두 이야기를 담고, 계단으로 이어 달래요.',
  buildNote: '이번 집은 2층이에요. 층마다 절(주어 + 동사 …)이 하나씩 들어가요. 1층을 다 지으면 계단(접속사)을 놓고 2층으로 올라가요.',
  meaning: {
    text: '목수는 피곤했지만, 그는 그 일을 끝냈다.',
    details: ['목수 아저씨는 한 명이에요.', '어제 있었던 일이에요.', '두 이야기는 서로 "반대되는" 흐름이에요.'],
  },
  conditions: [
    {
      id: 'past',
      short: '두 동사 모두 과거 시제',
      text: '어제 일을 기념하는 집이에요. 1층과 2층의 동사 방 기둥을 모두 "옛날 자재"로 세워 주세요.',
      grammar: '어제 있었던 일이므로 두 절의 동사를 모두 과거 시제로 써요.',
      checkIds: ['C1', 'C2'],
    },
  ],
  scaffold: { showRoles: false },

  floors: [
    {
      comps: [
        { id: 'S', role: 'S', type: 'np', words: ['painter', 'carpenter', 'baby'], dets: ['a', 'the', 'none'] },
        { id: 'V', role: 'V', type: 'verb', words: ['sleep', 'be', 'feel'] },
        { id: 'C', role: 'C', type: 'adj', words: ['happy', 'tired', 'quiet'] },
      ],
    },
    {
      link: { words: ['so', 'because', 'but'] },
      comps: [
        { id: 'S', role: 'S', type: 'np', words: ['she', 'they', 'he', 'it'] },
        { id: 'V', role: 'V', type: 'verb', words: ['start', 'finish', 'stop'] },
        { id: 'O', role: 'O', type: 'np', words: ['homework', 'work'], dets: ['a', 'the', 'none'] },
      ],
    },
  ],
  sentence: [0, ',', 'L1', 1],

  answers: {
    main: 'The carpenter was tired, but he finished the work.',
    accepted: [
      {
        '0.S': { word: 'carpenter', form: 'sg', det: 'the' },
        '0.V': { word: 'be', form: 'was' },
        '0.C': { word: 'tired', form: 'adj' },
        L1: 'but',
        '1.S': { word: 'he' },
        '1.V': { word: 'finish', form: 'past' },
        '1.O': { word: 'work', form: 'sg', det: 'the' },
      },
      {
        '0.S': { word: 'carpenter', form: 'sg', det: 'the' },
        '0.V': { word: 'feel', form: 'past' },
        '0.C': { word: 'tired', form: 'adj' },
        L1: 'but',
        '1.S': { word: 'he' },
        '1.V': { word: 'finish', form: 'past' },
        '1.O': { word: 'work', form: 'sg', det: 'the' },
      },
    ],
  },

  checks: {
    grammar: [
      { id: 'G1', match: { '0.C': { 'form.feel': ['ed', undefined] } }, pass: '사람이 느끼는 기분을 -ed 모양(tired)으로 나타냈어요.', fail: '사람이 "피곤함을 느낄" 때는 tired, 무엇이 "피곤하게 만들" 때는 tiring을 써요.' },
    ],
    meaning: [
      { id: 'M1', match: { '0.S': { 'word.sem': 'carpenter', 'form.number': 'sg' } }, pass: '1층의 주인공이 "목수 한 명"이에요.', fail: '1층의 주인공은 목수 한 명이에요. 주어 방을 확인해 보세요.' },
      { id: 'M2', match: { '0.V': { 'word.sem': ['be', 'feel'] }, '0.C': { 'word.sem': 'tired' } }, pass: '"피곤했다"는 뜻이 잘 전달돼요.', fail: '목수는 어떤 상태였나요? 1층의 동사 방과 보어 방을 확인해 보세요.' },
      { id: 'M3', match: { L1: { 'word.sem': 'contrast' } }, pass: '"피곤했다"와 "일을 끝냈다"를 반대의 흐름(but)으로 이었어요.', fail: '두 이야기는 "피곤했는데도 끝냈다"는 반대의 흐름이에요. 계단의 접속사를 비교해 보세요.' },
      { id: 'M4', match: { '1.S': { 'word.sem': 'he' } }, pass: '2층의 주어가 목수 아저씨를 가리켜요.', fail: '일을 끝낸 사람은 목수 아저씨 한 명이에요. 그를 가리키는 말은 무엇일까요?' },
      { id: 'M5', match: { '1.V': { 'word.sem': 'finish' }, '1.O': { 'word.sem': 'work' } }, pass: '"일을 끝냈다"는 뜻이 잘 전달돼요.', fail: '목수 아저씨가 무엇을 했는지 2층의 동사 방과 목적어 방을 확인해 보세요.' },
    ],
    condition: [
      { id: 'C1', match: { '0.V': { 'finite.tense': 'past' } }, pass: '1층 동사 방을 "옛날 자재"(과거)로 세웠어요.', fail: '1층 동사가 과거 시제가 아니에요. 어제 일이므로 과거 시제로 바꿔 보세요.' },
      { id: 'C2', match: { '1.V': { 'finite.tense': 'past' } }, pass: '2층 동사 방을 "옛날 자재"(과거)로 세웠어요.', fail: '2층 동사가 과거 시제가 아니에요. 어제 일이므로 과거 시제로 바꿔 보세요.' },
    ],
  },

  // 생각해 보기(자기 설명): 완공 후 짧은 질문. 점수와 관계없고 기록에만 남는다.
  selfExplain: {
    question: '두 절을 but으로 이은 이유는 무엇일까요?',
    options: [
      { text: '피곤했는데도 일을 끝냈다는 반대의 흐름이라서', correct: true },
      { text: '피곤해서 그 결과로 일을 끝냈기 때문에' },
      { text: '일을 끝낸 것이 피곤한 이유라서' },
    ],
    explain: 'but은 앞뒤 내용이 반대될 때, so는 결과, because는 이유를 이을 때 써요.',
  },
  // 비교해 보기(대조 학습): 비슷하지만 뜻이나 문법이 다른 문장. mine: 이번 정답
  contrast: [
    { sentence: 'The carpenter was tired, but he finished the work.', meaning: '목수는 피곤했지만, 일을 끝냈다. (반대)', mine: true },
    { sentence: 'The carpenter was tired, so he went to bed.', meaning: '목수는 피곤해서, 잠자리에 들었다. (결과)' },
    { sentence: 'The carpenter was tired because he worked hard.', meaning: '목수는 열심히 일했기 때문에 피곤했다. (이유)' },
  ],

  hints: {
    steps: [
      '1층에는 "목수가 피곤했다", 2층에는 "그가 그 일을 끝냈다"가 들어가요. 두 이야기는 어떤 관계일까요?',
      '접속사는 두 절의 관계를 정해요. but은 반대, so는 결과, because는 이유를 나타내요. 주어가 한 명일 때 be동사의 과거형은 was예요.',
      '"피곤했다 → 그래서(so) 끝냈다"와 "피곤했다 → 그런데도(but) 끝냈다"를 비교해 보세요. 사람이 느끼는 기분은 tired일까요, tiring일까요?',
    ],
  },
};
