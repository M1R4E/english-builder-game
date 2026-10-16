import IconButton from './IconButton.jsx';
import { IconGear } from './Icons.jsx';

// 메인 화면. 뒤에서는 견본 건물이 1초마다 바뀌고(ShowcaseBackground),
// 화면 아무 곳이나 누르면(또는 Enter·Space) 우편함 화면으로 넘어간다.
// 오른쪽 위 톱니바퀴로 설정 창을 열 수 있다 (화면 전체 버튼과 겹치지 않게 따로 둔다).
export default function TitleScreen({ onStart, onSettings }) {
  return (
    <>
      <button type="button" className="title-screen" onClick={onStart} aria-label="게임 시작">
        <span className="title-logo">
          <span className="title-kicker">SENTENCE BUILDER</span>
          <span className="title-name">문장 건축가</span>
          <span className="title-sub">영어 문장으로 짓는 작은 집</span>
        </span>
        <span className="tap-to-start">아무 곳이나 탭하여 시작</span>
      </button>
      {onSettings && <IconButton icon={IconGear} label="설정" onClick={onSettings} className="title-settings" />}
    </>
  );
}
