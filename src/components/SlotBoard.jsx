import { useEffect, useRef } from 'react';
import { sentenceText } from '../game/analyzeSentence.js';

// 공정표: 이 건물에 필요한 자리(주어 기둥, 동사 기둥 …)와 각 자리에 놓인 카드.
// 자리를 누르면 그 자리가 선택되고, 아래 카드 판에 그 자리에 맞는 카드만 나타난다.
// (3D 건물의 부품을 직접 눌러도 똑같이 선택된다)
// 제출 결과에서 문제가 있었던 자리에는 "!" 표시를 붙인다.
export default function SlotBoard({ level, slots, placed, activeSlot, errorCardIds, onSelect }) {
  const byId = new Map(level.cards.map((c) => [c.id, c]));
  const boardRef = useRef(null);

  // 좁은 화면에서는 공정표가 가로로 밀리므로, 고르고 있는 자리가 보이도록 옮겨 준다
  useEffect(() => {
    const board = boardRef.current;
    const chip = board?.querySelector('.slot-chip.is-active');
    if (!board || !chip || board.scrollWidth <= board.clientWidth) return;
    const left = chip.getBoundingClientRect().left - board.getBoundingClientRect().left + board.scrollLeft;
    if (left < board.scrollLeft || left + chip.offsetWidth > board.scrollLeft + board.clientWidth) {
      board.scrollTo({ left: left - 12, behavior: 'smooth' });
    }
  }, [activeSlot]);

  return (
    <div className="sentence">
      <div className="slot-board" role="group" aria-label="공정표: 건물의 자리" ref={boardRef}>
        {slots.map((slot) => {
          const card = byId.get(placed[slot.key]);
          const active = slot.key === activeSlot;
          const hasError = card && errorCardIds.includes(card.id);
          return (
            <button
              key={slot.key}
              type="button"
              className={`slot-chip role-${slot.role}${card ? ' is-filled' : ''}${active ? ' is-active' : ''}${
                hasError ? ' has-error' : ''
              }`}
              onClick={() => onSelect(slot.key)}
              aria-pressed={active}
              aria-label={`${slot.name}: ${card ? card.text : '비어 있음'}${hasError ? ', 확인 필요' : ''}`}
            >
              <span className="slot-name">
                {hasError && (
                  <span className="error-dot" aria-hidden="true">
                    !
                  </span>
                )}
                {slot.name}
                {active && <span className="slot-now">고르는 중</span>}
              </span>
              <span className="slot-word">{card ? card.text : '?'}</span>
            </button>
          );
        })}
      </div>
      <p className="sentence-preview" aria-live="polite">
        {sentenceText(level, placed) || ' '}
      </p>
    </div>
  );
}
