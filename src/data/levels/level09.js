// 레벨 9: 복합 조건과 비슷한 선택지 (이유 부사절 + 불규칙 과거 + 관사·형용사 순서)
// 작성법은 level01.js 맨 위 설명 참고

export default {
  id: 9,
  title: '강가의 새 다리',
  difficulty: 4,
  topic: '복합 조건과 비슷한 선택지',
  client: '강 건너 마을 이장님',

  request: '마을 이장님이 다리 공사 기념관을 주문했어요. 지난해 마을의 낡은 다리 하나가 너무 오래되어서, 일꾼들이 새 다리를 지었대요. 그 이야기를 2층 기념관에 담아 달래요.',
  buildNote: '계단(접속사)이 문장 맨 앞에 와요. 비슷하게 생긴 카드가 많으니, 하나하나 꼼꼼히 비교해 보세요.',
  meaning: {
    text: '그 다리가 낡았기 때문에, 일꾼들은 새 다리를 지었다.',
    details: ['낡은 다리는 하나예요.', '1층은 "이유", 2층은 그 결과로 한 일이에요.', '지난해의 일이에요.'],
  },
  conditions: [
    {
      id: 'past',
      text: '지난해에 끝난 공사예요. 2층 동사 기둥은 "옛날 자재"로 세워 주세요.',
      grammar: '지난 일이므로 동사를 과거 시제로 써요.',
      checkId: 'C1',
    },
  ],
  scaffold: { showRoles: false },

  cards: [
    { id: 'because', text: 'because', role: 'CONJ', sem: 'reason', gloss: '~때문에 (이유)' },
    { id: 'since', text: 'since', role: 'CONJ', sem: 'reason', gloss: '~이므로 (이유)' },
    { id: 'although', text: 'although', role: 'CONJ', sem: 'concession', gloss: '비록 ~이지만 (반대)' },
    { id: 'the-bridge', text: 'the bridge', role: 'S', slots: ['0-S'], person: 3, number: 'sg', gloss: '그 다리 (하나)' },
    { id: 'the-bridges', text: 'the bridges', role: 'S', slots: ['0-S'], person: 3, number: 'pl', gloss: '그 다리들 (여러 개)' },
    { id: 'was', text: 'was', role: 'V', slots: ['0-V'], tense: 'past', agree: ['1sg', '3sg'], gloss: '~였다 (하나일 때)' },
    { id: 'were', text: 'were', role: 'V', slots: ['0-V'], tense: 'past', agree: ['2sg', '1pl', '2pl', '3pl'], gloss: '~였다 (여럿일 때)' },
    { id: 'old', text: 'old', role: 'C', slots: ['0-C'], sem: 'old', gloss: '낡은, 오래된' },
    { id: 'new', text: 'new', role: 'C', slots: ['0-C'], sem: 'new', gloss: '새로운' },
    { id: 'the-workers', text: 'the workers', role: 'S', slots: ['1-S'], person: 3, number: 'pl', gloss: '그 일꾼들' },
    { id: 'built', text: 'built', role: 'V', slots: ['1-V'], tense: 'past', agree: 'any', form: 'ok', gloss: '지었다 (build의 과거)' },
    { id: 'builded', text: 'builded', role: 'V', slots: ['1-V'], tense: 'past', agree: 'any', form: 'bad', gloss: '(build의 과거는 -ed가 아님)' },
    { id: 'build', text: 'build', role: 'V', slots: ['1-V'], tense: 'present', agree: 'base', form: 'ok', gloss: '짓다' },
    { id: 'a-new-bridge', text: 'a new bridge', role: 'O', slots: ['1-O'], form: 'ok', gloss: '새 다리 하나' },
    { id: 'a-bridge-new', text: 'a bridge new', role: 'O', slots: ['1-O'], form: 'bad', gloss: '(형용사 위치가 어색함)' },
    { id: 'an-new-bridge', text: 'an new bridge', role: 'O', slots: ['1-O'], form: 'bad', gloss: '(an은 모음 소리 앞에만)' },
  ],

  structure: {
    clauses: [
      { slots: ['S', 'V', 'C'], commaAfter: true },
      { slots: ['S', 'V', 'O'] },
    ],
    links: [{ id: 'L0', before: 0 }],
  },

  answers: {
    main: 'Because the bridge was old, the workers built a new bridge.',
    accepted: [
      { L0: 'because', '0-S': 'the-bridge', '0-V': 'was', '0-C': 'old', '1-S': 'the-workers', '1-V': 'built', '1-O': 'a-new-bridge' },
      { L0: 'since', '0-S': 'the-bridge', '0-V': 'was', '0-C': 'old', '1-S': 'the-workers', '1-V': 'built', '1-O': 'a-new-bridge' },
    ],
  },

  checks: [
    {
      id: 'G1', category: 'grammar', points: 10, type: 'agreement', clause: 0, target: '0-V',
      requires: ['0-S', '0-V'],
      pass: '1층의 주어와 be동사가 잘 맞아요.',
      fail: '주어가 하나인지 여럿인지에 따라 was와 were가 달라져요.',
    },
    {
      id: 'G2', category: 'grammar', points: 10, type: 'slotMatches', slot: '1-V',
      match: { form: 'ok' }, target: '1-V', requires: ['1-V'],
      pass: '동사의 모양이 맞아요.',
      fail: 'build는 과거형이 불규칙하게 바뀌는 동사예요. -ed를 붙이지 않아요.',
    },
    {
      id: 'G3', category: 'grammar', points: 10, type: 'slotMatches', slot: '1-O',
      match: { form: 'ok' }, target: '1-O', requires: ['1-O'],
      pass: '관사(a)와 형용사(new)의 모양과 순서가 맞아요.',
      fail: '"관사 + 형용사 + 명사" 순서인지, a와 an 중 무엇이 오는지(뒤에 오는 소리) 확인해 보세요.',
    },
    {
      id: 'M1', category: 'meaning', points: 10, type: 'slotMatches', slot: 'L0',
      match: { sem: 'reason' }, target: 'L0', requires: ['L0'],
      pass: '1층이 2층의 "이유"가 되도록 이었어요.',
      fail: '다리가 낡은 것은 새 다리를 지은 "이유"예요. although는 "~이지만"이라는 반대의 뜻이에요.',
    },
    {
      id: 'M2', category: 'meaning', points: 10, type: 'slotMatches', slot: '0-C',
      match: { sem: 'old' }, target: '0-C', requires: ['0-C'],
      pass: '다리가 "낡았다"는 뜻이 잘 전달돼요.',
      fail: '원래 있던 다리는 어떤 상태였나요? 1층 보어 칸을 확인해 보세요.',
    },
    {
      id: 'M3', category: 'meaning', points: 10, type: 'roleMatches', clause: 0, role: 'S',
      match: { number: 'sg' }, target: '0-S', requires: ['0-S'],
      pass: '낡은 다리가 "하나"라는 뜻이 잘 전달돼요.',
      fail: '낡은 다리는 하나예요. 1층 주어를 확인해 보세요.',
    },
    {
      id: 'C1', category: 'condition', points: 25, type: 'roleMatches', clause: 1, role: 'V',
      match: { tense: 'past' }, target: '1-V', requires: ['1-V'],
      pass: '2층 동사 기둥을 "옛날 자재"(과거)로 세웠어요.',
      fail: '지난해의 일이므로 2층 동사를 과거 시제로 바꿔 보세요.',
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
      '1층(다리가 낡았다)과 2층(새 다리를 지었다)은 어떤 관계인가요? 맨 앞 계단이 그 관계를 정해요.',
      '이유를 나타내는 접속사는 because와 since예요. build는 과거형이 불규칙하게 바뀌어요.',
      'a new bridge / a bridge new / an new bridge를 비교해 보세요. an은 모음 소리(a, e, i, o, u 소리) 앞에서만 써요.',
    ],
  },
};
