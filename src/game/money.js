import { WON_PER_POINT } from '../config.js';

// 점수 → 돈(원) 바꾸기. 채점은 점수로 하고, 화면에는 돈으로 보여 준다.
export const toWon = (points) => Math.round(points) * WON_PER_POINT;

// 12345 → "12,345원"
export const formatWon = (won) => `${Math.round(won).toLocaleString('ko-KR')}원`;

// 점수를 바로 "75,000원" 같은 글자로
export const wonText = (points) => formatWon(toWon(points));

// 만점(100점)에 해당하는 금액
export const MAX_WON = toWon(100);
