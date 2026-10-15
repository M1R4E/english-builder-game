import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' → 파일 경로를 상대 경로로 만들어서
// GitHub Pages(하위 주소)나 다른 폴더에 올려도 그대로 작동하게 한다.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    // Windows에서 파일을 빠르게 연달아 고치면 개발 서버가 마지막 변경을 놓치는 일이 있어서,
    // 0.3초마다 파일을 직접 확인하는 방식(polling)을 쓴다. 개발할 때만 적용되고 게임 실행에는 영향이 없다.
    watch: { usePolling: true, interval: 300 },
  },
});
