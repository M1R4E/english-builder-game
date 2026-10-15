import { useEffect, useMemo, useReducer } from 'react';
import { buildParts } from '../building/buildParts.js';
import { makeBlueprint } from '../building/makeBlueprint.js';
import { computeReward } from '../game/reward.js';
import { createSession, currentResult, sessionReducer } from '../game/session.js';
import BuildingView from './BuildingView.jsx';
import CardTray from './CardTray.jsx';
import HintBox from './HintBox.jsx';
import MissionPanel from './MissionPanel.jsx';
import PredictionPanel from './PredictionPanel.jsx';
import ResultPanel from './ResultPanel.jsx';
import SentenceBoard from './SentenceBoard.jsx';

// 한 레벨을 플레이하는 화면.
// 진행 순서: 예상 점수 입력 → 카드로 문장 조립(건물 변화) → 제출 → 결과 → (고쳐서 다시 제출)
export default function PlayScreen({ level, onExit, onProgress }) {
  const [state, dispatch] = useReducer(sessionReducer, level, createSession);

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

  return (
    <main className="layout">
      <section className="stage" aria-label="3D 건축 화면">
        <BuildingView parts={parts} bounds={bounds} />
        <p className="stage-caption">
          반투명한 <b>?</b> 표시는 아직 비어 있는 자리예요. 드래그해서 돌려 볼 수 있어요.
        </p>
      </section>

      <section className="panel" aria-label="문장 구성 패널">
        <MissionPanel level={level} result={state.phase === 'result' ? lastAttempt.result : null} />

        {state.phase === 'predict' && (
          <PredictionPanel
            value={state.prediction}
            onChange={(value) => dispatch({ type: 'SET_PREDICTION', value })}
            onStart={() => dispatch({ type: 'START', now: Date.now() })}
          />
        )}

        {state.phase === 'build' && (
          <>
            <CardTray
              level={level}
              selected={state.selected}
              showRoles={showRoles}
              onAdd={(id) => dispatch({ type: 'ADD_CARD', id })}
            />
            <SentenceBoard
              level={level}
              selected={state.selected}
              showRoles={showRoles}
              errorCardIds={shownResult?.errorCardIds ?? []}
              onRemove={(index) => dispatch({ type: 'REMOVE_AT', index })}
              onMove={(index, delta) => dispatch({ type: 'MOVE', index, delta })}
            />
            <HintBox steps={level.hints.steps} hintStep={state.hintStep} />
            <div className="actions">
              <button
                type="button"
                className="btn btn-hint"
                disabled={state.hintStep >= hintMax}
                onClick={() => dispatch({ type: 'HINT', maxSteps: hintMax })}
              >
                💡 힌트 {state.hintStep}/{hintMax}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={state.history.length === 0}
                onClick={() => dispatch({ type: 'UNDO' })}
              >
                ↩️ 되돌리기
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={state.selected.length === 0}
                onClick={() => dispatch({ type: 'CLEAR' })}
              >
                🧹 비우기
              </button>
              <button
                type="button"
                className="btn btn-submit"
                disabled={state.selected.length === 0}
                onClick={() => dispatch({ type: 'SUBMIT', level, now: Date.now() })}
              >
                ✅ 제출하기
              </button>
            </div>
          </>
        )}

        {state.phase === 'result' && (
          <ResultPanel
            level={level}
            attempt={lastAttempt}
            reward={reward}
            attemptCount={state.attempts.length}
            onEdit={() => dispatch({ type: 'EDIT' })}
            onExit={onExit}
          />
        )}
      </section>
    </main>
  );
}
