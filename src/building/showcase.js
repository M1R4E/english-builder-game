import { ALL_LEVELS } from '../data/levels/index.js';
import { normalizeAnswer } from '../game/structure.js';
import { buildParts } from './buildParts.js';
import { makeBlueprint } from './makeBlueprint.js';

// 메인 화면·우편함 화면 뒤에 보여 줄 견본 건물들.
// 실제 레벨의 정답 건물을 그대로 쓴다. 모두 완공된 모습(깃발·울타리·나무)으로 통일한다.
const SHOWCASE_LEVELS = [1, 3, 4, 7, 6, 10];
const COMPLETED = { total: 100, perfect: true, errorRefs: [] };

export const SHOWCASE_BLUEPRINTS = SHOWCASE_LEVELS.map((id) => {
  const level = ALL_LEVELS.find((l) => l.id === id);
  return makeBlueprint(level, normalizeAnswer(level, level.answers.accepted[0]), COMPLETED);
});

// 가장 큰 견본에 맞춘 카메라 범위. 건물이 바뀌어도 카메라가 흔들리지 않게 고정해서 쓴다.
export const SHOWCASE_BOUNDS = SHOWCASE_BLUEPRINTS.map((bp) => buildParts(bp, { labels: false }).bounds).reduce((a, b) =>
  a.radius >= b.radius ? a : b);
