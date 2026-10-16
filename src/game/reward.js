import {
  COMPLETE_THRESHOLD,
  ESTIMATE_PENALTY_RATE,
  ESTIMATE_TOLERANCE,
  PREDICTION_BADGES,
  RETRY_PAY_RATE,
  STAR_THRESHOLDS,
} from '../config.js';
import { clamp } from './scoring.js';

// 견적 오차 차감: 차이가 봐주는 범위를 넘은 만큼 × 비율 (점수 기준, 0~100)
// 1점(1,000원) 미만은 버린다 → 플레이어에게 불리하게 반올림하지 않는다. 예) 7.5점 → 7점
export function estimatePenalty(diff) {
  return clamp(Math.floor(Math.max(0, diff - ESTIMATE_TOLERANCE) * ESTIMATE_PENALTY_RATE), 0, 100);
}

// ── 보상 계산 ──
// 문장 점수(문장의 질)와 예측 정확도(자기평가)는 따로 계산하고 따로 보여 준다.
//  - 완공·별        : 지금까지 제출한 점수 중 "최고 점수" 기준 (견적과 관계없음)
//  - 예측 비교      : 레벨 시작 전 예상 점수 vs "첫 제출 점수"
//  - 최종 공사 대금 : 첫 청구 금액 + 고쳐서 늘어난 금액 × RETRY_PAY_RATE − 견적 오차 차감
//                     고쳐서 다시 제출하면 늘어난 만큼의 일부만 더해진다(두 번 받지 않음).
//                     → 고쳐서 완벽해져도, 처음부터 완벽하게 지은 경우보다 조금 적다.
//                     견적 오차 차감은 첫 제출 때 정해진 값이 그대로 남는다.
//  - 힌트 사용으로는 아무것도 깎지 않는다.
export function computeReward(prediction, attemptScores) {
  if (attemptScores.length === 0) return null;
  const scores = attemptScores.map((s) => clamp(s, 0, 100));
  const first = scores[0];
  const best = Math.max(...scores);
  const predicted = clamp(prediction, 0, 100);
  const diff = Math.abs(predicted - first);
  // 견적 오차 차감은 견적이 실제보다 "높았을 때"만 한다 (낮게 예상한 경우에는 빼지 않는다)
  const penalty = estimatePenalty(Math.max(0, predicted - first));
  // 고쳐서 늘어난 금액 중 받는 부분 (1점 미만은 버림)
  const retryGain = Math.floor((best - first) * RETRY_PAY_RATE);

  return {
    first,
    best,
    latest: scores[scores.length - 1],
    completed: best >= COMPLETE_THRESHOLD,
    stars: STAR_THRESHOLDS.filter((t) => best >= t).length, // 0~5
    prediction: predicted,
    predictionDiff: diff, // 0~100
    predictionDirection: predicted > first ? 'over' : predicted < first ? 'under' : 'exact',
    predictionBadge: PREDICTION_BADGES.find((b) => diff <= b.maxDiff)?.label ?? null,
    estimatePenalty: penalty, // 0~100
    retryGain, // 고쳐서 더 받은 금액 (점수 기준)
    finalPay: clamp(first + retryGain - penalty, 0, 100), // 최종 공사 대금 (점수 기준)
    // 처음엔 완공 기준에 못 미쳤지만 고쳐서 완공한 경우
    persistedBadge: first < COMPLETE_THRESHOLD && best >= COMPLETE_THRESHOLD,
  };
}
