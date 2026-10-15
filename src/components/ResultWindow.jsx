import { useEffect, useMemo, useState } from 'react';
import { CATEGORY_LABELS, ESTIMATE_PENALTY_RATE, ESTIMATE_TOLERANCE, FIREWORKS_THRESHOLD } from '../config.js';
import { sentenceText } from '../game/analyzeSentence.js';
import { formatWon, MAX_WON, toWon, wonText } from '../game/money.js';
import Fireworks from './Fireworks.jsx';
import Window from './Window.jsx';

// 점검 결과의 상태 표시: 색과 함께 글자 배지로 구분한다 (색만으로 구분하지 않기).
const STATUS = {
  pass: { tag: '통과', cls: 'ok' },
  partial: { tag: '부분 통과', cls: 'info' },
  fail: { tag: '고칠 점', cls: 'warn' },
  skipped: { tag: '확인 보류', cls: 'mute' },
  blocked: { tag: '확인 못 함', cls: 'mute' },
};

const STAR_GAP_MS = 350; // 별이 하나씩 나타나는 간격
const BAR_GAP_MS = 150; // 그래프 막대가 차례로 그려지는 간격

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// 성취 수준에 따른 문구
function headlineOf(total, perfect, completed) {
  if (perfect) return '완벽한 시공이에요!';
  if (total >= 85) return '훌륭하게 완공했어요!';
  if (completed) return '완공했어요! 조금 더 다듬을 수 있어요.';
  return '아직 공사 중이에요. 조금만 더 다듬어 볼까요?';
}

// 숫자가 0부터 목표값까지 올라가는 효과
function useCountUp(target, active, duration) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return undefined;
    if (duration === 0) {
      setValue(target);
      return undefined;
    }
    let raf;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return value;
}

// 제출 결과 "점검 보고서" 창. 항목들이 차례대로 나타난다.
//  1 성취 문구 → 2 청구 금액(숫자가 올라감) → 3 별(하나씩) → 4 항목별 그래프(그려짐, 높은 점수면 폭죽)
//  → 5 필수 성분 → 6 점검 결과(빠르게 페이드 인) → 7 내 견적과 비교하기 → 8 최종 공사 대금 → 9 버튼
// X 또는 확인 버튼으로 닫으면 문장 고치기로 돌아간다. "바로 보기"를 누르면 연출을 건너뛴다.
export default function ResultWindow({ level, attempt, reward, attemptCount, onEdit, onExit }) {
  const { result } = attempt;
  const sentence = sentenceText(level, attempt.placed);

  // 고칠 점을 먼저, 그다음 통과 항목을 보여 준다.
  const order = { fail: 0, partial: 1, skipped: 2, blocked: 3, pass: 4 };
  const checks = [...result.checks].sort((a, b) => order[a.status] - order[b.status]);
  const listItems = result.missing.length + checks.length;

  // 각 단계가 시작되는 시각(ms)
  const times = useMemo(() => {
    const t = [];
    let now = 250;
    t.push(now); // 1 성취 문구
    now += 550;
    t.push(now); // 2 청구 금액
    now += 900;
    t.push(now); // 3 별
    now += Math.max(reward.stars, 1) * STAR_GAP_MS + 250;
    t.push(now); // 4 그래프 (+ 폭죽)
    now += 4 * BAR_GAP_MS + 650;
    t.push(now); // 5 필수 성분
    now += 600;
    t.push(now); // 6 점검 결과
    now += 400 + listItems * 50;
    t.push(now); // 7 내 견적과 비교하기
    now += 500;
    t.push(now); // 8 최종 공사 대금
    now += 450;
    t.push(now); // 9 버튼
    return t;
  }, [reward.stars, listItems]);
  const LAST = times.length;

  const [stage, setStage] = useState(() => (reduceMotion() ? LAST : 0));
  const [skipped, setSkipped] = useState(() => reduceMotion());
  useEffect(() => {
    if (skipped) return undefined;
    const timers = times.map((t, i) => setTimeout(() => setStage((s) => Math.max(s, i + 1)), t));
    return () => timers.forEach(clearTimeout);
  }, [times, skipped]);
  const skip = () => {
    setSkipped(true);
    setStage(LAST);
  };
  const shown = (k) => (stage >= k ? ' is-shown' : '');

  const amount = useCountUp(toWon(result.total), stage >= 2, skipped ? 0 : 700);
  const fireworks = stage >= 4 && result.total >= FIREWORKS_THRESHOLD;

  return (
    <Window title="점검 보고서" onClose={onEdit} className="result-window">
      {fireworks && <Fireworks />}

      <section className="report-summary">
        <p className={`result-title reveal${shown(1)}`}>{headlineOf(result.total, result.perfect, reward.completed)}</p>
        <p className={`result-sentence reveal${shown(1)}`}>“{sentence}”</p>

        <div className={`amount-line reveal${shown(2)}`}>
          <span className="amount-label">청구 금액</span>
          <span className="amount-big">{formatWon(amount)}</span>
          <span className="amount-max">/ {formatWon(MAX_WON)}</span>
        </div>
        {attemptCount > 1 && (
          <p className={`muted small reveal${shown(2)}`}>
            {attemptCount}번째 점검 · 지금까지 가장 높은 청구 금액 {wonText(reward.best)}
          </p>
        )}

        <div className={`star-line reveal${shown(3)}`} aria-label={`별 ${reward.stars}개`}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`star${i < reward.stars ? ' on' : ''}${stage >= 3 && i < reward.stars ? ' pop' : ''}`}
              style={{ animationDelay: skipped ? '0ms' : `${i * STAR_GAP_MS}ms` }}
            >
              {i < reward.stars ? '★' : '☆'}
            </span>
          ))}
        </div>

        <div className={`category-bars reveal${shown(4)}`}>
          {Object.entries(result.categories).map(([cat, { earned, max }], i) => (
            <div className="cat-row" key={cat}>
              <span className="cat-label">{CATEGORY_LABELS[cat]}</span>
              <span className="cat-bar" aria-hidden="true">
                <span
                  style={{
                    width: stage >= 4 ? `${(earned / max) * 100}%` : '0%',
                    transitionDelay: skipped ? '0ms' : `${i * BAR_GAP_MS}ms`,
                  }}
                />
              </span>
              <span className="cat-num">
                {toWon(earned).toLocaleString('ko-KR')} / {wonText(max)}
              </span>
            </div>
          ))}
        </div>
        <div className={`cat-row penalty-row reveal${shown(5)}${result.penalty > 0 ? ' has-penalty' : ''}`}>
          <span className="cat-label">필수 성분</span>
          <span className="penalty-text">{result.penalty > 0 ? `${result.missing.length}개 빠짐` : '모두 갖춤'}</span>
          <span className="cat-num">{result.penalty > 0 ? `−${wonText(result.penalty)}` : '차감 없음'}</span>
        </div>
      </section>

      <section className={`report-section reveal-list${shown(6)}`}>
        <h3>점검 결과</h3>
        <ul className="check-list">
          {result.missing.map((m, i) => (
            <li key={`missing-${m.clause}-${m.role}`} className="check check-missing" style={{ '--i': i }}>
              <span className="state-tag danger">성분 빠짐</span>
              <span className="check-text">{m.message}</span>
              <span className="check-points">−{wonText(m.penalty)}</span>
            </li>
          ))}
          {checks.map((c, i) => (
            <li key={c.id} className={`check check-${c.status}`} style={{ '--i': i + result.missing.length }}>
              <span className={`state-tag ${STATUS[c.status].cls}`}>{STATUS[c.status].tag}</span>
              <span className="check-text">{c.message}</span>
              <span className="check-points">{wonText(c.earned)}</span>
            </li>
          ))}
        </ul>
        {result.perfect && (
          <p className="model-answer" style={{ '--i': listItems }}>
            <span className="model-answer-label">대표 정답</span>
            {level.answers.main}
          </p>
        )}
      </section>

      <section className={`report-section metacog reveal-list${shown(7)}`}>
        <h3>내 견적과 비교하기</h3>
        <div className="metacog-row">
          <div style={{ '--i': 0 }}>
            <span className="muted small">예상 청구 비용</span>
            <b>{wonText(reward.prediction)}</b>
          </div>
          <div style={{ '--i': 1 }}>
            <span className="muted small">첫 청구 금액</span>
            <b>{wonText(reward.first)}</b>
          </div>
          <div style={{ '--i': 2 }}>
            <span className="muted small">차이</span>
            <b>{wonText(reward.predictionDiff)}</b>
          </div>
        </div>
        <p style={{ '--i': 3 }}>
          {reward.predictionDirection === 'exact' && '견적과 실제 청구 금액이 똑같아요.'}
          {reward.predictionDirection === 'over' && '견적보다 실제 청구 금액이 적었어요. 어떤 부분을 놓쳤는지 점검 결과를 살펴보세요.'}
          {reward.predictionDirection === 'under' && '견적보다 실제 청구 금액이 많았어요. 생각보다 잘 알고 있었네요.'}
        </p>
        <p className="badges" style={{ '--i': 4 }}>
          {reward.predictionBadge && <span className="badge">{reward.predictionBadge}</span>}
          {reward.persistedBadge && <span className="badge">끝까지 수정해 완공</span>}
        </p>
      </section>

      {/* 최종 공사 대금 = 최고 청구 금액 − 견적 오차 차감 */}
      <section className={`report-section pay reveal-list${shown(8)}`}>
        <h3>최종 공사 대금</h3>
        <ul className="pay-lines">
          <li style={{ '--i': 0 }}>
            <span>{attemptCount > 1 ? '가장 높은 청구 금액' : '청구 금액'}</span>
            <b className="pay-amount">{wonText(reward.best)}</b>
          </li>
          <li style={{ '--i': 1 }} className={reward.estimatePenalty > 0 ? 'has-penalty' : ''}>
            <span>견적 오차 차감</span>
            <b className="pay-amount">
              {reward.estimatePenalty > 0 ? `−${wonText(reward.estimatePenalty)}` : '차감 없음'}
            </b>
          </li>
          <li style={{ '--i': 2 }} className="pay-total">
            <span>최종 공사 대금</span>
            <b className="pay-amount">{wonText(reward.finalPay)}</b>
          </li>
        </ul>
        <p className="muted small" style={{ '--i': 3 }}>
          견적이 첫 청구 금액보다 {wonText(ESTIMATE_TOLERANCE)} 넘게 높으면, 넘은 금액의{' '}
          {Math.round(ESTIMATE_PENALTY_RATE * 100)}%를 공사 대금에서 빼요(1,000원 미만은 빼지 않아요). 문장
          점수(청구 금액)와 별 개수에는 영향을 주지 않아요.
        </p>
      </section>

      {stage < LAST ? (
        <div className="window-actions">
          <button type="button" className="btn btn-ghost btn-small" onClick={skip}>
            바로 보기
          </button>
        </div>
      ) : (
        <div className="window-actions reveal is-shown">
          <button type="button" className="btn btn-ghost" onClick={onExit}>
            우편함으로
          </button>
          <button type="button" className="btn btn-primary" onClick={onEdit}>
            {result.perfect ? '확인' : '확인하고 문장 고치기'}
          </button>
        </div>
      )}
    </Window>
  );
}
