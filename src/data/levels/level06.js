// 레벨 6: 이유와 결과 (because / so / although 비교)
// 작성법은 level01.js 맨 위 설명 참고

export default {
  id: 6,
  title: '비 오는 날의 거실',
  difficulty: 3,
  topic: '이유와 결과의 의미 관계',
  client: '집순이 가족',

  request: '어느 가족이 넓은 거실이 있는 2층 집을 주문했어요. 어제는 비가 계속 내려서 온 가족이 하루 종일 집에 있었대요. 그날처럼 편안한 집이면 좋겠대요.',
  buildNote: '1층에는 가족이 한 일, 2층에는 그 이유를 지어요. 계단에 놓는 접속사가 두 층의 관계(이유, 결과, 반대)를 정해요.',
  meaning: {
    text: '비가 오고 있었기 때문에, 우리는 집에 있었다.',
    details: ['"집에 있었다"가 1층, 그 "이유"가 2층이에요.', '어제의 일이에요.'],
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

  cards: [
    { id: 'we', text: 'we', role: 'S', slots: ['0-S'], person: 1, number: 'pl', gloss: '우리' },
    { id: 'stayed', text: 'stayed', role: 'V', slots: ['0-V'], sem: 'stay', tense: 'past', agree: 'any', gloss: '머물렀다' },
    { id: 'left', text: 'left', role: 'V', slots: ['0-V'], sem: 'leave', tense: 'past', agree: 'any', gloss: '떠났다' },
    { id: 'stay', text: 'stay', role: 'V', slots: ['0-V'], sem: 'stay', tense: 'present', agree: 'base', gloss: '머문다' },
    { id: 'home', text: 'home', role: 'M', slots: ['0-M-where'], sem: 'home', form: 'ok', gloss: '집에 (부사)' },
    { id: 'at-home', text: 'at home', role: 'M', slots: ['0-M-where'], sem: 'home', form: 'ok', gloss: '집에서' },
    { id: 'to-home', text: 'to home', role: 'M', slots: ['0-M-where'], sem: 'home', form: 'bad', gloss: '(home 앞에는 to를 쓰지 않음)' },
    { id: 'because', text: 'because', role: 'CONJ', sem: 'reason', gloss: '왜냐하면 (이유)' },
    { id: 'so', text: 'so', role: 'CONJ', sem: 'result', gloss: '그래서 (결과)' },
    { id: 'although', text: 'although', role: 'CONJ', sem: 'concession', gloss: '비록 ~이지만 (반대)' },
    { id: 'it', text: 'it', role: 'S', slots: ['1-S'], sem: 'weather', person: 3, number: 'sg', gloss: '(날씨를 말할 때 쓰는 주어)' },
    { id: 'they', text: 'they', role: 'S', slots: ['1-S'], sem: 'people', person: 3, number: 'pl', gloss: '그들' },
    { id: 'was-raining', text: 'was raining', role: 'V', slots: ['1-V'], tense: 'past', agree: ['1sg', '3sg'], gloss: '비가 오고 있었다' },
    { id: 'were-raining', text: 'were raining', role: 'V', slots: ['1-V'], tense: 'past', agree: ['2sg', '1pl', '2pl', '3pl'], gloss: '(were는 여럿일 때)' },
    { id: 'is-raining', text: 'is raining', role: 'V', slots: ['1-V'], tense: 'present', agree: '3sg', gloss: '비가 오고 있다 (현재)' },
  ],

  structure: {
    clauses: [
      { slots: ['S', 'V', { role: 'M', id: 'where', name: '어디서 장식' }] },
      { slots: ['S', 'V'] },
    ],
    links: [{ id: 'L0', after: 0 }],
  },

  answers: {
    main: 'We stayed home because it was raining.',
    accepted: [
      { '0-S': 'we', '0-V': 'stayed', '0-M-where': 'home', L0: 'because', '1-S': 'it', '1-V': 'was-raining' },
      { '0-S': 'we', '0-V': 'stayed', '0-M-where': 'at-home', L0: 'because', '1-S': 'it', '1-V': 'was-raining' },
    ],
  },

  checks: [
    {
      id: 'G1', category: 'grammar', points: 10, type: 'agreement', clause: 1, target: '1-V',
      requires: ['1-S', '1-V'],
      pass: '2층의 주어와 be동사(was/were)가 잘 맞아요.',
      fail: '2층 주어가 하나(it)인지 여럿(they)인지에 따라 was와 were가 달라져요.',
    },
    {
      id: 'G2', category: 'grammar', points: 10, type: 'slotMatches', slot: '0-M-where',
      match: { form: 'ok' }, target: '0-M-where', requires: ['0-M-where'],
      pass: '"집에"를 자연스러운 모양으로 나타냈어요.',
      fail: 'home은 "집에, 집으로"라는 뜻을 이미 갖고 있어서 앞에 to를 붙이지 않아요.',
    },
    {
      id: 'G3', category: 'grammar', points: 10, type: 'slotsMatch',
      expect: { '0-V': { tense: 'past' }, '1-V': { tense: 'past' } }, target: '1-V', requires: ['0-V', '1-V'],
      pass: '두 층의 시제를 모두 과거로 맞췄어요.',
      fail: '어제 일이므로 두 절의 동사를 모두 과거 시제로 맞춰야 해요. 현재형이 섞여 있지 않은지 확인해 보세요.',
    },
    {
      id: 'M1', category: 'meaning', points: 10, type: 'roleMatches', clause: 0, role: 'V',
      match: { sem: 'stay' }, target: '0-V', requires: ['0-V'],
      pass: '"머물렀다"는 뜻이 잘 전달돼요.',
      fail: '가족은 집을 떠난 게 아니라 집에 "머물렀어요". 1층 동사를 확인해 보세요.',
    },
    {
      id: 'M2', category: 'meaning', points: 10, type: 'roleMatches', clause: 1, role: 'S',
      match: { sem: 'weather' }, target: '1-S', requires: ['1-S'],
      pass: '날씨를 말할 때 쓰는 주어 it을 골랐어요.',
      fail: '"비가 온다"처럼 날씨를 말할 때는 특별한 주어를 써요. they는 사람들을 가리켜요.',
    },
    {
      id: 'M3', category: 'meaning', points: 10, type: 'slotMatches', slot: '0-M-where',
      match: { sem: 'home' }, target: '0-M-where',
      pass: '가족이 "집에" 있었다는 뜻이 담겼어요.',
      fail: '가족이 어디에 머물렀는지 장식이 비어 있어요.',
    },
    {
      id: 'C1', category: 'condition', points: 25, type: 'slotMatches', slot: 'L0',
      match: { sem: 'reason' }, target: 'L0', requires: ['L0'],
      pass: '2층이 1층의 "이유"가 되도록 계단을 놓았어요.',
      fail: '2층(비가 옴)은 1층(집에 있음)의 이유예요. so는 결과, although는 반대를 나타내요.',
    },
    {
      id: 'N1', category: 'naturalness', points: 5, type: 'noExtraCards',
      pass: '필요 없는 카드 없이 깔끔해요.',
      fail: '같은 역할의 카드가 겹쳐 있어요.',
    },
    {
      id: 'N2', category: 'naturalness', points: 10, partialPoints: 5, type: 'verifiedAnswer', dependsOnAll: true,
      pass: '미리 검증한 자연스러운 문장과 일치해요.',
      partial: '오류는 찾지 못했지만, 미리 검증한 답안 목록에 없는 표현이라 자연스러움은 확실히 판단하지 못했어요.',
    },
  ],

  hints: {
    steps: [
      '1층(우리가 집에 있었다)과 2층(비가 오고 있었다) 중 어느 쪽이 원인이고 어느 쪽이 결과일까요?',
      '뒤 절이 "이유"이면 because, 뒤 절이 "결과"이면 so를 써요. although는 "~이지만"이라는 반대의 뜻이에요.',
      '"We stayed home so it was raining"이라고 하면 "집에 있어서 비가 왔다"가 돼 버려요. 날씨를 말할 때의 주어 it과 함께 쓰는 be동사도 확인해 보세요.',
    ],
  },
};
