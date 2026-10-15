import { scoreSentence } from './scoring.js';

// 한 레벨을 플레이하는 동안의 상태와, 그 상태를 바꾸는 규칙(reducer).
// 화면(React)은 "무슨 일이 일어났는지(action)"만 알려 주고,
// 상태를 실제로 바꾸는 계산은 모두 여기서 한다. → 테스트하기 쉽고 실수가 줄어든다.
//
// phase(진행 단계): 'predict' 예상 점수 입력 → 'build' 문장 조립 → 'result' 결과 확인

export function createSession(level) {
  return {
    levelId: level.id,
    phase: 'predict',
    prediction: 50,
    selected: [], // 고른 카드 id (문장 순서대로)
    history: [], // 되돌리기용 이전 selected 목록
    attempts: [], // 제출 기록 [{ ids, result, at }]
    hintStep: 0, // 지금까지 펼친 힌트 단계 수
    startedAt: null,
  };
}

function withHistory(state, selected) {
  return { ...state, selected, history: [...state.history, state.selected] };
}

export function sessionReducer(state, action) {
  switch (action.type) {
    case 'SET_PREDICTION':
      return { ...state, prediction: Math.round(Math.min(100, Math.max(0, action.value))) };

    case 'START':
      return { ...state, phase: 'build', startedAt: action.now };

    case 'ADD_CARD':
      if (state.phase !== 'build' || state.selected.includes(action.id)) return state;
      return withHistory(state, [...state.selected, action.id]);

    case 'REMOVE_AT': {
      if (state.phase !== 'build' || !(action.index in state.selected)) return state;
      return withHistory(state, state.selected.filter((_, i) => i !== action.index));
    }

    case 'MOVE': {
      const to = action.index + action.delta;
      if (state.phase !== 'build' || !(action.index in state.selected) || to < 0 || to >= state.selected.length) {
        return state;
      }
      const next = [...state.selected];
      [next[action.index], next[to]] = [next[to], next[action.index]];
      return withHistory(state, next);
    }

    case 'CLEAR':
      if (state.phase !== 'build' || state.selected.length === 0) return state;
      return withHistory(state, []);

    case 'UNDO': {
      if (state.phase !== 'build' || state.history.length === 0) return state;
      return {
        ...state,
        selected: state.history[state.history.length - 1],
        history: state.history.slice(0, -1),
      };
    }

    case 'HINT':
      return { ...state, hintStep: Math.min(state.hintStep + 1, action.maxSteps) };

    case 'SUBMIT': {
      if (state.phase !== 'build' || state.selected.length === 0) return state;
      const result = scoreSentence(action.level, state.selected);
      return {
        ...state,
        phase: 'result',
        attempts: [...state.attempts, { ids: state.selected, result, at: action.now }],
      };
    }

    case 'EDIT':
      return state.phase === 'result' ? { ...state, phase: 'build' } : state;

    default:
      return state;
  }
}

// 지금 고른 카드가 마지막 제출 때와 똑같으면 그 채점 결과를 돌려준다 (오류 표시용).
export function currentResult(state) {
  const last = state.attempts[state.attempts.length - 1];
  if (!last) return null;
  const same = last.ids.length === state.selected.length && last.ids.every((id, i) => id === state.selected[i]);
  return same ? last.result : null;
}
