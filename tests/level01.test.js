import { describe, expect, it } from 'vitest';
import { MISSING_ROLE_PENALTY } from '../src/config.js';
import level from '../src/data/levels/level01.js';
import { scoreSentence } from '../src/game/scoring.js';
import { validateLevel } from '../src/game/validateLevel.js';

const score = (ids) => scoreSentence(level, ids);
const statusOf = (result, id) => result.checks.find((c) => c.id === id).status;
const failedIds = (result) => result.checks.filter((c) => c.status === 'fail').map((c) => c.id);

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
    expect(r.missing).toEqual([]);
  });

  it('The cat sleep. → 수 일치 오류만 지적 (75점)', () => {
    const r = score(['the-cat', 'sleep']);
    expect(failedIds(r)).toEqual(['G2']);
    expect(r.errorCardIds).toEqual(['sleep']);
    expect(r.total).toBe(75);
  });

  it('The cats sleep. → 문법은 맞지만 의미(한 마리) 오류 (75점)', () => {
    const r = score(['the-cats', 'sleep']);
    expect(failedIds(r)).toEqual(['M1']);
    expect(r.total).toBe(75);
  });

  it('The cats sleeps. → 수 일치와 의미 둘 다 문제', () => {
    const r = score(['the-cats', 'sleeps']);
    expect(failedIds(r)).toEqual(['G2', 'M1']);
    expect(r.total).toBe(60);
  });

  it('The cat slept. → 시제 조건 실패, 완공 기준 미만 (65점)', () => {
    const r = score(['the-cat', 'slept']);
    expect(failedIds(r)).toEqual(['C1']); // 과거형은 수 일치 문제가 없다
    expect(r.total).toBe(65);
  });

  it('Sleeps the cat. → 어순 오류 (75점)', () => {
    const r = score(['sleeps', 'the-cat']);
    expect(failedIds(r)).toEqual(['G1']);
    expect(r.categories.meaning.earned).toBe(30);
    expect(r.total).toBe(75);
  });

  it('The cat the cats sleeps. → 겹친 카드 지적 (85점)', () => {
    const r = score(['the-cat', 'the-cats', 'sleeps']);
    expect(failedIds(r)).toEqual(['N1']);
    expect(r.errorCardIds).toContain('the-cats');
    expect(r.total).toBe(85);
  });
});

describe('레벨 1 채점: 필수 성분 누락', () => {
  it('Sleeps. → 주어 누락 40점 감점, 주어가 필요한 항목은 "확인 못 함"으로 감점 없음 (60점)', () => {
    const r = score(['sleeps']);
    expect(r.missing.map((m) => m.role)).toEqual(['S']);
    expect(r.penalty).toBe(MISSING_ROLE_PENALTY);
    expect(statusOf(r, 'M1')).toBe('blocked');
    expect(statusOf(r, 'G2')).toBe('blocked');
    expect(failedIds(r)).toEqual([]); // 누락 외에 따로 지적하는 오류 없음
    expect(r.total).toBe(60);
    expect(r.perfect).toBe(false);
  });

  it('The cat. → 동사 누락 (60점)', () => {
    const r = score(['the-cat']);
    expect(r.missing.map((m) => m.role)).toEqual(['V']);
    expect(r.total).toBe(60);
  });

  it('누락과 다른 오류가 함께 있으면 둘 다 반영된다: The cats. (35점)', () => {
    const r = score(['the-cats']);
    expect(r.missing.map((m) => m.role)).toEqual(['V']);
    expect(failedIds(r)).toEqual(['M1']);
    // 동사 누락 40 + 의미(한 마리) 15 + 검증된 자연스러운 표현 10 (다른 항목이 모두 통과해야 받는 점수)
    expect(r.total).toBe(100 - 40 - 15 - 10);
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

  it('필수 성분이 하나라도 빠지면 완공(70점)할 수 없다', () => {
    for (const ids of all) {
      const r = score(ids);
      if (r.missing.length > 0) expect(r.total).toBeLessThan(70);
    }
  });

  it('각 범주 점수가 만점을 넘지 않는다', () => {
    for (const ids of all) {
      for (const c of Object.values(score(ids).categories)) {
        expect(c.earned).toBeLessThanOrEqual(c.max);
      }
    }
  });
});
