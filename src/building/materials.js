import * as THREE from 'three';

// 건물 부품이 함께 쓰는 재질(색). 부품마다 새로 만들지 않고 공유해서
// 메모리를 아낀다. flatShading → 각진 로우폴리 느낌.
const make = (color) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85 });

export const COLORS = {
  ground: '#b7d98b',
  foundation: '#c9b79c',
  slab: '#d8c6a8',
  pillarS: '#e58f65', // 주어 기둥
  pillarV: '#5b8fd9', // 동사 기둥
  roomO: '#b98fd9', // 목적어 칸
  roomC: '#d9b84f', // 보어 칸
  wall: '#fff6e5',
  roof: '#d9584a',
  stairs: '#a68a64',
  furniture: '#8fc0a9',
  fence: '#f2d38b',
  flag: '#ffd34d',
  trunk: '#8b6a4a',
  leaves: '#6fae5a',
  window: '#9fd3f0',
  door: '#9b6b43',
  rug: '#e9b8c8', // 카펫: 명사를 꾸미는 형용사
  tensePresent: '#e8c48f', // 동사 재질 = 시제: 현재는 밝은 나무 (지금 자재)
  tensePast: '#9a978f', // 과거는 회색 돌 (옛날 자재)
  tenseIng: '#8cc6e6', // -ing(진행)는 하늘색
};

export const MATERIALS = Object.fromEntries(
  Object.entries(COLORS).map(([key, color]) => [key, make(color)]),
);

// 아직 카드가 놓이지 않은 자리: 반투명한 파란 유령 모양
MATERIALS.ghost = new THREE.MeshBasicMaterial({
  color: '#6f9fd8',
  transparent: true,
  opacity: 0.28,
  depthWrite: false,
});

// 지금 카드를 고르고 있는 자리: 노란색으로 은은하게 깜빡인다 (깜빡임은 BuildingRenderer가 담당)
MATERIALS.active = new THREE.MeshStandardMaterial({
  color: '#ffd34d',
  emissive: '#ffb800',
  emissiveIntensity: 0.35,
  flatShading: true,
  transparent: true,
  opacity: 0.85,
});

// 공유 재질은 앱 전체에서 재사용하므로 부품 정리할 때 지우지 않도록 표시한다.
Object.values(MATERIALS).forEach((m) => {
  m.userData.shared = true;
});
