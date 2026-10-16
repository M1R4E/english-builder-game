import { computeReward } from './reward.js';
import { tiersOf, unlockedTiers } from './progress.js';

// ── 학습 기록 ──
// 레벨을 한 번 플레이할 때마다(playId) 기록 하나를 만든다. 제출할 때마다 최신 내용으로 바꾼다.
// 연구에 쓸 수 있도록 남기는 것: 예상 점수와 실제 점수, 둘의 차이, 힌트 사용, 재도전, 오류 종류, 완공 여부, 시간
// 주의: 시간이 짧다고 실력이 높다고 보거나, 힌트 횟수만으로 불안 수준을 판단하지 않는다. (기획서 7)
//
// session: game/session.js의 상태, extras: { playId, difficulty, viewedAnswer, selfExplain }
export function buildRecord(level, session, extras = {}) {
  const scores = session.attempts.map((a) => a.result.total);
  const reward = computeReward(session.prediction, scores);
  const last = session.attempts[session.attempts.length - 1];
  const failed = session.attempts.flatMap((a) => a.result.checks.filter((c) => c.status === 'fail'));
  return {
    playId: extras.playId,
    levelId: level.id,
    difficulty: extras.difficulty ?? 'normal',
    startedAt: session.startedAt,
    lastSubmitAt: last?.at ?? null,
    durationSec: last && session.startedAt ? Math.round((last.at - session.startedAt) / 1000) : null,
    prediction: session.prediction, // 레벨 시작 전 예상 점수 (0~100)
    firstScore: reward?.first ?? null, // 첫 제출 점수
    bestScore: reward?.best ?? null,
    predictionDiff: reward ? reward.prediction - reward.first : null, // + 이면 높게 예상, − 이면 낮게 예상
    finalPay: reward?.finalPay ?? null,
    stars: reward?.stars ?? 0,
    completed: Boolean(reward?.completed),
    attempts: scores.length,
    retries: Math.max(0, scores.length - 1),
    hintsUsed: session.hintStep, // 펼친 힌트 단계 수
    floorMistakes: session.floorMistakes,
    // 오류 종류: 범주별 횟수, 항목 id
    errorCategories: countBy(failed.map((c) => c.category)),
    errorChecks: [...new Set(failed.map((c) => c.id))],
    viewedAnswer: Boolean(extras.viewedAnswer),
    alreadyPerfect: Boolean(extras.alreadyPerfect), // 이미 완벽하게 지은 레벨을 다시 한 판 (공사 대금 없음)
    selfExplain: extras.selfExplain ?? null, // { choice, correct }
  };
}

function countBy(list) {
  const out = {};
  for (const x of list) out[x] = (out[x] ?? 0) + 1;
  return out;
}

// ── 난이도 추천 (기획서 2-3) ──
// 최근 3개 레벨 기록(가장 높은 점수)의 평균으로 다음 도전을 추천한다. 기준값은 config에서 바꿀 수 있다.
//  85 이상: 다음 난이도의 레벨 추천 / 50~84: 지금 난이도 유지 / 50 미만: 더 쉬운 레벨과 "쉬움" 설정 추천
// (이 기준은 처음 정한 값이며, 효과가 검증된 것은 아니다.)
export const RECOMMEND = { up: 85, down: 50 };

export function recommend(levels, progress, records) {
  const recent = [...records].filter((r) => r.bestScore !== null).sort((a, b) => (b.lastSubmitAt ?? 0) - (a.lastSubmitAt ?? 0)).slice(0, 3);
  if (recent.length === 0) return null;
  const avg = Math.round(recent.reduce((s, r) => s + r.bestScore, 0) / recent.length);
  const unlocked = unlockedTiers(levels, progress);
  const tiers = tiersOf(levels);
  const lastLevel = levels.find((l) => l.id === recent[0].levelId);
  const current = lastLevel?.difficulty ?? tiers[0];
  let tier;
  let mode;
  if (avg >= RECOMMEND.up) {
    mode = 'up';
    tier = unlocked.find((t) => t > current) ?? current;
  } else if (avg >= RECOMMEND.down) {
    mode = 'keep';
    tier = current;
  } else {
    mode = 'down';
    tier = [...unlocked].reverse().find((t) => t < current) ?? tiers[0];
  }
  // 그 난이도에서 아직 완공하지 못한 레벨 → 없으면 그 난이도의 아무 레벨
  const inTier = levels.filter((l) => l.difficulty === tier && unlocked.includes(l.difficulty));
  const pick = inTier.find((l) => !progress[l.id]?.completed) ?? inTier.find((l) => l.id !== lastLevel?.id) ?? inTier[0] ?? null;
  return { average: avg, mode, levelId: pick?.id ?? null, count: recent.length };
}

// ── 기록 내보내기 (CSV, 엑셀에서 열 수 있음) ──
const COLUMNS = [
  ['player', '체험자'],
  ['levelId', '레벨'],
  ['difficulty', '난이도 설정'],
  ['prediction', '예상 점수'],
  ['firstScore', '첫 제출 점수'],
  ['bestScore', '최고 점수'],
  ['predictionDiff', '예상-첫 점수'],
  ['finalPay', '최종 공사 대금(점수)'],
  ['stars', '별'],
  ['completed', '완공'],
  ['attempts', '제출 횟수'],
  ['retries', '재도전'],
  ['hintsUsed', '힌트 단계'],
  ['floorMistakes', '층수 실수'],
  ['errorCategories', '오류 범주'],
  ['errorChecks', '오류 항목'],
  ['viewedAnswer', '정답 예시 봄'],
  ['selfExplain', '자기 설명'],
  ['durationSec', '걸린 시간(초)'],
  ['startedAt', '시작 시각'],
];

const cell = (v) => {
  if (v === null || v === undefined) return '';
  let s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  if (/[",\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
};

export function recordsToCsv(players) {
  const rows = [COLUMNS.map(([, title]) => title).join(',')];
  for (const [player, info] of Object.entries(players)) {
    for (const r of info.records) {
      const row = { ...r, player, startedAt: r.startedAt ? new Date(r.startedAt).toISOString() : '' };
      rows.push(COLUMNS.map(([key]) => cell(row[key])).join(','));
    }
  }
  // 엑셀에서 한글이 깨지지 않도록 맨 앞에 BOM을 붙인다
  return `﻿${rows.join('\r\n')}`;
}
