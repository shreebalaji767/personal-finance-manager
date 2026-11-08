(() => {
  const host = document.querySelector('.hero-art');
  if (!host || !('WebGLRenderingContext' in window)) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.15, 8.2);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !/Mobi|Android/i.test(navigator.userAgent),
      powerPreference: 'low-power',
      stencil: false,
      depth: true
    });
  } catch (error) {
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.className = 'ledger-3d-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.prepend(renderer.domElement);

  const root = new THREE.Group();
  scene.add(root);

  const blue = new THREE.MeshStandardMaterial({ color: 0x5274ee, metalness: 0.48, roughness: 0.27 });
  const pale = new THREE.MeshStandardMaterial({ color: 0xc6d4ff, metalness: 0.52, roughness: 0.24 });
  const green = new THREE.MeshStandardMaterial({ color: 0x35b990, metalness: 0.42, roughness: 0.3 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x91a8ff, metalness: 0.35, roughness: 0.22, transparent: true, opacity: 0.72 });
  scene.add(new THREE.AmbientLight(0xffffff, 1.8));
  const keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
  keyLight.position.set(4, 6, 7);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0x8da5ff, 18, 18);
  rimLight.position.set(-4, 1, 3);
  scene.add(rimLight);

  const makeMesh = (geometry, material, position, parent = root) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    parent.add(mesh);
    return mesh;
  };

  const core = new THREE.Group();
  root.add(core);
  const coin = makeMesh(new THREE.CylinderGeometry(0.92, 0.92, 0.16, 64), pale, [0, 0, 0], core);
  coin.rotation.x = 0.32;
  const coinInset = makeMesh(new THREE.CylinderGeometry(0.72, 0.72, 0.18, 64), blue, [0, 0.02, 0], core);
  coinInset.rotation.x = 0.32;
  const ring = makeMesh(new THREE.TorusGeometry(1.18, 0.045, 12, 80), green, [0, 0, 0.12]);
  ring.rotation.set(0.9, 0.15, 0.2);
  const halo = makeMesh(new THREE.TorusGeometry(1.48, 0.018, 8, 96), pale, [0, 0, -0.1]);
  halo.rotation.set(0.9, -0.35, 0.25);

  const bars = new THREE.Group();
  bars.position.set(1.75, -0.68, -0.15);
  root.add(bars);
  [0.5, 0.86, 0.68, 1.18].forEach((height, index) => {
    const bar = makeMesh(new THREE.BoxGeometry(0.22, height, 0.22), index === 3 ? green : blue, [index * 0.32, height / 2, 0], bars);
    bar.rotation.z = (index - 1.5) * 0.035;
  });

  const orbiters = new THREE.Group();
  root.add(orbiters);
  const orbiterData = [
    { p: [-1.85, 0.95, 0.3], r: 0.19, m: green },
    { p: [1.75, 1.1, -0.4], r: 0.13, m: pale },
    { p: [-1.55, -1.0, -0.3], r: 0.11, m: blue }
  ];
  orbiterData.forEach(({ p, r, m }) => {
    const orbiter = makeMesh(new THREE.SphereGeometry(r, 24, 16), m, p, orbiters);
    orbiter.userData.base = new THREE.Vector3(...p);
  });

  const starField = new THREE.Group();
  root.add(starField);
  for (let i = 0; i < 18; i++) {
    const dot = makeMesh(new THREE.SphereGeometry(0.018 + (i % 3) * 0.008, 8, 6), i % 3 === 0 ? green : pale,
      [((i * 37) % 53) / 15 - 1.75, ((i * 19) % 37) / 13 - 1.35, -0.7 - (i % 4) * 0.2], starField);
    dot.userData.phase = i * 0.7;
    dot.userData.baseY = dot.position.y;
  }

  let width = 1;
  let height = 1;
  let visible = false;
  let lastFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;
  const clock = new THREE.Clock();

  const resize = () => {
    const rect = host.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    camera.aspect = width / height;
    camera.position.z = width < 480 ? 9.1 : 8.2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    draw();
  };

  const draw = () => renderer.render(scene, camera);
  const animate = (time) => {
    if (!visible || document.hidden) return;
    if (time - lastFrame < 30) return;
    lastFrame = time;
    const elapsed = clock.getElapsedTime();
    root.rotation.y += (targetX - root.rotation.y) * 0.025;
    root.rotation.x += (targetY - root.rotation.x) * 0.025;
    core.position.y = Math.sin(elapsed * 0.8) * 0.11;
    core.rotation.y = Math.sin(elapsed * 0.32) * 0.13;
    ring.rotation.z = elapsed * 0.16;
    halo.rotation.y = -elapsed * 0.12;
    bars.rotation.y = Math.sin(elapsed * 0.42) * 0.12;
    orbiters.children.forEach((object, index) => {
      const base = object.userData.base;
      object.position.y = base.y + Math.sin(elapsed * 1.05 + index * 1.8) * 0.12;
    });
    starField.children.forEach((dot) => {
      dot.position.y = dot.userData.baseY + Math.sin(elapsed + dot.userData.phase) * 0.035;
    });
    draw();
  };

  const setActive = (active) => {
    visible = active;
    if (reducedMotion) {
      if (visible) draw();
      return;
    }
    renderer.setAnimationLoop(visible && !document.hidden ? animate : null);
  };

  host.addEventListener('pointermove', (event) => {
    const rect = host.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
    pointerY = (event.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
    targetX = pointerX * 0.22;
    targetY = -pointerY * 0.16;
  }, { passive: true });
  host.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; }, { passive: true });

  const observer = new IntersectionObserver((entries) => setActive(entries[0].isIntersecting), { threshold: 0.05 });
  observer.observe(host);
  document.addEventListener('visibilitychange', () => setActive(visible));
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host);
  else window.addEventListener('resize', resize, { passive: true });
  resize();
  host.classList.add('three-ready');
})();
