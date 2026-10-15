// 레벨 2: 목적어가 있는 문장 (주어 + 동사 + 목적어)
// 작성법은 level01.js 맨 위 설명 참고

export default {
  id: 2,
  title: '강아지의 장난감 방',
  difficulty: 1,
  topic: '주어 + 동사 + 목적어',
  client: '공놀이 좋아하는 강아지 씨',

  request: '옆집 강아지 씨가 장난감을 넣어 둘 방이 있는 집을 주문했어요. 강아지 씨가 제일 좋아하는 물건을 방 안에 꼭 들여놓아 달래요.',
  buildNote: '이번 집에는 기둥 두 개와 함께 "목적어 칸"이 있어요. 목적어 칸에는 "무엇을"에 해당하는 말을 넣어요.',
  meaning: {
    text: '그 강아지는 공을 좋아한다.',
    details: ['강아지는 한 마리예요.', '평소에 늘 그래요.'],
  },
  conditions: [
    {
      id: 'no-door',
      text: '강아지 씨는 공을 방 안에 바로 들여놓길 원해요. 목적어 칸 앞에 "문(to)"을 달지 말아 주세요.',
      grammar: 'like(좋아하다) 다음에는 to 없이 목적어를 바로 써요.',
      checkId: 'C1',
    },
  ],
  scaffold: { showRoles: true },

  cards: [
    { id: 'the-dog', text: 'the dog', role: 'S', sem: 'dog', person: 3, number: 'sg', gloss: '그 강아지 (한 마리)' },
    { id: 'the-dogs', text: 'the dogs', role: 'S', sem: 'dog', person: 3, number: 'pl', gloss: '그 강아지들 (여러 마리)' },
    { id: 'likes', text: 'likes', role: 'V', sem: 'like', tense: 'present', agree: '3sg', gloss: '좋아하다 (-s가 붙은 형태)' },
    { id: 'like', text: 'like', role: 'V', sem: 'like', tense: 'present', agree: 'base', gloss: '좋아하다' },
    { id: 'liked', text: 'liked', role: 'V', sem: 'like', tense: 'past', agree: 'any', gloss: '좋아했다' },
    { id: 'the-ball', text: 'the ball', role: 'O', sem: 'ball', form: 'np', gloss: '그 공' },
    { id: 'to-the-ball', text: 'to the ball', role: 'O', sem: 'ball', form: 'prep', gloss: '그 공에게 / 공 쪽으로' },
    { id: 'the-bone', text: 'the bone', role: 'O', sem: 'bone', form: 'np', gloss: '그 뼈다귀' },
  ],

  structure: {
    clauses: [{ slots: ['S', 'V', 'O'] }],
  },

  answers: {
    main: 'The dog likes the ball.',
    accepted: [{ '0-S': 'the-dog', '0-V': 'likes', '0-O': 'the-ball' }],
  },

  checks: [
    {
      id: 'G1', category: 'grammar', points: 15, type: 'agreement', clause: 0, target: '0-V',
      requires: ['0-S', '0-V'],
      pass: '주어와 동사의 모양이 서로 잘 맞아요.',
      fail: '주어가 한 마리(3인칭 단수)일 때 현재형 동사의 모양을 확인해 보세요.',
    },
    {
      id: 'G2', category: 'grammar', points: 15, type: 'roleMatches', clause: 0, role: 'V',
      match: { tense: 'present' }, target: '0-V', requires: ['0-V'],
      pass: '평소의 일을 현재 시제로 나타냈어요.',
      fail: '"평소에 늘 그렇다"는 이야기예요. 지난 일을 말하는 모양이 아닌지 동사를 확인해 보세요.',
    },
    {
      id: 'M1', category: 'meaning', points: 15, type: 'roleMatches', clause: 0, role: 'S',
      match: { sem: 'dog', number: 'sg' }, target: '0-S', requires: ['0-S'],
      pass: '"강아지 한 마리"라는 뜻이 잘 전달돼요.',
      fail: '의뢰는 강아지 "한 마리"의 이야기예요. 주어를 확인해 보세요.',
    },
    {
      id: 'M2', category: 'meaning', points: 15, type: 'slotMatches', slot: '0-O',
      match: { sem: 'ball' }, target: '0-O', requires: ['0-O'],
      pass: '좋아하는 물건이 "공"이라는 뜻이 잘 전달돼요.',
      fail: '강아지 씨가 좋아하는 물건이 무엇인지 주문서를 다시 확인해 보세요.',
    },
    {
      id: 'C1', category: 'condition', points: 25, type: 'slotMatches', slot: '0-O',
      match: { form: 'np' }, target: '0-O', requires: ['0-O'],
      pass: '목적어 칸 앞에 문(to)을 달지 않고 바로 들여놓았어요.',
      fail: 'like 다음에는 to 없이 "무엇을"을 바로 써요. 목적어 칸의 카드를 확인해 보세요.',
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
      '"누가", "무엇을 하나", "무엇을"을 각각 찾아보세요. 세 가지가 주어 기둥, 동사 기둥, 목적어 칸과 짝을 이뤄요.',
      '목적어 칸에는 "~을/를"에 해당하는 말이 들어가요. like(좋아하다)는 목적어를 바로 뒤에 붙여요.',
      'the ball과 to the ball을 비교해 보세요. "공을 좋아한다"는 like + the ball이에요. 주어가 한 마리이면 동사에 -s가 붙어요.',
    ],
  },
};
