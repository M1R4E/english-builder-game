import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' → 파일 경로를 상대 경로로 만들어서
// GitHub Pages(하위 주소)나 다른 폴더에 올려도 그대로 작동하게 한다.
export default defineConfig({
  base: './',
  plugins: [react()],
});
