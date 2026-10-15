import { useEffect, useRef, useState } from 'react';
import { ROLE_LABELS } from '../game/analyzeSentence.js';
import Window from './Window.jsx';

const STAMP_MS = 900; // 도장 찍는 연출 시간

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
};

// 건축 주문서 (영수증·견적서 모양 종이).
//  mode 'accept' : 레벨 시작 전. 예상 점수(견적)를 정하고 "수락" 도장을 눌러 공사를 시작한다.
//  mode 'view'   : 플레이 중 다시 보기. 이미 찍힌 도장이 보이고, X 또는 확인으로 닫는다.
export default function OrderSheet({ level, mode, prediction, onPredictionChange, onAccept, onClose, result }) {
  const [stamping, setStamping] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const accepted = mode === 'view' || stamping;
  const clauses = level.structure.clauses;
  const pillarCount = clauses.reduce((n, c) => n + c.slots.length, 0);
  const slotNames = [...new Set(clauses.flatMap((c) => c.slots))].map((r) => ROLE_LABELS[r]).join('·');

  const stamp = () => {
    if (stamping) return;
    setStamping(true);
    // 움직임 줄이기 설정을 켠 사용자는 연출을 짧게
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    timer.current = setTimeout(onAccept, reduce ? 150 : STAMP_MS);
  };

  return (
    <Window variant="paper" labelledBy="order-title" onClose={mode === 'view' ? onClose : undefined}>
      <div className={`receipt${stamping ? ' is-stamping' : ''}`}>
        <header className="receipt-head">
          <p className="receipt-kicker">WORK ORDER</p>
          <h2 id="order-title" className="receipt-title">건축 주문서</h2>
          <div className="receipt-meta">
            <span>No. {String(level.id).padStart(4, '0')}</span>
            <span>{today()}</span>
          </div>
          <div className="receipt-meta">
            <span>의뢰인</span>
            <span>{level.client}</span>
          </div>
        </header>

        <hr className="receipt-rule" />

        <section className="receipt-block">
          <h3>공사 내용</h3>
          <p>{level.request}</p>
          <h3>완성할 문장의 뜻</h3>
          <p className="receipt-strong">{level.meaningKo}</p>
        </section>

        <hr className="receipt-rule" />

        <table className="receipt-items">
          <thead>
            <tr>
              <th>품목</th>
              <th>수량</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>층 (절)</td>
              <td>{clauses.length}</td>
            </tr>
            <tr>
              <td>필수 기둥·칸 ({slotNames})</td>
              <td>{pillarCount}</td>
            </tr>
          </tbody>
        </table>

        {level.conditions?.length > 0 && (
          <>
            <hr className="receipt-rule" />
            <section className="receipt-block">
              <h3>특별 조건</h3>
              <ul className="receipt-conditions">
                {level.conditions.map((cond) => {
                  const status = result?.checks.find((c) => c.id === cond.checkId)?.status;
                  return (
                    <li key={cond.id}>
                      <span className="receipt-box" aria-hidden="true">
                        {status === 'pass' ? '✓' : ''}
                      </span>
                      <span>
                        {cond.text}{' '}
                        {status === 'pass' && <span className="state-tag ok">충족</span>}
                        {status && status !== 'pass' && <span className="state-tag warn">다시 확인</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}

        <hr className="receipt-rule receipt-rule-double" />

        {/* 견적(예상 점수)과 수락 도장을 나란히 둔다 */}
        <section className="receipt-sign">
          <div className="receipt-estimate">
            <div className="receipt-total">
              <span>내 예상 점수 (견적)</span>
              <b>{prediction}점</b>
            </div>
            {mode === 'accept' && (
              <>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={prediction}
                  disabled={stamping}
                  onChange={(e) => onPredictionChange(Number(e.target.value))}
                  aria-label="예상 점수"
                  className="slider"
                />
                <p className="receipt-note">
                  * 받을 것 같은 점수를 정해 보세요. 실제 결과와 비교해 보기 위한 것이며, 문장 점수에는 영향이 없습니다.
                </p>
                <p className="receipt-note receipt-cta">도장을 눌러 주문을 수락하면 공사가 시작됩니다. →</p>
              </>
            )}
          </div>

          <div className="receipt-stamp-area">
            {mode === 'accept' && !stamping && (
              <button type="button" className="stamp-button" onClick={stamp} aria-label="수락 도장 찍기">
                <span className="stamp-face">
                  <span className="stamp-big">수락</span>
                  <span className="stamp-small">ACCEPTED</span>
                </span>
              </button>
            )}
            {accepted && (
              <div className="stamp-mark" aria-hidden={mode === 'accept'}>
                <span className="stamp-big">수락</span>
                <span className="stamp-small">{today()}</span>
              </div>
            )}
          </div>
        </section>

        {mode === 'view' && (
          <button type="button" className="btn btn-primary btn-wide receipt-ok" onClick={onClose}>
            확인
          </button>
        )}
        <div className="receipt-edge" aria-hidden="true" />
      </div>
    </Window>
  );
}
