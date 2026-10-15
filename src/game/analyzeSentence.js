// 플레이어가 고른 카드들을 분석해서 "절(층)"로 나누고 성분별로 정리한다.
// React나 Three.js와 관계없는 순수 함수라서 자동 테스트하기 쉽다.

export const CORE_ROLES = ['S', 'V', 'O', 'C']; // 한 절에 하나씩만 있어야 하는 성분

export const ROLE_LABELS = {
  S: '주어',
  V: '동사',
  O: '목적어',
  C: '보어',
  M: '수식어',
  CONJ: '접속사',
};

// 카드 id 목록 → 카드 객체 목록 (없는 id는 건너뛴다)
export function getCards(level, ids) {
  const byId = new Map(level.cards.map((c) => [c.id, c]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}

// 카드 목록 → { clauses: [{ cards, roles }], connectors: [...] }
// 접속사(CONJ)를 만나면 새 절(층)이 시작된다.
// 단, 문장 맨 앞의 접속사(예: When ...)는 새 절을 만들지 않고 바로 뒤 절에 붙는다.
export function analyzeSentence(cards) {
  const clauses = [{ cards: [], leadingConnector: null }];
  const connectors = [];

  for (const card of cards) {
    const current = clauses[clauses.length - 1];
    if (card.role === 'CONJ') {
      if (current.cards.length === 0 && !current.leadingConnector) {
        current.leadingConnector = card;
      } else {
        connectors.push({ card, between: [clauses.length - 1, clauses.length] });
        clauses.push({ cards: [], leadingConnector: null });
      }
    } else {
      current.cards.push(card);
    }
  }

  for (const clause of clauses) {
    clause.roles = {};
    for (const card of clause.cards) {
      (clause.roles[card.role] ||= []).push(card);
    }
  }

  return { clauses, connectors };
}

// 카드 목록 → 화면에 보여 줄 문장 (첫 글자 대문자, 끝에 마침표)
export function sentenceText(cards) {
  if (cards.length === 0) return '';
  let text = '';
  for (const card of cards) {
    const t = card.text;
    text += text === '' || t.startsWith(',') ? t : ` ${t}`;
  }
  text = text.charAt(0).toUpperCase() + text.slice(1);
  return /[.!?]$/.test(text) ? text : `${text}.`;
}
