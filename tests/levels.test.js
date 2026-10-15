import { describe, expect, it } from 'vitest';
import { ALL_LEVELS } from '../src/data/levels/index.js';
import { scoreSentence } from '../src/game/scoring.js';
import { isComplete, normalizeAnswer, sameChoices, sentenceText } from '../src/game/structure.js';
import { validateLevel } from '../src/game/validateLevel.js';
import { answerChoices, complete, seededRandom, singleChanges } from './helpers.js';

// ── 모든 레벨 공통 검사 ──
describe.each(ALL_LEVELS.map((level) => [level.id, level]))('레벨 %i 공통 검사', (_id, level) => {
  const accepted = level.answers.accepted.map((a) => normalizeAnswer(level, a));
  const isAccepted = (c) => accepted.some((a) => sameChoices(level, a, c));
  const changes = [...singleChanges(level)];

  it('데이터 검사에서 문제가 없다', () => {
    expect(validateLevel(level)).toEqual([]);
  });

  it('검증된 정답은 모두 다 지어진 100점 건물이고, 대표 정답 문장과 첫 번째 정답이 같다', () => {
    for (const a of accepted) {
      expect(isComplete(level, a)).toBe(true);
      expect(scoreSentence(level, a).total).toBe(100);
    }
    expect(sentenceText(level, accepted[0])).toBe(level.answers.main);
  });

  it('정답에서 한 단계만 바꿔도 (다른 정답이 아니면) 점수가 내려가고 무엇이 문제인지 알려 준다', () => {
    expect(changes.length).toBeGreaterThan(0);
    for (const { step, value, choices } of changes) {
      if (isAccepted(choices)) continue;
      const r = scoreSentence(level, choices);
      const flagged = r.checks.filter((c) => c.status === 'fail' || c.status === 'partial');
      expect(r.total, `${step.key}=${value}`).toBeLessThan(100);
      expect(flagged.length, `${step.key}=${value}`).toBeGreaterThan(0);
    }
  });

  it('무작위로 지은 건물 3,000채: 점수는 0~100 정수, 같은 건물은 같은 점수, 100점은 검증된 정답뿐', () => {
    const rand = seededRandom(level.id * 7919);
    for (let i = 0; i < 3000; i += 1) {
      const c = complete(level, {}, {}, (opts) => opts[Math.floor(rand() * opts.length)]);
      const r = scoreSentence(level, c);
      expect(Number.isInteger(r.total)).toBe(true);
      expect(r.total).toBeGreaterThanOrEqual(0);
      expect(r.total).toBeLessThanOrEqual(100);
      for (const cat of Object.values(r.categories)) expect(cat.earned).toBeLessThanOrEqual(cat.max);
      if (r.total === 100) expect(isAccepted(c)).toBe(true);
      if (i % 100 === 0) expect(scoreSentence(level, c)).toEqual(r);
    }
  });

  it('범주별 배점 합계가 100점이다', () => {
    const r = scoreSentence(level, accepted[0]);
    expect(Object.values(r.categories).map((c) => c.max)).toEqual([30, 30, 25, 15]);
    expect(r.checks.reduce((s, c) => s + c.points, 0)).toBe(100);
  });
});

// ── 레벨별 대표 오답 (기획 의도대로 지적하는지) ──
const level = (id) => ALL_LEVELS.find((l) => l.id === id);
const failedWith = (id, changes) => {
  const lv = level(id);
  const c = complete(lv, { ...answerChoices(lv), ...changes }, answerChoices(lv));
  const r = scoreSentence(lv, c);
  return { r, failed: r.checks.filter((x) => x.status === 'fail').map((x) => x.id), text: sentenceText(lv, c) };
};

describe('레벨별 대표 오답', () => {
  it('레벨 1: The cat sleep. → 수 일치만 / The cats sleep. → 의미(한 마리)만 / Cat sleeps. → 관사 문법', () => {
    expect(failedWith(1, { '0.V.form': 'base' }).failed).toEqual(['G-0-agree']);
    expect(failedWith(1, { '0.S.form': 'pl', '0.V.form': 'base' }).failed).toEqual(['M2']);
    expect(failedWith(1, { '0.S.det': 'd:none' }).failed).toEqual(['G-0.S-np']);
    // sleeped: 틀린 형태(문법)이면서 과거형(현재 시제 요청 위반) → 두 가지 모두 알려 준다
    expect(failedWith(1, { '0.V.form': 'bad0' }).failed).toEqual(['G-0.V-verb', 'C1']);
  });

  it('레벨 2: likes to the ball → 특별 요청(출입문 없음)만 지적', () => {
    const { failed, text } = failedWith(2, { '0.O.prep': 'p:to' });
    expect(text).toBe('The dog likes to the ball.');
    expect(failed).toEqual(['C1']);
  });

  it('레벨 3: peaceful(형용사)은 품사만, on the small room은 의미만 지적', () => {
    expect(failedWith(3, { '0.how.form': 'adj' }).failed).toEqual(['G-0.how-pos']);
    expect(failedWith(3, { '0.where.prep': 'p:on' }).failed).toEqual(['M5']);
  });

  it('레벨 4: so는 의미, tiring은 문법, were는 수 일치만 지적', () => {
    expect(failedWith(4, { 'L1.word': 'c:so' }).failed).toEqual(['M3']);
    expect(failedWith(4, { '0.C.form': 'ing' }).failed).toEqual(['G1']);
    expect(failedWith(4, { '0.V.form': 'were' }).failed).toEqual(['G-0-agree']);
  });

  it('레벨 5: After도 정답, childs는 명사 문법, outdoor는 품사 지적', () => {
    expect(failedWith(5, { 'L1.word': 'c:after' }).r.total).toBe(100);
    expect(failedWith(5, { '0.S.form': 'bad0' }).failed).toEqual(['G-0.S-np']);
    expect(failedWith(5, { '0.where.word': 'a:outdoor' }).failed).toEqual(['G-0.where-pos']);
  });

  it('레벨 6: at home도 정답, to home은 문법, so는 특별 요청, raining만 쓰면 be동사 지적', () => {
    expect(failedWith(6, { '0.where.prep': 'p:at' }).r.total).toBe(100);
    expect(failedWith(6, { '0.where.prep': 'p:to' }).failed).toEqual(['G1']);
    expect(failedWith(6, { 'L1.word': 'c:so' }).failed).toEqual(['C1']);
    expect(failedWith(6, { '1.V.aux': 'x:none' }).failed).toContain('G-1.V-verb');
  });

  it('레벨 7: a warm milk는 셀 수 없는 명사 문법, usual은 품사 지적', () => {
    expect(failedWith(7, { '0.O.det': 'd:a' }).failed).toEqual(['G-0.O-np']);
    expect(failedWith(7, { '0.often.form': 'adj' }).failed).toEqual(['G-0.often-pos']);
  });

  it('레벨 8: 두 장식 방의 내용을 바꾸면 순서 항목만 지적되고 뜻은 인정, an English와 studys도 지적', () => {
    const swapped = failedWith(8, {
      '0.front.word': 'n:library', '0.front.form': 'sg', '0.front.det': 'd:the', '0.front.prep': 'p:at',
      '0.end.word': 'a:always',
    });
    expect(swapped.text).toBe('Mina at the library studies English always.');
    expect(swapped.failed).toEqual(['G1']);
    expect(swapped.r.categories.meaning.earned).toBe(30);
    expect(failedWith(8, { '0.O.det': 'd:an' }).failed).toEqual(['G-0.O-np']);
    expect(failedWith(8, { '0.V.form': 'bad0' }).failed).toEqual(['G-0.V-verb']);
  });

  it('레벨 9: since도 정답, an new bridge와 builded는 문법 지적', () => {
    expect(failedWith(9, { 'L1.word': 'c:since' }).r.total).toBe(100);
    expect(failedWith(9, { '0.O.det': 'd:an' }).failed).toEqual(['G-0.O-np']);
    expect(failedWith(9, { '0.V.form': 'bad0' }).failed).toEqual(['G-0.V-verb']);
  });

  it('레벨 10: sweetly, breads, every mornings는 각각 문법 항목 하나만 지적', () => {
    expect(failedWith(10, { '1.C.form': 'adv' }).failed).toEqual(['G-1.C-pos']);
    expect(failedWith(10, { '0.O.form': 'pl' }).failed).toEqual(['G-0.O-np']);
    expect(failedWith(10, { '0.when.form': 'pl' }).failed).toEqual(['G-0.when-np']);
    expect(failedWith(10, { 'L1.word': 'c:because' }).failed).toEqual(['M4']);
  });
});
