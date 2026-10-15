import { describe, expect, it } from 'vitest';
import level from '../src/data/levels/level01.js';
import level3 from '../src/data/levels/level03.js';
import level5 from '../src/data/levels/level05.js';
import { makeBlueprint } from '../src/building/makeBlueprint.js';
import { scoreSentence } from '../src/game/scoring.js';

const cat = { '0-S': 'the-cat' };
const catSleeps = { '0-S': 'the-cat', '0-V': 'sleeps' };

describe('건물 설계도', () => {
  it('카드가 없으면 주어·동사 기둥이 모두 빈자리(유령)이고 지붕이 없다', () => {
    const bp = makeBlueprint(level, {});
    expect(bp.floors).toHaveLength(1);
    expect(bp.floors[0].pillars).toEqual({ S: 'ghost', V: 'ghost' });
    expect(bp.floors[0].roomComplete).toBe(false);
  });

  it('주어만 놓으면 주어 기둥만 채워지고, 기둥에 단어가 붙는다', () => {
    const bp = makeBlueprint(level, cat);
    expect(bp.floors[0].pillars).toEqual({ S: 'filled', V: 'ghost' });
    expect(bp.floors[0].words).toEqual({ '0-S': 'the cat' });
    expect(bp.floors[0].roomComplete).toBe(false);
  });

  it('고르고 있는 자리를 층마다 표시한다', () => {
    expect(makeBlueprint(level, {}, null, { activeSlot: '0-V' }).floors[0].active).toBe('0-V');
    expect(makeBlueprint(level, {}).floors[0].active).toBeNull();
  });

  it('방(절)이 완성되면 정답이 아니어도 지붕이 생긴다 (기획 결정 ①)', () => {
    for (const p of [catSleeps, { '0-S': 'the-cats', '0-V': 'sleeps' }, { '0-S': 'the-cat', '0-V': 'slept' }]) {
      expect(makeBlueprint(level, p).floors[0].roomComplete).toBe(true);
    }
  });

  it('장식 자리는 빈자리여도 지붕에 영향이 없고, 빈자리는 유령으로 표시된다', () => {
    const bp = makeBlueprint(level3, { '0-S': 'the-baby', '0-V': 'sleeps' });
    expect(bp.floors[0].roomComplete).toBe(true);
    expect(bp.floors[0].mods).toEqual([
      { key: '0-M-how', state: 'ghost' },
      { key: '0-M-where', state: 'ghost' },
    ]);
  });

  it('제출 전에는 경고 표시가 없고, 제출 후 틀린 자리에 경고가 붙는다', () => {
    const p = { '0-S': 'the-cat', '0-V': 'sleep' };
    expect(makeBlueprint(level, p).warnings).toEqual([]);
    const bp = makeBlueprint(level, p, scoreSentence(level, p));
    expect(bp.warnings).toEqual([{ slot: '0-V', kind: 'check' }]);
    expect(bp.success).toBe(false);
  });

  it('필수 자리가 빈 채 제출하면 빈자리에 "없음" 경고가 붙는다', () => {
    const p = { '0-V': 'sleeps' };
    const bp = makeBlueprint(level, p, scoreSentence(level, p));
    expect(bp.warnings).toEqual([{ slot: '0-S', kind: 'missing' }]);
    expect(bp.completed).toBe(false);
  });

  it('정답을 제출하면 울타리(조건 충족)와 깃발(완공) 표시', () => {
    const bp = makeBlueprint(level, catSleeps, scoreSentence(level, catSleeps));
    expect(bp.conditionsMet).toBe(true);
    expect(bp.completed).toBe(true);
    expect(bp.success).toBe(true);
  });

  it('두 절 레벨은 2층 + 계단. 문장 맨 앞 접속사도 1층과 2층을 잇는다', () => {
    const bp = makeBlueprint(level5, { L0: 'when' }, null, { activeSlot: 'L0' });
    expect(bp.floors).toHaveLength(2);
    expect(bp.floors[0].isTop).toBe(false); // 아래층은 처마 지붕
    expect(bp.stairs).toEqual([{ from: 0, to: 1, key: 'L0', state: 'filled', word: 'when', active: true }]);
  });

  it('층수가 다른 건물로 바뀌면 깃발을 새로 만든다 (메인 화면 깃발이 떠 있던 문제)', async () => {
    const { buildParts } = await import('../src/building/buildParts.js');
    const { SHOWCASE_BLUEPRINTS } = await import('../src/building/showcase.js');
    const flagSig = (bp) => buildParts(bp, { labels: false }).parts.find((p) => p.key === 'flag')?.sig;
    const withFlag = SHOWCASE_BLUEPRINTS.filter((bp) => bp.completed);
    const sigs = withFlag.map(flagSig);
    const floors = withFlag.map((bp) => bp.floors.length);
    for (let i = 0; i < sigs.length; i += 1) {
      for (let j = 0; j < sigs.length; j += 1) {
        if (floors[i] !== floors[j]) expect(sigs[i]).not.toBe(sigs[j]);
      }
    }
  });
});
