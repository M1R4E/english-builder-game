// 레벨 3: 수식어(부사, 형용사가 들어간 장소 표현)로 문장 꾸미기
// 작성법은 level01.js 맨 위 설명 참고

export default {
  id: 3,
  title: '아기의 꿈나라 방',
  difficulty: 2,
  topic: '수식어: 부사와 형용사',
  client: '갓난아기를 키우는 부부',

  request: '갓난아기를 키우는 부부가 아기 방이 있는 집을 주문했어요. 아기가 얼마나 편안하게, 어디에서 자는지 집 안 장식으로 보여 주고 싶대요.',
  buildNote: '방 안의 화분은 "장식" 자리예요. 장식에는 문장을 꾸며 주는 말(수식어)을 놓아요. 장식 자리도 눌러서 카드를 고를 수 있어요.',
  meaning: {
    text: '그 아기는 작은 방에서 평화롭게 잔다.',
    details: ['아기는 한 명이에요.', '"어떻게" 자는지와 "어디서" 자는지를 모두 나타내요.'],
  },
  conditions: [
    {
      id: 'decor',
      text: '아기 방에 장식 두 가지를 꼭 놓아 주세요. 하나는 "어떻게 자는지", 하나는 "어디서 자는지" 보여 주는 장식이에요.',
      grammar: '동사를 꾸미는 부사(어떻게)와 장소를 나타내는 말(어디서)을 모두 넣어요.',
      checkIds: ['C1', 'C2'],
    },
  ],
  scaffold: { showRoles: true },

  cards: [
    { id: 'the-baby', text: 'the baby', role: 'S', sem: 'baby', person: 3, number: 'sg', gloss: '그 아기 (한 명)' },
    { id: 'the-babies', text: 'the babies', role: 'S', sem: 'baby', person: 3, number: 'pl', gloss: '그 아기들 (여러 명)' },
    { id: 'sleeps', text: 'sleeps', role: 'V', sem: 'sleep', tense: 'present', agree: '3sg', gloss: '자다 (-s가 붙은 형태)' },
    { id: 'sleep', text: 'sleep', role: 'V', sem: 'sleep', tense: 'present', agree: 'base', gloss: '자다' },
    { id: 'peacefully', text: 'peacefully', role: 'M', slots: ['0-M-how'], form: 'adv', sem: 'peaceful', gloss: '평화롭게 (부사)' },
    { id: 'peaceful', text: 'peaceful', role: 'M', slots: ['0-M-how'], form: 'adj', sem: 'peaceful', gloss: '평화로운 (형용사)' },
    { id: 'in-the-small-room', text: 'in the small room', role: 'M', slots: ['0-M-where'], sem: 'room', adjpos: 'ok', gloss: '작은 방에서' },
    { id: 'in-the-room-small', text: 'in the room small', role: 'M', slots: ['0-M-where'], sem: 'room', adjpos: 'bad', gloss: '(형용사 위치가 어색함)' },
    { id: 'in-the-small-car', text: 'in the small car', role: 'M', slots: ['0-M-where'], sem: 'car', adjpos: 'ok', gloss: '작은 차에서' },
  ],

  structure: {
    clauses: [
      {
        slots: ['S', 'V', { role: 'M', id: 'how', name: '어떻게 장식' }, { role: 'M', id: 'where', name: '어디서 장식' }],
      },
    ],
  },

  answers: {
    main: 'The baby sleeps peacefully in the small room.',
    accepted: [{ '0-S': 'the-baby', '0-V': 'sleeps', '0-M-how': 'peacefully', '0-M-where': 'in-the-small-room' }],
  },

  checks: [
    {
      id: 'G1', category: 'grammar', points: 10, type: 'agreement', clause: 0, target: '0-V',
      requires: ['0-S', '0-V'],
      pass: '주어와 동사의 모양이 서로 잘 맞아요.',
      fail: '주어가 한 명(3인칭 단수)일 때 현재형 동사의 모양을 확인해 보세요.',
    },
    {
      id: 'G2', category: 'grammar', points: 10, type: 'slotMatches', slot: '0-M-how',
      match: { form: 'adv' }, target: '0-M-how', requires: ['0-M-how'],
      pass: '동사를 꾸미는 말로 부사(-ly)를 골랐어요.',
      fail: '"어떻게 자는지"처럼 동사를 꾸밀 때는 형용사가 아니라 부사를 써요. 끝 모양(-ly)을 비교해 보세요.',
    },
    {
      id: 'G3', category: 'grammar', points: 10, type: 'slotMatches', slot: '0-M-where',
      match: { adjpos: 'ok' }, target: '0-M-where', requires: ['0-M-where'],
      pass: '형용사(small)가 꾸미는 명사(room) 앞에 잘 놓였어요.',
      fail: '영어에서 명사를 꾸미는 형용사는 보통 명사 앞에 와요. small과 room의 순서를 확인해 보세요.',
    },
    {
      id: 'M1', category: 'meaning', points: 15, type: 'roleMatches', clause: 0, role: 'S',
      match: { sem: 'baby', number: 'sg' }, target: '0-S', requires: ['0-S'],
      pass: '"아기 한 명"이라는 뜻이 잘 전달돼요.',
      fail: '의뢰는 아기 "한 명"의 이야기예요. 주어를 확인해 보세요.',
    },
    {
      id: 'M2', category: 'meaning', points: 15, type: 'slotMatches', slot: '0-M-where',
      match: { sem: 'room' }, target: '0-M-where', requires: ['0-M-where'],
      pass: '아기가 "작은 방"에서 잔다는 뜻이 잘 전달돼요.',
      fail: '아기가 자는 곳이 어디인지 주문서를 다시 확인해 보세요.',
    },
    {
      id: 'C1', category: 'condition', points: 12, type: 'slotFilled', slot: '0-M-how', target: '0-M-how',
      pass: '"어떻게 자는지" 장식을 놓았어요.',
      fail: '"어떻게 자는지" 보여 주는 장식 자리가 비어 있어요.',
    },
    {
      id: 'C2', category: 'condition', points: 13, type: 'slotFilled', slot: '0-M-where', target: '0-M-where',
      pass: '"어디서 자는지" 장식을 놓았어요.',
      fail: '"어디서 자는지" 보여 주는 장식 자리가 비어 있어요.',
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
      '먼저 기둥 두 개(누가, 무엇을 하나)를 세우고, 그다음 장식 두 개(어떻게, 어디서)를 채워 보세요.',
      '"어떻게"는 동사를 꾸미는 말이라 부사를 써요. 형용사는 명사를 꾸미고, 명사 앞에 와요.',
      'peaceful(평화로운)과 peacefully(평화롭게)를 비교해 보세요. 또 "small room"과 "room small" 중 어느 쪽이 영어 순서일까요?',
    ],
  },
};
