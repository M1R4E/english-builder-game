// 게임 전체에서 쓰는 조정 가능한 숫자 모음.
// 테스트해 보고 바꾸고 싶으면 이 파일만 고치면 된다.

// 채점 항목별 만점 (합계 100)
export const SCORE_WEIGHTS = {
  meaning: 30, // 의미 전달
  grammar: 30, // 문법 정확성
  condition: 25, // 특별 조건 충족
  naturalness: 15, // 문장 완성도와 자연스러움
};

export const CATEGORY_LABELS = {
  meaning: '의미 전달',
  grammar: '문법',
  condition: '특별 요청 사항',
  naturalness: '완성도·자연스러움',
};

// ── 돈 표시 ──
// 게임 안에서는 "점수" 대신 "공사 대금(돈)"으로 보여 준다. 계산은 그대로 점수로 하고 화면에서만 바꾼다.
// 1점 = 1,000원 → 만점 100점 = 100,000원
export const WON_PER_POINT = 1000;

// 레벨 시작 전 "예상 청구 비용"을 고를 때 한 칸의 크기 (점수 기준 5점 = 5,000원)
export const PREDICTION_STEP = 5;

// 결과 창에서 폭죽을 터뜨리는 기준 (이 점수 이상)
export const FIREWORKS_THRESHOLD = 95;

// 이 점수 이상이면 "완공". 건물을 다 지어야 제출할 수 있으므로 빈자리 감점은 없다.
export const COMPLETE_THRESHOLD = 70;

// 별 개수 기준 (최고 점수 기준, 5개): 완공(70)하면 ★1개부터, 6점마다 하나씩 더
//  ★ 70 · ★★ 76 · ★★★ 82 · ★★★★ 88 · ★★★★★ 94
export const STAR_THRESHOLDS = [70, 76, 82, 88, 94];
export const MAX_STARS = STAR_THRESHOLDS.length;

// ── 견적 오차 차감 (최종 공사 대금) ──
// 예상 청구 비용(견적)이 첫 청구 금액보다 많이 "높을수록" 최종 공사 대금에서 뺀다.
// 견적이 실제보다 낮았던 경우에는 빼지 않는다.
//  차감 = (견적 − 첫 청구 금액 − 봐주는 범위) × 차감 비율   (봐주는 범위 이하이면 차감 없음)
//  최종 공사 대금 = 최고 청구 금액 − 차감   (0보다 작아지지 않음, 1점 미만의 차감은 버림)
// 예) 봐주는 범위 10점, 비율 0.5일 때 견적 100,000원, 첫 청구 60,000원 → 차이 40,000원
//     → 차감 (40 − 10) × 0.5 = 15 → 15,000원
export const ESTIMATE_TOLERANCE = 10; // 이만큼(점수 기준)까지의 차이는 차감하지 않는다
export const ESTIMATE_PENALTY_RATE = 0.5; // 봐주는 범위를 넘은 차이 중 이 비율만큼 뺀다

// 예상 청구 비용과 첫 청구 금액의 차이(점수 기준)에 따른 견적 배지
export const PREDICTION_BADGES = [
  { maxDiff: 10, label: '정확한 견적' },
  { maxDiff: 20, label: '거의 정확한 견적' },
];
