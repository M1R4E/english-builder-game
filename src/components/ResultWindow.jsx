import { CATEGORY_LABELS } from '../config.js';
import { getCards, sentenceText } from '../game/analyzeSentence.js';
import Stars from './Stars.jsx';
import Window from './Window.jsx';

// 점검 결과의 상태 표시: 색과 함께 글자 배지로 구분한다 (색만으로 구분하지 않기).
const STATUS = {
  pass: { tag: '통과', cls: 'ok' },
  partial: { tag: '부분 통과', cls: 'info' },
  fail: { tag: '고칠 점', cls: 'warn' },
  skipped: { tag: '확인 보류', cls: 'mute' },
  blocked: { tag: '확인 못 함', cls: 'mute' },
};

// 제출 결과 "점검 보고서" 창. 3D 건물 위에 뜨고, X 또는 확인 버튼으로 닫으면 문장 고치기로 돌아간다.
// 문장 점수(문장의 질)와 예측 비교(자기평가)는 서로 다른 칸에 나눠 보여 준다.
export default function ResultWindow({ level, attempt, reward, attemptCount, onEdit, onExit }) {
  const { result } = attempt;
  const sentence = sentenceText(getCards(level, attempt.ids));

  // 고칠 점을 먼저, 그다음 통과 항목을 보여 준다.
  const order = { fail: 0, partial: 1, skipped: 2, blocked: 3, pass: 4 };
  const checks = [...result.checks].sort((a, b) => order[a.status] - order[b.status]);

  const headline = result.perfect
    ? '완벽하게 완공했어요!'
    : reward.completed
      ? '완공했어요! 조금 더 다듬을 수 있어요.'
      : '아직 공사 중이에요. 조금만 더 다듬어 볼까요?';

  return (
    <Window title="점검 보고서" onClose={onEdit} className="result-window">
      <section className="report-summary">
        <p className="result-title">{headline}</p>
        <p className="result-sentence">“{sentence}”</p>
        <div className="score-line">
          <span className="score-big">{result.total}</span>
          <span className="score-max">/ 100점</span>
          <Stars count={reward.stars} />
        </div>
        {attemptCount > 1 && (
          <p className="muted small">
            {attemptCount}번째 제출 · 지금까지 최고 {reward.best}점
          </p>
        )}

        <div className="category-bars">
          {Object.entries(result.categories).map(([cat, { earned, max }]) => (
            <div className="cat-row" key={cat}>
              <span className="cat-label">{CATEGORY_LABELS[cat]}</span>
              <span className="cat-bar" aria-hidden="true">
                <span style={{ width: `${(earned / max) * 100}%` }} />
              </span>
              <span className="cat-num">
                {earned} / {max}
              </span>
            </div>
          ))}
          <div className={`cat-row penalty-row${result.penalty > 0 ? ' has-penalty' : ''}`}>
            <span className="cat-label">필수 성분</span>
            <span className="penalty-text">{result.penalty > 0 ? `${result.missing.length}개 빠짐` : '모두 갖춤'}</span>
            <span className="cat-num">{result.penalty > 0 ? `−${result.penalty}` : '감점 없음'}</span>
          </div>
        </div>
      </section>

      <section className="report-section">
        <h3>점검 결과</h3>
        <ul className="check-list">
          {result.missing.map((m) => (
            <li key={`missing-${m.clause}-${m.role}`} className="check check-missing">
              <span className="state-tag danger">성분 빠짐</span>
              <span className="check-text">{m.message}</span>
              <span className="check-points">−{m.penalty}</span>
            </li>
          ))}
          {checks.map((c) => (
            <li key={c.id} className={`check check-${c.status}`}>
              <span className={`state-tag ${STATUS[c.status].cls}`}>{STATUS[c.status].tag}</span>
              <span className="check-text">{c.message}</span>
              <span className="check-points">
                {c.earned}/{c.points}
              </span>
            </li>
          ))}
        </ul>
        {result.perfect && <p className="muted small">대표 정답: {level.answers.main}</p>}
      </section>

      <section className="report-section metacog">
        <h3>내 예상과 비교하기</h3>
        <div className="metacog-row">
          <div>
            <span className="muted small">시작 전 예상</span>
            <b>{reward.prediction}점</b>
          </div>
          <div>
            <span className="muted small">첫 제출 점수</span>
            <b>{reward.first}점</b>
          </div>
          <div>
            <span className="muted small">차이</span>
            <b>{reward.predictionDiff}점</b>
          </div>
        </div>
        <p>
          {reward.predictionDirection === 'exact' && '예상과 실제 점수가 똑같아요.'}
          {reward.predictionDirection === 'over' && '예상보다 실제 점수가 낮았어요. 어떤 부분을 놓쳤는지 점검 결과를 살펴보세요.'}
          {reward.predictionDirection === 'under' && '예상보다 실제 점수가 높았어요. 생각보다 잘 알고 있었네요.'}
        </p>
        <p className="badges">
          {reward.predictionBadge && <span className="badge">{reward.predictionBadge}</span>}
          {reward.persistedBadge && <span className="badge">끝까지 수정해 완공</span>}
        </p>
        <p className="muted small">예측 비교는 문장 점수와 따로 기록되며, 문장 점수에는 영향을 주지 않아요.</p>
      </section>

      <div className="window-actions">
        <button type="button" className="btn btn-ghost" onClick={onExit}>
          레벨 목록
        </button>
        <button type="button" className="btn btn-primary" onClick={onEdit}>
          {result.perfect ? '확인' : '확인하고 문장 고치기'}
        </button>
      </div>
    </Window>
  );
}
