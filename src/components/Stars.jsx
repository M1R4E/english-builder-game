// 별 0~3개 표시. 화면 읽기 프로그램을 위해 글자로도 개수를 알려 준다.
export default function Stars({ count }) {
  return (
    <span className="stars" aria-label={`별 ${count}개`} title={`별 ${count}개`}>
      {[0, 1, 2].map((i) => (
        <span key={i} aria-hidden="true" className={i < count ? 'star on' : 'star'}>
          {i < count ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}
