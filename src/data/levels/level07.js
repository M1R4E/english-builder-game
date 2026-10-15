// 레벨 7: 여러 조건을 동시에 지키는 문장 (3인칭 단수 현재 + 빈도부사 + 형용사)
// 작성법은 level01.js 맨 위 설명 참고

export default {
  id: 7,
  title: '언니의 밤 부엌',
  difficulty: 3,
  topic: '여러 문법 조건을 동시에',
  client: '잠들기 전 우유를 마시는 언니',

  request: '언니가 작은 부엌이 딸린 집을 주문했어요. 언니는 잠들기 전에 거의 매일 따뜻한 우유를 마신대요. 그 습관이 잘 드러나는 부엌이면 좋겠대요.',
  buildNote: '이번에는 장식이 동사 기둥 앞에 와요. "얼마나 자주"를 나타내는 장식은 보통 일반동사 앞에 놓아요.',
  meaning: {
    text: '언니는 보통 따뜻한 우유를 마신다.',
    details: ['언니는 한 명이에요.', '"보통, 대개" 그렇게 해요.', '차가운 우유가 아니라 따뜻한 우유예요.'],
  },
  conditions: [
    {
      id: 'present',
      text: '지금도 매일 밤 하는 습관이에요. 동사 기둥은 "지금 자재"로 세워 주세요.',
      grammar: '평소의 습관이므로 동사를 현재 시제로 써요.',
      checkId: 'C1',
    },
    {
      id: 'often',
      text: '"얼마나 자주" 마시는지 보여 주는 장식을 동사 기둥 바로 앞에 꼭 달아 주세요.',
      grammar: '빈도를 나타내는 부사(usually 등)를 넣어요.',
      checkId: 'C2',
    },
  ],
  scaffold: { showRoles: false },

  cards: [
    { id: 'my-sister', text: 'my sister', role: 'S', sem: 'sister', person: 3, number: 'sg', gloss: '나의 언니(누나, 여동생) 한 명' },
    { id: 'my-sisters', text: 'my sisters', role: 'S', sem: 'sister', person: 3, number: 'pl', gloss: '나의 자매들' },
    { id: 'usually', text: 'usually', role: 'M', slots: ['0-M-often'], sem: 'usually', form: 'adv', gloss: '보통, 대개 (부사)' },
    { id: 'never', text: 'never', role: 'M', slots: ['0-M-often'], sem: 'never', form: 'adv', gloss: '결코 ~않다 (부사)' },
    { id: 'usual', text: 'usual', role: 'M', slots: ['0-M-often'], sem: 'usually', form: 'adj', gloss: '평소의 (형용사)' },
    { id: 'drinks', text: 'drinks', role: 'V', sem: 'drink', tense: 'present', agree: '3sg', gloss: '마신다 (-s가 붙은 형태)' },
    { id: 'drink', text: 'drink', role: 'V', sem: 'drink', tense: 'present', agree: 'base', gloss: '마시다' },
    { id: 'drank', text: 'drank', role: 'V', sem: 'drink', tense: 'past', agree: 'any', gloss: '마셨다' },
    { id: 'warm-milk', text: 'warm milk', role: 'O', adj: 'warm', adjpos: 'ok', gloss: '따뜻한 우유' },
    { id: 'milk-warm', text: 'milk warm', role: 'O', adj: 'warm', adjpos: 'bad', gloss: '(형용사 위치가 어색함)' },
    { id: 'cold-milk', text: 'cold milk', role: 'O', adj: 'cold', adjpos: 'ok', gloss: '차가운 우유' },
    { id: 'milk', text: 'milk', role: 'O', adj: 'none', adjpos: 'ok', gloss: '우유' },
  ],

  structure: {
    clauses: [{ slots: ['S', { role: 'M', id: 'often', name: '얼마나 자주 장식' }, 'V', 'O'] }],
  },

  answers: {
    main: 'My sister usually drinks warm milk.',
    accepted: [{ '0-S': 'my-sister', '0-M-often': 'usually', '0-V': 'drinks', '0-O': 'warm-milk' }],
  },

  checks: [
    {
      id: 'G1', category: 'grammar', points: 10, type: 'agreement', clause: 0, target: '0-V',
      requires: ['0-S', '0-V'],
      pass: '주어와 동사의 모양이 서로 잘 맞아요.',
      fail: '주어가 한 명(3인칭 단수)일 때 현재형 동사의 모양을 확인해 보세요.',
    },
    {
      id: 'G2', category: 'grammar', points: 10, type: 'slotMatches', slot: '0-M-often',
      match: { form: 'adv' }, target: '0-M-often', requires: ['0-M-often'],
      pass: '동사를 꾸미는 빈도부사를 골랐어요.',
      fail: 'usual(평소의)은 명사를 꾸미는 형용사예요. 동사 앞에서 "얼마나 자주"를 나타낼 때는 부사를 써요.',
    },
    {
      id: 'G3', category: 'grammar', points: 10, type: 'slotMatches', slot: '0-O',
      match: { adjpos: 'ok' }, target: '0-O', requires: ['0-O'],
      pass: '형용사가 명사 앞에 잘 놓였어요.',
      fail: '명사를 꾸미는 형용사는 보통 명사 앞에 와요. warm과 milk의 순서를 확인해 보세요.',
    },
    {
      id: 'M1', category: 'meaning', points: 10, type: 'roleMatches', clause: 0, role: 'S',
      match: { sem: 'sister', number: 'sg' }, target: '0-S', requires: ['0-S'],
      pass: '"언니 한 명"이라는 뜻이 잘 전달돼요.',
      fail: '의뢰인은 언니 "한 명"이에요. 주어를 확인해 보세요.',
    },
    {
      id: 'M2', category: 'meaning', points: 10, type: 'slotMatches', slot: '0-M-often',
      match: { sem: 'usually' }, target: '0-M-often', requires: ['0-M-often'],
      pass: '"보통, 대개"라는 빈도가 잘 전달돼요.',
      fail: '언니는 거의 매일 우유를 마셔요. never(결코 ~않다)를 쓰면 뜻이 정반대가 돼요.',
    },
    {
      id: 'M3', category: 'meaning', points: 10, type: 'slotMatches', slot: '0-O',
      match: { adj: 'warm' }, target: '0-O', requires: ['0-O'],
      pass: '"따뜻한" 우유라는 뜻이 잘 전달돼요.',
      fail: '언니가 마시는 우유는 어떤 우유인가요? 주문서의 뜻을 다시 확인해 보세요.',
    },
    {
      id: 'C1', category: 'condition', points: 12, type: 'roleMatches', clause: 0, role: 'V',
      match: { tense: 'present' }, target: '0-V', requires: ['0-V'],
      pass: '동사 기둥을 "지금 자재"(현재)로 세웠어요.',
      fail: '지금도 하는 습관은 현재 시제로 나타내요. 동사 기둥의 시제를 확인해 보세요.',
    },
    {
      id: 'C2', category: 'condition', points: 13, type: 'slotFilled', slot: '0-M-often', target: '0-M-often',
      pass: '"얼마나 자주" 장식을 달았어요.',
      fail: '"얼마나 자주" 마시는지 보여 주는 장식 자리가 비어 있어요.',
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
      '주문서의 특별 요청 사항이 두 가지예요. 하나씩 체크하면서 자리를 채워 보세요.',
      '빈도부사(usually, never 등)는 보통 일반동사 앞에 와요. 주어가 한 명이고 현재형이면 동사에 -s가 붙어요.',
      'usually(부사)와 usual(형용사), warm milk와 milk warm을 비교해 보세요.',
    ],
  },
};
