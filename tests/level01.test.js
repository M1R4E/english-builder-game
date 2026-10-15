import { describe, expect, it } from 'vitest';
import level from '../src/data/levels/level01.js';
import { scoreSentence } from '../src/game/scoring.js';
import { validateLevel } from '../src/game/validateLevel.js';

const score = (ids) => scoreSentence(level, ids);
const statusOf = (result, id) => result.checks.find((c) => c.id === id).status;

describe('레벨 1 데이터', () => {
  it('데이터 검사에서 문제가 없다', () => {
    expect(validateLevel(level)).toEqual([]);
  });

  it('검증된 정답은 모두 100점이다', () => {
    for (const answer of level.answers.accepted) {
      expect(score(answer).total).toBe(100);
    }
  });
});

describe('레벨 1 채점: 대표적인 답안', () => {
  it('The cat sleeps. → 100점', () => {
    const r = score(['the-cat', 'sleeps']);
    expect(r.total).toBe(100);
    expect(r.perfect).toBe(true);
  });

  it('The cat sleep. → 수 일치 오류만 지적 (81점)', () => {
    const r = score(['the-cat', 'sleep']);
    expect(statusOf(r, 'G4')).toBe('fail');
    expect(r.checks.filter((c) => c.status === 'fail').map((c) => c.id)).toEqual(['G4']);
    expect(r.errorCardIds).toEqual(['sleep']);
    expect(r.total).toBe(81);
  });

  it('The cats sleep. → 문법은 맞지만 의미(한 마리) 오류', () => {
    const r = score(['the-cats', 'sleep']);
    expect(statusOf(r, 'G4')).toBe('pass');
    expect(statusOf(r, 'M1')).toBe('fail');
    expect(r.total).toBe(75);
  });

  it('The cats sleeps. → 수 일치와 의미 둘 다 문제', () => {
    const r = score(['the-cats', 'sleeps']);
    expect(statusOf(r, 'G4')).toBe('fail');
    expect(statusOf(r, 'M1')).toBe('fail');
  });

  it('The cat slept. → 시제 조건 실패, 완공 기준 미만', () => {
    const r = score(['the-cat', 'slept']);
    expect(statusOf(r, 'C1')).toBe('fail');
    expect(statusOf(r, 'G4')).toBe('pass'); // 과거형은 수 일치 문제가 없다
    expect(r.total).toBeLessThan(70);
  });

  it('Sleeps the cat. → 어순 오류', () => {
    const r = score(['sleeps', 'the-cat']);
    expect(statusOf(r, 'G3')).toBe('fail');
    expect(r.categories.meaning.earned).toBe(30);
  });

  it('Sleeps. → 주어 없음. 주어에 걸린 항목은 "확인 보류"', () => {
    const r = score(['sleeps']);
    expect(statusOf(r, 'G1')).toBe('fail');
    expect(statusOf(r, 'M1')).toBe('skipped');
    expect(statusOf(r, 'G4')).toBe('skipped');
    expect(r.checks.filter((c) => c.status === 'fail')).toHaveLength(1); // 오류 메시지는 하나만
    expect(r.total).toBeLessThan(70);
  });

  it('The cat the cats sleeps. → 겹친 카드 지적', () => {
    const r = score(['the-cat', 'the-cats', 'sleeps']);
    expect(statusOf(r, 'N1')).toBe('fail');
    expect(r.errorCardIds).toContain('the-cats');
  });
});

// 카드 5장으로 만들 수 있는 모든 배열(325가지)을 채점해 본다.
function* permutations(items, maxLen) {
  if (maxLen === 0) return;
  for (let i = 0; i < items.length; i += 1) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    yield [items[i]];
    for (const tail of permutations(rest, maxLen - 1)) yield [items[i], ...tail];
  }
}

describe('레벨 1 전수 검사', () => {
  const allIds = level.cards.map((c) => c.id);
  const all = [...permutations(allIds, allIds.length)];

  it('모든 조합의 점수가 0~100 사이의 정수이고, 같은 답은 항상 같은 점수', () => {
    for (const ids of all) {
      const a = score(ids);
      expect(Number.isInteger(a.total)).toBe(true);
      expect(a.total).toBeGreaterThanOrEqual(0);
      expect(a.total).toBeLessThanOrEqual(100);
      expect(score(ids)).toEqual(a);
    }
  });

  it('100점은 검증된 정답뿐이다 (예상하지 못한 만점 없음)', () => {
    const perfect = all.filter((ids) => score(ids).total === 100).map((ids) => ids.join(' '));
    expect(perfect).toEqual(level.answers.accepted.map((a) => a.join(' ')));
  });

  it('각 범주 점수가 만점을 넘지 않는다', () => {
    for (const ids of all) {
      for (const c of Object.values(score(ids).categories)) {
        expect(c.earned).toBeLessThanOrEqual(c.max);
      }
    }
  });
});
