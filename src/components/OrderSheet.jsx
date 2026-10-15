import { useEffect, useRef, useState } from 'react';
import { PREDICTION_STEP, WON_PER_POINT } from '../config.js';
import { formatWon, MAX_WON, toWon } from '../game/money.js';
import { IconPillar, IconPlant, IconRoom, IconStairs } from './Icons.jsx';
import Window from './Window.jsx';

const STAMP_MS = 900; // 도장 찍는 연출 시간

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
};

// 품목 이름과 아이콘 (문장 성분 → 건축 부품)
const ITEM_OF_ROLE = {
  S: { name: '주어 방', Icon: IconPillar },
  V: { name: '동사 방', Icon: IconPillar },
  O: { name: '목적어 방', Icon: IconRoom },
  C: { name: '보어 방', Icon: IconRoom },
  M: { name: '장식 방 (수식어)', Icon: IconPlant },
  CONJ: { name: '접속사 계단', Icon: IconStairs },
};

// 필요한 방 수를 세어 품목 목록을 만든다. 예: 주어 방 1, 동사 방 1
// 층수는 플레이어가 공정 첫 단계에서 직접 정하므로 품목에 적지 않는다.
function itemsOf(level) {
  const counts = { CONJ: level.floors.length - 1 };
  for (const floor of level.floors) for (const comp of floor.comps) counts[comp.role] = (counts[comp.role] ?? 0) + 1;
  return ['S', 'V', 'O', 'C', 'M', 'CONJ']
    .filter((role) => counts[role])
    .map((role) => ({ key: role, ...ITEM_OF_ROLE[role], count: counts[role] }));
}

// 특별 요청 사항의 상태: 연결된 채점 항목이 모두 통과하면 '충족'
function conditionStatus(cond, result) {
  if (!result) return null;
  const statuses = (cond.checkIds ?? [cond.checkId]).map((id) => result.checks.find((c) => c.id === id)?.status);
  return statuses.every((s) => s === 'pass') ? 'pass' : 'fail';
}

// 건축 주문서 (영수증·견적서 모양 종이).
//  mode 'accept' : 레벨 시작 전. 예상 청구 비용(견적)을 정하고 "수락" 도장을 눌러 공사를 시작한다.
//  mode 'view'   : 플레이 중 다시 보기. 이미 찍힌 도장이 보이고, X 또는 확인으로 닫는다.
// prediction은 내부적으로 점수(0~100)이고, 화면에는 돈으로 보여 준다.
export default function OrderSheet({ level, mode, prediction, onPredictionChange, onAccept, onClose, result }) {
  const [stamping, setStamping] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const accepted = mode === 'view' || stamping;

  const stamp = () => {
    if (stamping) return;
    setStamping(true);
    // 움직임 줄이기 설정을 켠 사용자는 연출을 짧게
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    timer.current = setTimeout(onAccept, reduce ? 150 : STAMP_MS);
  };

  return (
    <Window
      variant="paper"
      labelledBy="order-title"
      className={mode === 'accept' ? 'is-arriving' : ''}
      onClose={mode === 'view' ? onClose : undefined}
    >
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
        </section>

        <section className="receipt-block receipt-meaning">
          <h3>완성할 문장의 뜻</h3>
          <p className="meaning-text">{level.meaning.text}</p>
          {level.meaning.details.length > 0 && (
            <ul className="meaning-details">
              {level.meaning.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
        </section>

        <p className="receipt-guide">
          <span className="receipt-guide-label">시공 안내</span>
          {level.buildNote}
        </p>

        <hr className="receipt-rule" />

        <table className="receipt-items">
          <thead>
            <tr>
              <th>품목</th>
              <th>수량</th>
            </tr>
          </thead>
          <tbody>
            {itemsOf(level).map(({ key, name, Icon, count }) => (
              <tr key={key}>
                <td>
                  <span className="item-name">
                    <Icon />
                    {name}
                  </span>
                </td>
                <td>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {level.conditions?.length > 0 && (
          <>
            <hr className="receipt-rule" />
            <section className="receipt-block">
              <h3>특별 요청 사항</h3>
              <ul className="receipt-conditions">
                {level.conditions.map((cond) => {
                  const status = conditionStatus(cond, result);
                  return (
                    <li key={cond.id}>
                      <span className="receipt-box" aria-hidden="true">
                        {status === 'pass' ? '✓' : ''}
                      </span>
                      <span>
                        {cond.text}{' '}
                        {status === 'pass' && <span className="state-tag ok">충족</span>}
                        {status && status !== 'pass' && <span className="state-tag warn">다시 확인</span>}
                        <span className="condition-meaning">
                          <span className="condition-meaning-label">문장에서는</span>
                          {cond.grammar}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}

        <hr className="receipt-rule receipt-rule-double" />

        {/* 견적(예상 청구 비용)과 수락 도장을 나란히 둔다 */}
        <section className="receipt-sign">
          <div className="receipt-estimate">
            <div className="receipt-total">
              <span>예상 청구 비용</span>
              <b>{formatWon(toWon(prediction))}</b>
            </div>
            {mode === 'accept' && (
              <>
                <input
                  type="range"
                  min="0"
                  max={MAX_WON}
                  step={PREDICTION_STEP * WON_PER_POINT}
                  value={toWon(prediction)}
                  disabled={stamping}
                  onChange={(e) => onPredictionChange(Number(e.target.value) / WON_PER_POINT)}
                  aria-label="예상 청구 비용"
                  className="slider"
                />
                <p className="receipt-note">
                  * 이 공사를 마치고 받을 수 있을 것 같은 금액을 적어 보세요. 견적이 첫 청구 금액보다 많이 높을수록
                  최종 공사 대금이 줄어듭니다.
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
