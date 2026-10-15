import { CATEGORY_LABELS } from '../config.js';
import { getCards, sentenceText } from '../game/analyzeSentence.js';
import Stars from './Stars.jsx';

const STATUS = {
  pass: { icon: '✅', label: '통과' },
  partial: { icon: '◐', label: '부분 통과' },
  fail: { icon: '⚠️', label: '고칠 점' },
  skipped: { icon: '⏸', label: '확인 보류' },
  blocked: { icon: '➖', label: '확인 못 함' },
};

// 제출 결과: 문장 점수(문장의 질)와 예측 비교(자기평가)를 서로 다른 상자에 나눠 보여 준다.
export default function ResultPanel({ level, attempt, reward, attemptCount, onEdit, onExit }) {
  const { result } = attempt;
  const sentence = sentenceText(getCards(level, attempt.ids));

  // 고칠 점을 먼저, 그다음 통과 항목을 보여 준다.
  const order = { fail: 0, partial: 1, skipped: 2, blocked: 3, pass: 4 };
  const checks = [...result.checks].sort((a, b) => order[a.status] - order[b.status]);

  return (
    <div className="result">
      <div className="card-box result-head">
        <p className="result-title">
          {result.perfect ? '🎉 완벽하게 완공했어요!' : reward.completed ? '🏠 완공했어요!' : '🔧 조금만 더 다듬어 볼까요?'}
        </p>
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
            <span className="penalty-text">
              {result.penalty > 0 ? `⚠️ ${result.missing.length}개 빠짐` : '✅ 모두 갖춤'}
            </span>
            <span className="cat-num">{result.penalty > 0 ? `−${result.penalty}` : '감점 없음'}</span>
          </div>
        </div>
      </div>

      <div className="card-box">
        <h2>🔍 점검 결과</h2>
        <ul className="check-list">
          {result.missing.map((m) => (
            <li key={`missing-${m.clause}-${m.role}`} className="check check-fail check-missing">
              <span className="check-icon" aria-hidden="true">🚧</span>
              <span className="check-text">
                <span className="check-status">필수 성분 빠짐</span> {m.message}
              </span>
              <span className="check-points">−{m.penalty}</span>
            </li>
          ))}
          {checks.map((c) => (
            <li key={c.id} className={`check check-${c.status}`}>
              <span className="check-icon" aria-hidden="true">{STATUS[c.status].icon}</span>
              <span className="check-text">
                <span className="check-status">{STATUS[c.status].label}</span> {c.message}
              </span>
              <span className="check-points">
                {c.earned}/{c.points}
              </span>
            </li>
          ))}
        </ul>
        {result.perfect && (
          <p className="muted small">대표 정답: {level.answers.main}</p>
        )}
      </div>

      <div className="card-box metacog">
        <h2>🔮 내 예상과 비교하기</h2>
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
          {reward.predictionBadge && <span className="badge">🎯 {reward.predictionBadge}</span>}
        </p>
        {reward.persistedBadge && <p><span className="badge">💪 끝까지 수정해 완공</span></p>}
        <p className="muted small">예측 비교는 문장 점수와 따로 기록되며, 문장 점수에는 영향을 주지 않아요.</p>
      </div>

      <div className="actions">
        <button type="button" className="btn btn-ghost" onClick={onExit}>
          🗺️ 레벨 목록
        </button>
        <button type="button" className="btn btn-submit" onClick={onEdit}>
          ✏️ 문장 고쳐서 다시 제출
        </button>
      </div>
    </div>
  );
}
