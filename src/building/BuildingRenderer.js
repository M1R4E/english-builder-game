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

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

const CELEBRATE_SECONDS = 1.8; // 완공 연출(한 바퀴 회전 + 통통 튀기) 시간
const CLICK_MOVE_LIMIT = 6; // 이보다 많이 끌면(px) 클릭이 아니라 화면 돌리기로 본다

// 3D 화면 전체(장면, 카메라, 조명, 땅, 건물)를 관리하는 클래스.
// 건물 모양 자체는 만들지 않고, 밖에서 만든 건물(Group)을 받아서 보여 준다.
// options.interactive: false면 마우스·손가락으로 돌릴 수 없다 (메인 화면용)
// options.autoRotate : true면 카메라가 건물 주위를 천천히 돈다
// options.onPick     : 방·계단 부품을 누르면 그 공정 단위(ref)로 호출된다
// options.buildSeconds: 새 부품들이 이 시간(초) 안에 모두 등장하도록 간격을 줄인다 (메인 화면용)
export class BuildingRenderer {
  constructor(container, { interactive = true, autoRotate = false, onPick = null, buildSeconds = null } = {}) {
    this.container = container;
    this.onPick = onPick;
    this.buildSeconds = buildSeconds;
    this.celebration = null; // 진행 중인 완공 연출 { startAt }
    this.lowPower = isLowPowerDevice();
    this.animations = []; // 등장 애니메이션 중인 부품 목록
    this.partMap = new Map(); // 지금 화면에 있는 부품: key → { sig, obj }
    this.bounds = null;
    this.insets = { top: 0, bottom: 0 }; // 화면을 가리는 판의 높이(px)

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
    this.controls.enabled = interactive;
    this.controls.autoRotate = autoRotate;
    this.controls.autoRotateSpeed = 0.8;

    this.addLightsAndGround();

    this.buildingRoot = new THREE.Group();
    this.scene.add(this.buildingRoot);

    if (interactive) this.setupPicking();

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
    this.addScenery();
  }

  // 주변 풍경: 덤불·돌·꽃(땅 가장자리)과 천천히 흘러가는 구름. 건물 밖에 있어서 완공 연출 때 같이 돌지 않는다.
  // 위치는 매번 같도록 정해 둔다 (무작위 아님). 성능이 낮은 기기에서는 구름 수를 줄인다.
  addScenery() {
    const mesh = (geo, mat, x, y, z, sx = 1, sy = 1, sz = 1) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.scale.set(sx, sy, sz);
      return m;
    };
    const around = (deg, r) => [Math.cos((deg * Math.PI) / 180) * r, Math.sin((deg * Math.PI) / 180) * r];
    const scenery = new THREE.Group();
    const bush = new THREE.IcosahedronGeometry(0.7, 0);
    for (const [deg, r, k] of [[20, 10, 1], [70, 11.5, 0.8], [130, 10.5, 1.1], [200, 11, 0.9], [250, 9.5, 1], [320, 11, 1.2]]) {
      const [x, z] = around(deg, r);
      scenery.add(mesh(bush, MATERIALS.bush, x, 0.45 * k, z, k, 0.8 * k, k));
    }
    const rock = new THREE.DodecahedronGeometry(0.45, 0);
    for (const [deg, r] of [[45, 9], [160, 12], [285, 10]]) {
      const [x, z] = around(deg, r);
      scenery.add(mesh(rock, MATERIALS.rock, x, 0.2, z, 1.2, 0.6, 1));
    }
    const stem = new THREE.CylinderGeometry(0.03, 0.03, 0.35, 4);
    const petal = new THREE.IcosahedronGeometry(0.12, 0);
    for (const [deg, r, i] of [[95, 8.5, 0], [100, 9.2, 1], [215, 8.8, 0], [340, 9, 1], [345, 8.4, 0]]) {
      const [x, z] = around(deg, r);
      scenery.add(mesh(stem, MATERIALS.leaves, x, 0.18, z));
      scenery.add(mesh(petal, i ? MATERIALS.petalB : MATERIALS.petalA, x, 0.38, z));
    }
    scenery.traverse((m) => {
      if (m.isMesh) m.castShadow = !this.lowPower;
    });
    this.scene.add(scenery);

    // 구름: 납작한 덩어리 3개씩. tick에서 천천히 돈다.
    this.clouds = new THREE.Group();
    const puff = new THREE.IcosahedronGeometry(1, 0);
    const cloudSpots = this.lowPower ? [[30, 16, 13], [210, 18, 15]] : [[30, 16, 13], [120, 19, 15], [210, 18, 14], [300, 17, 16]];
    for (const [deg, r, y] of cloudSpots) {
      const [x, z] = around(deg, r);
      const c = new THREE.Group();
      c.add(mesh(puff, MATERIALS.cloud, 0, 0, 0, 1.6, 0.7, 1.1));
      c.add(mesh(puff, MATERIALS.cloud, 1.3, -0.2, 0.2, 1.1, 0.55, 0.9));
      c.add(mesh(puff, MATERIALS.cloud, -1.2, -0.25, -0.1, 1, 0.5, 0.8));
      c.position.set(x, y, z);
      this.clouds.add(c);
    }
    this.scene.add(this.clouds);
  }

  // ── 자리 부품 누르기 ──
  // 화면을 끌어서 돌리는 동작과 구분하기 위해, 누른 곳과 뗀 곳이 가까울 때만 "클릭"으로 본다.
  setupPicking() {
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    const el = this.renderer.domElement;
    let down = null;
    this.handlers = {
      pointerdown: (e) => {
        down = { x: e.clientX, y: e.clientY };
      },
      pointerup: (e) => {
        if (!down) return;
        const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
        down = null;
        if (moved > CLICK_MOVE_LIMIT) return;
        const key = this.slotAt(e);
        if (key) this.onPick?.(key);
      },
      // 마우스를 자리 부품 위에 올리면 손가락 모양 커서
      pointermove: (e) => {
        if (e.pointerType !== 'mouse' || e.buttons) return;
        el.style.cursor = this.slotAt(e) ? 'pointer' : '';
      },
    };
    for (const [name, fn] of Object.entries(this.handlers)) el.addEventListener(name, fn);
  }

  // 화면의 한 점 → 그 아래에 있는 자리 부품의 key (없으면 null)
  slotAt(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    for (const hit of this.raycaster.intersectObject(this.buildingRoot, true)) {
      for (let o = hit.object; o; o = o.parent) {
        if (o.userData.slotKey) return o.userData.slotKey;
      }
    }
    return null;
  }

  // ── 완공 연출: 건물이 한 바퀴 돌면서 통통 튄다 ──
  celebrate() {
    this.celebration = { startAt: performance.now() / 1000 };
  }

  // 부품 목록을 받아 건물을 갱신한다.
  //  - key와 sig가 같은 부품: 그대로 둔다
  //  - 없어졌거나 상태가 바뀐 부품: 장면에서 빼고 메모리 해제
  //  - 새 부품: 작게 시작해서 커지며 등장 (차례대로 조금씩 늦게)
  updateParts(parts, bounds) {
    if (!Array.isArray(parts)) return; // 잘못된 값이 들어와도 화면 전체가 멈추지 않게
    const next = new Map(parts.map((p) => [p.key, p]));
    for (const [key, entry] of this.partMap) {
      const p = next.get(key);
      if (!p || p.sig !== entry.sig) this.removePart(key);
    }

    const now = performance.now() / 1000;
    const newCount = parts.filter((p) => !this.partMap.has(p.key)).length;
    const gap = this.buildSeconds ? Math.min(0.06, this.buildSeconds / Math.max(newCount, 1)) : 0.06;
    const duration = this.buildSeconds ? 0.3 : 0.4;
    let order = 0;
    for (const p of parts) {
      if (this.partMap.has(p.key)) continue;
      const obj = p.create();
      // 부품의 가운데를 기준으로 커지도록, 가운데에 축(pivot)을 만든다.
      const center = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());
      const pivot = new THREE.Group();
      pivot.position.copy(center);
      obj.position.sub(center);
      pivot.add(obj);
      pivot.traverse((m) => {
        if (m.isMesh) {
          m.castShadow = !this.lowPower && !m.userData.noShadow;
          m.receiveShadow = !this.lowPower && !m.userData.noShadow;
        }
      });
      // 처음 화면을 열 때만 애니메이션 없이 바로 보여 줘도 되지만, 짓는 느낌을 위해 항상 등장시킨다.
      pivot.userData.targetScale = new THREE.Vector3(1, 1, 1);
      pivot.scale.setScalar(0.0001);
      this.animations.push({ obj: pivot, startAt: now + order * gap + (p.delay ?? 0), duration });
      order += 1;
      this.buildingRoot.add(pivot);
      this.partMap.set(p.key, { sig: p.sig, obj: pivot });
    }

    // 건물 크기가 바뀌었을 때만 카메라를 다시 맞춘다 (카드 하나 바꿀 때마다 화면이 흔들리지 않게).
    if (bounds && (!this.bounds || Math.abs(this.bounds.radius - bounds.radius) > 0.01)) {
      this.bounds = bounds;
      this.fitCamera();
    }
  }

  removePart(key) {
    const entry = this.partMap.get(key);
    if (!entry) return;
    this.animations = this.animations.filter((a) => a.obj !== entry.obj);
    this.buildingRoot.remove(entry.obj);
    disposeObject(entry.obj);
    this.partMap.delete(key);
  }

  clearBuilding() {
    for (const key of [...this.partMap.keys()]) this.removePart(key);
  }

  // 화면 위·아래를 가리는 판(상단 바, 하단 카드 판)의 높이(px)를 알려 준다.
  // 건물은 가려지지 않은 가운데 공간에 맞춰 보이게 된다.
  setInsets(top, bottom) {
    if (this.insets.top === top && this.insets.bottom === bottom) return;
    this.insets = { top, bottom };
    this.resize();
  }

  // 가려지지 않은 공간의 높이 (너무 작아지지 않게 최소 30%는 보장)
  visibleHeight(h) {
    return Math.max(h - this.insets.top - this.insets.bottom, h * 0.3);
  }

  // 건물 크기에 맞춰 보이는 공간 안에 전부 들어오도록 카메라 거리를 정한다.
  fitCamera() {
    if (!this.bounds) return;
    const { clientWidth: w, clientHeight: h } = this.container;
    if (w === 0 || h === 0) return;
    const { center, radius } = this.bounds;
    const t = Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2);
    const vertical = Math.atan((t * this.visibleHeight(h)) / h); // 보이는 공간의 세로 반각
    const horizontal = Math.atan(t * (w / h)); // 화면 가로 반각
    const distance = (radius / Math.sin(Math.min(vertical, horizontal))) * 1.02;
    const dir = new THREE.Vector3(1, 0.75, 1.3).normalize();
    this.camera.position.copy(center).addScaledVector(dir, distance);
    this.controls.target.copy(center);
    this.controls.maxDistance = distance * 2;
    this.controls.update();
  }

  resize() {
    const { clientWidth: w, clientHeight: h } = this.container;
    if (w === 0 || h === 0) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // 화면 중심을 "가려지지 않은 공간의 중심"으로 옮긴다.
    // (아래가 더 많이 가려지면 그만큼 장면을 위로 올려 그린다)
    const top = this.insets.top;
    const bottom = h - top - this.visibleHeight(h);
    this.camera.setViewOffset(w, h, 0, Math.round((bottom - top) / 2), w, h);
    this.camera.updateProjectionMatrix();
    this.fitCamera();
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

    // 고르고 있는 자리가 은은하게 깜빡인다
    MATERIALS.active.emissiveIntensity = 0.25 + 0.3 * (0.5 + 0.5 * Math.sin(now * 5));

    // 구름이 아주 천천히 흘러간다
    if (this.clouds) this.clouds.rotation.y = now * 0.01;

    if (this.celebration) {
      const t = Math.min(1, (now - this.celebration.startAt) / CELEBRATE_SECONDS);
      this.buildingRoot.rotation.y = easeInOutCubic(t) * Math.PI * 2;
      // 세 번 통통 튀고, 튈수록 낮아진다
      this.buildingRoot.position.y = Math.abs(Math.sin(t * Math.PI * 3)) * 0.9 * (1 - t);
      if (t >= 1) {
        this.buildingRoot.rotation.y = 0;
        this.buildingRoot.position.y = 0;
        this.celebration = null;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.resizeObserver.disconnect();
    for (const [name, fn] of Object.entries(this.handlers ?? {})) {
      this.renderer.domElement.removeEventListener(name, fn);
    }
    this.controls.dispose();
    this.clearBuilding();
    disposeObject(this.scene);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

// 형상, (공유되지 않는) 재질, 글자 그림(텍스처)을 GPU 메모리에서 해제한다.
// 스프라이트의 형상은 Three.js가 모든 스프라이트에 함께 쓰는 것이라 지우지 않는다.
function disposeObject(root) {
  root.traverse((obj) => {
    if (obj.geometry && !obj.isSprite) obj.geometry.dispose();
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((m) => {
      if (!m || m.userData?.shared) return;
      m.map?.dispose();
      m.dispose();
    });
  });
}
