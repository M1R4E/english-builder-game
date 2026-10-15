// 레벨 10: 앞에서 배운 요소를 모두 종합하는 도전 레벨
// 작성법은 level01.js 맨 위 설명 참고

export default {
  id: 10,
  title: '할머니의 빵 굽는 집',
  difficulty: 5,
  topic: '종합 도전',
  client: '빵 굽는 할머니',

  request: '할머니가 오븐이 있는 2층 집을 주문했어요. 할머니는 매일 아침 빵을 구우시는데, 그래서 집 안에는 늘 달콤한 냄새가 난대요. 지금까지 배운 모든 기술을 써서 지어 주세요.',
  buildNote: '두 층, 계단, 장식 두 개, 목적어 칸과 보어 칸까지 모두 있는 집이에요. 지금까지 배운 규칙을 떠올려 하나씩 지어 보세요.',
  meaning: {
    text: '할머니는 매일 아침 빵을 구우셔서, 우리 집은 항상 달콤한 냄새가 난다.',
    details: ['할머니는 한 분, 우리 집은 한 채예요.', '1층이 원인, 2층이 그 결과예요.', '지금도 매일 그래요.'],
  },
  conditions: [
    {
      id: 'present',
      text: '지금도 매일 아침 일어나는 일이에요. 두 층의 동사 기둥을 모두 "지금 자재"로 세워 주세요.',
      grammar: '지금도 반복되는 일이므로 두 절의 동사를 모두 현재 시제로 써요.',
      checkIds: ['C1', 'C2'],
    },
  ],
  scaffold: { showRoles: false },

  cards: [
    { id: 'my-grandmother', text: 'my grandmother', role: 'S', slots: ['0-S'], person: 3, number: 'sg', gloss: '나의 할머니 (한 분)' },
    { id: 'my-grandmothers', text: 'my grandmothers', role: 'S', slots: ['0-S'], person: 3, number: 'pl', gloss: '나의 할머니들' },
    { id: 'bakes', text: 'bakes', role: 'V', slots: ['0-V'], tense: 'present', agree: '3sg', gloss: '굽는다 (-s가 붙은 형태)' },
    { id: 'bake', text: 'bake', role: 'V', slots: ['0-V'], tense: 'present', agree: 'base', gloss: '굽다' },
    { id: 'baked', text: 'baked', role: 'V', slots: ['0-V'], tense: 'past', agree: 'any', gloss: '구웠다' },
    { id: 'bread', text: 'bread', role: 'O', slots: ['0-O'], form: 'ok', gloss: '빵' },
    { id: 'breads', text: 'breads', role: 'O', slots: ['0-O'], form: 'bad', gloss: '(bread는 보통 -s를 붙이지 않음)' },
    { id: 'a-bread', text: 'a bread', role: 'O', slots: ['0-O'], form: 'bad', gloss: '(bread 앞에는 보통 a를 쓰지 않음)' },
    { id: 'every-morning', text: 'every morning', role: 'M', slots: ['0-M-when'], form: 'ok', gloss: '매일 아침' },
    { id: 'every-mornings', text: 'every mornings', role: 'M', slots: ['0-M-when'], form: 'bad', gloss: '(every 뒤에는 단수 명사)' },
    { id: 'so', text: 'so', role: 'CONJ', sem: 'result', gloss: '그래서 (결과)' },
    { id: 'because', text: 'because', role: 'CONJ', sem: 'reason', gloss: '왜냐하면 (이유)' },
    { id: 'but', text: 'but', role: 'CONJ', sem: 'contrast', gloss: '그러나 (반대)' },
    { id: 'our-house', text: 'our house', role: 'S', slots: ['1-S'], person: 3, number: 'sg', gloss: '우리 집 (한 채)' },
    { id: 'our-houses', text: 'our houses', role: 'S', slots: ['1-S'], person: 3, number: 'pl', gloss: '우리 집들 (여러 채)' },
    { id: 'always', text: 'always', role: 'M', slots: ['1-M-often'], sem: 'always', gloss: '항상' },
    { id: 'sometimes', text: 'sometimes', role: 'M', slots: ['1-M-often'], sem: 'sometimes', gloss: '가끔' },
    { id: 'smells', text: 'smells', role: 'V', slots: ['1-V'], tense: 'present', agree: '3sg', gloss: '냄새가 난다 (-s가 붙은 형태)' },
    { id: 'smell', text: 'smell', role: 'V', slots: ['1-V'], tense: 'present', agree: 'base', gloss: '냄새가 나다' },
    { id: 'smelled', text: 'smelled', role: 'V', slots: ['1-V'], tense: 'past', agree: 'any', gloss: '냄새가 났다' },
    { id: 'sweet', text: 'sweet', role: 'C', slots: ['1-C'], form: 'adj', gloss: '달콤한 (형용사)' },
    { id: 'sweetly', text: 'sweetly', role: 'C', slots: ['1-C'], form: 'adv', gloss: '달콤하게 (부사)' },
  ],

  structure: {
    clauses: [
      { slots: ['S', 'V', 'O', { role: 'M', id: 'when', name: '언제 장식' }] },
      { slots: ['S', { role: 'M', id: 'often', name: '얼마나 자주 장식' }, 'V', 'C'] },
    ],
    links: [{ id: 'L0', after: 0, commaBefore: true }],
  },

  answers: {
    main: 'My grandmother bakes bread every morning, so our house always smells sweet.',
    accepted: [
      {
        '0-S': 'my-grandmother', '0-V': 'bakes', '0-O': 'bread', '0-M-when': 'every-morning',
        L0: 'so', '1-S': 'our-house', '1-M-often': 'always', '1-V': 'smells', '1-C': 'sweet',
      },
    ],
  },

  checks: [
    {
      id: 'G1', category: 'grammar', points: 6, type: 'agreement', clause: 0, target: '0-V',
      requires: ['0-S', '0-V'],
      pass: '1층의 주어와 동사가 잘 맞아요.',
      fail: '1층 주어가 한 분일 때 현재형 동사의 모양을 확인해 보세요.',
    },
    {
      id: 'G2', category: 'grammar', points: 6, type: 'agreement', clause: 1, target: '1-V',
      requires: ['1-S', '1-V'],
      pass: '2층의 주어와 동사가 잘 맞아요.',
      fail: '2층 주어가 한 채일 때 현재형 동사의 모양을 확인해 보세요.',
    },
    {
      id: 'G3', category: 'grammar', points: 6, type: 'slotMatches', slot: '0-O',
      match: { form: 'ok' }, target: '0-O', requires: ['0-O'],
      pass: 'bread를 셀 수 없는 명사로 바르게 썼어요.',
      fail: 'bread(빵)는 보통 셀 수 없는 명사로 써서 a를 붙이거나 -s를 붙이지 않아요.',
    },
    {
      id: 'G4', category: 'grammar', points: 6, type: 'slotMatches', slot: '1-C',
      match: { form: 'adj' }, target: '1-C', requires: ['1-C'],
      pass: 'smell 뒤에 형용사 보어를 썼어요.',
      fail: 'smell(~한 냄새가 나다) 뒤에는 상태를 설명하는 형용사가 와요. 부사(-ly)가 아니에요.',
    },
    {
      id: 'G5', category: 'grammar', points: 6, type: 'slotMatches', slot: '0-M-when',
      match: { form: 'ok' }, target: '0-M-when', requires: ['0-M-when'],
      pass: 'every 뒤에 단수 명사를 썼어요.',
      fail: 'every(매 ~, 모든 ~) 뒤에는 단수 명사가 와요.',
    },
    {
      id: 'M1', category: 'meaning', points: 10, type: 'slotMatches', slot: 'L0',
      match: { sem: 'result' }, target: 'L0', requires: ['L0'],
      pass: '2층이 1층의 "결과"가 되도록 이었어요.',
      fail: '빵을 굽는 것(1층)이 원인이고, 달콤한 냄새(2층)가 그 결과예요. 계단의 접속사를 확인해 보세요.',
    },
    {
      id: 'M2', category: 'meaning', points: 8, type: 'slotsMatch',
      expect: { '0-S': { number: 'sg' }, '1-S': { number: 'sg' } }, target: '0-S', requires: ['0-S', '1-S'],
      pass: '할머니 한 분, 우리 집 한 채라는 뜻이 잘 전달돼요.',
      fail: '할머니는 한 분, 우리 집은 한 채예요. 두 주어를 확인해 보세요.',
    },
    {
      id: 'M3', category: 'meaning', points: 6, type: 'slotMatches', slot: '1-M-often',
      match: { sem: 'always' }, target: '1-M-often',
      pass: '"항상"이라는 뜻이 담겼어요.',
      fail: '집 안에서는 "항상" 달콤한 냄새가 나요. 얼마나 자주 장식을 확인해 보세요.',
    },
    {
      id: 'M4', category: 'meaning', points: 6, type: 'slotFilled', slot: '0-M-when', target: '0-M-when',
      pass: '"매일 아침"이라는 때가 담겼어요.',
      fail: '할머니가 언제 빵을 구우시는지 장식이 비어 있어요.',
    },
    {
      id: 'C1', category: 'condition', points: 12, type: 'roleMatches', clause: 0, role: 'V',
      match: { tense: 'present' }, target: '0-V', requires: ['0-V'],
      pass: '1층 동사 기둥을 "지금 자재"(현재)로 세웠어요.',
      fail: '지금도 매일 하는 일이므로 1층 동사를 현재 시제로 써요.',
    },
    {
      id: 'C2', category: 'condition', points: 13, type: 'roleMatches', clause: 1, role: 'V',
      match: { tense: 'present' }, target: '1-V', requires: ['1-V'],
      pass: '2층 동사 기둥을 "지금 자재"(현재)로 세웠어요.',
      fail: '지금도 늘 그러므로 2층 동사를 현재 시제로 써요.',
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
      '1층은 "할머니가 매일 아침 빵을 굽는다", 2층은 "우리 집은 항상 달콤한 냄새가 난다"예요. 두 층은 원인과 결과 관계예요.',
      '확인할 것: 3인칭 단수 현재(-s), 셀 수 없는 명사 bread, every + 단수 명사, 빈도부사의 위치, smell + 형용사.',
      '"smells sweet"와 "smells sweetly", "every morning"과 "every mornings"를 비교해 보세요. 원인 → 결과로 이어지는 접속사는 so예요.',
    ],
  },
};
