// 레벨 1: 주어와 동사로 이루어진 기본 문장
//
// ── 레벨 데이터 작성법 (모든 레벨 공통) ──
// floors    : 층(절) 목록. 0번이 1층(주절). 층마다 방(문장 성분) 목록 comps와, 2층부터는 아래층과 잇는 계단 link가 있다.
//   comp    : { id, role(S·V·O·C·M), type(np·pp·verb·adj·mod), words(고를 단어), dets·adjs·preps·auxes(선택) }
//             자세한 내용은 src/game/structure.js 맨 위 설명 참고. 단어는 src/data/lexicon.js에 있어야 한다.
// sentence  : (선택) 문장에서의 순서. 예) ['L1', 1, ',', 0] → "When …, …"
// answers   : main(대표 정답 문장), accepted(미리 검증한 정답들. 같은 뜻의 다른 표현도 모두 적는다)
// checks    : meaning(의미 30점), condition(특별 요청 25점), grammar(자동 문법 검사에 더할 항목)
//             항목 모양은 src/game/scoring.js 맨 위 설명 참고. 범주 안에서 점수를 똑같이 나눈다.
// conditions: 주문서의 특별 요청 사항. text(건축 표현) + grammar(문장에서의 뜻) + checkId(s)

export default {
  id: 1,
  title: '고양이의 낮잠 집',
  difficulty: 1,
  topic: '주어 + 동사',
  client: '낮잠 좋아하는 고양이 씨',

  request: '햇볕 잘 드는 골목 끝에 사는 고양이 씨가 낮잠 잘 집을 주문했어요. 혼자 쓰기 좋은 작고 아늑한 집이면 충분하대요.',
  buildNote: '먼저 몇 층짜리 집인지 정하고, 주어 방과 동사 방을 차례로 지어요. 방마다 가구(단어)를 고른 뒤 개수(단수·복수)와 문패(관사) 같은 세부 사항을 정해요.',
  meaning: {
    text: '그 고양이는 잠을 잔다.',
    details: ['고양이는 한 마리예요.', '평소에 늘 하는 일이에요.'],
  },
  conditions: [
    {
      id: 'present',
      short: '동사는 현재 시제',
      text: '고양이 씨는 이 집에서 매일 낮잠을 자요. 동사 방의 기둥은 지난 공사에서 남은 "옛날 자재" 말고, 매일 쓰는 "지금 자재"로 세워 주세요.',
      grammar: '평소에 늘 하는 일이므로, 동사를 현재 시제로 써요.',
      checkId: 'C1',
    },
  ],
  scaffold: { showRoles: true },

  floors: [
    {
      comps: [
        { id: 'S', role: 'S', type: 'np', words: ['dog', 'cat', 'bird', 'rabbit'], dets: ['a', 'the', 'none'] },
        { id: 'V', role: 'V', type: 'verb', words: ['eat', 'sleep', 'run'] },
      ],
    },
  ],

  answers: {
    main: 'The cat sleeps.',
    accepted: [{ '0.S': { word: 'cat', form: 'sg', det: 'the' }, '0.V': { word: 'sleep', form: 's' } }],
  },

  checks: {
    meaning: [
      { id: 'M1', match: { '0.S': { 'word.sem': 'cat' } }, pass: '주인공이 "고양이"예요.', fail: '집의 주인은 누구인가요? 주어 방의 가구(단어)를 확인해 보세요.' },
      { id: 'M2', match: { '0.S': { 'form.number': 'sg' } }, pass: '고양이 "한 마리"라는 뜻이 잘 전달돼요.', fail: '고양이는 한 마리예요. 주어 방의 가구 개수(단수·복수)를 확인해 보세요.' },
      { id: 'M3', match: { '0.S': { 'det.name': ['the', 'none'] } }, pass: '"그" 고양이라는 정해진 대상을 나타냈어요.', fail: '주문서의 "그 고양이"처럼 정해진 대상을 가리킬 때 쓰는 문패(관사)는 무엇일까요?' },
      { id: 'M4', match: { '0.V': { 'word.sem': 'sleep' } }, pass: '"잠을 잔다"는 행동이 잘 전달돼요.', fail: '고양이가 하는 행동이 주문서와 같은지 동사 방을 확인해 보세요.' },
    ],
    condition: [
      { id: 'C1', match: { '0.V': { 'finite.tense': 'present' } }, pass: '"지금 자재"(현재 시제)로 세워 달라는 요청을 지켰어요.', fail: '평소에 늘 하는 일은 현재 시제로 나타내요. 동사의 형태를 확인해 보세요.' },
    ],
  },

  // 생각해 보기(자기 설명): 완공 후 짧은 질문. 점수와 관계없고 기록에만 남는다.
  selfExplain: {
    question: '동사를 sleeps로 쓴 이유는 무엇일까요?',
    options: [
      { text: '주어가 고양이 한 마리이고, 평소의 일(현재)이라서', correct: true },
      { text: '고양이가 어제 잤기 때문에' },
      { text: '주어가 여러 마리라서' },
    ],
    explain: '주어가 3인칭 단수(한 마리)이고 현재 시제이면 일반동사 끝에 -s를 붙여요.',
  },
  // 비교해 보기(대조 학습): 비슷하지만 뜻이나 문법이 다른 문장. mine: 이번 정답
  contrast: [
    { sentence: 'The cat sleeps.', meaning: '그 고양이는 (평소에) 잔다.', mine: true },
    { sentence: 'The cats sleep.', meaning: '그 고양이들은 (평소에) 잔다.' },
    { sentence: 'The cat slept.', meaning: '그 고양이는 잤다. (지난 일)' },
  ],

  hints: {
    steps: [
      '주문서에서 "누가"와 "무엇을 하나"를 찾아보세요. 문장 하나(주어 + 동사 한 묶음)는 층 하나예요.',
      '주어 방에는 "누가"를, 동사 방에는 "무엇을 하나"를 지어요. 고양이가 한 마리인지, 평소의 일인지 지난 일인지도 확인해 보세요.',
      '주어가 3인칭 단수(그·그녀·그것, 고양이 한 마리)이고 현재형이면 동사 끝에 보통 -s가 붙어요. sleep · sleeps · slept를 비교해 보세요.',
    ],
  },
};
