import { describe, expect, it } from 'vitest';
import { COMPLETE_THRESHOLD } from '../src/config.js';
import { ALL_LEVELS } from '../src/data/levels/index.js';
import { sentenceText } from '../src/game/analyzeSentence.js';
import { scoreSentence } from '../src/game/scoring.js';
import { samePlaced } from '../src/game/slots.js';
import { validateLevel } from '../src/game/validateLevel.js';
import { allPlacements, changed } from './helpers.js';

// ── 모든 레벨 공통 검사 ──
// 레벨마다 만들 수 있는 모든 배치를 채점해 본다 (레벨 10은 약 6만 가지).
describe.each(ALL_LEVELS.map((level) => [level.id, level]))('레벨 %i 공통 검사', (_id, level) => {
  const all = [...allPlacements(level)];
  const accepted = level.answers.accepted;
  const isAccepted = (p) => accepted.some((a) => samePlaced(a, p));

  it('데이터 검사에서 문제가 없다', () => {
    expect(validateLevel(level)).toEqual([]);
  });

  it('검증된 정답은 모두 100점이고, 대표 정답 문장과 첫 번째 정답이 같다', () => {
    for (const answer of accepted) expect(scoreSentence(level, answer).total).toBe(100);
    expect(sentenceText(level, accepted[0])).toBe(level.answers.main);
  });

  it('모든 배치의 점수가 0~100 사이의 정수이고, 같은 답은 항상 같은 점수', () => {
    for (const p of all) {
      const r = scoreSentence(level, p);
      expect(Number.isInteger(r.total)).toBe(true);
      expect(r.total).toBeGreaterThanOrEqual(0);
      expect(r.total).toBeLessThanOrEqual(100);
      for (const c of Object.values(r.categories)) expect(c.earned).toBeLessThanOrEqual(c.max);
    }
    // 같은 답을 다시 채점해도 같은 결과 (일부만 골라 확인)
    for (let i = 0; i < all.length; i += 97) expect(scoreSentence(level, all[i])).toEqual(scoreSentence(level, all[i]));
  });

  it('100점은 검증된 정답뿐이다 (예상하지 못한 만점 없음)', () => {
    const perfect = all.filter((p) => scoreSentence(level, p).total === 100);
    expect(perfect.every(isAccepted)).toBe(true);
    expect(perfect).toHaveLength(accepted.length);
  });

  it('필수 자리가 하나라도 비면 완공할 수 없다', () => {
    for (const p of all) {
      const r = scoreSentence(level, p);
      if (r.missing.length > 0) expect(r.total).toBeLessThan(COMPLETE_THRESHOLD);
    }
  });

  it('정답에서 필수 자리 하나만 비우면, 어느 자리든 똑같이 누락 감점만 받는다 (60점)', () => {
    const answer = accepted[0];
    for (const p of all) {
      const emptied = Object.keys(answer).filter((k) => !p[k]);
      const same = Object.keys(p).every((k) => p[k] === answer[k]);
      if (emptied.length !== 1 || !same) continue;
      const r = scoreSentence(level, p);
      if (r.missing.length === 1) expect(r.total).toBe(100 - r.penalty);
    }
  });

  it('정답에서 카드 하나만 바꾸면, 고칠 점이 하나 이상 지적되고 점수가 내려간다', () => {
    const answer = accepted[0];
    for (const p of all) {
      const diff = Object.keys({ ...answer, ...p }).filter((k) => (answer[k] ?? null) !== (p[k] ?? null));
      if (diff.length !== 1 || isAccepted(p)) continue;
      const r = scoreSentence(level, p);
      expect(r.total).toBeLessThan(100);
      const flagged = r.missing.length + r.checks.filter((c) => c.status === 'fail').length;
      // 장식 자리를 비운 경우는 특별 요청 사항이나 의미 항목에서, 그 밖에는 실패 항목으로 지적된다
      expect(flagged + (r.checks.some((c) => c.status === 'partial') ? 1 : 0)).toBeGreaterThan(0);
    }
  });
});

// ── 레벨별 대표 답안 점수 (기획 의도대로 채점되는지 고정) ──
const failed = (r) => r.checks.filter((c) => c.status === 'fail').map((c) => c.id);
const level = (id) => ALL_LEVELS.find((l) => l.id === id);
const answer = (id) => level(id).answers.accepted[0];
const score = (id, changes) => scoreSentence(level(id), changed(answer(id), changes));

describe('레벨별 대표 오답', () => {
  it('레벨 2: to the ball → 특별 요청(문 달지 않기) 실패, 완공 못 함', () => {
    const r = score(2, { '0-O': 'to-the-ball' });
    expect(failed(r)).toEqual(['C1']);
    expect(r.total).toBeLessThan(COMPLETE_THRESHOLD);
  });

  it('레벨 3: peaceful(형용사) → 부사 항목만 지적', () => {
    expect(failed(score(3, { '0-M-how': 'peaceful' }))).toEqual(['G2']);
    expect(failed(score(3, { '0-M-where': 'in-the-room-small' }))).toEqual(['G3']);
  });

  it('레벨 3: 장식을 비우면 특별 요청 사항에서 한 번만 지적', () => {
    expect(failed(score(3, { '0-M-how': null }))).toEqual(['C1']);
  });

  it('레벨 4: so/because를 고르면 의미(반대 흐름) 지적, tiring은 문법 지적', () => {
    expect(failed(score(4, { L0: 'so' }))).toEqual(['M1']);
    expect(failed(score(4, { '0-C': 'tiring' }))).toEqual(['G2']);
    expect(failed(score(4, { '0-V': 'is' }))).toEqual(['C1']);
  });

  it('레벨 5: When과 After 모두 정답, Before는 의미 오류', () => {
    expect(score(5, { L0: 'after' }).total).toBe(100);
    expect(failed(score(5, { L0: 'before' }))).toEqual(['M1']);
    expect(failed(score(5, { '1-M-where': 'outdoor' }))).toEqual(['G2']);
  });

  it('레벨 6: home과 at home 모두 정답, so는 특별 요청(이유) 실패', () => {
    expect(score(6, { '0-M-where': 'at-home' }).total).toBe(100);
    expect(failed(score(6, { L0: 'so' }))).toEqual(['C1']);
    expect(failed(score(6, { '1-V': 'is-raining' }))).toEqual(['G3']);
  });

  it('레벨 7: never는 의미, usual은 문법, milk warm은 문법 지적', () => {
    expect(failed(score(7, { '0-M-often': 'never' }))).toEqual(['M2']);
    expect(failed(score(7, { '0-M-often': 'usual' }))).toEqual(['G2']);
    expect(failed(score(7, { '0-O': 'milk-warm' }))).toEqual(['G3']);
  });

  it('레벨 8: 두 장식의 자리를 바꾸면 순서 항목 하나만 지적되고 뜻은 인정', () => {
    const r = score(8, { '0-M-front': 'at-the-library', '0-M-end': 'always' });
    expect(failed(r)).toEqual(['G1']);
    expect(r.categories.meaning.earned).toBe(30);
    expect(failed(score(8, { '0-V': 'studys' }))).toEqual(['G3']);
    expect(failed(score(8, { '0-O': 'an-english' }))).toEqual(['C1']);
  });

  it('레벨 9: since도 정답, builded와 an new bridge는 문법 지적', () => {
    expect(score(9, { L0: 'since' }).total).toBe(100);
    expect(failed(score(9, { '1-V': 'builded' }))).toEqual(['G2']);
    expect(failed(score(9, { '1-O': 'an-new-bridge' }))).toEqual(['G3']);
    expect(failed(score(9, { '1-V': 'build' }))).toEqual(['C1']);
  });

  it('레벨 10: sweetly, breads, every mornings는 각각 문법 항목 하나만 지적', () => {
    expect(failed(score(10, { '1-C': 'sweetly' }))).toEqual(['G4']);
    expect(failed(score(10, { '0-O': 'breads' }))).toEqual(['G3']);
    expect(failed(score(10, { '0-M-when': 'every-mornings' }))).toEqual(['G5']);
    expect(failed(score(10, { L0: 'because' }))).toEqual(['M1']);
  });
});
