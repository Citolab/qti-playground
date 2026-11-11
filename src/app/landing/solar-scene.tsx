import { useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";

// The landing page's hero backdrop: the solar system of the item in the hero, in 3D. The four planets of the
// item wear the item's own maps (public/examples/solar-system/images/*-map.svg); the others are painted
// here. The planet the candidate picks in the item grows and lights up: green when it is right, magenta
// when it is not. Drag to turn the system. three.js is in a chunk of its own: only the landing page loads it.

export type PlanetId =
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "neptune";

export type Focus = { planet: PlanetId; correct: boolean } | null;

type Props = {
  focus: Focus;
  /** The planet under the pointer, or null. */
  onHover?: (planet: PlanetId | null) => void;
};

const MAPS = "/examples/solar-system/images";

type Planet = {
  id: PlanetId;
  size: number;
  orbit: number;
  /** Radians per second at the base speed. */
  speed: number;
  /** One of the item's maps, two turns side by side, or a painter. */
  map?: string;
  paint?: (ctx: CanvasRenderingContext2D, w: number, h: number, rand: () => number) => void;
  ring?: boolean;
  start: number;
};

/** A seeded random, so the sky is the same on every visit. */
function random(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Horizontal bands with a wobble, for the gas giants and for clouds. */
function bands(ctx: CanvasRenderingContext2D, w: number, h: number, colors: string[], rand: () => number) {
  const count = colors.length * 2;
  for (let i = 0; i < count; i++) {
    const y = (i / count) * h;
    const height = h / count + 2;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += 16) ctx.lineTo(x, y + Math.sin(x / 40 + i) * 3 * rand());
    ctx.lineTo(w, y + height);
    ctx.lineTo(0, y + height);
    ctx.closePath();
    ctx.fill();
  }
}

function blotches(ctx: CanvasRenderingContext2D, w: number, h: number, color: string, count: number, size: number, rand: () => number) {
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const x = rand() * w;
    const y = h * 0.15 + rand() * h * 0.7;
    const r = size * (0.4 + rand());
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.6, r, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
}

const PLANETS: Planet[] = [
  {
    id: "mercury",
    size: 0.2,
    orbit: 2.3,
    speed: 1.6,
    start: 0.4,
    paint: (ctx, w, h, rand) => {
      ctx.fillStyle = "#9a948c";
      ctx.fillRect(0, 0, w, h);
      blotches(ctx, w, h, "#7d776f", 60, 10, rand);
      blotches(ctx, w, h, "#b5afa6", 30, 6, rand);
    },
  },
  { id: "venus", size: 0.36, orbit: 3.3, speed: 1.2, start: 2.2, map: `${MAPS}/venus-map.svg` },
  {
    id: "earth",
    size: 0.38,
    orbit: 4.4,
    speed: 1,
    start: 4.1,
    paint: (ctx, w, h, rand) => {
      ctx.fillStyle = "#1f5fbf";
      ctx.fillRect(0, 0, w, h);
      blotches(ctx, w, h, "#3f9b4a", 18, 34, rand);
      blotches(ctx, w, h, "#b89a5c", 8, 18, rand);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillRect(0, 0, w, h * 0.07);
      ctx.fillRect(0, h * 0.93, w, h * 0.07);
      ctx.globalAlpha = 0.5;
      blotches(ctx, w, h, "#ffffff", 26, 14, rand);
      ctx.globalAlpha = 1;
    },
  },
  { id: "mars", size: 0.3, orbit: 5.5, speed: 0.8, start: 0.9, map: `${MAPS}/mars-map.svg` },
  { id: "jupiter", size: 0.85, orbit: 7.3, speed: 0.45, start: 3.3, map: `${MAPS}/jupiter-map.svg` },
  {
    id: "saturn",
    size: 0.7,
    orbit: 9.1,
    speed: 0.33,
    start: 5.4,
    ring: true,
    paint: (ctx, w, h, rand) => bands(ctx, w, h, ["#e4cf9b", "#d2b57a", "#ead9ad", "#c9a86c"], rand),
  },
  { id: "neptune", size: 0.5, orbit: 10.9, speed: 0.25, start: 1.7, map: `${MAPS}/neptune-map.svg` },
];

/** Where a picked planet flies to on a wide screen: the open sky under the item, left of the coach (NDC). */
const FLY_TO = new THREE.Vector2(0.11, -0.72);
/** How far from the camera it stops, and how big it shows there (world units). */
const FLY_DISTANCE = 19;
const FLY_RADIUS = 0.85;

const GREEN = new THREE.Color("#00ee6c");
const MAGENTA = new THREE.Color("#e30275");

/** A soft round dot: the sun's glow, the stars, the halo of a picked planet. */
function radialTexture(stops: [number, string][]) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  for (const [at, color] of stops) gradient.addColorStop(at, color);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function planetTexture(planet: Planet, rand: () => number) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (planet.paint) {
    planet.paint(ctx, canvas.width, canvas.height, rand);
  } else if (planet.map) {
    // the item's map holds two turns of the planet: drawn once round the sphere, it turns twice
    ctx.fillStyle = "#444";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const image = new Image();
    image.onload = () => {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      texture.needsUpdate = true;
    };
    image.src = planet.map;
  }
  return texture;
}

/** Saturn's ring: bands of dust from the inside out, on a ring whose u runs from the inner edge outwards. */
function ringMesh(size: number) {
  const inner = size * 1.35;
  const outer = size * 2.3;
  const geometry = new THREE.RingGeometry(inner, outer, 96, 1);
  const uv = geometry.attributes.uv;
  const position = geometry.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < uv.count; i++) {
    v.fromBufferAttribute(position, i);
    uv.setXY(i, (v.length() - inner) / (outer - inner), 0.5);
  }
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 4;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, 256, 0);
  gradient.addColorStop(0, "rgba(210,190,150,0.1)");
  gradient.addColorStop(0.2, "rgba(230,210,170,0.8)");
  gradient.addColorStop(0.45, "rgba(190,165,120,0.55)");
  gradient.addColorStop(0.5, "rgba(0,0,0,0)");
  gradient.addColorStop(0.56, "rgba(220,200,160,0.7)");
  gradient.addColorStop(1, "rgba(200,180,140,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 4);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide, depthWrite: false }),
  );
  mesh.rotation.x = -Math.PI / 2 + 0.35;
  return { mesh, texture };
}

type SceneApi = { dispose: () => void };

function createScene(canvas: HTMLCanvasElement, host: HTMLElement, props: { current: Props }): SceneApi | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    return null; // no WebGL: the hero keeps its starry gradient
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 200);
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(thing: T) => (disposables.push(thing), thing);

  const rand = random(11);

  // stars, far behind the system
  const STARS = 1600;
  const starPositions = new Float32Array(STARS * 3);
  for (let i = 0; i < STARS; i++) {
    const r = 40 + rand() * 40;
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    starPositions.set([r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)], i * 3);
  }
  const starGeometry = keep(new THREE.BufferGeometry());
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const dot = keep(radialTexture([[0, "rgba(255,255,255,1)"], [0.4, "rgba(255,255,255,0.6)"], [1, "rgba(255,255,255,0)"]]));
  const stars = new THREE.Points(
    starGeometry,
    keep(new THREE.PointsMaterial({ size: 0.35, map: dot, transparent: true, opacity: 0.85, depthWrite: false, color: 0xdfe8ff })),
  );
  scene.add(stars);

  // the system: the sun, the orbits and the planets, in a plane tilted towards the camera
  const system = new THREE.Group();
  scene.add(system);
  const plane = new THREE.Group();
  plane.rotation.set(0.32, 0, -0.18);
  system.add(plane);

  const sunTexture = keep(
    radialTexture([[0, "#fff6c8"], [0.45, "#ffd23f"], [0.8, "#ff9d1c"], [1, "#e86a10"]]),
  );
  const sun = new THREE.Mesh(keep(new THREE.SphereGeometry(1.05, 48, 48)), keep(new THREE.MeshBasicMaterial({ map: sunTexture })));
  plane.add(sun);
  const glowTexture = keep(
    radialTexture([[0, "rgba(255,214,90,0.95)"], [0.25, "rgba(255,170,40,0.45)"], [0.6, "rgba(227,2,117,0.12)"], [1, "rgba(0,0,0,0)"]]),
  );
  const glow = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: glowTexture, blending: THREE.AdditiveBlending, depthWrite: false })));
  glow.scale.setScalar(9);
  plane.add(glow);
  scene.add(new THREE.AmbientLight(0x6070a0, 0.35));
  const sunlight = new THREE.PointLight(0xfff1d0, 3.2, 0, 0);
  plane.add(sunlight);
  // the sun is behind a planet that flew out towards the camera: this lights its day side then
  const frontlight = new THREE.DirectionalLight(0xffffff, 0);
  frontlight.position.set(-4, 3, 10);
  scene.add(frontlight);

  const haloTexture = keep(
    radialTexture([[0, "rgba(255,255,255,0)"], [0.55, "rgba(255,255,255,0)"], [0.68, "rgba(255,255,255,0.9)"], [0.8, "rgba(255,255,255,0.25)"], [1, "rgba(255,255,255,0)"]]),
  );

  type Body = {
    planet: Planet;
    pivot: THREE.Group;
    mesh: THREE.Mesh;
    halo: THREE.Sprite;
    haloMaterial: THREE.SpriteMaterial;
    scale: number;
    glow: number;
    /** 0 in its orbit, 1 flown out to the open sky under the item. */
    fly: number;
  };
  const bodies: Body[] = PLANETS.map((planet) => {
    const orbit = new THREE.LineLoop(
      keep(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 160 }, (_, i) => {
        const a = (i / 160) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(a) * planet.orbit, 0, Math.sin(a) * planet.orbit);
      }))),
      keep(new THREE.LineBasicMaterial({ color: 0x7effbe, transparent: true, opacity: 0.14 })),
    );
    plane.add(orbit);
    const pivot = new THREE.Group();
    pivot.rotation.y = planet.start;
    plane.add(pivot);
    const texture = keep(planetTexture(planet, rand));
    const mesh = new THREE.Mesh(
      keep(new THREE.SphereGeometry(planet.size, 48, 48)),
      keep(new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9, metalness: 0 })),
    );
    mesh.position.x = planet.orbit;
    mesh.rotation.z = 0.2;
    mesh.userData.id = planet.id;
    pivot.add(mesh);
    if (planet.ring) {
      const ring = ringMesh(planet.size);
      keep(ring.texture);
      keep(ring.mesh.geometry);
      keep(ring.mesh.material);
      mesh.add(ring.mesh);
    }
    const haloMaterial = keep(
      new THREE.SpriteMaterial({ map: haloTexture, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    const halo = new THREE.Sprite(haloMaterial);
    halo.scale.setScalar(planet.size * 4.2);
    halo.position.x = planet.orbit;
    pivot.add(halo);
    return { planet, pivot, mesh, halo, haloMaterial, scale: 1, glow: 0, fly: 0 };
  });

  // pointer: parallax, hover, drag to turn
  const pointer = new THREE.Vector2();
  const parallax = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let overCanvas = false;
  let dragging = false;
  let dragFrom = 0;
  let spin = 0;
  let hovered: PlanetId | null = null;
  const onMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    overCanvas = event.target === canvas;
    if (dragging) {
      spin += (event.clientX - dragFrom) * 0.003;
      dragFrom = event.clientX;
    }
  };
  const onDown = (event: PointerEvent) => {
    dragging = true;
    dragFrom = event.clientX;
  };
  const onUp = () => (dragging = false);
  window.addEventListener("pointermove", onMove, { passive: true });
  canvas.addEventListener("pointerdown", onDown);
  window.addEventListener("pointerup", onUp);

  // where the system stands: the sun high on the right, its orbits sweeping across the hero
  let anchor = new THREE.Vector3();
  let size = 1;
  let wide = true;
  const resize = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.set(0, 0, 26);
    camera.updateProjectionMatrix();
    const visibleH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const visibleW = visibleH * camera.aspect;
    wide = width >= 1024;
    // on a wide screen the sun rises from behind the item, clear of the headline
    const [nx, ny] = wide ? [0.6, 0.52] : [0.5, 0.8];
    anchor = new THREE.Vector3((nx * 2 - 1) * (visibleW / 2), -(ny * 2 - 1) * (visibleH / 2), 0);
    size = wide ? Math.max(0.8, visibleW / 26) : visibleW / 20;
  };
  const resizer = new ResizeObserver(resize);
  resizer.observe(host);
  resize();

  const scroller = host.closest("main");
  let visible = true;
  const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
  observer.observe(host);

  const flyTo = new THREE.Vector3();
  const orbitPosition = new THREE.Vector3();
  let time = 0;
  let pace = 1;
  let last = performance.now();
  let frame = 0;
  const render = (now: number) => {
    frame = requestAnimationFrame(render);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!visible || document.hidden) return;
    const focus = props.current.focus;
    // the system slows down while a planet is picked, so it can be seen
    pace += ((focus ? 0.15 : 1) - pace) * 0.05;
    if (!reduced) time += dt * pace;

    // the page scrolls in <main>, under the nav: how far the hero has gone up behind it
    const rect = host.getBoundingClientRect();
    const top = scroller?.getBoundingClientRect().top ?? 0;
    const scrolled = Math.min(1, Math.max(0, (top - rect.top) / rect.height));

    parallax.lerp(pointer, 0.05);
    camera.position.x = parallax.x * 0.8;
    camera.position.y = parallax.y * 0.6;
    camera.lookAt(0, 0, 0);

    system.position.copy(anchor);
    system.scale.setScalar(size);
    spin *= 0.94;
    plane.rotation.x = 0.32 + scrolled * 0.5 + parallax.y * 0.05;
    plane.rotation.y += spin + (reduced ? 0 : dt * 0.01);

    sun.rotation.y = time * 0.05;
    stars.rotation.y = time * 0.004;

    if (overCanvas && !dragging) {
      raycaster.setFromCamera(pointer, camera);
      const [hit] = raycaster.intersectObjects(bodies.map((b) => b.mesh), false);
      const id = (hit?.object.userData.id as PlanetId | undefined) ?? null;
      if (id !== hovered) {
        hovered = id;
        canvas.style.cursor = id ? "help" : "grab";
        props.current.onHover?.(id);
      }
    } else if (hovered && !overCanvas) {
      hovered = null;
      props.current.onHover?.(null);
    }

    for (const body of bodies) {
      body.pivot.rotation.y = body.planet.start + time * body.planet.speed * 0.12;
    }
    scene.updateMatrixWorld();
    // on a wide screen the picked planet leaves its orbit, which may run behind the item, for the open
    // sky under the item; on a narrow one it lights up where it is
    if (wide) {
      raycaster.setFromCamera(FLY_TO, camera);
      raycaster.ray.at(FLY_DISTANCE, flyTo);
    }

    for (const body of bodies) {
      body.mesh.rotation.y = time * 0.6;
      const picked = focus?.planet === body.planet.id;
      body.fly += ((picked && wide ? 1 : 0) - body.fly) * 0.06;
      const t = body.fly * body.fly * (3 - 2 * body.fly);
      orbitPosition.set(body.planet.orbit, 0, 0);
      if (t > 0.001) {
        const local = body.pivot.worldToLocal(flyTo.clone());
        body.mesh.position.lerpVectors(orbitPosition, local, t);
      } else {
        body.mesh.position.copy(orbitPosition);
      }
      body.halo.position.copy(body.mesh.position);
      // flown out, every planet shows at the same size: Mercury as big as Jupiter
      const flown = FLY_RADIUS / (body.planet.size * size);
      const target = picked ? (wide ? flown : 2.1) : hovered === body.planet.id ? 1.35 : 1;
      body.scale += (target - body.scale) * 0.08;
      body.mesh.scale.setScalar(body.scale);
      body.glow += ((picked ? 1 : 0) - body.glow) * 0.08;
      body.haloMaterial.opacity = body.glow * (0.75 + Math.sin(now / 300) * 0.25);
      body.haloMaterial.color.copy(focus?.correct ? GREEN : MAGENTA);
      body.halo.scale.setScalar(body.planet.size * 4.2 * body.scale);
      // flying towards the camera, it is drawn over the planets it passes
      body.mesh.renderOrder = picked ? 10 : 0;
    }
    frontlight.intensity = 2.4 * Math.max(...bodies.map((b) => b.fly));

    renderer.render(scene, camera);
  };
  canvas.style.cursor = "grab";
  frame = requestAnimationFrame(render);

  return {
    dispose() {
      cancelAnimationFrame(frame);
      resizer.disconnect();
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      for (const thing of disposables) thing.dispose();
      renderer.dispose();
    },
  };
}

export default function SolarScene(props: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const latest = useRef(props);
  useLayoutEffect(() => {
    latest.current = props;
  });

  useEffect(() => {
    const element = canvas.current;
    const host = element?.parentElement;
    if (!element || !host) return;
    const api = createScene(element, host, latest);
    return () => api?.dispose();
  }, []);

  return <canvas ref={canvas} className="animate-fade-in block h-full w-full touch-pan-y" aria-hidden="true" />;
}
