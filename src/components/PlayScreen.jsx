import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { buildParts } from '../building/buildParts.js';
import { makeBlueprint } from '../building/makeBlueprint.js';
import { computeReward } from '../game/reward.js';
import { createSession, currentResult, sessionReducer } from '../game/session.js';
import BuildingView from './BuildingView.jsx';
import CardTray from './CardTray.jsx';
import HintWindow from './HintWindow.jsx';
import OrderSheet from './OrderSheet.jsx';
import ResultWindow from './ResultWindow.jsx';
import SentenceBoard from './SentenceBoard.jsx';

// 요소의 높이를 계속 재는 작은 도구 (화면 크기가 바뀌어도 따라간다)
function useHeight() {
  const ref = useRef(null);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setHeight(el.getBoundingClientRect().height));
    ro.observe(el);
    return () => ro.disconnect();
  });
  return [ref, height];
}

// 한 레벨을 플레이하는 화면.
// 3D 건물이 화면 전체를 차지하고, 그 위에 상단 바·하단 카드 판·창(주문서, 힌트, 결과)이 겹쳐 뜬다.
// 진행 순서: 주문서(예상 점수 → 수락 도장) → 카드로 문장 조립(건물 변화) → 제출 → 점검 보고서 → (고쳐서 다시 제출)
export default function PlayScreen({ level, onExit, onProgress }) {
  const [state, dispatch] = useReducer(sessionReducer, level, createSession);
  const [orderOpen, setOrderOpen] = useState(false); // 플레이 중 주문서 다시 보기
  const [hintOpen, setHintOpen] = useState(false);
  const [topRef, topHeight] = useHeight();
  const [dockRef, dockHeight] = useHeight();

  // 지금 카드가 마지막 제출과 같을 때만 오류 표시를 보여 준다.
  const shownResult = currentResult(state);

  // 카드 상태 → 설계도 → 3D 부품 목록
  const { parts, bounds } = useMemo(
    () => buildParts(makeBlueprint(level, state.selected, shownResult)),
    [level, state.selected, shownResult],
  );

  const scores = state.attempts.map((a) => a.result.total);
  const reward = useMemo(() => computeReward(state.prediction, scores), [state.prediction, scores.join()]);
  const lastAttempt = state.attempts[state.attempts.length - 1];

  // 레벨 목록에 진행 상황(완공 여부, 별)을 알려 준다.
  useEffect(() => {
    if (reward) onProgress(level.id, { completed: reward.completed, stars: reward.stars });
  }, [reward, level.id, onProgress]);

  const showRoles = Boolean(level.scaffold?.showRoles);
  const hintMax = level.hints.steps.length;
  const building = state.phase === 'build';

  const askHint = () => {
    if (state.hintStep < hintMax) dispatch({ type: 'HINT', maxSteps: hintMax });
    setHintOpen(true);
  };

  return (
    <div className="play">
      <BuildingView parts={parts} bounds={bounds} insetTop={topHeight} insetBottom={building ? dockHeight : 0} />

      {/* 상단 바 */}
      <header className="hud-top" ref={topRef}>
        <button type="button" className="btn btn-ghost btn-small" onClick={onExit}>
          ◀ 목록
        </button>
        <div className="hud-title">
          <span className="hud-level">레벨 {level.id}</span>
          <span className="hud-name">{level.title}</span>
        </div>
        <div className="hud-right">
          {state.phase !== 'predict' && (
            <button type="button" className="btn btn-ghost btn-small" onClick={() => setOrderOpen(true)}>
              주문서
            </button>
          )}
          <button type="button" className="btn btn-ghost btn-small" disabled title="4단계에서 연결 예정">
            설정
          </button>
        </div>
      </header>

      {/* 하단 카드 판 */}
      {building && (
        <section className="dock" ref={dockRef} aria-label="문장 조립">
          <div className="dock-row dock-row-sentence">
            <SentenceBoard
              level={level}
              selected={state.selected}
              showRoles={showRoles}
              errorCardIds={shownResult?.errorCardIds ?? []}
              onRemove={(index) => dispatch({ type: 'REMOVE_AT', index })}
              onMove={(index, delta) => dispatch({ type: 'MOVE', index, delta })}
            />
            <div className="dock-actions">
              <button type="button" className="btn btn-hint" onClick={askHint}>
                힌트 {state.hintStep}/{hintMax}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={state.history.length === 0}
                onClick={() => dispatch({ type: 'UNDO' })}
              >
                되돌리기
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={state.selected.length === 0}
                onClick={() => dispatch({ type: 'CLEAR' })}
              >
                비우기
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={state.selected.length === 0}
                onClick={() => {
                  setHintOpen(false);
                  dispatch({ type: 'SUBMIT', level, now: Date.now() });
                }}
              >
                제출하기
              </button>
            </div>
          </div>
          <CardTray
            level={level}
            selected={state.selected}
            showRoles={showRoles}
            onAdd={(id) => dispatch({ type: 'ADD_CARD', id })}
          />
        </section>
      )}

      {building && hintOpen && state.hintStep > 0 && (
        <HintWindow
          steps={level.hints.steps}
          hintStep={state.hintStep}
          bottom={dockHeight + 12}
          onClose={() => setHintOpen(false)}
        />
      )}

      {/* 창: 주문서 (시작 전) */}
      {state.phase === 'predict' && (
        <OrderSheet
          level={level}
          mode="accept"
          prediction={state.prediction}
          onPredictionChange={(value) => dispatch({ type: 'SET_PREDICTION', value })}
          onAccept={() => dispatch({ type: 'START', now: Date.now() })}
        />
      )}

      {/* 창: 주문서 다시 보기 */}
      {orderOpen && state.phase !== 'predict' && (
        <OrderSheet
          level={level}
          mode="view"
          prediction={state.prediction}
          result={lastAttempt?.result}
          onClose={() => setOrderOpen(false)}
        />
      )}

      {/* 창: 점검 보고서 (제출 결과) */}
      {state.phase === 'result' && !orderOpen && (
        <ResultWindow
          level={level}
          attempt={lastAttempt}
          reward={reward}
          attemptCount={state.attempts.length}
          onEdit={() => dispatch({ type: 'EDIT' })}
          onExit={onExit}
        />
      )}
    </div>
  );
}
