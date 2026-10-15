import { scoreSentence } from './scoring.js';
import { clearAfterWord, firstOpenStep, getSteps, isComplete, sameChoices, stepOptions } from './structure.js';

// 한 레벨을 플레이하는 동안의 상태와, 그 상태를 바꾸는 규칙(reducer).
// 화면(React)은 "무슨 일이 일어났는지(action)"만 알려 주고,
// 상태를 실제로 바꾸는 계산은 모두 여기서 한다. → 테스트하기 쉽고 실수가 줄어든다.
//
// phase(진행 단계): 'predict' 예상 점수 입력 → 'build' 건물 짓기 → 'result' 결과 확인
//
// 짓기는 정해진 공정 순서를 따른다 (structure.js의 getSteps).
//  - 지금 단계(currentStep)에서 하나를 고르면 다음 단계로 넘어간다.
//  - 다 지은 방은 다시 눌러 "고쳐 짓기"(editStep)를 할 수 있다. 그 방의 단계를 처음부터 다시 거친다.
//  - 층수는 정답일 때만 다음으로 넘어간다 (틀리면 안내만 하고 기록해 둔다).

export function createSession(level) {
  return {
    levelId: level.id,
    phase: 'predict',
    prediction: 50,
    choices: {}, // 단계 key → 고른 값
    editStep: null, // 고쳐 짓는 중인 단계 key
    history: [], // 되돌리기용 이전 choices 목록
    attempts: [], // 제출 기록 [{ choices, result, at }]
    hintStep: 0,
    floorMistakes: 0, // 층수를 잘못 고른 횟수 (학습 기록용)
    startedAt: null,
  };
}

// 지금 고를 단계
export function currentStep(level, state) {
  const steps = getSteps(level, state.choices);
  return (state.editStep && steps.find((s) => s.key === state.editStep)) || firstOpenStep(level, state.choices);
}

const withChoices = (state, choices, editStep = null) => ({
  ...state,
  choices,
  editStep,
  history: [...state.history, state.choices],
});

export function sessionReducer(state, action) {
  const building = state.phase === 'build';
  switch (action.type) {
    case 'SET_PREDICTION':
      return { ...state, prediction: Math.round(Math.min(100, Math.max(0, action.value))) };

    case 'START':
      return { ...state, phase: 'build', startedAt: action.now };

    // 지금 단계에서 하나를 고른다
    case 'CHOOSE': {
      if (!building) return state;
      const { level, value } = action;
      const step = currentStep(level, state);
      if (!step || !stepOptions(step, state.choices).some((o) => o.value === value)) return state;
      if (step.key === 'floors' && value !== level.floors.length) {
        return { ...state, floorMistakes: state.floorMistakes + 1 };
      }
      let choices = { ...state.choices, [step.key]: value };
      if (step.part === 'word' && state.choices[step.key] !== value) choices = clearAfterWord(choices, step.ref);
      // 고쳐 짓는 중이면 같은 방의 다음 단계로, 아니면 자동으로 다음 빈 단계로
      let editStep = null;
      if (state.editStep) {
        const steps = getSteps(level, choices);
        const i = steps.findIndex((s) => s.key === step.key);
        const next = steps[i + 1];
        if (next && next.unit === step.unit) editStep = next.key;
      }
      return withChoices(state, choices, editStep);
    }

    // 이미 지은(또는 짓기 시작한) 방을 다시 고쳐 짓는다
    case 'EDIT_UNIT': {
      if (!building) return state;
      const steps = getSteps(action.level, state.choices);
      const first = steps.find((s) => s.unit === action.unit);
      if (!first || state.choices[first.key] === undefined) return state; // 아직 차례가 오지 않은 곳
      return { ...state, editStep: first.key };
    }

    case 'CANCEL_EDIT':
      return { ...state, editStep: null };

    case 'UNDO': {
      if (!building || state.history.length === 0) return state;
      return {
        ...state,
        choices: state.history[state.history.length - 1],
        history: state.history.slice(0, -1),
        editStep: null,
      };
    }

    // 처음부터 다시 짓기
    case 'CLEAR':
      if (!building || Object.keys(state.choices).length === 0) return state;
      return withChoices(state, {});

    case 'HINT':
      return { ...state, hintStep: Math.min(state.hintStep + 1, action.maxSteps) };

    // 건물을 다 지어야 제출할 수 있다 (화면에서 미리 막고 안내한다)
    case 'SUBMIT': {
      if (!building || !isComplete(action.level, state.choices)) return state;
      const result = scoreSentence(action.level, state.choices);
      return {
        ...state,
        phase: 'result',
        editStep: null,
        attempts: [...state.attempts, { choices: state.choices, result, at: action.now }],
      };
    }

    case 'EDIT':
      return state.phase === 'result' ? { ...state, phase: 'build' } : state;

    default:
      return state;
  }
}

// 지금 건물이 마지막 제출 때와 똑같으면 그 채점 결과를 돌려준다 (오류 표시용).
export function currentResult(level, state) {
  const last = state.attempts[state.attempts.length - 1];
  return last && sameChoices(level, last.choices, state.choices) ? last.result : null;
}
