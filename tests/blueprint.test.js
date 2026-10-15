import { describe, expect, it } from 'vitest';
import { makeBlueprint } from '../src/building/makeBlueprint.js';
import level from '../src/data/levels/level01.js';
import level5 from '../src/data/levels/level05.js';
import level7 from '../src/data/levels/level07.js';
import { scoreSentence } from '../src/game/scoring.js';
import { answerChoices } from './helpers.js';

const room = (bp, ref) => bp.floors.flatMap((f) => f.rooms).find((r) => r.ref === ref);

describe('건물 설계도', () => {
  it('층수를 고르기 전에는 기초만 있다', () => {
    const bp = makeBlueprint(level, {});
    expect(bp.floors).toEqual([]);
    expect(bp.stairs).toEqual([]);
  });

  it('층수를 고르면 방들이 유령(아직 시작 전)으로 보이고, 지금 짓는 방이 "짓는 중"', () => {
    const bp = makeBlueprint(level, { floors: 1 }, null, { activeUnit: '0.S' });
    expect(bp.floors[0].rooms.map((r) => [r.ref, r.state, r.active])).toEqual([
      ['0.S', 'building', true],
      ['0.V', 'ghost', false],
    ]);
    expect(bp.floors[0].roofed).toBe(false);
  });

  it('방 안의 부품: 복수면 가구 2개, 문패(관사), 동사 재질(시제)', () => {
    const c = { floors: 1, '0.S.word': 'n:cat', '0.S.form': 'pl', '0.S.det': 'd:the', '0.V.word': 'v:sleep', '0.V.form': 'past' };
    const bp = makeBlueprint(level, c);
    expect(room(bp, '0.S')).toMatchObject({ word: 'cats', plural: true, det: 'the', state: 'done', text: 'the cats' });
    expect(room(bp, '0.V')).toMatchObject({ word: 'slept', tense: 'past', state: 'done' });
    expect(bp.floors[0].roofed).toBe(true); // 정답이 아니어도 다 지으면 지붕 (기획 결정 ①)
  });

  it('형용사(카펫)와 관사 없음, 방은 문장 순서대로 놓인다', () => {
    const bp = makeBlueprint(level7, answerChoices(level7));
    expect(bp.floors[0].rooms.map((r) => r.ref)).toEqual(['0.S', '0.often', '0.V', '0.O']);
    expect(room(bp, '0.O')).toMatchObject({ adj: 'warm', det: '' });
    expect(room(bp, '0.often').kind).toBe('mod');
  });

  it('두 절 레벨: 2층 + 계단, 문장 맨 앞 접속사도 1층과 2층을 잇는다', () => {
    const bp = makeBlueprint(level5, answerChoices(level5), null, { activeUnit: 'L1' });
    expect(bp.floors).toHaveLength(2);
    expect(bp.stairs).toEqual([{ ref: 'L1', from: 0, state: 'done', word: 'when', active: true, warn: false }]);
  });

  it('제출 후 고칠 점이 있는 방에 경고, 완공이면 깃발·울타리·나무 표시', () => {
    const wrong = { ...answerChoices(level), '0.V.form': 'base' };
    const bp = makeBlueprint(level, wrong, scoreSentence(level, wrong));
    expect(room(bp, '0.V').warn).toBe(true);
    expect(bp.completed).toBe(true); // 75점
    const right = answerChoices(level);
    expect(makeBlueprint(level, right, scoreSentence(level, right)).success).toBe(true);
  });

  it('층수가 다른 견본 건물로 바뀌면 깃발을 새로 만든다 (메인 화면 깃발이 떠 있던 문제)', async () => {
    const { buildParts } = await import('../src/building/buildParts.js');
    const { SHOWCASE_BLUEPRINTS } = await import('../src/building/showcase.js');
    const info = SHOWCASE_BLUEPRINTS.map((bp) => ({
      floors: bp.floors.length,
      sig: buildParts(bp, { labels: false }).parts.find((p) => p.key === 'flag')?.sig,
    }));
    expect(info.every((x) => x.sig)).toBe(true); // 모든 견본 건물에 깃발 (요청 8)
    for (const a of info) for (const b of info) if (a.floors !== b.floors) expect(a.sig).not.toBe(b.sig);
  });
});
