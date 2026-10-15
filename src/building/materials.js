import * as THREE from 'three';

// 건물 부품이 함께 쓰는 재질(색). 부품마다 새로 만들지 않고 공유해서
// 메모리를 아낀다. flatShading → 각진 로우폴리 느낌.
const make = (color) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85 });

export const COLORS = {
  ground: '#b7d98b',
  foundation: '#c9b79c',
  pillarSubject: '#e58f65', // 주어 기둥
  pillarVerb: '#5b8fd9', // 동사 기둥
  wall: '#fff6e5',
  roof: '#d9584a',
  stairs: '#a68a64',
  furniture: '#8fc0a9',
  fence: '#f2d38b',
  trunk: '#8b6a4a',
  leaves: '#6fae5a',
  window: '#9fd3f0',
  door: '#9b6b43',
};

export const MATERIALS = Object.fromEntries(
  Object.entries(COLORS).map(([key, color]) => [key, make(color)]),
);

// 공유 재질은 앱 전체에서 재사용하므로 부품 정리할 때 지우지 않도록 표시한다.
Object.values(MATERIALS).forEach((m) => {
  m.userData.shared = true;
});
