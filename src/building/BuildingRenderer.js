import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MATERIALS } from './materials.js';

// 성능이 낮은 기기로 추정되면 그림자를 끄고 해상도를 낮춘다.
function isLowPowerDevice() {
  const cores = navigator.hardwareConcurrency || 4;
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  return cores <= 4 || mobile;
}

const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};

// 3D 화면 전체(장면, 카메라, 조명, 땅, 건물)를 관리하는 클래스.
// 건물 모양 자체는 만들지 않고, 밖에서 만든 건물(Group)을 받아서 보여 준다.
export class BuildingRenderer {
  constructor(container) {
    this.container = container;
    this.lowPower = isLowPowerDevice();
    this.animations = []; // 등장 애니메이션 중인 부품 목록

    this.renderer = new THREE.WebGLRenderer({ antialias: !this.lowPower });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.lowPower ? 1.5 : 2));
    this.renderer.shadowMap.enabled = !this.lowPower;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#dcecf5');

    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.maxPolarAngle = Math.PI * 0.47; // 땅 밑으로 내려가지 않게
    this.controls.minDistance = 5;
    this.controls.maxDistance = 40;

    this.addLightsAndGround();

    this.buildingRoot = new THREE.Group();
    this.scene.add(this.buildingRoot);

    // 컨테이너 크기가 바뀔 때마다 렌더러·카메라 비율을 다시 맞춘다.
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();

    this.renderer.setAnimationLoop(() => this.tick());
  }

  addLightsAndGround() {
    this.scene.add(new THREE.HemisphereLight('#ffffff', '#a8c48a', 1.6));
    const sun = new THREE.DirectionalLight('#fff3dd', 2.2);
    sun.position.set(8, 14, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 });
    this.scene.add(sun);

    const ground = new THREE.Mesh(new THREE.CircleGeometry(14, 10), MATERIALS.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  // 새 건물로 교체한다. 이전 건물의 형상(geometry)은 메모리에서 해제한다.
  setBuilding(group) {
    this.clearBuilding();
    group.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = !this.lowPower;
        obj.receiveShadow = !this.lowPower;
      }
    });
    // userData.appearDelay가 있는 부품은 작게 시작해서 커지며 등장한다.
    // 실제 시계(performance.now) 기준이라 화면이 느리게 그려져도 제시간에 끝난다.
    const now = performance.now() / 1000;
    group.traverse((obj) => {
      if (obj.userData.appearDelay !== undefined) {
        obj.userData.targetScale = obj.scale.clone();
        obj.scale.setScalar(0.0001);
        this.animations.push({ obj, startAt: now + obj.userData.appearDelay, duration: 0.45 });
      }
    });
    this.buildingRoot.add(group);
    this.fitCamera(group);
  }

  clearBuilding() {
    this.animations = [];
    for (const child of [...this.buildingRoot.children]) {
      this.buildingRoot.remove(child);
      disposeObject(child);
    }
  }

  // 건물 크기를 재서 화면 안에 전부 들어오도록 카메라 거리를 정한다.
  fitCamera(group) {
    const box = new THREE.Box3().setFromObject(group);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const radius = Math.max(size.length() / 2, 1.5);
    const fov = THREE.MathUtils.degToRad(this.camera.fov);
    const fitHeight = radius / Math.sin(fov / 2);
    const fitWidth = fitHeight / Math.min(this.camera.aspect, 1);
    const distance = Math.max(fitHeight, fitWidth) * 1.05;
    const dir = new THREE.Vector3(1, 0.75, 1.3).normalize();
    this.camera.position.copy(center).addScaledVector(dir, distance);
    this.controls.target.copy(center);
    this.controls.maxDistance = distance * 2;
    this.controls.update();
    this.lastFit = group;
  }

  resize() {
    const { clientWidth: w, clientHeight: h } = this.container;
    if (w === 0 || h === 0) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    if (this.lastFit) this.fitCamera(this.lastFit);
  }

  tick() {
    const now = performance.now() / 1000;
    this.animations = this.animations.filter((a) => {
      const t = (now - a.startAt) / a.duration;
      if (t <= 0) return true;
      const k = t >= 1 ? 1 : easeOutBack(t);
      a.obj.scale.copy(a.obj.userData.targetScale).multiplyScalar(Math.max(k, 0.0001));
      return t < 1;
    });
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.clearBuilding();
    this.scene.traverse(disposeObject);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

// 형상과 (공유되지 않는) 재질을 GPU 메모리에서 해제한다.
function disposeObject(root) {
  root.traverse?.((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((m) => {
      if (m && !m.userData?.shared) m.dispose();
    });
  });
}
