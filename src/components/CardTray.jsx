import { ROLE_LABELS } from '../game/analyzeSentence.js';

// 문장 카드 보관함. 카드를 누르면 문장 끝에 추가된다.
// 이미 쓴 카드는 흐리게 표시하고 다시 누를 수 없다.
// 카드에는 문장 성분(주어/동사 등)을 표시해 건물 기둥과 연결해 볼 수 있게 한다.
export default function CardTray({ level, selected, onAdd, showRoles }) {
  return (
    <div className="card-tray" role="group" aria-label="문장 카드">
      {level.cards.map((card) => {
        const used = selected.includes(card.id);
        return (
          <button
            key={card.id}
            type="button"
            className={`word-card role-${card.role}${used ? ' is-used' : ''}`}
            disabled={used}
            onClick={() => onAdd(card.id)}
            aria-label={`${card.text} 카드${used ? ' (사용 중)' : ' 추가'}`}
          >
            {card.text}
            {showRoles && <span className="role-chip">{ROLE_LABELS[card.role]}</span>}
          </button>
        );
      })}
    </div>
  );
}
