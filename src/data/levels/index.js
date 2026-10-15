import level01 from './level01.js';
import { validateLevel } from '../../game/validateLevel.js';

// 모든 레벨 목록. 3단계에서 level02 ~ level10을 여기에 추가한다.
const ALL_LEVELS = [level01];

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
