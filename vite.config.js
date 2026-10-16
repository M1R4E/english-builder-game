import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// base: './' → 파일 경로를 상대 경로로 만들어서
// GitHub Pages(하위 주소)나 다른 폴더에 올려도 그대로 작동하게 한다.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    // ── 오프라인 실행 (PWA) ──
    // 배포용 빌드(npm run build)에서 "서비스 워커"를 만든다. 서비스 워커는 처음 접속할 때
    // 게임에 필요한 파일(HTML, JS, CSS, 글꼴, 아이콘)을 브라우저에 저장해 두고,
    // 그다음부터는 인터넷이 끊겨도 저장해 둔 파일로 게임을 연다.
    // 레벨·단어 사전·채점 규칙은 모두 JS 안에 들어 있어서 함께 저장된다.
    // 개발 서버(npm run dev)에서는 켜지 않는다 (고친 코드가 바로 보이도록).
    VitePWA({
      registerType: 'autoUpdate', // 새 버전을 올리면 다음 접속 때 자동으로 바뀐다
      injectRegister: false, // 등록은 src/offline.js에서 직접 한다 (준비 상태를 화면에 보여 주려고)
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: '문장 건축가',
        short_name: '문장 건축가',
        description: '영어 문장 카드를 골라 3D 건물을 짓는 학습 게임',
        lang: 'ko',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#f4efe6',
        theme_color: '#f4efe6',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // 저장할 파일 종류. 글꼴은 woff2만 저장한다 (요즘 브라우저는 woff2를 쓰므로 woff는 필요 없다).
        globPatterns: ['**/*.{js,css,html,png,svg,woff2,webmanifest}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // Three.js가 들어 있는 JS 파일(약 0.9MB)도 저장되도록
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    // Windows에서 파일을 빠르게 연달아 고치면 개발 서버가 마지막 변경을 놓치는 일이 있어서,
    // 0.3초마다 파일을 직접 확인하는 방식(polling)을 쓴다. 개발할 때만 적용되고 게임 실행에는 영향이 없다.
    watch: { usePolling: true, interval: 300 },
  },
});
