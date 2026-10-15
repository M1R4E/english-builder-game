import * as THREE from 'three';
import { MATERIALS } from '../materials.js';

// 1단계 확인용 샘플 건물. 기본 도형(상자, 원뿔, 원기둥)만으로 만든다.
// 2단계부터는 문장 분석 결과(설계도)에 따라 부품을 조합하는 방식으로 바뀐다.

function box(w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  return mesh;
}

// 등장 애니메이션 순서를 정해 준다 (초 단위).
function appear(obj, delay) {
  obj.userData.appearDelay = delay;
  return obj;
}

export function makeDemoHouse() {
  const house = new THREE.Group();
  const W = 4; // 가로
  const D = 3; // 세로
  const H = 2.2; // 층 높이

  // 기초 (주어+동사가 놓일 바닥)
  house.add(appear(box(W + 0.6, 0.3, D + 0.6, MATERIALS.foundation, 0, 0.15, 0), 0));

  // 기둥: 왼쪽 = 주어, 오른쪽 = 동사 (색 + 2단계에서 라벨 아이콘을 함께 표시)
  const pillarY = 0.3 + H / 2;
  [
    [-W / 2, -D / 2, MATERIALS.pillarSubject],
    [-W / 2, D / 2, MATERIALS.pillarSubject],
    [W / 2, -D / 2, MATERIALS.pillarVerb],
    [W / 2, D / 2, MATERIALS.pillarVerb],
  ].forEach(([x, z, mat], i) => {
    house.add(appear(box(0.35, H, 0.35, mat, x, pillarY, z), 0.2 + i * 0.08));
  });

  // 벽 (뒤쪽 + 양옆) — 앞쪽은 문과 창문이 있는 벽
  const wallT = 0.15;
  house.add(appear(box(W, H, wallT, MATERIALS.wall, 0, pillarY, -D / 2), 0.6));
  house.add(appear(box(wallT, H, D, MATERIALS.wall, -W / 2, pillarY, 0), 0.65));
  house.add(appear(box(wallT, H, D, MATERIALS.wall, W / 2, pillarY, 0), 0.7));
  house.add(appear(box(W * 0.3, H, wallT, MATERIALS.wall, -W * 0.35, pillarY, D / 2), 0.75));
  house.add(appear(box(W * 0.3, H, wallT, MATERIALS.wall, W * 0.35, pillarY, D / 2), 0.75));
  house.add(appear(box(W * 0.4, H * 0.3, wallT, MATERIALS.wall, 0, 0.3 + H * 0.85, D / 2), 0.8));

  // 문과 창문
  house.add(appear(box(W * 0.38, H * 0.68, 0.05, MATERIALS.door, 0, 0.3 + H * 0.34, D / 2 + 0.06), 0.9));
  house.add(appear(box(0.7, 0.6, 0.05, MATERIALS.window, -W * 0.35, pillarY + 0.2, D / 2 + 0.09), 0.95));
  house.add(appear(box(0.7, 0.6, 0.05, MATERIALS.window, W * 0.35, pillarY + 0.2, D / 2 + 0.09), 0.95));

  // 지붕: 네 면짜리 원뿔을 45도 돌리면 각진 지붕이 된다.
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 4), MATERIALS.roof);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set((W + 1) * 0.72, 1.6, (D + 1) * 0.72);
  roof.position.set(0, 0.3 + H + 0.8, 0);
  house.add(appear(roof, 1.1));

  // 실내 장식 (수식어) — 창문 너머로 보이는 화분
  const plant = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 0), MATERIALS.furniture);
  plant.position.set(-1.1, 0.75, 0.6);
  house.add(appear(plant, 1.3));

  // 계단 (접속사) — 1층짜리 샘플이라 현관 계단으로 표시
  for (let i = 0; i < 3; i += 1) {
    house.add(appear(box(1.4, 0.1, 0.3, MATERIALS.stairs, 0, 0.05 + i * 0.1, D / 2 + 1.05 - i * 0.3), 1.4 + i * 0.05));
  }

  // 울타리 (조건 충족 표시용 보조 장식)
  for (let i = -3; i <= 3; i += 1) {
    if (i === 0) continue;
    house.add(appear(box(0.12, 0.5, 0.12, MATERIALS.fence, i * 0.75, 0.25, D / 2 + 1.8), 1.6 + Math.abs(i) * 0.03));
  }

  // 나무 (단순 장식)
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.8, 6), MATERIALS.trunk);
  trunk.position.set(W / 2 + 1.6, 0.4, -0.5);
  const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 0), MATERIALS.leaves);
  leaves.position.set(W / 2 + 1.6, 1.3, -0.5);
  house.add(appear(trunk, 1.7), appear(leaves, 1.75));

  return house;
}
