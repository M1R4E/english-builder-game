import { describe, expect, it } from 'vitest';
import level from '../src/data/levels/level01.js';
import { makeBlueprint } from '../src/building/makeBlueprint.js';
import { scoreSentence } from '../src/game/scoring.js';

describe('건물 설계도', () => {
  it('카드가 없으면 주어·동사 기둥이 모두 빈자리(유령)이고 지붕이 없다', () => {
    const bp = makeBlueprint(level, []);
    expect(bp.floors).toHaveLength(1);
    expect(bp.floors[0].pillars).toEqual({ S: 'ghost', V: 'ghost' });
    expect(bp.floors[0].roomComplete).toBe(false);
  });

  it('주어만 놓으면 주어 기둥만 채워지고, 기둥에 단어가 붙는다', () => {
    const bp = makeBlueprint(level, ['the-cat']);
    expect(bp.floors[0].pillars).toEqual({ S: 'filled', V: 'ghost' });
    expect(bp.floors[0].words).toEqual({ S: 'the cat' });
    expect(bp.floors[0].roomComplete).toBe(false);
  });

  it('고르고 있는 자리를 층마다 표시한다', () => {
    expect(makeBlueprint(level, [], null, { activeSlot: '0-V' }).floors[0].active).toBe('V');
    expect(makeBlueprint(level, []).floors[0].active).toBeNull();
  });

  it('방(절)이 완성되면 정답이 아니어도 지붕이 생긴다 (기획 결정 ①)', () => {
    for (const ids of [['the-cat', 'sleeps'], ['the-cats', 'sleeps'], ['slept', 'the-cat']]) {
      expect(makeBlueprint(level, ids).floors[0].roomComplete).toBe(true);
    }
  });

  it('제출 전에는 경고 표시가 없고, 제출 후 틀린 성분에 경고가 붙는다', () => {
    const ids = ['the-cat', 'sleep'];
    expect(makeBlueprint(level, ids).warnings).toEqual([]);
    const bp = makeBlueprint(level, ids, scoreSentence(level, ids));
    expect(bp.warnings).toEqual([{ floor: 0, role: 'V', kind: 'check' }]);
    expect(bp.success).toBe(false);
  });

  it('필수 성분이 빠진 채 제출하면 빈자리에 "없음" 경고가 붙는다', () => {
    const ids = ['sleeps'];
    const bp = makeBlueprint(level, ids, scoreSentence(level, ids));
    expect(bp.warnings).toEqual([{ floor: 0, role: 'S', kind: 'missing' }]);
    expect(bp.completed).toBe(false); // 60점 → 깃발 없음
  });

  it('정답을 제출하면 울타리(조건 충족)와 깃발(완공) 표시', () => {
    const ids = ['the-cat', 'sleeps'];
    const bp = makeBlueprint(level, ids, scoreSentence(level, ids));
    expect(bp.conditionsMet).toBe(true);
    expect(bp.completed).toBe(true);
    expect(bp.success).toBe(true);
  });

  it('필요 없는 목적어를 넣으면 목적어 칸이 생긴다', () => {
    const extra = { ...level, cards: [...level.cards, { id: 'fish', text: 'fish', role: 'O' }] };
    const bp = makeBlueprint(extra, ['the-cat', 'sleeps', 'fish']);
    expect(bp.floors[0].rooms).toEqual([{ role: 'O', state: 'filled' }]);
  });

  it('층수가 다른 건물로 바뀌면 깃발을 새로 만든다 (메인 화면 깃발이 떠 있던 문제)', async () => {
    const { buildParts } = await import('../src/building/buildParts.js');
    const { SHOWCASE_BLUEPRINTS } = await import('../src/building/showcase.js');
    const flagSig = (bp) => buildParts(bp, { labels: false }).parts.find((p) => p.key === 'flag')?.sig;
    const withFlag = SHOWCASE_BLUEPRINTS.filter((bp) => bp.completed);
    const sigs = withFlag.map(flagSig);
    const floors = withFlag.map((bp) => bp.floors.length);
    // 층수가 다르면 sig도 달라야 렌더러가 깃발을 새 높이로 다시 만든다
    for (let i = 0; i < sigs.length; i += 1) {
      for (let j = 0; j < sigs.length; j += 1) {
        if (floors[i] !== floors[j]) expect(sigs[i]).not.toBe(sigs[j]);
      }
    }
  });

  it('두 절이 필요한 레벨은 2층 + 접속사 계단 자리를 보여 준다', () => {
    const twoFloors = { ...level, structure: { clauses: [{ slots: ['S', 'V'] }, { slots: ['S', 'V'] }] } };
    const bp = makeBlueprint(twoFloors, ['the-cat', 'sleeps']);
    expect(bp.floors).toHaveLength(2);
    expect(bp.floors[0].isTop).toBe(false); // 아래층은 처마 지붕
    expect(bp.stairs).toEqual([{ from: 0, to: 1, state: 'ghost' }]);
  });
});
