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
  condition: '특별 조건',
  naturalness: '완성도·자연스러움',
};

// 필수 성분(주어·동사·목적어·보어 중 그 레벨에서 꼭 필요한 것)이 빠졌을 때,
// 빠진 성분 하나마다 감점하는 점수. 위 4개 항목과 별도로 총점에서 뺀다.
// 40점 → 하나만 빠져도 최대 60점이라 완공(70점)할 수 없다.
export const MISSING_ROLE_PENALTY = 40;

// 이 점수 이상이면 "완공"
export const COMPLETE_THRESHOLD = 70;

// 별 개수 기준 (최고 점수 기준): ★ 70, ★★ 85, ★★★ 95
export const STAR_THRESHOLDS = [70, 85, 95];

// 예상 점수와 첫 제출 점수의 차이에 따른 예측 배지
export const PREDICTION_BADGES = [
  { maxDiff: 10, label: '정확한 예측' },
  { maxDiff: 20, label: '거의 정확' },
];
