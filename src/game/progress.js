// ── 레벨 해금과 다음 레벨 고르기 ──
// 순수 계산만 한다 (화면과 분리 → 자동 테스트하기 쉽다).
//
// 해금 규칙
//  - 처음에는 가장 쉬운 난이도의 레벨들만 우편함에 있다.
//  - 어떤 난이도의 레벨을 하나라도 완공하면, 바로 다음 난이도의 레벨들이 한꺼번에 모두 도착한다.
//  - 새로 도착한(아직 열어 보지 않은) 레벨에는 New! 표시를 붙인다. 처음부터 있던 레벨에는 붙이지 않는다.
//
// progress: { [레벨 번호]: { completed, stars, opened } }

export const tiersOf = (levels) => [...new Set(levels.map((l) => l.difficulty))].sort((a, b) => a - b);

// 해금된 난이도 목록
export function unlockedTiers(levels, progress) {
  const tiers = tiersOf(levels);
  const unlocked = [tiers[0]];
  for (let i = 1; i < tiers.length; i += 1) {
    const prevDone = levels.some((l) => l.difficulty === tiers[i - 1] && progress[l.id]?.completed);
    if (!prevDone) break;
    unlocked.push(tiers[i]);
  }
  return unlocked;
}

export function isUnlocked(level, levels, progress) {
  return unlockedTiers(levels, progress).includes(level.difficulty);
}

export function isNew(level, levels, progress) {
  return isUnlocked(level, levels, progress) && level.difficulty !== tiersOf(levels)[0] && !progress[level.id]?.opened;
}

// "다음 레벨로" 후보 (우선순위 순서)
//  1) 같은 난이도의 아직 열어 보지 않은 레벨
//  2) 다음 난이도의 레벨 (해금되었을 때)
//  3) 같은 난이도의 다른 레벨
// 같은 순위 안에서는 무작위로 하나를 고른다. 후보가 없으면 null.
export function pickNextLevel(current, levels, progress, random = Math.random) {
  const tiers = tiersOf(levels);
  const unlocked = unlockedTiers(levels, progress);
  const others = levels.filter((l) => l.id !== current.id && unlocked.includes(l.difficulty));
  const sameTier = others.filter((l) => l.difficulty === current.difficulty);
  const nextTier = tiers[tiers.indexOf(current.difficulty) + 1];
  const groups = [
    sameTier.filter((l) => !progress[l.id]?.opened),
    others.filter((l) => l.difficulty === nextTier),
    sameTier,
  ];
  const group = groups.find((g) => g.length > 0);
  return group ? group[Math.floor(random() * group.length)] : null;
}
