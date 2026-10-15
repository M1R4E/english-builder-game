// 레벨 1: 주어와 동사로 이루어진 기본 문장
//
// ── 레벨 데이터 작성법 (모든 레벨 공통) ──
// 카드
//  role   : 문장 성분 (S 주어, V 동사, O 목적어, C 보어, M 수식어, CONJ 접속사)
//  slots  : (선택) 이 카드를 놓을 수 있는 자리 key 목록. 없으면 같은 성분의 모든 자리에 놓을 수 있다.
//  sem    : 뜻 꼬리표 (의미 채점에 사용)
//  person / number : 주어의 인칭(1·2·3)과 수(sg 단수, pl 복수)
//  agree  : 동사가 어울리는 주어 → '3sg'(3인칭 단수만), 'base'(3인칭 단수 이외), 'any'(모두)
//  tense  : 동사의 시제 (present 현재, past 과거)
//  gloss  : 단어 뜻 (단어 뜻 보기 설정에서 사용)
//  그 밖의 꼬리표(form, kind 등)는 레벨마다 채점 항목에서 자유롭게 쓴다.
//
// 건물 구조(structure) → src/game/slots.js 설명 참고
//  자리 key: '0-S'(1층 주어 기둥), '0-M-how'(1층 장식), 'L0'(계단) …
//  주어·동사·목적어·보어 자리와 계단은 필수. 비어 있으면 빈자리 하나마다 40점을 별도로 감점한다.
//
// 채점 항목(checks)
//  각 항목은 한 가지 범주(category)에만 속한다. → 같은 실수를 두 범주에서 깎지 않는다.
//  requires  : 이 항목을 확인하는 데 필요한 자리 key. 비어 있으면 '확인 못 함'(감점 없음)이 된다.
//  dependsOn(All) : 앞 항목이 통과해야 확인할 수 있는 항목. 앞 항목이 실패하면 '확인 보류'(0점)가 된다.
//  target    : 실패했을 때 건물에 "!" 표시를 띄울 자리 key
//
// 정답(answers.accepted): 미리 검증한 정답 배치. 자리 key → 카드 id. 같은 뜻의 다른 정답도 모두 적는다.

export default {
  id: 1,
  title: '고양이의 낮잠 집',
  difficulty: 1,
  topic: '주어 + 동사',
  client: '낮잠 좋아하는 고양이 씨',

  // ── 주문서에 들어가는 글 ──
  //  request  : 공사 내용. 이야기(스토리)만 쓴다.
  //  buildNote: 시공 안내. 게임 조작 설명은 여기에 따로 쓴다.
  //  meaning  : 완성할 문장의 뜻. text가 가장 크게 보이고, details는 그 아래에 나열된다.
  request: '햇볕 잘 드는 골목 끝에 사는 고양이 씨가 낮잠 잘 집을 주문했어요. 혼자 쓰기 좋은 작고 아늑한 1층 집이면 충분하대요.',
  buildNote: '고양이 씨가 평소에 하는 일을 영어 문장 하나로 지어요. 건물의 주어 기둥과 동사 기둥을 차례로 누르고, 각 기둥에 알맞은 단어 카드를 골라 세워 주세요.',
  meaning: {
    text: '그 고양이는 잠을 잔다.',
    details: ['고양이는 한 마리예요.', '평소에 늘 하는 일이에요.'],
  },
  // 특별 요청 사항
  //  text   : 의뢰인의 요청. 건축 공사에 빗대어 쓴다.
  //  grammar: 그 요청이 영어 문장에서 무엇을 뜻하는지 (주문서에서 요청 아래에 작게 표시)
  conditions: [
    {
      id: 'present',
      text: '고양이 씨는 이 집에서 매일 낮잠을 자요. 동사 기둥은 지난 공사에서 남은 "옛날 자재" 말고, 매일 쓰는 "지금 자재"로 세워 주세요.',
      grammar: '평소에 늘 하는 일이므로, 동사를 현재 시제로 써요.',
      checkId: 'C1',
    },
  ],

  // 비계(도움) 설정: 초반 레벨이라 자재 판에 문장 성분 이름을 보여 준다.
  scaffold: { showRoles: true },

  cards: [
    { id: 'the-cat', text: 'the cat', role: 'S', sem: 'cat', person: 3, number: 'sg', gloss: '그 고양이 (한 마리)' },
    { id: 'the-cats', text: 'the cats', role: 'S', sem: 'cat', person: 3, number: 'pl', gloss: '그 고양이들 (여러 마리)' },
    { id: 'sleep', text: 'sleep', role: 'V', sem: 'sleep', tense: 'present', agree: 'base', gloss: '자다' },
    { id: 'slept', text: 'slept', role: 'V', sem: 'sleep', tense: 'past', agree: 'any', gloss: '잤다' },
    { id: 'sleeps', text: 'sleeps', role: 'V', sem: 'sleep', tense: 'present', agree: '3sg', gloss: '자다 (-s가 붙은 형태)' },
  ],

  // 층(절)마다의 자리. 필수 자리가 모두 채워지면 그 층의 방이 완성되고 지붕이 나타난다.
  structure: {
    clauses: [{ slots: ['S', 'V'] }],
  },

  answers: {
    main: 'The cat sleeps.',
    accepted: [{ '0-S': 'the-cat', '0-V': 'sleeps' }],
  },

  checks: [
    {
      id: 'G1', category: 'grammar', points: 15, type: 'roleOrder', clause: 0, order: ['S', 'V'], target: '0-V',
      requires: ['0-S', '0-V'],
      pass: '주어 기둥 → 동사 기둥 순서로 섰어요.',
      fail: '영어 문장은 보통 주어가 동사보다 먼저 와요.',
    },
    {
      id: 'G2', category: 'grammar', points: 15, type: 'agreement', clause: 0, target: '0-V',
      requires: ['0-S', '0-V'],
      pass: '주어와 동사의 모양이 서로 잘 맞아요.',
      fail: '주어가 한 명·한 마리(3인칭 단수)일 때, 현재형 동사의 모양이 어떻게 되는지 확인해 보세요.',
    },
    {
      id: 'M1', category: 'meaning', points: 15, type: 'roleMatches', clause: 0, role: 'S',
      match: { sem: 'cat', number: 'sg' }, target: '0-S', requires: ['0-S'],
      pass: '"고양이 한 마리"라는 뜻이 잘 전달돼요.',
      fail: '의뢰는 고양이 "한 마리"에 대한 이야기예요. 주어가 몇 마리를 뜻하는지 확인해 보세요.',
    },
    {
      id: 'M2', category: 'meaning', points: 15, type: 'roleMatches', clause: 0, role: 'V',
      match: { sem: 'sleep' }, target: '0-V', requires: ['0-V'],
      pass: '"잠을 잔다"라는 행동이 잘 전달돼요.',
      fail: '고양이가 하는 행동이 의뢰 내용과 같은지 확인해 보세요.',
    },
    {
      id: 'C1', category: 'condition', points: 25, type: 'roleMatches', clause: 0, role: 'V',
      match: { tense: 'present' }, target: '0-V', requires: ['0-V'],
      pass: '"지금 자재"(현재 시제)로 세워 달라는 요청을 지켰어요.',
      fail: '평소에 늘 하는 일은 현재 시제로 나타내요. 동사 기둥의 시제를 확인해 보세요.',
    },
    {
      id: 'N1', category: 'naturalness', points: 5, type: 'noExtraCards',
      pass: '필요 없는 카드 없이 깔끔해요.',
      fail: '같은 역할의 카드가 겹쳐 있어요. 꼭 필요한 카드만 남겨 보세요.',
    },
    {
      id: 'N2', category: 'naturalness', points: 10, partialPoints: 5, type: 'verifiedAnswer',
      dependsOnAll: true,
      pass: '미리 검증한 자연스러운 문장과 일치해요.',
      partial: '오류는 찾지 못했지만, 미리 검증한 답안 목록에 없는 표현이라 자연스러움은 확실히 판단하지 못했어요.',
    },
  ],

  hints: {
    steps: [
      '의뢰 내용에서 "누가"와 "무엇을 하나"를 찾아보세요. 각각 어떤 기둥과 연결될까요?',
      '주어 기둥에는 "누가"를, 동사 기둥에는 "무엇을 하나"를 세워요. 주인공이 한 마리인지 여러 마리인지, 평소의 일인지 지난 일인지도 확인해 보세요.',
      '주어가 3인칭 단수(그·그녀·그것, 고양이 한 마리)이고 현재형이면, 일반동사 끝에 보통 -s가 붙어요. sleep · sleeps · slept 중 무엇이 알맞을지 비교해 보세요.',
    ],
  },
};
