import { useState } from 'react';
import { getCards, ROLE_LABELS, sentenceText } from '../game/analyzeSentence.js';

// 내가 만든 문장. 카드를 누르면 고른 상태가 되고, 옆 버튼으로 순서를 바꾸거나 뺄 수 있다.
// 제출 결과에서 문제가 있었던 카드에는 "!" 표시를 붙인다.
export default function SentenceBoard({ level, selected, errorCardIds, onRemove, onMove, showRoles }) {
  const [active, setActive] = useState(null);
  const cards = getCards(level, selected);
  const activeIndex = active !== null && active < cards.length ? active : null;

  const move = (delta) => {
    onMove(activeIndex, delta);
    setActive(activeIndex + delta);
  };
  const remove = () => {
    onRemove(activeIndex);
    setActive(null);
  };

  return (
    <div className="sentence">
      <div className="sentence-board" role="list" aria-label="내가 만든 문장">
        {cards.length === 0 && <span className="muted">아래 카드를 눌러 문장을 조립해 보세요.</span>}
        {cards.map((card, i) => {
          const hasError = errorCardIds.includes(card.id);
          return (
            <button
              key={card.id}
              type="button"
              role="listitem"
              className={`word-card placed role-${card.role}${i === activeIndex ? ' is-active' : ''}${hasError ? ' has-error' : ''}`}
              onClick={() => setActive(i === activeIndex ? null : i)}
              aria-pressed={i === activeIndex}
              aria-label={`${i + 1}번째 카드 ${card.text}${hasError ? ', 확인 필요' : ''}`}
            >
              {hasError && <span className="error-dot" aria-hidden="true">!</span>}
              {card.text}
              {showRoles && <span className="role-chip">{ROLE_LABELS[card.role]}</span>}
            </button>
          );
        })}
      </div>

      <div className="sentence-foot">
        <p className="sentence-preview" aria-live="polite">
          {cards.length > 0 ? sentenceText(cards) : ' '}
        </p>
        {activeIndex !== null && (
          <div className="chip-controls">
            <button type="button" className="btn btn-small btn-ghost" disabled={activeIndex === 0} onClick={() => move(-1)}>
              ◀ 앞으로
            </button>
            <button
              type="button"
              className="btn btn-small btn-ghost"
              disabled={activeIndex === cards.length - 1}
              onClick={() => move(1)}
            >
              뒤로 ▶
            </button>
            <button type="button" className="btn btn-small btn-ghost" onClick={remove}>
              빼기 ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
