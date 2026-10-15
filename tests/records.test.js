import { describe, expect, it } from 'vitest';
import { ALL_LEVELS } from '../src/data/levels/index.js';
import level from '../src/data/levels/level01.js';
import { buildRecord, recommend, recordsToCsv } from '../src/game/records.js';
import { createSession, sessionReducer } from '../src/game/session.js';
import {
  emptyData, loadData, saveData, STORAGE_KEY, startNewPlayer, updatePlayer, upsertRecord, walletPoints,
} from '../src/game/storage.js';
import { validateLevel } from '../src/game/validateLevel.js';

// 테스트용 가짜 저장소
const fakeStorage = (init = {}) => {
  const m = { ...init };
  return { getItem: (k) => m[k] ?? null, setItem: (k, v) => { m[k] = v; }, dump: m };
};

describe('브라우저 저장소', () => {
  it('저장했다가 다시 읽으면 그대로 돌아온다', () => {
    const s = fakeStorage();
    const data = updatePlayer(emptyData(0), (p) => ({ ...p, progress: { 1: { completed: true, stars: 4, bestPay: 90 } } }));
    expect(saveData(data, s)).toBe(true);
    expect(loadData(s)).toEqual(data);
  });

  it('비어 있거나 망가진 값이면 새로 시작한다 (게임이 멈추지 않게)', () => {
    expect(loadData(fakeStorage(), 0)).toEqual(emptyData(0));
    expect(loadData(fakeStorage({ [STORAGE_KEY]: '{망가짐' }), 0)).toEqual(emptyData(0));
    expect(loadData(fakeStorage({ [STORAGE_KEY]: '{"version":99}' }), 0)).toEqual(emptyData(0));
  });

  it('저장할 수 없는 환경에서도 오류 없이 넘어간다', () => {
    const broken = { getItem: () => { throw new Error('막힘'); }, setItem: () => { throw new Error('막힘'); } };
    expect(saveData(emptyData(), broken)).toBe(false);
    expect(loadData(broken, 0)).toEqual(emptyData(0));
  });

  it('새 체험자는 다음 번호로 시작하고, 이전 체험자 기록은 남는다', () => {
    let data = updatePlayer(emptyData(0), (p) => upsertRecord(p, { playId: 'a', levelId: 1 }));
    data = startNewPlayer(data, 1);
    expect(data.currentPlayer).toBe('P002');
    expect(data.players.P001.records).toHaveLength(1);
    expect(data.players.P002.records).toHaveLength(0);
  });

  it('같은 판(playId)의 기록은 하나만 남고 최신 내용으로 바뀐다', () => {
    let p = { records: [] };
    p = upsertRecord(p, { playId: 'a', bestScore: 60 });
    p = upsertRecord(p, { playId: 'a', bestScore: 90 });
    p = upsertRecord(p, { playId: 'b', bestScore: 70 });
    expect(p.records.map((r) => [r.playId, r.bestScore])).toEqual([['a', 90], ['b', 70]]);
  });

  it('지갑은 레벨마다 가장 많이 받은 최종 공사 대금의 합', () => {
    expect(walletPoints({ 1: { bestPay: 85 }, 2: { bestPay: 70 }, 3: {} })).toBe(155);
  });
});

describe('학습 기록', () => {
  const play = () => {
    let s = sessionReducer(createSession(level), { type: 'START', now: 1000 });
    s = sessionReducer(s, { type: 'SET_PREDICTION', value: 90 });
    s = sessionReducer(s, { type: 'CHOOSE', level, value: 2 }); // 층수 실수
    for (const v of [1, 'n:cat', 'sg', 'd:the', 'v:sleep', 'base']) s = sessionReducer(s, { type: 'CHOOSE', level, value: v });
    s = sessionReducer(s, { type: 'HINT', maxSteps: 3 });
    s = sessionReducer(s, { type: 'SUBMIT', level, now: 31000 });
    s = sessionReducer(s, { type: 'EDIT' });
    s = sessionReducer(s, { type: 'EDIT_UNIT', level, unit: '0.V' });
    for (const v of ['v:sleep', 's']) s = sessionReducer(s, { type: 'CHOOSE', level, value: v });
    return sessionReducer(s, { type: 'SUBMIT', level, now: 61000 });
  };

  it('예상·실제 점수, 차이, 힌트, 재도전, 오류 종류, 시간을 남긴다', () => {
    const r = buildRecord(level, play(), { playId: 'x', difficulty: 'easy', selfExplain: { choice: 0, correct: true } });
    expect(r).toMatchObject({
      playId: 'x', levelId: 1, difficulty: 'easy', prediction: 90, firstScore: 75, bestScore: 100, predictionDiff: 15,
      completed: true, attempts: 2, retries: 1, hintsUsed: 1, floorMistakes: 1, durationSec: 60, viewedAnswer: false,
    });
    expect(r.errorCategories).toEqual({ grammar: 1 });
    expect(r.errorChecks).toEqual(['G-0-agree']);
  });

  it('CSV로 내보내면 머리글 + 기록마다 한 줄, 쉼표가 든 값은 따옴표로 감싼다', () => {
    const r = buildRecord(level, play(), { playId: 'x' });
    const csv = recordsToCsv({ P001: { records: [r] }, P002: { records: [] } });
    const lines = csv.replace('﻿', '').split('\r\n');
    expect(lines).toHaveLength(2);
    expect(lines[0].startsWith('체험자,레벨')).toBe(true);
    expect(lines[1].startsWith('P001,1,')).toBe(true);
    expect(lines[1]).toContain('"{""grammar"":1}"');
  });
});

describe('난이도 추천 (최근 3개 평균)', () => {
  const rec = (levelId, bestScore, at) => ({ levelId, bestScore, lastSubmitAt: at });
  const progress = { 1: { completed: true }, 2: { completed: true }, 3: {}, 4: {} };

  it('85 이상이면 다음 난이도 레벨을 추천', () => {
    const r = recommend(ALL_LEVELS, progress, [rec(1, 90, 1), rec(2, 95, 2)]);
    expect(r).toMatchObject({ mode: 'up', average: 93 });
    expect([3, 4]).toContain(r.levelId);
  });

  it('50~84면 지금 난이도 유지, 50 미만이면 더 쉬운 레벨', () => {
    expect(recommend(ALL_LEVELS, progress, [rec(3, 70, 3), rec(1, 60, 1)]).mode).toBe('keep');
    const down = recommend(ALL_LEVELS, progress, [rec(3, 30, 3), rec(4, 40, 4)]);
    expect(down.mode).toBe('down');
    expect(ALL_LEVELS.find((l) => l.id === down.levelId).difficulty).toBe(1);
  });

  it('최근 3개만 본다, 기록이 없으면 추천 없음', () => {
    expect(recommend(ALL_LEVELS, {}, [])).toBeNull();
    const r = recommend(ALL_LEVELS, progress, [rec(1, 0, 1), rec(1, 100, 5), rec(2, 100, 6), rec(2, 100, 7)]);
    expect(r.average).toBe(100);
  });
});

describe('레벨 데이터: 생각해 보기·비교해 보기', () => {
  it('모든 레벨에 있고, 검사기가 잘못된 모양을 찾아낸다', () => {
    for (const l of ALL_LEVELS) {
      expect(l.selfExplain?.options.some((o) => o.correct)).toBe(true);
      expect(l.contrast?.length).toBeGreaterThan(0);
    }
    const bad = { ...level, selfExplain: { ...level.selfExplain, options: level.selfExplain.options.map((o) => ({ text: o.text })) } };
    expect(validateLevel(bad).join()).toMatch(/correct/);
    expect(validateLevel({ ...level, contrast: [{ sentence: 'x' }] }).join()).toMatch(/contrast/);
  });
});
