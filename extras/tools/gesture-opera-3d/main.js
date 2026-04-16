import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";
import { Hands } from "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";
import { Camera } from "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";

const stage = document.querySelector("#stage");
const webcam = document.querySelector("#webcam");
const overlay = document.querySelector("#overlay");
const statusEl = document.querySelector("#status");
const ctx = overlay.getContext("2d");

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
stage.append(renderer.domElement);

const scene = new THREE.Scene();
const camera3D = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
);
camera3D.position.set(0, 0, 6);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const key = new THREE.DirectionalLight(0x8fc5ff, 1.2);
key.position.set(4, 3, 3);
scene.add(key);
const rim = new THREE.DirectionalLight(0xff4f9b, 1.1);
rim.position.set(-4, -2, -2);
scene.add(rim);

const base = new THREE.Group();
scene.add(base);

const face = new THREE.Mesh(
  new THREE.SphereGeometry(1.1, 64, 64),
  new THREE.MeshStandardMaterial({
    color: 0xf8f2ea,
    roughness: 0.3,
    metalness: 0.15,
  }),
);
base.add(face);

const crest = new THREE.Mesh(
  new THREE.TorusGeometry(1.25, 0.08, 16, 120),
  new THREE.MeshStandardMaterial({ color: 0xcc2038, metalness: 0.45, roughness: 0.32 }),
);
crest.rotation.x = Math.PI / 2.5;
crest.position.z = 0.15;
base.add(crest);

const eyeL = new THREE.Mesh(
  new THREE.TorusGeometry(0.24, 0.05, 16, 64),
  new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.2, roughness: 0.65 }),
);
eyeL.position.set(-0.38, 0.15, 0.95);
const eyeR = eyeL.clone();
eyeR.position.x = 0.38;
base.add(eyeL, eyeR);

const browMat = new THREE.MeshStandardMaterial({ color: 0xd91933, roughness: 0.42, metalness: 0.1 });
const browGeo = new THREE.TorusGeometry(0.28, 0.03, 8, 32, Math.PI);
const browL = new THREE.Mesh(browGeo, browMat);
browL.position.set(-0.38, 0.36, 0.92);
browL.rotation.z = -0.6;
const browR = browL.clone();
browR.position.x = 0.38;
browR.rotation.z = 0.6;
base.add(browL, browR);

const nose = new THREE.Mesh(
  new THREE.ConeGeometry(0.08, 0.35, 24),
  new THREE.MeshStandardMaterial({ color: 0xca1a30, roughness: 0.45 }),
);
nose.position.set(0, -0.02, 1.02);
nose.rotation.x = Math.PI / 2;
base.add(nose);

const beard = new THREE.Mesh(
  new THREE.ConeGeometry(0.42, 1.25, 36),
  new THREE.MeshStandardMaterial({ color: 0x0f1015, metalness: 0.08, roughness: 0.75 }),
);
beard.position.set(0, -1.35, 0.52);
beard.rotation.x = Math.PI;
base.add(beard);

const ornament = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.18, 0.04, 100, 20),
  new THREE.MeshStandardMaterial({ color: 0xf3cf47, metalness: 0.85, roughness: 0.2 }),
);
ornament.position.set(0, 0.88, 0.95);
base.add(ornament);

const aura = new THREE.Mesh(
  new THREE.TorusGeometry(2.05, 0.02, 8, 160),
  new THREE.MeshBasicMaterial({ color: 0x8e6bff }),
);
aura.rotation.x = Math.PI / 2;
base.add(aura);

let targetX = 0;
let targetY = 0;
let targetScale = 1;

function resize() {
  overlay.width = window.innerWidth;
  overlay.height = window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera3D.aspect = window.innerWidth / window.innerHeight;
  camera3D.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

function drawLandmarks(points) {
  ctx.strokeStyle = "#42f5ef";
  ctx.fillStyle = "#ff6ebf";
  ctx.lineWidth = 2;
  for (const p of points) {
    const x = (1 - p.x) * overlay.width;
    const y = p.y * overlay.height;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

const hands = new Hands({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.6,
});

hands.onResults((results) => {
  ctx.clearRect(0, 0, overlay.width, overlay.height);

  const landmarks = results.multiHandLandmarks ?? [];
  for (const points of landmarks) drawLandmarks(points);

  if (landmarks.length >= 1) {
    const hand = landmarks[0];
    const tip = hand[8];

    // 手指向上移动 => 物体向上（tip.y 变小）
    targetX = (0.5 - tip.x) * 6;
    targetY = (0.5 - tip.y) * 4;
    statusEl.textContent = "已检测到单手：可控制上下左右";
  }

  if (landmarks.length >= 2) {
    const a = landmarks[0][8];
    const b = landmarks[1][8];
    const distance = Math.hypot(a.x - b.x, a.y - b.y);

    // 双手拉开放大、靠近缩小
    targetScale = THREE.MathUtils.clamp(0.5 + distance * 3.2, 0.55, 2.8);
    statusEl.textContent = "已检测到双手：正在控制缩放";
  }

  if (landmarks.length === 0) {
    statusEl.textContent = "未检测到手势，请将手放到镜头前";
  }
});

const inputCamera = new Camera(webcam, {
  onFrame: async () => {
    await hands.send({ image: webcam });
  },
  width: 640,
  height: 480,
});

inputCamera
  .start()
  .then(() => {
    statusEl.textContent = "摄像头已就绪，开始手势操控";
  })
  .catch((error) => {
    statusEl.textContent = `无法启动摄像头：${error.message}`;
  });

renderer.setAnimationLoop(() => {
  const t = performance.now() * 0.001;

  base.rotation.y += 0.005;
  base.rotation.x = Math.sin(t * 0.8) * 0.08;
  ornament.rotation.x += 0.03;
  ornament.rotation.y += 0.025;
  aura.rotation.z -= 0.003;

  base.position.x = THREE.MathUtils.lerp(base.position.x, targetX, 0.15);
  base.position.y = THREE.MathUtils.lerp(base.position.y, targetY, 0.15);

  const s = THREE.MathUtils.lerp(base.scale.x, targetScale, 0.16);
  base.scale.setScalar(s);

  renderer.render(scene, camera3D);
});
