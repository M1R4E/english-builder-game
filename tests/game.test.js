import { describe, expect, it } from 'vitest';
import level from '../src/data/levels/level01.js';
import level4 from '../src/data/levels/level04.js';
import level5 from '../src/data/levels/level05.js';
import { analyzePlaced, sentenceText } from '../src/game/analyzeSentence.js';
import { computeReward, estimatePenalty } from '../src/game/reward.js';
import { createSession, currentResult, sessionReducer } from '../src/game/session.js';
import { getSlots } from '../src/game/slots.js';
import { validateLevel } from '../src/game/validateLevel.js';

describe('자리와 문장 분석', () => {
  it('자리 순서: 문장 맨 앞 계단 → 1층 → 2층', () => {
    expect(getSlots(level5).map((s) => s.key)).toEqual(['L0', '0-S', '0-V', '1-S', '1-V', '1-M-where']);
    expect(getSlots(level4).map((s) => s.key)).toEqual(['0-S', '0-V', '0-C', 'L0', '1-S', '1-V', '1-O']);
  });

  it('카드를 층별로 나누고, 계단의 접속사는 따로 모은다', () => {
    const a = analyzePlaced(level4, level4.answers.accepted[0]);
    expect(a.clauses).toHaveLength(2);
    expect(a.clauses[1].roles.S[0].text).toBe('he');
    expect(a.links.L0.text).toBe('but');
  });

  it('첫 글자를 대문자로, 끝에 마침표, 레벨 구조에 맞춰 쉼표를 붙인다', () => {
    expect(sentenceText(level, { '0-S': 'the-cat', '0-V': 'sleeps' })).toBe('The cat sleeps.');
    expect(sentenceText(level4, level4.answers.accepted[0])).toBe('The carpenter was tired, but he finished the work.');
    expect(sentenceText(level5, level5.answers.accepted[1])).toBe('After the rain stopped, the children played outside.');
    expect(sentenceText(level, {})).toBe('');
  });

  it('빈자리가 있으면 그 자리를 건너뛰고, 쉼표가 겹치거나 끝에 남지 않는다', () => {
    expect(sentenceText(level4, { '0-S': 'the-carpenter', L0: 'but' })).toBe('The carpenter, but.');
    expect(sentenceText(level5, { L0: 'when', '0-S': 'the-rain' })).toBe('When the rain.');
  });
});

describe('보상 계산', () => {
  it('별과 완공은 최고 점수, 예측 비교는 첫 제출 점수 기준', () => {
    const r = computeReward(80, [60, 90]);
    expect(r.first).toBe(60);
    expect(r.best).toBe(90);
    expect(r.stars).toBe(2);
    expect(r.completed).toBe(true);
    expect(r.predictionDiff).toBe(20);
    expect(r.predictionBadge).toBe('거의 정확한 견적');
    expect(r.persistedBadge).toBe(true);
  });

  it('비정상적인 값이 들어와도 0~100 범위를 벗어나지 않는다', () => {
    const r = computeReward(150, [-20, NaN]);
    expect(r.prediction).toBe(100);
    expect(r.best).toBe(0);
    expect(r.predictionDiff).toBe(100);
    expect(r.stars).toBe(0);
  });

  it('제출 기록이 없으면 null', () => {
    expect(computeReward(50, [])).toBeNull();
  });
});

describe('견적 오차 차감 (최종 공사 대금)', () => {
  it('차이가 봐주는 범위(10점) 이하이면 차감 없음', () => {
    expect(estimatePenalty(0)).toBe(0);
    expect(estimatePenalty(10)).toBe(0);
    expect(estimatePenalty(25)).toBe(7); // 7.5 → 1,000원 미만은 버림
    const r = computeReward(80, [75]);
    expect(r.estimatePenalty).toBe(0);
    expect(r.finalPay).toBe(75);
  });

  it('넘은 차이의 절반을 뺀다: 견적 100, 첫 제출 60, 고쳐서 100 → 85', () => {
    const r = computeReward(100, [60, 100]);
    expect(r.predictionDiff).toBe(40);
    expect(r.estimatePenalty).toBe(15); // (40 − 10) × 0.5
    expect(r.best).toBe(100); // 문장 점수와 별은 견적과 관계없음
    expect(r.stars).toBe(3);
    expect(r.finalPay).toBe(85);
  });

  it('견적이 실제보다 낮았으면 차감하지 않는다 (견적 0, 실제 100 → 차감 없음)', () => {
    const r = computeReward(0, [100]);
    expect(r.predictionDiff).toBe(100); // 견적 비교(자기평가 기록)에는 차이가 그대로 남는다
    expect(r.estimatePenalty).toBe(0);
    expect(r.finalPay).toBe(100);
  });

  it('최종 공사 대금은 0보다 작아지지 않고, 모든 경우 0~100 정수', () => {
    expect(computeReward(100, [0]).finalPay).toBe(0);
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

describe('플레이 진행 상태 (자리를 골라 카드 놓기)', () => {
  const start = () => sessionReducer(createSession(level), { type: 'START', now: 0 });
  const place = (s, id) => sessionReducer(s, { type: 'PLACE', id, level });

  it('처음에는 주어 기둥을 고르고 있고, 카드를 놓으면 다음 빈자리로 넘어간다', () => {
    let s = start();
    expect(s.slots.map((x) => x.key)).toEqual(['0-S', '0-V']);
    expect(s.activeSlot).toBe('0-S');
    s = place(s, 'the-cat');
    expect(s.placed).toEqual({ '0-S': 'the-cat' });
    expect(s.activeSlot).toBe('0-V');
    s = place(s, 'sleeps');
    expect(s.placed).toEqual({ '0-S': 'the-cat', '0-V': 'sleeps' });
    expect(s.activeSlot).toBeNull(); // 모든 자리가 찼다
  });

  it('자리에 맞지 않는 성분의 카드는 놓을 수 없다', () => {
    let s = start(); // 주어 기둥을 고르는 중
    s = place(s, 'sleeps');
    expect(s.placed).toEqual({});
  });

  it('자리를 다시 골라 카드를 바꾸고, 같은 카드를 누르면 빠지고, 되돌리기', () => {
    let s = start();
    s = place(s, 'the-cat');
    s = place(s, 'sleep');
    s = sessionReducer(s, { type: 'SELECT_SLOT', key: '0-V' });
    s = place(s, 'sleeps'); // 바꾸기
    expect(s.placed).toEqual({ '0-S': 'the-cat', '0-V': 'sleeps' });
    s = sessionReducer(s, { type: 'SELECT_SLOT', key: '0-S' });
    s = place(s, 'the-cat'); // 같은 카드 → 빼기
    expect(s.placed).toEqual({ '0-V': 'sleeps' });
    expect(s.activeSlot).toBe('0-S');
    s = sessionReducer(s, { type: 'UNDO' });
    expect(s.placed).toEqual({ '0-S': 'the-cat', '0-V': 'sleeps' });
    s = sessionReducer(s, { type: 'CLEAR_SLOT', key: '0-V' });
    expect(s.placed).toEqual({ '0-S': 'the-cat' });
    expect(s.activeSlot).toBe('0-V');
    s = sessionReducer(s, { type: 'CLEAR' });
    expect(s.placed).toEqual({});
  });

  it('없는 자리는 고를 수 없고, 조립 단계가 아니면 바뀌지 않는다', () => {
    let s = start();
    s = sessionReducer(s, { type: 'SELECT_SLOT', key: '5-O' });
    expect(s.activeSlot).toBe('0-S');
    const before = createSession(level); // 아직 주문서 단계
    expect(sessionReducer(before, { type: 'PLACE', id: 'the-cat', level })).toBe(before);
  });

  it('제출 → 결과 → 고쳐서 다시 제출', () => {
    let s = start();
    s = place(s, 'the-cat');
    s = place(s, 'sleep');
    s = sessionReducer(s, { type: 'SUBMIT', level, now: 1 });
    expect(s.phase).toBe('result');
    expect(currentResult(s).total).toBe(75);
    s = sessionReducer(s, { type: 'EDIT' });
    s = sessionReducer(s, { type: 'CLEAR_SLOT', key: '0-V' });
    expect(currentResult(s)).toBeNull(); // 카드가 바뀌면 이전 오류 표시를 지운다
    s = place(s, 'sleeps');
    s = sessionReducer(s, { type: 'SUBMIT', level, now: 2 });
    expect(s.attempts.map((a) => a.result.total)).toEqual([75, 100]);
  });

  it('빈 문장은 제출할 수 없다', () => {
    const s = sessionReducer(start(), { type: 'SUBMIT', level, now: 1 });
    expect(s.phase).toBe('build');
    expect(s.attempts).toHaveLength(0);
  });
});

describe('레벨 데이터 검사기', () => {
  it('빠진 항목이나 잘못된 배점을 찾아낸다', () => {
    expect(validateLevel(null)).not.toEqual([]);
    expect(validateLevel({ ...level, checks: level.checks.slice(1) }).join()).toMatch(/grammar 배점 합계/);
    expect(validateLevel({ ...level, answers: { accepted: [{ '0-S': '없는카드', '0-V': 'sleeps' }] } }).join()).toMatch(/없는 카드 id/);
    expect(validateLevel({ ...level, answers: { accepted: [{ '0-S': 'sleeps', '0-V': 'sleeps' }] } }).join()).toMatch(/놓을 수 없음/);
    expect(validateLevel({ ...level, answers: { accepted: [{ '0-S': 'the-cat' }] } }).join()).toMatch(/필수 자리 0-V/);
    const twoFloorsNoStairs = { ...level, structure: { clauses: [{ slots: ['S', 'V'] }, { slots: ['S', 'V'] }] } };
    expect(validateLevel(twoFloorsNoStairs).join()).toMatch(/계단/);
    const noGrammar = level.conditions.map(({ grammar, ...rest }) => rest);
    expect(validateLevel({ ...level, conditions: noGrammar }).join()).toMatch(/문장에서의 뜻/);
  });
});
