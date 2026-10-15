import * as THREE from 'three';

// 3D 화면에 떠 있는 글자 표지판(스프라이트).
// 색만으로 정보를 전달하지 않도록 "주어", "동사 ?", "! 동사 확인" 같은 글자를 함께 보여 준다.
const STYLES = {
  normal: { bg: 'rgba(255,255,255,0.92)', fg: '#3a3330', border: '#e6dccd' },
  ghost: { bg: 'rgba(235,243,252,0.92)', fg: '#3d6aa8', border: '#9cbde6' },
  warn: { bg: '#fff1d6', fg: '#8a4b00', border: '#e0a040' },
  success: { bg: '#e6f6ec', fg: '#24734a', border: '#7cc79c' },
};

export function makeLabel(text, style = 'normal', scale = 1) {
  const s = STYLES[style];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const font = 'bold 44px system-ui, "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 48;
  const h = 76;
  canvas.width = w;
  canvas.height = h;

  ctx.font = font;
  ctx.fillStyle = s.bg;
  ctx.strokeStyle = s.border;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(3, 3, w - 6, h - 6, 22);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = s.fg;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  // depthTest: false → 벽이나 지붕 뒤에 있어도 표지판이 보인다.
  const material = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
  const sprite = new THREE.Sprite(material);
  const height = 0.5 * scale;
  sprite.scale.set((height * w) / h, height, 1);
  sprite.renderOrder = 10;
  sprite.userData.noShadow = true;
  return sprite;
}
