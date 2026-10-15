// 레벨 5: 시간을 나타내는 부사절 (When / After / Before)
// 작성법은 level01.js 맨 위 설명 참고

export default {
  id: 5,
  title: '비 갠 날의 놀이터',
  difficulty: 3,
  topic: '시간 관계를 나타내는 부사절',
  client: '동네 어린이집 선생님',

  request: '어린이집 선생님이 놀이터가 보이는 2층 건물을 주문했어요. 어제 오후, 비가 그치자마자 아이들이 우르르 밖으로 나가 놀았던 장면을 기억하고 싶대요.',
  buildNote: '이번에는 계단(접속사)이 문장 맨 앞에 와요. "~했을 때"를 나타내는 접속사로 1층(때를 나타내는 절)을 열고, 2층에 그때 일어난 일을 지어요.',
  meaning: {
    text: '비가 그치자, 아이들은 밖에서 놀았다.',
    details: ['비가 먼저 그치고, 그다음에 아이들이 놀았어요.', '아이들은 여러 명이에요.', '어제 오후의 일이에요.'],
  },
  conditions: [
    {
      id: 'past',
      text: '어제 오후의 장면이에요. 두 층의 동사 기둥을 모두 "옛날 자재"로 세워 주세요.',
      grammar: '지난 일이므로 두 절의 동사를 모두 과거 시제로 써요.',
      checkIds: ['C1', 'C2'],
    },
  ],
  scaffold: { showRoles: false },

  cards: [
    { id: 'when', text: 'when', role: 'CONJ', sem: 'when', gloss: '~할 때' },
    { id: 'after', text: 'after', role: 'CONJ', sem: 'after', gloss: '~한 후에' },
    { id: 'before', text: 'before', role: 'CONJ', sem: 'before', gloss: '~하기 전에' },
    { id: 'the-rain', text: 'the rain', role: 'S', slots: ['0-S'], person: 3, number: 'sg', gloss: '비' },
    { id: 'stopped', text: 'stopped', role: 'V', slots: ['0-V'], tense: 'past', agree: 'any', gloss: '멈췄다, 그쳤다' },
    { id: 'stops', text: 'stops', role: 'V', slots: ['0-V'], tense: 'present', agree: '3sg', gloss: '멈춘다' },
    { id: 'the-children', text: 'the children', role: 'S', slots: ['1-S'], person: 3, number: 'pl', gloss: '아이들 (여러 명)' },
    { id: 'the-child', text: 'the child', role: 'S', slots: ['1-S'], person: 3, number: 'sg', gloss: '그 아이 (한 명)' },
    { id: 'played', text: 'played', role: 'V', slots: ['1-V'], tense: 'past', agree: 'any', gloss: '놀았다' },
    { id: 'plays', text: 'plays', role: 'V', slots: ['1-V'], tense: 'present', agree: '3sg', gloss: '논다 (-s가 붙은 형태)' },
    { id: 'play', text: 'play', role: 'V', slots: ['1-V'], tense: 'present', agree: 'base', gloss: '놀다' },
    { id: 'outside', text: 'outside', role: 'M', slots: ['1-M-where'], sem: 'outside', form: 'adv', gloss: '밖에서 (부사)' },
    { id: 'outdoor', text: 'outdoor', role: 'M', slots: ['1-M-where'], sem: 'outside', form: 'adj', gloss: '야외의 (형용사, 명사 앞에 씀)' },
  ],

  structure: {
    clauses: [
      { slots: ['S', 'V'], commaAfter: true },
      { slots: ['S', 'V', { role: 'M', id: 'where', name: '어디서 장식' }] },
    ],
    links: [{ id: 'L0', before: 0 }],
  },

  answers: {
    main: 'When the rain stopped, the children played outside.',
    accepted: [
      { L0: 'when', '0-S': 'the-rain', '0-V': 'stopped', '1-S': 'the-children', '1-V': 'played', '1-M-where': 'outside' },
      { L0: 'after', '0-S': 'the-rain', '0-V': 'stopped', '1-S': 'the-children', '1-V': 'played', '1-M-where': 'outside' },
    ],
  },

  checks: [
    {
      id: 'G1', category: 'grammar', points: 15, type: 'agreement', clause: 1, target: '1-V',
      requires: ['1-S', '1-V'],
      pass: '2층의 주어와 동사의 모양이 잘 맞아요.',
      fail: '2층 주어가 한 명인지 여러 명인지에 따라 현재형 동사의 모양이 달라져요.',
    },
    {
      id: 'G2', category: 'grammar', points: 15, type: 'slotMatches', slot: '1-M-where',
      match: { form: 'adv' }, target: '1-M-where', requires: ['1-M-where'],
      pass: '동사(놀았다)를 꾸미는 부사 outside를 골랐어요.',
      fail: 'outdoor는 명사 앞에서 꾸미는 형용사예요. "밖에서 놀았다"처럼 동사를 꾸밀 때는 무엇을 쓸까요?',
    },
    {
      id: 'M1', category: 'meaning', points: 10, type: 'slotMatches', slot: 'L0',
      match: { sem: ['when', 'after'] }, target: 'L0', requires: ['L0'],
      pass: '"비가 그친 때(후)에"라는 시간 관계가 잘 전달돼요.',
      fail: '아이들은 비가 그친 "다음에" 놀았어요. before를 쓰면 순서가 반대가 돼요.',
    },
    {
      id: 'M2', category: 'meaning', points: 10, type: 'roleMatches', clause: 1, role: 'S',
      match: { number: 'pl' }, target: '1-S', requires: ['1-S'],
      pass: '아이들이 "여러 명"이라는 뜻이 잘 전달돼요.',
      fail: '밖에서 논 아이는 여러 명이에요. 2층 주어를 확인해 보세요.',
    },
    {
      id: 'M3', category: 'meaning', points: 10, type: 'slotMatches', slot: '1-M-where',
      match: { sem: 'outside' }, target: '1-M-where',
      pass: '아이들이 "밖에서" 놀았다는 뜻이 담겼어요.',
      fail: '아이들이 어디에서 놀았는지 장식이 비어 있어요.',
    },
    {
      id: 'C1', category: 'condition', points: 12, type: 'roleMatches', clause: 0, role: 'V',
      match: { tense: 'past' }, target: '0-V', requires: ['0-V'],
      pass: '1층 동사 기둥을 "옛날 자재"(과거)로 세웠어요.',
      fail: '1층 동사가 현재형이에요. 어제 일이므로 과거 시제로 바꿔 보세요.',
    },
    {
      id: 'C2', category: 'condition', points: 13, type: 'roleMatches', clause: 1, role: 'V',
      match: { tense: 'past' }, target: '1-V', requires: ['1-V'],
      pass: '2층 동사 기둥을 "옛날 자재"(과거)로 세웠어요.',
      fail: '2층 동사가 현재형이에요. 어제 일이므로 과거 시제로 바꿔 보세요.',
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
      '두 사건 중 어느 것이 먼저 일어났나요? 먼저 일어난 일(비가 그침)이 1층, 그다음 일(아이들이 놂)이 2층이에요.',
      '맨 앞 계단에는 시간 관계를 나타내는 접속사가 와요. when(~할 때), after(~한 후에), before(~하기 전에)를 비교해 보세요.',
      '"비가 그친 후에 놀았다"이므로 when이나 after가 어울려요. 지난 일이니 두 동사 모두 -ed 모양이 맞는지, 장소 장식이 동사를 꾸미는 말인지도 확인해 보세요.',
    ],
  },
};
