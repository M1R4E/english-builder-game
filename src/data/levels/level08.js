// 레벨 8: 단어의 순서와 문장의 의미 (장식을 어느 자리에 놓을지 스스로 정하기)
// 작성법은 level01.js 맨 위 설명 참고
//
// 이 레벨의 장식 카드는 자리 제한(slots)이 없어서 "동사 앞 장식"과 "문장 끝 장식" 어디에나 놓을 수 있다.
// → 빈도(always)와 장소(at the library)를 각각 어느 자리에 둘지 플레이어가 판단한다.

export default {
  id: 8,
  title: '미나의 도서관 별채',
  difficulty: 4,
  topic: '단어 순서와 문장 의미',
  client: '공부를 좋아하는 미나',

  request: '미나가 공부할 수 있는 별채를 주문했어요. 미나는 언제나 도서관에서 영어를 공부한대요. 별채에 장식 두 개를 다는데, 어느 장식을 어디에 달지는 건축가에게 맡긴대요.',
  buildNote: '이번 장식 카드는 "동사 앞 장식"과 "문장 끝 장식" 어디에나 놓을 수 있어요. 각 장식이 어느 자리에 어울리는지 직접 판단해 보세요.',
  meaning: {
    text: '미나는 항상 도서관에서 영어를 공부한다.',
    details: ['"항상" 그래요.', '공부하는 곳은 도서관이에요.'],
  },
  conditions: [
    {
      id: 'uncountable',
      text: '"영어" 책장에는 하나, 둘 세는 포장지(a/an)를 씌우지 말아 주세요.',
      grammar: 'English(영어)는 셀 수 없는 말이라 앞에 a/an을 붙이지 않아요.',
      checkId: 'C1',
    },
  ],
  scaffold: { showRoles: false },

  cards: [
    { id: 'mina', text: 'Mina', role: 'S', person: 3, number: 'sg', gloss: '미나 (한 명)' },
    { id: 'studies', text: 'studies', role: 'V', tense: 'present', agree: '3sg', spelling: 'ok', gloss: '공부한다 (y → ies)' },
    { id: 'study', text: 'study', role: 'V', tense: 'present', agree: 'base', spelling: 'ok', gloss: '공부하다' },
    { id: 'studys', text: 'studys', role: 'V', tense: 'present', agree: '3sg', spelling: 'bad', gloss: '(철자가 틀린 모양)' },
    { id: 'english', text: 'English', role: 'O', form: 'ok', gloss: '영어' },
    { id: 'an-english', text: 'an English', role: 'O', form: 'bad', gloss: '(영어 앞에는 an을 쓰지 않음)' },
    { id: 'always', text: 'always', role: 'M', kind: 'freq', sem: 'always', gloss: '항상 (빈도)' },
    { id: 'sometimes', text: 'sometimes', role: 'M', kind: 'freq', sem: 'sometimes', gloss: '가끔 (빈도)' },
    { id: 'at-the-library', text: 'at the library', role: 'M', kind: 'place', sem: 'library', gloss: '도서관에서 (장소)' },
    { id: 'at-the-park', text: 'at the park', role: 'M', kind: 'place', sem: 'park', gloss: '공원에서 (장소)' },
  ],

  structure: {
    clauses: [
      {
        slots: [
          'S',
          { role: 'M', id: 'front', name: '동사 앞 장식' },
          'V',
          'O',
          { role: 'M', id: 'end', name: '문장 끝 장식' },
        ],
      },
    ],
  },

  answers: {
    main: 'Mina always studies English at the library.',
    accepted: [{ '0-S': 'mina', '0-M-front': 'always', '0-V': 'studies', '0-O': 'english', '0-M-end': 'at-the-library' }],
  },

  checks: [
    {
      id: 'G1', category: 'grammar', points: 10, type: 'slotsMatch',
      expect: { '0-M-front': { kind: 'freq' }, '0-M-end': { kind: 'place' } }, target: '0-M-front',
      pass: '빈도 장식은 동사 앞에, 장소 장식은 문장 끝에 잘 놓였어요.',
      fail: '빈도를 나타내는 말(always 등)은 보통 일반동사 앞에, 장소를 나타내는 말은 문장 끝에 와요. 두 장식의 자리를 확인해 보세요.',
    },
    {
      id: 'G2', category: 'grammar', points: 10, type: 'agreement', clause: 0, target: '0-V',
      requires: ['0-S', '0-V'],
      pass: '주어와 동사의 모양이 서로 잘 맞아요.',
      fail: '주어가 한 명(3인칭 단수)일 때 현재형 동사의 모양을 확인해 보세요.',
    },
    {
      id: 'G3', category: 'grammar', points: 10, type: 'slotMatches', slot: '0-V',
      match: { spelling: 'ok' }, target: '0-V', requires: ['0-V'],
      pass: '동사의 철자가 맞아요.',
      fail: '"자음 + y"로 끝나는 동사에 -s를 붙일 때는 y를 i로 바꾸고 -es를 붙여요.',
    },
    {
      id: 'M1', category: 'meaning', points: 15, type: 'anySlotMatches',
      slots: ['0-M-front', '0-M-end'], match: { sem: 'always' }, target: '0-M-front',
      pass: '"항상"이라는 뜻이 담겼어요.',
      fail: '미나는 "항상" 공부해요. 그 뜻을 가진 장식이 있는지 확인해 보세요.',
    },
    {
      id: 'M2', category: 'meaning', points: 15, type: 'anySlotMatches',
      slots: ['0-M-front', '0-M-end'], match: { sem: 'library' }, target: '0-M-end',
      pass: '"도서관에서"라는 뜻이 담겼어요.',
      fail: '미나가 공부하는 곳이 어디인지 확인해 보세요.',
    },
    {
      id: 'C1', category: 'condition', points: 25, type: 'slotMatches', slot: '0-O',
      match: { form: 'ok' }, target: '0-O', requires: ['0-O'],
      pass: '영어 책장에 a/an 포장을 씌우지 않았어요.',
      fail: 'English(영어)는 셀 수 없는 말이라 앞에 a/an을 붙이지 않아요.',
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
      '장식 카드 네 장 중 뜻에 맞는 두 장을 고르고, 각각 어느 자리에 어울릴지 생각해 보세요.',
      '빈도(얼마나 자주)를 나타내는 말은 보통 일반동사 바로 앞에, 장소(어디서)를 나타내는 말은 보통 문장 끝에 와요.',
      '"Mina always studies …"와 "Mina at the library studies …"를 소리 내어 비교해 보세요. study에 -s를 붙일 때의 철자도 확인해 보세요.',
    ],
  },
};
