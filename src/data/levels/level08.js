// 레벨 8: 단어의 순서와 문장의 의미 (장식 방 두 곳에 무엇을 놓을지 스스로 정하기)
// 작성법은 level01.js 맨 위 설명 참고
//
// 두 장식 방(동사 앞, 문장 끝)은 type: 'mod'라서 빈도부사와 장소 명사를 모두 고를 수 있다.
// → 빈도(always)와 장소(at the library)를 각각 어느 자리에 둘지 플레이어가 판단한다.

const PLACE_OR_FREQ = ['a:sometimes', 'n:park', 'a:always', 'n:library'];
const modRoom = (id, name) => ({
  id, role: 'M', type: 'mod', name, words: PLACE_OR_FREQ, dets: ['a', 'the', 'none'], preps: ['to', 'at', 'none'],
});

export default {
  id: 8,
  title: '미나의 도서관 별채',
  difficulty: 4,
  topic: '단어 순서와 문장 의미',
  client: '공부를 좋아하는 미나',

  request: '미나가 공부할 수 있는 별채를 주문했어요. 미나는 언제나 도서관에서 영어를 공부한대요. 별채에 장식 방 두 개를 짓는데, 어느 장식을 어느 방에 둘지는 건축가에게 맡긴대요.',
  buildNote: '두 장식 방(동사 앞, 문장 끝)에는 빈도를 나타내는 말과 장소를 나타내는 말을 모두 놓을 수 있어요. 각 방에 무엇이 어울리는지 직접 판단해 보세요.',
  meaning: {
    text: '미나는 항상 그 도서관에서 영어를 공부한다.',
    details: ['"항상" 그래요.', '공부하는 곳은 도서관이에요.'],
  },
  conditions: [
    {
      id: 'present',
      text: '미나는 지금도 늘 공부해요. 동사 방의 기둥은 "지금 자재"로 세워 주세요.',
      grammar: '늘 하는 일이므로 동사를 현재 시제로 써요.',
      checkId: 'C1',
    },
  ],
  scaffold: { showRoles: false },

  floors: [
    {
      comps: [
        { id: 'S', role: 'S', type: 'np', words: ['they', 'Mina'] },
        modRoom('front', '동사 앞 장식 방'),
        { id: 'V', role: 'V', type: 'verb', words: ['read', 'study', 'make'] },
        { id: 'O', role: 'O', type: 'np', words: ['math', 'English'], dets: ['an', 'the', 'none'] },
        modRoom('end', '문장 끝 장식 방'),
      ],
    },
  ],

  answers: {
    main: 'Mina always studies English at the library.',
    accepted: [
      {
        '0.S': { word: 'Mina' },
        '0.front': { word: 'a:always' },
        '0.V': { word: 'study', form: 's' },
        '0.O': { word: 'English', det: 'none' },
        '0.end': { word: 'n:library', form: 'sg', det: 'the', prep: 'at' },
      },
    ],
  },

  checks: {
    grammar: [
      {
        id: 'G1', match: { '0.front': { 'word.kind': 'freq' }, '0.end': { 'word.kind': 'place' } },
        pass: '빈도 장식은 동사 앞에, 장소 장식은 문장 끝에 잘 놓였어요.',
        fail: '빈도를 나타내는 말(always 등)은 보통 일반동사 앞에, 장소를 나타내는 말은 문장 끝에 와요. 두 장식 방에 무엇을 놓았는지 확인해 보세요.',
      },
      {
        id: 'G2', oneOf: [{ '0.end': { 'word.kind': 'place', 'prep.name': 'at' } }, { '0.end': { 'word.kind': 'freq' } }],
        pass: '장소 앞에 알맞은 전치사를 썼어요.',
        fail: '"~에서" 공부하는 장소를 나타낼 때는 at을 써요. to는 "~으로" 가는 방향이에요.',
      },
    ],
    meaning: [
      { id: 'M1', match: { '0.S': { 'word.sem': 'mina' } }, pass: '주인공이 "미나"예요.', fail: '공부하는 사람은 미나 한 명이에요. 주어 방을 확인해 보세요.' },
      { id: 'M2', any: ['0.front', '0.end'], expect: { 'word.sem': 'always' }, pass: '"항상"이라는 뜻이 담겼어요.', fail: '미나는 "항상" 공부해요. 그 뜻을 가진 장식이 있는지 확인해 보세요.' },
      { id: 'M3', any: ['0.front', '0.end'], expect: { 'word.sem': 'library' }, pass: '"도서관에서"라는 뜻이 담겼어요.', fail: '미나가 공부하는 곳이 어디인지 확인해 보세요.' },
      { id: 'M4', match: { '0.V': { 'word.sem': 'study' }, '0.O': { 'word.sem': 'english' } }, pass: '"영어를 공부한다"는 뜻이 잘 전달돼요.', fail: '미나가 무엇을 하는지 동사 방과 목적어 방을 확인해 보세요.' },
    ],
    condition: [
      { id: 'C1', match: { '0.V': { 'finite.tense': 'present' } }, pass: '동사 방을 "지금 자재"(현재)로 세웠어요.', fail: '늘 하는 일은 현재 시제로 나타내요. 동사의 형태를 확인해 보세요.' },
    ],
  },

  hints: {
    steps: [
      '장식 방 두 곳에 놓을 단어는 "항상"과 "도서관"이에요. 각각 어느 방이 어울릴지 생각해 보세요.',
      '빈도(얼마나 자주)를 나타내는 말은 보통 일반동사 바로 앞에, 장소(어디서)를 나타내는 말은 보통 문장 끝에 와요.',
      '"Mina always studies …"와 "Mina at the library studies …"를 소리 내어 비교해 보세요. study에 -s를 붙일 때의 철자, 언어 이름 앞의 관사도 확인해 보세요.',
    ],
  },
};
