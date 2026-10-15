import { LEVELS } from '../data/levels/index.js';
import Stars from './Stars.jsx';

// 레벨 선택 화면. 모든 레벨이 처음부터 열려 있다 (기획 결정 ⑤).
export default function LevelSelect({ progress, onSelect }) {
  return (
    <main className="level-select">
      <div className="intro card-box">
        <h2>🏗️ 영어 문장으로 집을 지어요</h2>
        <p>
          건축 의뢰를 읽고 문장 카드를 조립해 보세요. 문장의 <b>주어</b>와 <b>동사</b>는 기둥이 되고,
          한 절의 자리가 모두 채워지면 그 층의 <b>지붕</b>이 올라가요. 다 지었다면 제출해서 점검을 받아요!
        </p>
      </div>

      <ul className="level-list">
        {LEVELS.map(({ level, problems }) => {
          const p = progress[level.id];
          const broken = problems.length > 0;
          return (
            <li key={level.id}>
              <button
                type="button"
                className="level-card"
                disabled={broken}
                onClick={() => onSelect(level.id)}
              >
                <span className="level-num">레벨 {level.id}</span>
                <span className="level-title">{level.title}</span>
                <span className="level-topic">{level.topic}</span>
                <span className="level-status">
                  {broken ? '⚠️ 준비 중 (데이터 점검 필요)' : p?.completed ? '🏠 완공' : p ? '🔧 공사 중' : '🆕 새 의뢰'}
                  {p && <Stars count={p.stars} />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="muted small">레벨 2~10은 3단계에서 추가될 예정이에요.</p>
    </main>
  );
}
