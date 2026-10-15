import { scoreSentence } from './scoring.js';
import { getSlots, idsFromPlaced, nextEmptySlot } from './slots.js';

// 한 레벨을 플레이하는 동안의 상태와, 그 상태를 바꾸는 규칙(reducer).
// 화면(React)은 "무슨 일이 일어났는지(action)"만 알려 주고,
// 상태를 실제로 바꾸는 계산은 모두 여기서 한다. → 테스트하기 쉽고 실수가 줄어든다.
//
// phase(진행 단계): 'predict' 예상 점수 입력 → 'build' 문장 조립 → 'result' 결과 확인
//
// 조립 방식: 건물의 자리(주어 기둥 등)를 고르고(activeSlot), 그 자리에 들어갈 카드를 놓는다(placed).
// selected는 자리 순서대로 늘어놓은 카드 id 목록으로, 채점과 건물 설계도에 쓰인다.

export function createSession(level) {
  const slots = getSlots(level);
  return {
    levelId: level.id,
    phase: 'predict',
    prediction: 50,
    slots,
    placed: {}, // 자리 key → 카드 id
    selected: [], // 자리 순서대로 늘어놓은 카드 id (placed에서 계산)
    activeSlot: slots[0]?.key ?? null, // 지금 카드를 고르고 있는 자리
    history: [], // 되돌리기용 이전 placed 목록
    attempts: [], // 제출 기록 [{ ids, result, at }]
    hintStep: 0, // 지금까지 펼친 힌트 단계 수
    startedAt: null,
  };
}

function withPlaced(state, placed, activeSlot = state.activeSlot) {
  return {
    ...state,
    placed,
    selected: idsFromPlaced(state.slots, placed),
    activeSlot,
    history: [...state.history, state.placed],
  };
}

export function sessionReducer(state, action) {
  const building = state.phase === 'build';
  switch (action.type) {
    case 'SET_PREDICTION':
      return { ...state, prediction: Math.round(Math.min(100, Math.max(0, action.value))) };

    case 'START':
      return { ...state, phase: 'build', startedAt: action.now };

    // 건물의 자리를 고른다 (3D 부품을 누르거나, 아래 공정표의 자리를 누른다)
    case 'SELECT_SLOT':
      if (!building || !state.slots.some((s) => s.key === action.key)) return state;
      return { ...state, activeSlot: action.key };

    // 지금 고른 자리에 카드를 놓는다. 이미 놓인 카드를 다시 누르면 뺀다.
    // 놓은 뒤에는 다음 빈자리로 넘어간다.
    case 'PLACE': {
      const slot = state.slots.find((s) => s.key === state.activeSlot);
      const card = action.level.cards.find((c) => c.id === action.id);
      if (!building || !slot || !card || card.role !== slot.role) return state;
      const usedElsewhere = Object.entries(state.placed).some(([k, id]) => id === card.id && k !== slot.key);
      if (usedElsewhere) return state;
      if (state.placed[slot.key] === card.id) {
        const { [slot.key]: _removed, ...rest } = state.placed;
        return withPlaced(state, rest);
      }
      const placed = { ...state.placed, [slot.key]: card.id };
      return withPlaced(state, placed, nextEmptySlot(state.slots, placed, slot.key));
    }

    // 한 자리를 비운다
    case 'CLEAR_SLOT': {
      if (!building || !state.placed[action.key]) return state;
      const { [action.key]: _removed, ...rest } = state.placed;
      return withPlaced(state, rest, action.key);
    }

    // 모든 자리를 비운다
    case 'CLEAR':
      if (!building || state.selected.length === 0) return state;
      return withPlaced(state, {}, state.slots[0]?.key ?? null);

    case 'UNDO': {
      if (!building || state.history.length === 0) return state;
      const placed = state.history[state.history.length - 1];
      return {
        ...state,
        placed,
        selected: idsFromPlaced(state.slots, placed),
        history: state.history.slice(0, -1),
        activeSlot: state.activeSlot ?? nextEmptySlot(state.slots, placed),
      };
    }

    case 'HINT':
      return { ...state, hintStep: Math.min(state.hintStep + 1, action.maxSteps) };

    case 'SUBMIT': {
      if (!building || state.selected.length === 0) return state;
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
