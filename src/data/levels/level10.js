// 레벨 10: 앞에서 배운 요소를 모두 종합하는 도전 레벨
// 작성법은 level01.js 맨 위 설명 참고

export default {
  id: 10,
  title: '할머니의 빵 굽는 집',
  difficulty: 5,
  topic: '종합 도전',
  client: '빵 굽는 할머니',

  request: '할머니가 오븐이 있는 2층 집을 주문했어요. 할머니는 매일 아침 빵을 구우시는데, 그래서 집 안에는 늘 달콤한 냄새가 난대요. 지금까지 배운 모든 기술을 써서 지어 주세요.',
  buildNote: '두 층, 계단, 장식 방 두 개, 목적어 방과 보어 방까지 모두 있는 집이에요. 지금까지 배운 규칙을 떠올려 하나씩 지어 보세요.',
  meaning: {
    text: '나의 할머니는 매일 아침 빵을 구우셔서, 우리 집은 항상 달콤한 냄새가 난다.',
    details: ['할머니는 한 분, 우리 집은 한 채예요.', '1층이 원인, 2층이 그 결과예요.', '지금도 매일 그래요.'],
  },
  conditions: [
    {
      id: 'present',
      text: '지금도 매일 아침 일어나는 일이에요. 두 층의 동사 방 기둥을 모두 "지금 자재"로 세워 주세요.',
      grammar: '지금도 반복되는 일이므로 두 절의 동사를 모두 현재 시제로 써요.',
      checkIds: ['C1', 'C2'],
    },
  ],
  scaffold: { showRoles: false },

  floors: [
    {
      comps: [
        { id: 'S', role: 'S', type: 'np', words: ['sister', 'grandmother'], dets: ['the', 'my', 'a'] },
        { id: 'V', role: 'V', type: 'verb', words: ['eat', 'make', 'bake'] },
        { id: 'O', role: 'O', type: 'np', words: ['cake', 'bread'], dets: ['a', 'none', 'the'] },
        { id: 'when', role: 'M', type: 'np', name: '언제 장식 방', words: ['night', 'morning'], dets: ['the', 'every', 'a'] },
      ],
    },
    {
      link: { words: ['because', 'but', 'so'] },
      comps: [
        { id: 'S', role: 'S', type: 'np', words: ['room', 'house'], dets: ['the', 'a', 'our'] },
        { id: 'often', role: 'M', type: 'adj', name: '얼마나 자주 장식 방', words: ['sometimes', 'always', 'never'] },
        { id: 'V', role: 'V', type: 'verb', words: ['look', 'smell'] },
        { id: 'C', role: 'C', type: 'adj', words: ['sour', 'sweet'] },
      ],
    },
  ],
  sentence: [0, ',', 'L1', 1],

  answers: {
    main: 'My grandmother bakes bread every morning, so our house always smells sweet.',
    accepted: [
      {
        '0.S': { word: 'grandmother', form: 'sg', det: 'my' },
        '0.V': { word: 'bake', form: 's' },
        '0.O': { word: 'bread', form: 'sg', det: 'none' },
        '0.when': { word: 'morning', form: 'sg', det: 'every' },
        L1: 'so',
        '1.S': { word: 'house', form: 'sg', det: 'our' },
        '1.often': { word: 'always' },
        '1.V': { word: 'smell', form: 's' },
        '1.C': { word: 'sweet', form: 'adj' },
      },
    ],
  },

  checks: {
    meaning: [
      { id: 'M1', match: { '0.S': { 'word.sem': 'grandmother', 'form.number': 'sg', 'det.name': ['my', 'none'] } }, pass: '"나의 할머니 한 분"이 주인공이에요.', fail: '1층의 주인공은 "나의" 할머니 한 분이에요. 주어 방을 확인해 보세요.' },
      { id: 'M2', match: { '0.V': { 'word.sem': 'bake' }, '0.O': { 'word.sem': 'bread' } }, pass: '"빵을 굽는다"는 뜻이 잘 전달돼요.', fail: '할머니가 무엇을 하시는지 1층의 동사 방과 목적어 방을 확인해 보세요.' },
      { id: 'M3', match: { '0.when': { 'word.sem': 'morning', 'det.name': ['every', 'none'] } }, pass: '"매일 아침"이라는 때가 담겼어요.', fail: '할머니가 언제 빵을 구우시나요? "매 ~"를 나타내는 문패와 함께 확인해 보세요.' },
      { id: 'M4', match: { L1: { 'word.sem': 'result' } }, pass: '2층이 1층의 "결과"가 되도록 이었어요.', fail: '빵을 굽는 것(1층)이 원인이고, 달콤한 냄새(2층)가 그 결과예요. 계단의 접속사를 확인해 보세요.' },
      { id: 'M5', match: { '1.S': { 'word.sem': 'house', 'form.number': 'sg', 'det.name': ['our', 'none'] } }, pass: '"우리 집 한 채"라는 뜻이 잘 전달돼요.', fail: '2층의 주인공은 "우리" 집 한 채예요. 2층 주어 방을 확인해 보세요.' },
      { id: 'M6', match: { '1.often': { 'word.sem': 'always' }, '1.V': { 'word.sem': 'smell' }, '1.C': { 'word.sem': 'sweet' } }, pass: '"항상 달콤한 냄새가 난다"는 뜻이 잘 전달돼요.', fail: '집 안에서는 얼마나 자주, 어떤 냄새가 나나요? 2층의 장식 방, 동사 방, 보어 방을 확인해 보세요.' },
    ],
    condition: [
      { id: 'C1', match: { '0.V': { 'finite.tense': 'present' } }, pass: '1층 동사 방을 "지금 자재"(현재)로 세웠어요.', fail: '지금도 매일 하는 일이므로 1층 동사를 현재 시제로 써요.' },
      { id: 'C2', match: { '1.V': { 'finite.tense': 'present' } }, pass: '2층 동사 방을 "지금 자재"(현재)로 세웠어요.', fail: '지금도 늘 그러므로 2층 동사를 현재 시제로 써요.' },
    ],
  },

  hints: {
    steps: [
      '1층은 "할머니가 매일 아침 빵을 굽는다", 2층은 "우리 집은 항상 달콤한 냄새가 난다"예요. 두 층은 원인과 결과 관계예요.',
      '확인할 것: 3인칭 단수 현재(-s), 셀 수 없는 명사 bread, every + 단수, 빈도부사의 위치, smell + 형용사.',
      '"smells sweet"와 "smells sweetly", "every morning"과 "every mornings"를 비교해 보세요. 원인 → 결과로 이어지는 접속사는 so예요.',
    ],
  },
};
