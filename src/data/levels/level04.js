// 레벨 4: 접속사로 두 절 잇기 (but / so / because 비교)
// 작성법은 level01.js 맨 위 설명 참고

export default {
  id: 4,
  title: '목수 씨의 2층 작업실',
  difficulty: 2,
  topic: '접속사로 두 절 연결',
  client: '부지런한 목수 씨',

  request: '목수 씨가 2층짜리 작업실을 주문했어요. 어제 몹시 피곤했는데도 일을 끝까지 마친 날을 기억하고 싶대요. 1층과 2층에 그날의 두 이야기를 담고, 계단으로 이어 달래요.',
  buildNote: '이번 집은 2층이에요. 층마다 절(주어 + 동사 …)이 하나씩 들어가고, 두 층을 잇는 계단에는 접속사를 놓아요.',
  meaning: {
    text: '목수는 피곤했지만, 그는 일을 끝냈다.',
    details: ['목수는 한 명이에요.', '어제 있었던 일이에요.', '두 이야기는 서로 "반대되는" 흐름이에요.'],
  },
  conditions: [
    {
      id: 'past',
      text: '어제 일을 기념하는 집이에요. 1층과 2층의 동사 기둥을 모두 "옛날 자재"로 세워 주세요.',
      grammar: '어제 있었던 일이므로 두 절의 동사를 모두 과거 시제로 써요.',
      checkIds: ['C1', 'C2'],
    },
  ],
  scaffold: { showRoles: false },

  cards: [
    { id: 'the-carpenter', text: 'the carpenter', role: 'S', slots: ['0-S'], sem: 'carpenter', person: 3, number: 'sg', gloss: '그 목수' },
    { id: 'was', text: 'was', role: 'V', slots: ['0-V'], tense: 'past', agree: ['1sg', '3sg'], gloss: '~였다 (I, he, she, it과 함께)' },
    { id: 'were', text: 'were', role: 'V', slots: ['0-V'], tense: 'past', agree: ['2sg', '1pl', '2pl', '3pl'], gloss: '~였다 (you, we, they와 함께)' },
    { id: 'is', text: 'is', role: 'V', slots: ['0-V'], tense: 'present', agree: '3sg', gloss: '~이다 (현재)' },
    { id: 'tired', text: 'tired', role: 'C', slots: ['0-C'], form: 'ed', gloss: '피곤한 (사람이 느끼는 기분)' },
    { id: 'tiring', text: 'tiring', role: 'C', slots: ['0-C'], form: 'ing', gloss: '피곤하게 만드는 (일이 주는 느낌)' },
    { id: 'but', text: 'but', role: 'CONJ', sem: 'contrast', gloss: '그러나 (반대)' },
    { id: 'so', text: 'so', role: 'CONJ', sem: 'result', gloss: '그래서 (결과)' },
    { id: 'because', text: 'because', role: 'CONJ', sem: 'reason', gloss: '왜냐하면 (이유)' },
    { id: 'he', text: 'he', role: 'S', slots: ['1-S'], ref: 'carpenter', person: 3, number: 'sg', gloss: '그 (남자 한 명)' },
    { id: 'they', text: 'they', role: 'S', slots: ['1-S'], ref: 'others', person: 3, number: 'pl', gloss: '그들 (여러 명)' },
    { id: 'finished', text: 'finished', role: 'V', slots: ['1-V'], sem: 'finish', tense: 'past', agree: 'any', gloss: '끝냈다' },
    { id: 'finishes', text: 'finishes', role: 'V', slots: ['1-V'], sem: 'finish', tense: 'present', agree: '3sg', gloss: '끝낸다 (-es가 붙은 형태)' },
    { id: 'the-work', text: 'the work', role: 'O', slots: ['1-O'], gloss: '그 일' },
  ],

  structure: {
    clauses: [{ slots: ['S', 'V', 'C'] }, { slots: ['S', 'V', 'O'] }],
    links: [{ id: 'L0', after: 0, commaBefore: true }],
  },

  answers: {
    main: 'The carpenter was tired, but he finished the work.',
    accepted: [
      { '0-S': 'the-carpenter', '0-V': 'was', '0-C': 'tired', L0: 'but', '1-S': 'he', '1-V': 'finished', '1-O': 'the-work' },
    ],
  },

  checks: [
    {
      id: 'G1', category: 'grammar', points: 15, type: 'agreement', clause: 0, target: '0-V',
      requires: ['0-S', '0-V'],
      pass: '1층의 주어와 be동사가 잘 맞아요.',
      fail: '주어가 한 명일 때 과거의 be동사는 was와 were 중 무엇일까요?',
    },
    {
      id: 'G2', category: 'grammar', points: 15, type: 'slotMatches', slot: '0-C',
      match: { form: 'ed' }, target: '0-C', requires: ['0-C'],
      pass: '사람이 느끼는 기분을 -ed 모양(tired)으로 나타냈어요.',
      fail: '사람이 "피곤함을 느낄" 때는 -ed, 무엇이 "피곤하게 만들" 때는 -ing를 써요. 보어 칸을 확인해 보세요.',
    },
    {
      id: 'M1', category: 'meaning', points: 15, type: 'slotMatches', slot: 'L0',
      match: { sem: 'contrast' }, target: 'L0', requires: ['L0'],
      pass: '"피곤했다"와 "일을 끝냈다"를 반대의 흐름(but)으로 이었어요.',
      fail: '두 이야기는 "피곤했는데도 끝냈다"는 반대의 흐름이에요. 계단의 접속사를 비교해 보세요.',
    },
    {
      id: 'M2', category: 'meaning', points: 15, type: 'roleMatches', clause: 1, role: 'S',
      match: { ref: 'carpenter' }, target: '1-S', requires: ['1-S'],
      pass: '2층의 주어가 목수 씨를 가리켜요.',
      fail: '일을 끝낸 사람은 누구인가요? 2층 주어가 목수 씨 한 명을 가리키는지 확인해 보세요.',
    },
    {
      id: 'C1', category: 'condition', points: 12, type: 'roleMatches', clause: 0, role: 'V',
      match: { tense: 'past' }, target: '0-V', requires: ['0-V'],
      pass: '1층 동사 기둥을 "옛날 자재"(과거)로 세웠어요.',
      fail: '1층 동사 기둥이 지금 자재(현재)예요. 어제 일이므로 과거 시제로 바꿔 보세요.',
    },
    {
      id: 'C2', category: 'condition', points: 13, type: 'roleMatches', clause: 1, role: 'V',
      match: { tense: 'past' }, target: '1-V', requires: ['1-V'],
      pass: '2층 동사 기둥을 "옛날 자재"(과거)로 세웠어요.',
      fail: '2층 동사 기둥이 지금 자재(현재)예요. 어제 일이므로 과거 시제로 바꿔 보세요.',
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
      '1층에는 "목수가 피곤했다", 2층에는 "그가 일을 끝냈다"가 들어가요. 두 이야기는 어떤 관계일까요?',
      '접속사는 두 절의 관계를 정해요. but은 반대, so는 결과, because는 이유를 나타내요.',
      '"피곤했다 → 그래서(so) 끝냈다"와 "피곤했다 → 그런데도(but) 끝냈다"를 비교해 보세요. 또 사람이 느끼는 기분은 tired일까요, tiring일까요?',
    ],
  },
};
