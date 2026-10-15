import { cardsForSlot, getSlots } from '../src/game/slots.js';

// 한 레벨에서 만들 수 있는 모든 배치(자리마다 비워 두거나, 놓을 수 있는 카드 중 하나)를 차례로 만든다.
// 같은 카드는 두 자리에 동시에 놓을 수 없다.
export function* allPlacements(level) {
  const slots = getSlots(level);
  const options = slots.map((s) => [null, ...cardsForSlot(level, s).map((c) => c.id)]);
  function* walk(i, placed, used) {
    if (i === slots.length) {
      yield placed;
      return;
    }
    for (const id of options[i]) {
      if (id === null) {
        yield* walk(i + 1, placed, used);
      } else if (!used.has(id)) {
        used.add(id);
        yield* walk(i + 1, { ...placed, [slots[i].key]: id }, used);
        used.delete(id);
      }
    }
  }
  yield* walk(0, {}, new Set());
}

// 정답 배치에서 몇 자리만 바꾼 배치
export const changed = (answer, changes) => {
  const next = { ...answer, ...changes };
  for (const [k, v] of Object.entries(next)) if (v === null) delete next[k];
  return next;
};
