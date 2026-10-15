import { MAX_STARS } from '../config.js';

// 별 0~5개 표시. 화면 읽기 프로그램을 위해 글자로도 개수를 알려 준다.
export default function Stars({ count }) {
  return (
    <span className="stars" aria-label={`별 ${count}개`} title={`별 ${count}개`}>
      {Array.from({ length: MAX_STARS }, (_, i) => (
        <span key={i} aria-hidden="true" className={i < count ? 'star on' : 'star'}>
          {i < count ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}
