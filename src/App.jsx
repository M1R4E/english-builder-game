import BuildingView from './components/BuildingView.jsx';
import { makeDemoHouse } from './building/parts/demoHouse.js';

// 1단계: 기본 레이아웃 + 3D 건물 확인용 화면.
// 오른쪽 패널의 각 영역은 2단계에서 실제 게임 기능과 연결한다.
export default function App() {
  return (
    <div className="app">
      <header className="topbar">
        <h1 className="logo">🏗️ 문장 건축가</h1>
        <button className="btn btn-ghost" type="button" disabled title="4단계에서 연결 예정">
          ⚙️ 설정
        </button>
      </header>

      <main className="layout">
        <section className="stage" aria-label="3D 건축 화면">
          <BuildingView buildFn={makeDemoHouse} />
          <p className="stage-caption">드래그해서 돌려 보고, 휠·두 손가락으로 확대할 수 있어요.</p>
        </section>

        <section className="panel" aria-label="문장 구성 패널">
          <div className="card-box">
            <h2>📜 건축 의뢰</h2>
            <p className="muted">레벨을 고르면 여기에 의뢰 내용이 나타나요. (2단계에서 연결)</p>
          </div>

          <div className="card-box">
            <h2>🧱 문장 카드</h2>
            <div className="card-tray">
              {['The cat', 'sleeps', 'sleep', '.'].map((t) => (
                <span key={t} className="word-card is-placeholder">{t}</span>
              ))}
            </div>
          </div>

          <div className="card-box">
            <h2>✏️ 내가 만든 문장</h2>
            <div className="sentence-board muted">카드를 고르면 여기에 순서대로 놓여요.</div>
          </div>

          <div className="actions">
            <button className="btn btn-hint" type="button" disabled>💡 힌트</button>
            <button className="btn btn-ghost" type="button" disabled>↩️ 되돌리기</button>
            <button className="btn btn-submit" type="button" disabled>✅ 제출하기</button>
          </div>
        </section>
      </main>
    </div>
  );
}
