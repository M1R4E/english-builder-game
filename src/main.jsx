import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// 글꼴: 인터넷 없이도 보이도록 글꼴 파일을 프로젝트 안에 함께 넣어 쓴다 (npm 패키지 @fontsource).
//  - 주아(Jua): 제목, 버튼, 카드 등 게임 화면 전체
//  - 고운돋움(Gowun Dodum): 주문서 설명처럼 긴 글
import '@fontsource/jua';
import '@fontsource/gowun-dodum';
import App from './App.jsx';
import { setupOffline } from './offline.js';
import './styles/app.css';

// 3D 표지판은 캔버스에 글자를 그려서 만들기 때문에, 그리기 전에 글꼴이 준비되어 있어야 한다.
// 표지판에 쓰는 글자를 미리 불러오고, 늦어지면(최대 1.5초) 기다리지 않고 시작한다.
const LABEL_CHARS = '주어동사목적어보어수식어접속사확인없음고르는중? !·,abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const fontsReady = document.fonts
  ? document.fonts.load('44px "Jua"', LABEL_CHARS).catch(() => {})
  : Promise.resolve();

// 인터넷이 끊겨도 실행되도록 게임 파일을 브라우저에 저장해 둔다 (배포용 빌드에서만)
setupOffline();

Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1500))]).then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
