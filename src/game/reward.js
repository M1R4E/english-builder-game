import { COMPLETE_THRESHOLD, PREDICTION_BADGES, STAR_THRESHOLDS } from '../config.js';
import { clamp } from './scoring.js';

// ── 보상 계산 ──
// 문장 점수(문장의 질)와 예측 정확도(자기평가)는 섞지 않고 따로 계산한다.
//  - 완공·별   : 지금까지 제출한 점수 중 "최고 점수" 기준
//  - 예측 비교 : 레벨 시작 전 예상 점수 vs "첫 제출 점수"
//  - 힌트 사용으로는 아무것도 깎지 않는다.
export function computeReward(prediction, attemptScores) {
  if (attemptScores.length === 0) return null;
  const scores = attemptScores.map((s) => clamp(s, 0, 100));
  const first = scores[0];
  const best = Math.max(...scores);
  const predicted = clamp(prediction, 0, 100);
  const diff = Math.abs(predicted - first);

  return {
    first,
    best,
    latest: scores[scores.length - 1],
    completed: best >= COMPLETE_THRESHOLD,
    stars: STAR_THRESHOLDS.filter((t) => best >= t).length, // 0~3
    prediction: predicted,
    predictionDiff: diff, // 0~100
    predictionDirection: predicted > first ? 'over' : predicted < first ? 'under' : 'exact',
    predictionBadge: PREDICTION_BADGES.find((b) => diff <= b.maxDiff)?.label ?? null,
    // 처음엔 완공 기준에 못 미쳤지만 고쳐서 완공한 경우
    persistedBadge: first < COMPLETE_THRESHOLD && best >= COMPLETE_THRESHOLD,
  };
}
