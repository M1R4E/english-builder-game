import { lookup, optionLabel } from '../data/lexicon.js';
import { partLabel, stepOptions } from '../game/structure.js';

// 자재(카드) 판. 지금 공정 단계에서 고를 수 있는 것만 보여 준다.
//  예) 주어 방 ① 가구(단어): cat, dog, bird …  → ② 개수: cat / cats → ③ 문패(관사): a / the / (없음)
// 단어를 고르는 단계에서는 뜻을 보여 주지 않는다(의미를 스스로 판단).
// 형태·관사처럼 문법을 고르는 단계의 짧은 설명(예: "과거", "그 (정해진 것)")은 초반 레벨(scaffold.showRoles)에서만 보여 준다.
export default function CardTray({ step, choices, editing, onChoose, onCancelEdit, scaffold = false }) {
  if (!step) {
    return (
      <div className="card-tray">
        <p className="tray-empty">
          모든 공정을 마쳤어요! 아래 제출하기를 눌러 점검을 받아 보세요. 고치고 싶은 방은 건물이나 위의 진행 표시에서 눌러요.
        </p>
      </div>
    );
  }

  const options = stepOptions(step, choices);
  const current = choices[step.key];
  let title;
  if (step.kind === 'floors') {
    title = (
      <>
        <b>몇 층 건물</b>을 지을까요? <span className="tray-note">층 하나 = 절(주어 + 동사 묶음) 하나</span>
      </>
    );
  } else {
    const [part, grammar] = partLabel(step.part, step.type, lookup(choices[`${step.ref}.word`]));
    title = (
      <>
        <b>{step.name}</b> · {part}
        <span className="tray-note">({grammar}) 고르기</span>
      </>
    );
  }
  const showGloss = step.kind === 'floors' || (scaffold && step.part !== 'word' && step.part !== 'adj');

  return (
    <div className="card-tray" role="group" aria-label="고를 수 있는 자재">
      <div className="tray-head">
        <p className="tray-title">{title}</p>
        {editing && (
          <button type="button" className="btn btn-small btn-ghost" onClick={onCancelEdit}>
            고쳐 짓기 그만하기
          </button>
        )}
      </div>
      <div className="tray-cards">
        {options.map(({ value, entry }) => {
          const chosen = value === current;
          return (
            <button
              key={String(value)}
              type="button"
              className={`word-card${chosen ? ' is-chosen' : ''}`}
              onClick={() => onChoose(value)}
              aria-pressed={chosen}
            >
              <span className="word-text">{optionLabel(entry)}</span>
              {showGloss && entry?.gloss && <span className="word-gloss">{entry.gloss}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
