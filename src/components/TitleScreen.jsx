// 메인 화면. 뒤에서는 견본 건물이 1초마다 바뀌고(ShowcaseBackground),
// 화면 아무 곳이나 누르면(또는 Enter·Space) 우편함 화면으로 넘어간다.
export default function TitleScreen({ onStart }) {
  return (
    <button type="button" className="title-screen" onClick={onStart} aria-label="게임 시작">
      <span className="title-logo">
        <span className="title-kicker">SENTENCE BUILDER</span>
        <span className="title-name">문장 건축가</span>
        <span className="title-sub">영어 문장으로 짓는 작은 집</span>
      </span>
      <span className="tap-to-start">아무 곳이나 탭하여 시작</span>
    </button>
  );
}
