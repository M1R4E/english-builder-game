import { ROLE_LABELS } from '../game/analyzeSentence.js';
import { cardsForSlot } from '../game/slots.js';

// 자재(카드) 판. 지금 고른 자리에 놓을 수 있는 카드만 보여 준다.
// 예) 주어 기둥을 고르면 주어 카드만, 동사 기둥을 고르면 동사 카드만 나타난다.
// 카드를 누르면 그 자리에 놓이고, 이미 놓인 카드를 다시 누르면 빠진다.
export default function CardTray({ level, slot, placed, onPlace, onClearSlot, showRoles }) {
  if (!slot) {
    return (
      <div className="card-tray">
        <p className="tray-empty">
          모든 자리를 채웠어요. 바꾸고 싶은 부품이 있으면 건물이나 위의 공정표에서 눌러 보세요.
        </p>
      </div>
    );
  }

  const current = placed[slot.key];
  const usedElsewhere = new Set(Object.entries(placed).filter(([k]) => k !== slot.key).map(([, id]) => id));

  return (
    <div className="card-tray" role="group" aria-label={`${slot.name}에 놓을 카드`}>
      <div className="tray-head">
        <p className="tray-title">
          <b>{slot.name}</b>에 쓸 {showRoles ? `${ROLE_LABELS[slot.role]} ` : ''}카드를 골라 주세요
        </p>
        {current && (
          <button type="button" className="btn btn-small btn-ghost" onClick={() => onClearSlot(slot.key)}>
            이 자리 비우기
          </button>
        )}
      </div>
      <div className="tray-cards">
        {cardsForSlot(level, slot).map((card) => {
          const chosen = card.id === current;
          const used = usedElsewhere.has(card.id);
          return (
            <button
              key={card.id}
              type="button"
              className={`word-card role-${card.role}${chosen ? ' is-chosen' : ''}${used ? ' is-used' : ''}`}
              disabled={used}
              onClick={() => onPlace(card.id)}
              aria-pressed={chosen}
              aria-label={`${card.text} 카드${chosen ? ' (놓여 있음, 누르면 빼기)' : used ? ' (다른 자리에 사용 중)' : ''}`}
            >
              {card.text}
              {chosen && <span className="role-chip chosen-chip">놓음</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
