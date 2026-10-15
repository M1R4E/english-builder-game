import { describe, expect, it } from 'vitest';
import level from '../src/data/levels/level01.js';
import { analyzeSentence, sentenceText } from '../src/game/analyzeSentence.js';
import { computeReward } from '../src/game/reward.js';
import { createSession, currentResult, sessionReducer } from '../src/game/session.js';
import { validateLevel } from '../src/game/validateLevel.js';

const card = (text, role) => ({ id: text, text, role });

describe('문장 분석', () => {
  it('접속사로 절(층)을 나눈다', () => {
    const a = analyzeSentence([card('I', 'S'), card('was tired', 'V'), card(', but', 'CONJ'), card('I', 'S'), card('slept', 'V')]);
    expect(a.clauses).toHaveLength(2);
    expect(a.connectors).toHaveLength(1);
  });

  it('문장 맨 앞의 접속사는 새 층을 만들지 않는다', () => {
    const a = analyzeSentence([card('when', 'CONJ'), card('it', 'S'), card('rained', 'V')]);
    expect(a.clauses).toHaveLength(1);
    expect(a.clauses[0].leadingConnector.text).toBe('when');
  });

  it('첫 글자를 대문자로, 끝에 마침표를 붙인다', () => {
    expect(sentenceText([card('the cat', 'S'), card('sleeps', 'V')])).toBe('The cat sleeps.');
    expect(sentenceText([card('I', 'S'), card('ran', 'V'), card(', so', 'CONJ'), card('I', 'S'), card('won', 'V')]))
      .toBe('I ran, so I won.');
    expect(sentenceText([])).toBe('');
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

describe('플레이 진행 상태', () => {
  const start = () => sessionReducer(createSession(level), { type: 'START', now: 0 });

  it('카드 추가, 순서 바꾸기, 빼기, 되돌리기', () => {
    let s = start();
    s = sessionReducer(s, { type: 'ADD_CARD', id: 'sleeps' });
    s = sessionReducer(s, { type: 'ADD_CARD', id: 'the-cat' });
    s = sessionReducer(s, { type: 'ADD_CARD', id: 'the-cat' }); // 같은 카드는 한 번만
    expect(s.selected).toEqual(['sleeps', 'the-cat']);
    s = sessionReducer(s, { type: 'MOVE', index: 1, delta: -1 });
    expect(s.selected).toEqual(['the-cat', 'sleeps']);
    s = sessionReducer(s, { type: 'REMOVE_AT', index: 0 });
    expect(s.selected).toEqual(['sleeps']);
    s = sessionReducer(s, { type: 'UNDO' });
    expect(s.selected).toEqual(['the-cat', 'sleeps']);
  });

  it('제출 → 결과 → 고쳐서 다시 제출', () => {
    let s = start();
    s = sessionReducer(s, { type: 'ADD_CARD', id: 'the-cat' });
    s = sessionReducer(s, { type: 'ADD_CARD', id: 'sleep' });
    s = sessionReducer(s, { type: 'SUBMIT', level, now: 1 });
    expect(s.phase).toBe('result');
    expect(currentResult(s).total).toBe(75);
    s = sessionReducer(s, { type: 'EDIT' });
    s = sessionReducer(s, { type: 'REMOVE_AT', index: 1 });
    expect(currentResult(s)).toBeNull(); // 카드가 바뀌면 이전 오류 표시를 지운다
    s = sessionReducer(s, { type: 'ADD_CARD', id: 'sleeps' });
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
    expect(validateLevel({ ...level, answers: { accepted: [['없는카드']] } }).join()).toMatch(/없는 카드 id/);
  });
});
