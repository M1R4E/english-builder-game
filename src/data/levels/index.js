import level01 from './level01.js';
import level02 from './level02.js';
import level03 from './level03.js';
import level04 from './level04.js';
import level05 from './level05.js';
import level06 from './level06.js';
import level07 from './level07.js';
import level08 from './level08.js';
import level09 from './level09.js';
import level10 from './level10.js';
import { validateLevel } from '../../game/validateLevel.js';

// 모든 레벨 목록 (순서 = 우편함에 꽂히는 순서)
export const ALL_LEVELS = [level01, level02, level03, level04, level05, level06, level07, level08, level09, level10];

// 데이터에 문제가 있는 레벨은 게임이 멈추지 않도록 "준비 중"으로 표시한다.
export const LEVELS = ALL_LEVELS.map((level) => {
  const problems = validateLevel(level);
  if (problems.length > 0) {
    console.error(`레벨 ${level.id} 데이터 문제:`, problems);
  }
  return { level, problems };
});

export function findLevel(id) {
  const entry = LEVELS.find((e) => e.level.id === id);
  return entry && entry.problems.length === 0 ? entry.level : null;
}
