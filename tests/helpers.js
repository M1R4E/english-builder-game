import { clearAfterWord, firstOpenStep, getSteps, normalizeAnswer, stepOptions } from '../src/game/structure.js';

// 정답 선택 목록
export const answerChoices = (level, i = 0) => normalizeAnswer(level, level.answers.accepted[i]);

// 남은 단계를 채운다. prefer에 있는 값이 선택지에 있으면 그 값을, 없으면 pick(선택지)으로 고른다.
export function complete(level, choices, prefer = {}, pick = (opts) => opts[0]) {
  let c = { ...choices };
  for (let guard = 0; guard < 200; guard += 1) {
    const step = firstOpenStep(level, c);
    if (!step) return c;
    const opts = stepOptions(step, c).map((o) => o.value);
    const value = step.key === 'floors' ? level.floors.length : opts.includes(prefer[step.key]) ? prefer[step.key] : pick(opts);
    c = { ...c, [step.key]: value };
  }
  throw new Error('공정이 끝나지 않음');
}

// 정답에서 한 단계만 다른 값으로 바꾼 모든 건물 (단어를 바꾸면 나머지 단계는 정답 값을 최대한 유지)
export function* singleChanges(level) {
  const answer = answerChoices(level);
  for (const step of getSteps(level, answer)) {
    if (step.key === 'floors') continue;
    for (const { value } of stepOptions(step, answer)) {
      if (value === answer[step.key]) continue;
      let c = { ...answer, [step.key]: value };
      if (step.part === 'word') c = clearAfterWord(c, step.ref);
      yield { step, value, choices: complete(level, c, answer) };
    }
  }
}

// 같은 씨앗이면 같은 순서로 나오는 난수 (테스트 결과가 매번 같도록)
export function seededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}
