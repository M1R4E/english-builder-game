import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { buildParts } from '../building/buildParts.js';
import { makeBlueprint } from '../building/makeBlueprint.js';
import { COMPLETE_THRESHOLD } from '../config.js';
import { computeReward } from '../game/reward.js';
import { scoreSentence } from '../game/scoring.js';
import { buildRecord } from '../game/records.js';
import { createSession, currentResult, currentStep, sessionReducer } from '../game/session.js';
import { DEFAULT_SETTINGS } from '../game/storage.js';
import { isComplete, sentenceText } from '../game/structure.js';
import BuildingView from './BuildingView.jsx';
import CardTray from './CardTray.jsx';
import CompletionCelebration from './CompletionCelebration.jsx';
import HintWindow from './HintWindow.jsx';
import IconButton from './IconButton.jsx';
import { IconBulb, IconGear, IconMailbox, IconTrash, IconUndo } from './Icons.jsx';
import OrderSheet from './OrderSheet.jsx';
import OrderSlip from './OrderSlip.jsx';
import ProgressBar from './ProgressBar.jsx';
import ResultWindow from './ResultWindow.jsx';
import SettingsWindow from './SettingsWindow.jsx';
import Toast from './Toast.jsx';

const DOCK_PEEK = 46; // 카드 판을 끝까지 내렸을 때 보이는 높이 (손잡이 부분)

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

// 카드 판을 손잡이로 잡고 아래로 끌어내리기 (3D 화면을 넓게 보기)
// 손잡이를 누르기만 하면(끌지 않으면) 내리기 ↔ 올리기를 바꾼다.
function useDockDrag(dockHeight) {
  const [collapsed, setCollapsed] = useState(false);
  const [drag, setDrag] = useState(null); // { startY, startOffset, offset }
  const maxOffset = Math.max(0, dockHeight - DOCK_PEEK);
  const offset = drag ? drag.offset : collapsed ? maxOffset : 0;

  const handlers = {
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture?.(e.pointerId);
      setDrag({ startY: e.clientY, startOffset: offset, offset, moved: false });
    },
    onPointerMove: (e) => {
      if (!drag) return;
      const dy = e.clientY - drag.startY;
      setDrag({ ...drag, offset: Math.min(maxOffset, Math.max(0, drag.startOffset + dy)), moved: drag.moved || Math.abs(dy) > 5 });
    },
    onPointerUp: () => {
      if (!drag) return;
      setCollapsed(drag.moved ? drag.offset > maxOffset / 2 : !collapsed);
      setDrag(null);
    },
    onPointerCancel: () => setDrag(null),
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setCollapsed((c) => !c);
      }
    },
  };
  return { offset, collapsed, dragging: Boolean(drag), handlers, expand: () => setCollapsed(false) };
}

// 한 레벨을 플레이하는 화면.
// 3D 건물이 화면 전체를 차지하고, 그 위에 상단 바·하단 카드 판·창(주문서, 힌트, 결과)이 겹쳐 뜬다.
// 진행 순서: 주문서(예상 비용 → 수락 도장) → 공정 순서대로 짓기(층수 → 방 → 계단 → 위층) → 제출
//          → (완공이면 완공 연출) → 점검 보고서 → (고쳐서 다시 제출 / 다음 레벨)
export default function PlayScreen({
  level,
  playId,
  settings = DEFAULT_SETTINGS,
  onSettingsChange,
  onExit,
  onProgress,
  onRecord,
  nextLevel,
  onNext,
}) {
  const [state, dispatch] = useReducer(sessionReducer, level, createSession);
  const [orderOpen, setOrderOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [viewedAnswer, setViewedAnswer] = useState(false); // 정답 예시를 봤는지 (기록용, 감점 없음)
  const [selfExplain, setSelfExplain] = useState(null); // 자기 설명 답 { choice, correct }
  const easy = settings.difficulty === 'easy';
  // 문법 단계의 짧은 설명: 쉬움은 항상, 보통은 초반 레벨만, 어려움은 숨김
  const grammarGloss = easy || (settings.difficulty === 'normal' && Boolean(level.scaffold?.showRoles));
  const [hintOpen, setHintOpen] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [toast, setToast] = useState(null);
  const [topRef, topHeight] = useHeight();
  const [dockRef, dockHeight] = useHeight();
  const dock = useDockDrag(dockHeight);

  const building = state.phase === 'build';
  const step = currentStep(level, state);
  const shownResult = currentResult(level, state);
  const complete = isComplete(level, state.choices);
  const activeUnit = building ? step?.unit ?? null : null;

  // 공정 선택 → 설계도 → 3D 부품 목록
  const { parts, bounds } = useMemo(
    () => buildParts(makeBlueprint(level, state.choices, shownResult, { activeUnit }), { prompts: easy }),
    [level, state.choices, shownResult, activeUnit, easy],
  );

  const scores = state.attempts.map((a) => a.result.total);
  const reward = useMemo(() => computeReward(state.prediction, scores), [state.prediction, scores.join()]);
  const lastAttempt = state.attempts[state.attempts.length - 1];

  useEffect(() => {
    if (reward) onProgress(level.id, { completed: reward.completed, stars: reward.stars, finalPay: reward.finalPay });
  }, [reward, level.id, onProgress]);

  // 학습 기록: 제출할 때마다, 정답 예시를 보거나 자기 설명에 답할 때마다 저장한다
  useEffect(() => {
    if (state.attempts.length === 0 || !onRecord) return;
    onRecord(buildRecord(level, state, { playId, difficulty: settings.difficulty, viewedAnswer, selfExplain }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.attempts.length, viewedAnswer, selfExplain]);

  const say = (text) => setToast({ id: Date.now(), text });
  const endCelebration = useCallback(() => setCelebrating(false), []);
  const clearToast = useCallback(() => setToast(null), []);

  const choose = (value) => {
    if (step?.key === 'floors' && value !== level.floors.length) {
      say('주문서를 다시 읽어 보세요! 이 문장에는 절(주어 + 동사 묶음)이 몇 개 있나요?');
    }
    dispatch({ type: 'CHOOSE', level, value });
  };

  // 3D 건물이나 진행 표시에서 방·계단을 누르면 그 곳을 고쳐 짓는다
  const editUnit = useCallback(
    (unit) => {
      dispatch({ type: 'EDIT_UNIT', level, unit });
      dock.expand();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level],
  );

  const submit = () => {
    if (!complete) {
      say(`아직 건물이 완성되지 않았어요! 지금 공사 중: ${step?.name ?? ''}`);
      return;
    }
    setHintOpen(false);
    if (scoreSentence(level, state.choices).total >= COMPLETE_THRESHOLD) {
      setCelebrating(true);
      setCelebrateKey(state.attempts.length + 1);
    }
    dispatch({ type: 'SUBMIT', level, now: Date.now() });
  };

  const hintMax = level.hints.steps.length;
  const askHint = () => {
    if (state.hintStep < hintMax) dispatch({ type: 'HINT', maxSteps: hintMax });
    setHintOpen(true);
  };
  const visibleDock = building ? Math.max(dockHeight - dock.offset, 0) : 0;
  const preview = sentenceText(level, state.choices);

  return (
    <div className="play">
      <BuildingView
        parts={parts}
        bounds={bounds}
        insetTop={topHeight}
        insetBottom={visibleDock}
        onPick={editUnit}
        celebrateKey={celebrateKey}
      />

      {/* 상단 바 */}
      <header className="hud-top" ref={topRef}>
        <IconButton icon={IconMailbox} label="우편함으로" onClick={onExit} />
        <div className="hud-title">
          <span className="hud-level">레벨 {level.id}</span>
          <span className="hud-name">{level.title}</span>
        </div>
        <div className="hud-right">
          <IconButton icon={IconGear} label="설정" onClick={() => setSettingsOpen(true)} />
        </div>
      </header>
      {state.phase !== 'predict' && <OrderSlip onClick={() => setOrderOpen(true)} />}

      <Toast toast={toast} onDone={clearToast} />

      {/* 하단 카드 판: 손잡이로 끌어내릴 수 있다 */}
      {building && (
        <section
          className={`dock${dock.dragging ? ' is-dragging' : ''}${dock.collapsed ? ' is-collapsed' : ''}`}
          ref={dockRef}
          style={{ transform: `translate(-50%, ${dock.offset}px)` }}
          aria-label="건물 짓기"
        >
          <div
            className="dock-handle"
            role="button"
            tabIndex={0}
            aria-label={dock.collapsed ? '카드 판 올리기' : '카드 판 내리기'}
            {...dock.handlers}
          >
            <span className="dock-grip" aria-hidden="true" />
          </div>
          <ProgressBar
            level={level}
            choices={state.choices}
            current={step}
            errorRefs={shownResult?.errorRefs ?? []}
            onEdit={editUnit}
          />
          <p className="sentence-preview" aria-live="polite">
            {preview || ' '}
          </p>
          <CardTray
            step={step}
            choices={state.choices}
            editing={Boolean(state.editStep)}
            grammarGloss={grammarGloss}
            meanings={settings.showMeanings}
            hideInvalid={easy}
            onChoose={choose}
            onCancelEdit={() => dispatch({ type: 'CANCEL_EDIT' })}
          />
          <div className="dock-tools">
            <IconButton icon={IconBulb} label={`힌트 ${state.hintStep}/${hintMax}`} onClick={askHint} className="tool-hint" />
            <IconButton
              icon={IconUndo}
              label="되돌리기"
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={state.history.length === 0}
            />
            <IconButton
              icon={IconTrash}
              label="비우기"
              onClick={() => dispatch({ type: 'CLEAR' })}
              disabled={Object.keys(state.choices).length === 0}
            />
          </div>
          <button type="button" className={`btn btn-primary btn-wide submit${complete ? '' : ' is-waiting'}`} onClick={submit}>
            제출하기
          </button>
        </section>
      )}

      {building && hintOpen && state.hintStep > 0 && (
        <HintWindow
          steps={level.hints.steps}
          hintStep={state.hintStep}
          bottom={visibleDock + 12}
          onClose={() => setHintOpen(false)}
        />
      )}

      {/* 창: 설정 (게임 중에도 바꿀 수 있다) */}
      {settingsOpen && (
        <SettingsWindow settings={settings} onChange={onSettingsChange} onClose={() => setSettingsOpen(false)} />
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

      {/* 완공 연출 (건물 완공! + 폭죽) → 끝나면 점검 보고서 */}
      {state.phase === 'result' && celebrating && <CompletionCelebration onDone={endCelebration} />}

      {/* 창: 점검 보고서 (제출 결과) */}
      {state.phase === 'result' && !celebrating && !orderOpen && (
        <ResultWindow
          key={state.attempts.length} // 제출할 때마다 연출을 처음부터 다시
          level={level}
          attempt={lastAttempt}
          reward={reward}
          attemptCount={state.attempts.length}
          onEdit={() => dispatch({ type: 'EDIT' })}
          onExit={onExit}
          viewedAnswer={viewedAnswer}
          onViewAnswer={() => setViewedAnswer(true)}
          selfExplain={selfExplain}
          onSelfExplain={setSelfExplain}
          nextLevel={nextLevel}
          onNext={onNext}
        />
      )}
    </div>
  );
}
