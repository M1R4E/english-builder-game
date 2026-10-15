import { describe, expect, it } from 'vitest';
import { MISSING_ROLE_PENALTY } from '../src/config.js';
import level from '../src/data/levels/level01.js';
import { scoreSentence } from '../src/game/scoring.js';

// 레벨 1 대표 답안 점수 (공통 검사는 levels.test.js)
const score = (S, V) => scoreSentence(level, { ...(S && { '0-S': S }), ...(V && { '0-V': V }) });
const statusOf = (result, id) => result.checks.find((c) => c.id === id).status;
const failedIds = (result) => result.checks.filter((c) => c.status === 'fail').map((c) => c.id);

describe('레벨 1 채점: 대표적인 답안', () => {
  it('The cat sleeps. → 100점', () => {
    const r = score('the-cat', 'sleeps');
    expect(r.total).toBe(100);
    expect(r.perfect).toBe(true);
    expect(r.missing).toEqual([]);
  });

  it('The cat sleep. → 수 일치 오류만 지적 (75점)', () => {
    const r = score('the-cat', 'sleep');
    expect(failedIds(r)).toEqual(['G2']);
    expect(r.errorCardIds).toEqual(['sleep']);
    expect(r.total).toBe(75);
  });

  it('The cats sleep. → 문법은 맞지만 의미(한 마리) 오류 (75점)', () => {
    const r = score('the-cats', 'sleep');
    expect(failedIds(r)).toEqual(['M1']);
    expect(r.total).toBe(75);
  });

  it('The cats sleeps. → 수 일치와 의미 둘 다 문제 (60점)', () => {
    const r = score('the-cats', 'sleeps');
    expect(failedIds(r)).toEqual(['G2', 'M1']);
    expect(r.total).toBe(60);
  });

  it('The cat slept. → 시제 조건 실패, 완공 기준 미만 (65점)', () => {
    const r = score('the-cat', 'slept');
    expect(failedIds(r)).toEqual(['C1']);
    expect(r.total).toBe(65);
  });
});

describe('레벨 1 채점: 빈 필수 자리', () => {
  it('주어 기둥이 비면 40점 감점, 주어가 필요한 항목은 "확인 못 함"으로 감점 없음 (60점)', () => {
    const r = score(null, 'sleeps');
    expect(r.missing.map((m) => m.slot)).toEqual(['0-S']);
    expect(r.penalty).toBe(MISSING_ROLE_PENALTY);
    expect(statusOf(r, 'M1')).toBe('blocked');
    expect(statusOf(r, 'G2')).toBe('blocked');
    expect(failedIds(r)).toEqual([]);
    expect(r.total).toBe(60);
  });

  it('빈자리와 다른 오류가 함께 있으면 둘 다 반영된다: The cats. (35점)', () => {
    const r = score('the-cats', null);
    expect(r.missing.map((m) => m.slot)).toEqual(['0-V']);
    expect(failedIds(r)).toEqual(['M1']);
    expect(r.total).toBe(100 - 40 - 15 - 10);
  });

  it('없는 카드나 없는 자리가 들어와도 멈추지 않는다', () => {
    const r = scoreSentence(level, { '0-S': 'the-cat', '0-V': '없는카드', '9-Z': 'sleeps' });
    expect(r.missing.map((m) => m.slot)).toEqual(['0-V']);
  });
});
