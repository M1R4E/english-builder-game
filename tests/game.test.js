import { describe, expect, it } from 'vitest';
import { ALL_LEVELS } from '../src/data/levels/index.js';
import level from '../src/data/levels/level01.js';
import level4 from '../src/data/levels/level04.js';
import level5 from '../src/data/levels/level05.js';
import { isNew, pickNextLevel, unlockedTiers } from '../src/game/progress.js';
import { computeReward, estimatePenalty } from '../src/game/reward.js';
import { createSession, currentResult, currentStep, sessionReducer } from '../src/game/session.js';
import { getSteps, getUnits, sentenceText } from '../src/game/structure.js';
import { validateLevel } from '../src/game/validateLevel.js';
import { answerChoices } from './helpers.js';

describe('공정 순서와 문장 만들기', () => {
  it('처음에는 층수 단계만 있고, 층수를 바르게 고르면 방들의 단계가 나타난다', () => {
    expect(getSteps(level, {}).map((s) => s.key)).toEqual(['floors']);
    expect(getSteps(level, { floors: 1 }).map((s) => s.key)).toEqual(['floors', '0.S.word', '0.V.word']);
  });

  it('단어를 고르면 그 단어에 맞는 세부 단계(개수, 문패 …)가 이어진다', () => {
    const keys = getSteps(level, { floors: 1, '0.S.word': 'n:cat' }).map((s) => s.key);
    expect(keys).toEqual(['floors', '0.S.word', '0.S.form', '0.S.det', '0.V.word']);
  });

  it('공정 순서: 1층(주절) → 계단 → 2층. 장식 방은 필수 방 다음', () => {
    expect(getUnits(level5, { floors: 2 }).map((u) => u.unit)).toEqual(['floors', '0.S', '0.V', '0.where', 'L1', '1.S', '1.V']);
  });

  it('문장 순서는 레벨의 sentence를 따르고, 쉼표와 대문자·마침표를 붙인다', () => {
    expect(sentenceText(level5, answerChoices(level5, 1))).toBe('After the rain stopped, the children played outside.');
    expect(sentenceText(level4, answerChoices(level4, 1))).toBe('The carpenter felt tired, but he finished the work.');
    expect(sentenceText(level, {})).toBe('');
  });
});

describe('보상 계산', () => {
  it('별(5개)과 완공은 최고 점수, 예측 비교는 첫 제출 점수 기준', () => {
    const r = computeReward(80, [60, 90]);
    expect(r.first).toBe(60);
    expect(r.best).toBe(90);
    expect(r.stars).toBe(4); // 70 · 76 · 82 · 88
    expect(computeReward(50, [100]).stars).toBe(5);
    expect(computeReward(50, [69]).stars).toBe(0);
    expect(r.completed).toBe(true);
    expect(r.predictionDiff).toBe(20);
    expect(r.predictionBadge).toBe('거의 정확한 견적');
    expect(r.persistedBadge).toBe(true);
  });

  it('비정상적인 값이 들어와도 0~100 범위를 벗어나지 않는다', () => {
    const r = computeReward(150, [-20, NaN]);
    expect(r.prediction).toBe(100);
    expect(r.best).toBe(0);
    expect(r.stars).toBe(0);
  });

  it('제출 기록이 없으면 null', () => {
    expect(computeReward(50, [])).toBeNull();
  });
});

describe('견적 오차 차감 (최종 공사 대금)', () => {
  it('넘은 차이의 절반을 빼고(1,000원 미만 버림), 견적이 낮았으면 빼지 않는다', () => {
    expect(estimatePenalty(10)).toBe(0);
    expect(estimatePenalty(25)).toBe(7);
    const r = computeReward(100, [60, 100]);
    expect(r.estimatePenalty).toBe(15);
    expect(r.finalPay).toBe(85);
    expect(computeReward(0, [100]).finalPay).toBe(100);
  });

  it('최종 공사 대금은 모든 경우 0 이상, 최고 점수 이하의 정수', () => {
    for (let p = 0; p <= 100; p += 5) {
      for (let s = 0; s <= 100; s += 1) {
        const r = computeReward(p, [s]);
        expect(Number.isInteger(r.finalPay)).toBe(true);
        expect(r.finalPay).toBeGreaterThanOrEqual(0);
        expect(r.finalPay).toBeLessThanOrEqual(r.best);
      }
    }
  });
});

describe('플레이 진행 상태 (공정 순서대로 짓기)', () => {
  const start = () => sessionReducer(createSession(level), { type: 'START', now: 0 });
  const choose = (s, value) => sessionReducer(s, { type: 'CHOOSE', level, value });
  const build = (s, values) => values.reduce(choose, s);

  it('층수를 틀리면 넘어가지 않고 실수 횟수만 기록한다', () => {
    let s = start();
    s = choose(s, 2);
    expect(s.choices).toEqual({});
    expect(s.floorMistakes).toBe(1);
    s = choose(s, 1);
    expect(currentStep(level, s).key).toBe('0.S.word');
  });

  it('선택지에 없는 값은 무시하고, 고를 때마다 다음 단계로 넘어간다', () => {
    let s = build(start(), [1, 'n:cat']);
    expect(choose(s, 'n:없는단어')).toBe(s);
    s = build(s, ['sg', 'd:the', 'v:sleep', 's']);
    expect(currentStep(level, s)).toBeNull(); // 다 지음
    expect(sentenceText(level, s.choices)).toBe('The cat sleeps.');
  });

  it('다 지은 방을 고쳐 짓기: 그 방의 단계를 처음부터 다시 거치고, 단어를 바꾸면 세부 단계를 다시 고른다', () => {
    let s = build(start(), [1, 'n:cat', 'sg', 'd:the', 'v:sleep', 's']);
    s = sessionReducer(s, { type: 'EDIT_UNIT', level, unit: '0.S' });
    expect(currentStep(level, s).key).toBe('0.S.word');
    s = choose(s, 'n:dog');
    expect(s.choices['0.S.form']).toBeUndefined();
    expect(currentStep(level, s).key).toBe('0.S.form');
    s = build(s, ['sg', 'd:a']);
    expect(currentStep(level, s)).toBeNull(); // 방을 다 고치면 고쳐 짓기가 끝난다
    expect(sentenceText(level, s.choices)).toBe('A dog sleeps.');
  });

  it('아직 차례가 오지 않은 방은 고쳐 짓기를 할 수 없다', () => {
    const s = build(start(), [1]);
    expect(sessionReducer(s, { type: 'EDIT_UNIT', level, unit: '0.V' })).toBe(s);
  });

  it('되돌리기, 비우기', () => {
    let s = build(start(), [1, 'n:cat']);
    s = sessionReducer(s, { type: 'UNDO' });
    expect(s.choices).toEqual({ floors: 1 });
    s = sessionReducer(s, { type: 'CLEAR' });
    expect(s.choices).toEqual({});
  });

  it('다 짓지 않으면 제출할 수 없고, 다 지으면 채점된다. 고쳐서 다시 제출할 수 있다', () => {
    let s = build(start(), [1, 'n:cat', 'sg', 'd:the', 'v:sleep']);
    expect(sessionReducer(s, { type: 'SUBMIT', level, now: 1 })).toBe(s);
    s = build(s, ['base']);
    s = sessionReducer(s, { type: 'SUBMIT', level, now: 1 });
    expect(s.phase).toBe('result');
    expect(currentResult(level, s).errorRefs).toEqual(['0.V']);
    s = sessionReducer(s, { type: 'EDIT' });
    s = sessionReducer(s, { type: 'EDIT_UNIT', level, unit: '0.V' });
    s = build(s, ['v:sleep', 's']);
    expect(currentResult(level, s)).toBeNull(); // 건물이 바뀌면 이전 오류 표시를 지운다
    s = sessionReducer(s, { type: 'SUBMIT', level, now: 2 });
    expect(s.attempts.at(-1).result.total).toBe(100);
  });
});

describe('레벨 해금과 다음 레벨', () => {
  const levels = ALL_LEVELS;
  const done = (...ids) => Object.fromEntries(ids.map((id) => [id, { completed: true, opened: true, stars: 3 }]));

  it('처음에는 가장 쉬운 난이도만, 하나를 완공하면 다음 난이도가 한꺼번에 열린다', () => {
    expect(unlockedTiers(levels, {})).toEqual([1]);
    expect(unlockedTiers(levels, done(1))).toEqual([1, 2]);
    expect(unlockedTiers(levels, done(1, 4))).toEqual([1, 2, 3]);
  });

  it('새로 도착한 레벨에만 New! (처음부터 있던 레벨과 이미 연 레벨은 아님)', () => {
    const p = done(1);
    expect(isNew(levels.find((l) => l.id === 2), levels, p)).toBe(false);
    expect(isNew(levels.find((l) => l.id === 3), levels, p)).toBe(true);
    expect(isNew(levels.find((l) => l.id === 3), levels, { ...p, 3: { opened: true } })).toBe(false);
  });

  it('다음 레벨: 같은 난이도의 안 해 본 레벨 → 다음 난이도 → 같은 난이도', () => {
    const one = levels.find((l) => l.id === 1);
    expect(pickNextLevel(one, levels, done(1)).id).toBe(2);
    const p = done(1, 2);
    expect([3, 4]).toContain(pickNextLevel(one, levels, p).id);
    // 완공하지 못해 다음 난이도가 열리지 않았으면 같은 난이도의 다른 레벨
    expect(pickNextLevel(one, levels, { 1: { opened: true }, 2: { opened: true } }).id).toBe(2);
    // 무작위: 같은 순위 안에서 고른다
    const three = levels.find((l) => l.id === 3);
    expect(pickNextLevel(three, levels, done(1, 3), () => 0).id).toBe(4);
  });
});

describe('레벨 데이터 검사기', () => {
  it('빠진 항목이나 잘못된 값을 찾아낸다', () => {
    expect(validateLevel(null)).not.toEqual([]);
    expect(validateLevel({ ...level, checks: { ...level.checks, meaning: [] } }).join()).toMatch(/meaning/);
    const badWord = { ...level, floors: [{ comps: [{ ...level.floors[0].comps[0], words: ['없는단어'] }, level.floors[0].comps[1]] }] };
    expect(validateLevel(badWord).join()).toMatch(/사전에 없는 단어/);
    const badAnswer = { ...level, answers: { ...level.answers, accepted: [{ '0.S': { word: 'cat' } }] } };
    expect(validateLevel(badAnswer).join()).toMatch(/다 지어지지 않았거나/);
    const noStairs = { ...level, floors: [level.floors[0], { comps: level.floors[0].comps }] };
    expect(validateLevel(noStairs).join()).toMatch(/계단/);
    const noGrammar = level.conditions.map(({ grammar, ...rest }) => rest);
    expect(validateLevel({ ...level, conditions: noGrammar }).join()).toMatch(/문장에서의 뜻/);
  });
});
