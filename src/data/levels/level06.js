// 레벨 6: 이유와 결과 (because / so / although 비교) + 진행형(be동사 + -ing)
// 작성법은 level01.js 맨 위 설명 참고

export default {
  id: 6,
  title: '비 오는 날의 거실',
  difficulty: 3,
  topic: '이유와 결과의 의미 관계',
  client: '집순이 가족',

  request: '어느 가족이 넓은 거실이 있는 2층 집을 주문했어요. 어제는 비가 계속 내리고 있어서 온 가족이 하루 종일 집에 있었대요. 그날처럼 편안한 집이면 좋겠대요.',
  buildNote: '1층에는 가족이 한 일, 2층에는 그 이유를 지어요. 2층 동사 방에는 받침대(be동사)를 놓아 "~하고 있었다"를 나타낼 수 있어요.',
  meaning: {
    text: '비가 오고 있었기 때문에, 우리는 집에 있었다.',
    details: ['"집에 있었다"가 1층, 그 "이유"가 2층이에요.', '비는 계속 "오고 있었어요".', '어제의 일이에요.'],
  },
  conditions: [
    {
      id: 'reason',
      text: '1층에서 2층으로 올라가는 계단은 "왜 그랬는지" 알려 주는 계단이어야 해요.',
      grammar: '뒤 절이 앞 절의 이유가 되도록, 이유를 나타내는 접속사를 써요.',
      checkId: 'C1',
    },
  ],
  scaffold: { showRoles: false },

  floors: [
    {
      comps: [
        { id: 'S', role: 'S', type: 'np', words: ['they', 'we', 'he'] },
        { id: 'V', role: 'V', type: 'verb', words: ['leave', 'sleep', 'stay'] },
        { id: 'where', role: 'M', type: 'pp', name: '어디서 장식 방', words: ['library', 'home'], dets: ['the', 'none', 'my'], preps: ['to', 'none', 'at'] },
      ],
    },
    {
      link: { words: ['so', 'although', 'because'] },
      comps: [
        { id: 'S', role: 'S', type: 'np', words: ['they', 'it', 'we'] },
        { id: 'V', role: 'V', type: 'verb', words: ['snow', 'rain'], auxes: ['is', 'were', 'was', 'none'] },
      ],
    },
  ],

  answers: {
    main: 'We stayed home because it was raining.',
    accepted: ['none', 'at'].map((prep) => ({
      '0.S': { word: 'we' },
      '0.V': { word: 'stay', form: 'past' },
      '0.where': { word: 'home', det: 'none', prep },
      L1: 'because',
      '1.S': { word: 'it' },
      '1.V': { word: 'rain', form: 'ing', aux: 'was' },
    })),
  },

  checks: {
    grammar: [
      {
        id: 'G1',
        oneOf: [
          { '0.where': { 'word.name': 'home', 'det.name': 'none', 'prep.name': ['none', 'at'] } },
          { '0.where': { 'word.name': 'home', 'det.name': ['my', 'the'], 'prep.name': 'at' } },
          { '0.where': { 'word.name': 'library', 'prep.name': 'at' } },
        ],
        pass: '"어디에서 머물렀는지"를 바르게 나타냈어요.',
        fail: 'stay(머물다)는 "어디에서" 머무는지를 나타내요. home 앞에는 전치사를 안 쓰거나 at을, 다른 장소 앞에는 at을 써요. to(~으로)는 쓰지 않아요.',
      },
      { id: 'G2', match: { '0.V': { 'finite.tense': 'past' }, '1.V': { 'finite.tense': 'past' } }, pass: '두 층의 시제를 모두 과거로 맞췄어요.', fail: '어제 일이므로 두 절의 시제를 모두 과거로 맞춰요. 2층은 받침대(be동사)가 시제를 정해요.' },
    ],
    meaning: [
      { id: 'M1', match: { '0.S': { 'word.sem': 'we' } }, pass: '"우리"가 주인공이에요.', fail: '집에 있었던 사람은 "우리" 가족이에요. 1층 주어 방을 확인해 보세요.' },
      { id: 'M2', match: { '0.V': { 'word.sem': 'stay' }, '0.where': { 'word.sem': 'home' } }, pass: '"집에 머물렀다"는 뜻이 잘 전달돼요.', fail: '가족은 집을 떠난 게 아니라 집에 "머물렀어요". 1층 동사 방과 장식 방을 확인해 보세요.' },
      { id: 'M3', match: { '1.S': { 'word.sem': 'it' }, '1.V': { 'word.sem': 'rain', 'form.tense': 'ing' } }, pass: '"비가 오고 있었다"는 뜻이 잘 전달돼요.', fail: '날씨를 말할 때는 주어 it을 써요. 비가 "오고 있었다"는 be동사 + -ing로 나타내요.' },
    ],
    condition: [
      { id: 'C1', match: { L1: { 'word.sem': 'reason' } }, pass: '2층이 1층의 "이유"가 되도록 계단을 놓았어요.', fail: '2층(비가 옴)은 1층(집에 있음)의 이유예요. so는 결과, although는 반대를 나타내요.' },
    ],
  },

  hints: {
    steps: [
      '1층(우리가 집에 있었다)과 2층(비가 오고 있었다) 중 어느 쪽이 원인이고 어느 쪽이 결과일까요?',
      '뒤 절이 "이유"이면 because를 써요. "~하고 있었다"는 be동사(was/were) + -ing로 지어요.',
      '"We stayed home so it was raining"이라고 하면 "집에 있어서 비가 왔다"가 돼 버려요. 날씨의 주어 it에는 was와 were 중 무엇이 어울릴까요?',
    ],
  },
};
