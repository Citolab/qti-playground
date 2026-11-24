/**
 * The quest in 3D. Two places share one scene:
 *
 *  - the world: a low-poly island built from the tile map in world.ts and
 *    dressed by the chosen theme (knights, princess or aliens);
 *  - the arena: a floating stage where a question is answered by jumping on
 *    pads (see arena.ts).
 *
 * One tile is one world unit; tile (x, y) spans x..x+1 and z = y..y+1. The page
 * owns all game state and calls `update()` every frame.
 */
import * as THREE from "three";
import {
  areaBox,
  fieldFor,
  pictureFrame,
  runwayOf,
  runwayPoint,
  type Area,
  type ArenaSpec,
  type Field,
  type Pad,
  type Picture,
} from "./arena";
import type { Theme } from "./themes";
import type { FrameState, PadView, PictureView } from "./types";
import { GATES, MAP, MAP_H, MAP_W, groundHeight, rng, type Layout, type Tile } from "./world";

const UP = new THREE.Vector3(0, 1, 0);
/** A picked pad is blue in every world: a theme's own accent can be red or green, which would read as wrong or right. */
const SELECTED = "#0ea5e9";

function starShape(outer = 1, inner = 0.45) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / 5 + Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

const mat = (color: string, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...extra });

const glowMat = (color: string, opacity = 1) =>
  new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: opacity < 1, opacity });

interface LabelStyle {
  bg?: string;
  fg?: string;
  border?: string;
  badge?: string;
  badgeColor?: string;
  pill?: boolean;
  alpha?: number;
}

/** A canvas you can write a label on; `draw` only repaints when something changed. */
function makeLabelTexture(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  let key = "";
  const draw = (text: string, style: LabelStyle = {}) => {
    const k = text + JSON.stringify(style);
    if (k === key) return;
    key = k;
    const { bg = "#ffffff", fg = "#1f2937", border = "#1f2937", badge, badgeColor = "#f59e0b", pill = false, alpha = 1 } = style;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = alpha;
    const pad = 10;
    ctx.fillStyle = bg;
    ctx.strokeStyle = border;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.roundRect(pad, pad, width - pad * 2, height - pad * 2, pill ? (height - pad * 2) / 2 : 26);
    ctx.fill();
    ctx.stroke();

    // Fit the text: one line if it fits, else split in two at the middle-most space.
    const left = badge ? height * 0.62 : 28;
    const room = width - left - 28;
    let lines = [text];
    const fits = (size: number, ls: string[]) => {
      ctx.font = `bold ${size}px system-ui, sans-serif`;
      return ls.every((l) => ctx.measureText(l).width <= room);
    };
    let size = Math.floor(height * 0.56);
    if (!fits(size, lines) && text.includes(" ")) {
      const words = text.split(" ");
      let best = lines;
      let bestDiff = Infinity;
      for (let i = 1; i < words.length; i++) {
        const a = words.slice(0, i).join(" ");
        const b = words.slice(i).join(" ");
        const diff = Math.abs(a.length - b.length);
        if (diff < bestDiff) {
          bestDiff = diff;
          best = [a, b];
        }
      }
      const twoLine = Math.floor(height * 0.34);
      // One line set a little smaller reads better than two, as long as it still comes out the larger.
      let single = size;
      while (single > twoLine && !fits(single, lines)) single -= 3;
      if (single > twoLine) size = single;
      else if (fits(twoLine, best)) {
        lines = best;
        size = twoLine;
      }
    }
    while (size > 18 && !fits(size, lines)) size -= 3;
    ctx.font = `bold ${size}px system-ui, sans-serif`;
    ctx.fillStyle = fg;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const cx = left + room / 2;
    lines.forEach((l, i) => ctx.fillText(l, cx, height / 2 + (i - (lines.length - 1) / 2) * size * 1.12 + size * 0.04));

    if (badge) {
      const r = height * 0.26;
      ctx.fillStyle = badgeColor;
      ctx.beginPath();
      ctx.arc(pad + r + 16, height / 2, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.floor(r * 1.3)}px system-ui, sans-serif`;
      ctx.fillText(badge, pad + r + 16, height / 2 + 3);
    }
    ctx.globalAlpha = 1;
    texture.needsUpdate = true;
  };
  return { texture, draw };
}

function makeSpriteLabel(width = 256, height = 128) {
  const label = makeLabelTexture(width, height);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: label.texture, depthTest: false, transparent: true }));
  sprite.renderOrder = 20;
  return { sprite, draw: label.draw };
}

function glowTexture(color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const c = new THREE.Color(color);
  const rgb = `${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)}`;
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, `rgba(${rgb},1)`);
  g.addColorStop(0.4, `rgba(${rgb},0.4)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

interface ChestView {
  id: string;
  group: THREE.Group;
  lid: THREE.Group;
  glow: THREE.Sprite;
  stars: THREE.Mesh[];
  bubble: ReturnType<typeof makeSpriteLabel>;
  lock: ReturnType<typeof makeSpriteLabel> | null;
  openAmount: number;
  boss: boolean;
}

interface GateView {
  id: string;
  group: THREE.Group;
  label: ReturnType<typeof makeSpriteLabel>;
  needs: number;
  sink: number;
}

interface PadMesh {
  pad: Pad;
  group: THREE.Group;
  top: THREE.Mesh;
  topMat: THREE.MeshStandardMaterial;
  label: ReturnType<typeof makeLabelTexture>;
  sign: THREE.Object3D | null;
  y: number;
}

interface Particle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  spin: THREE.Vector3;
  life: number;
  floor: number;
}

export class QuestScene {
  readonly renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(45, 1, 0.1, 400);
  private sun: THREE.DirectionalLight;
  private world = new THREE.Group();
  private arena = new THREE.Group();
  private arenaStage = new THREE.Group();
  private arenaSpec: ArenaSpec | null = null;
  private pads: PadMesh[] = [];
  private board: { mesh: THREE.Mesh; label: ReturnType<typeof makeLabelTexture> } | null = null;
  /** A hotspot or select-point picture lying on the arena floor, with a see-through layer for its marks. */
  private picture: {
    source: Picture;
    areas: Area[];
    canvas: HTMLCanvasElement;
    texture: THREE.CanvasTexture;
    /** Canvas pixels per picture pixel. */
    px: number;
    key: string;
    /** Graphic gap match: the pictures you carry, by choice, once they are loaded. */
    carried: Map<string, HTMLImageElement>;
  } | null = null;
  /** What the hero holds up while carrying something. */
  private crate!: THREE.Mesh;
  private marker = makeSpriteLabel(256, 128);
  private flag = new THREE.Group();
  private flagCloth!: THREE.Mesh;
  private water!: THREE.Mesh;
  private waterBase!: Float32Array;
  private player = new THREE.Group();
  private limbs!: { body: THREE.Object3D; legL: THREE.Group; legR: THREE.Group; armL: THREE.Group; armR: THREE.Group };
  private outfit: THREE.MeshStandardMaterial[] = [];
  private playerColor = "";
  private shadowBlob!: THREE.Mesh;
  private chests: ChestView[] = [];
  private gates: GateView[] = [];
  private landmarkGlow: { material: THREE.MeshStandardMaterial | THREE.MeshBasicMaterial; light: THREE.PointLight } | null = null;
  private spinners: THREE.Object3D[] = [];
  private flags: THREE.Mesh[] = [];
  private clouds: THREE.Group[] = [];
  private targetRing: THREE.Mesh;
  private particles: Particle[] = [];
  private floaters: { label: ReturnType<typeof makeSpriteLabel>; life: number }[] = [];
  private camTarget = new THREE.Vector3();
  private camSnap = true;
  private raycaster = new THREE.Raycaster();
  private groundPlane = new THREE.Plane(UP, 0);
  private starGeometry: THREE.BufferGeometry;
  private time = 0;
  private aspect = 1;
  private width = 1;
  private height = 1;
  /** Pixels on the left that a panel covers: the arena is framed in what is left. */
  private inset = 0;
  /** The same for a panel across the top, as on a phone. */
  private insetTop = 0;
  private field: Field = fieldFor(false);

  constructor(
    private container: HTMLElement,
    private theme: Theme,
    private layout: Layout,
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.touchAction = "none";
    container.appendChild(this.renderer.domElement);

    this.starGeometry = new THREE.ExtrudeGeometry(starShape(), {
      depth: 0.35,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelSegments: 1,
    }).center();

    this.scene.background = new THREE.Color(theme.sky);
    this.scene.fog = new THREE.Fog(theme.fog.color, theme.fog.near, theme.fog.far);
    this.scene.add(new THREE.HemisphereLight(theme.hemi.sky, theme.hemi.ground, theme.hemi.intensity));
    this.sun = new THREE.DirectionalLight(theme.sun.color, theme.sun.intensity);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const c = this.sun.shadow.camera;
    c.left = -17;
    c.right = 17;
    c.top = 17;
    c.bottom = -17;
    c.near = 1;
    c.far = 60;
    this.sun.shadow.bias = -0.0008;
    this.sun.shadow.normalBias = 0.03;
    this.scene.add(this.sun, this.sun.target);

    this.scene.add(this.world, this.arena);
    this.arena.visible = false;

    this.buildGround();
    this.buildWater();
    this.buildBridges();
    this.buildDecor();
    if (theme.landmark.kind === "ufo") this.buildMothership();
    else this.buildCastle();
    this.buildGates();
    this.buildChests();
    this.buildPlayer();
    this.buildSky();
    this.buildArenaShell();

    this.targetRing = new THREE.Mesh(
      new THREE.RingGeometry(0.28, 0.38, 32),
      new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.85, depthWrite: false }),
    );
    this.targetRing.rotation.x = -Math.PI / 2;
    this.targetRing.visible = false;
    this.scene.add(this.targetRing);

    this.marker.sprite.scale.set(1.5, 0.75, 1);
    this.marker.sprite.visible = false;
    this.scene.add(this.marker.sprite);

    this.resize();
  }

  // ── The world ─────────────────────────────────────────────────────

  private shadowed<T extends THREE.Object3D>(o: T, receive = true) {
    o.traverse((x) => {
      if ((x as THREE.Mesh).isMesh) {
        x.castShadow = true;
        x.receiveShadow = receive;
      }
    });
    return o;
  }

  private buildGround() {
    const t = this.theme;
    const palette = (tile: Tile) =>
      tile === "path"
        ? t.ground.path
        : tile === "forest" || tile === "pine"
          ? t.ground.forest
          : tile === "stone" || tile === "rock" || tile === "castle"
            ? t.ground.stone
            : t.ground.grass;
    const cells: { x: number; y: number; tile: Tile }[] = [];
    for (let y = 0; y < MAP_H; y++)
      for (let x = 0; x < MAP_W; x++) {
        const tile = MAP[y][x];
        if (tile !== "water" && tile !== "bridge") cells.push({ x, y, tile });
      }
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const ground = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ roughness: 1 }), cells.length);
    const m = new THREE.Matrix4();
    const color = new THREE.Color();
    cells.forEach(({ x, y, tile }, i) => {
      const top = groundHeight(y) + (tile === "path" ? -0.03 : 0);
      const h = 1.2 + top;
      m.makeScale(1, h, 1).setPosition(x + 0.5, top - h / 2, y + 0.5);
      ground.setMatrixAt(i, m);
      ground.setColorAt(i, color.set(palette(tile)[(x * 7 + y * 13) % 3]));
    });
    ground.receiveShadow = true;
    this.world.add(ground);

    // A rim where land meets water
    const rim: THREE.Matrix4[] = [];
    for (let y = 0; y < MAP_H; y++)
      for (let x = 0; x < MAP_W; x++) {
        if (MAP[y][x] !== "water") continue;
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const n = MAP[y + dy]?.[x + dx];
          if (!n || n === "water" || n === "bridge") continue;
          const mm = new THREE.Matrix4().makeScale(dx ? 0.22 : 1, 1, dy ? 0.22 : 1);
          mm.setPosition(x + 0.5 + dx * 0.4, -0.56, y + 0.5 + dy * 0.4);
          rim.push(mm);
        }
      }
    const rimMesh = new THREE.InstancedMesh(geo, mat(t.sand), rim.length);
    rim.forEach((mm, i) => rimMesh.setMatrixAt(i, mm));
    rimMesh.receiveShadow = true;
    this.world.add(rimMesh);
  }

  private buildWater() {
    const w = this.theme.water;
    const geo = new THREE.PlaneGeometry(MAP_W + 70, MAP_H + 70, 96, 84);
    geo.rotateX(-Math.PI / 2);
    this.waterBase = Float32Array.from(geo.attributes.position.array as Float32Array);
    this.water = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        color: w.color,
        emissive: w.emissive,
        emissiveIntensity: w.emissiveIntensity,
        roughness: 0.25,
        flatShading: true,
        transparent: true,
        opacity: w.opacity,
      }),
    );
    this.water.position.set(MAP_W / 2, -0.16, MAP_H / 2);
    this.water.receiveShadow = true;
    this.world.add(this.water);
  }

  private buildBridges() {
    const b = this.theme.bridge;
    const plank = b.glow ? glowMat(b.plank, 0.75) : mat(b.plank);
    const rail = mat(b.rail);
    for (const gate of GATES) {
      const xs = gate.tiles.map(([x]) => x);
      const zs = gate.tiles.map(([, y]) => y);
      const x0 = Math.min(...xs);
      const x1 = Math.max(...xs) + 1;
      const z0 = Math.min(...zs);
      const z1 = Math.max(...zs) + 1;
      const alongZ = gate.alongZ;
      const length = alongZ ? z1 - z0 : x1 - x0;
      const width = alongZ ? x1 - x0 : z1 - z0;
      for (let i = 0; i < length * 4; i++) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(alongZ ? width : 0.22, 0.1, alongZ ? 0.22 : width), plank);
        const t = (i + 0.5) / 4;
        p.position.set(alongZ ? (x0 + x1) / 2 : x0 + t, -0.04, alongZ ? z0 + t : (z0 + z1) / 2);
        p.receiveShadow = !b.glow;
        p.castShadow = !b.glow;
        this.world.add(p);
      }
      for (const side of [0, 1]) {
        const r = new THREE.Mesh(
          new THREE.BoxGeometry(alongZ ? 0.08 : length + 0.4, 0.08, alongZ ? length + 0.4 : 0.08),
          rail,
        );
        r.position.set(alongZ ? (side ? x1 : x0) : (x0 + x1) / 2, 0.42, alongZ ? (z0 + z1) / 2 : side ? z1 : z0);
        r.castShadow = true;
        this.world.add(r);
        for (let i = 0; i <= length; i++) {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.12), rail);
          post.position.set(alongZ ? (side ? x1 : x0) : x0 + i, 0.2, alongZ ? z0 + i : side ? z1 : z0);
          post.castShadow = true;
          this.world.add(post);
        }
      }
    }
  }

  private buildDecor() {
    const t = this.theme;
    const spots: Record<"tree" | "pine" | "rock" | "flower", [number, number][]> = { tree: [], pine: [], rock: [], flower: [] };
    for (let y = 0; y < MAP_H; y++)
      for (let x = 0; x < MAP_W; x++) {
        const tile = MAP[y][x];
        if (tile === "tree" || tile === "pine" || tile === "rock" || tile === "flower") spots[tile].push([x, y]);
      }
    const rand = rng(7);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const c = new THREE.Color();
    const place = (
      mesh: THREE.InstancedMesh,
      i: number,
      x: number,
      y: number,
      z: number,
      scale: number | [number, number, number],
      rotY = 0,
      tint?: string,
    ) => {
      q.setFromAxisAngle(UP, rotY);
      if (typeof scale === "number") s.set(scale, scale, scale);
      else s.set(...scale);
      m.compose(p.set(x, y, z), q, s);
      mesh.setMatrixAt(i, m);
      if (tint) mesh.setColorAt(i, c.set(tint));
    };
    const instanced = (geo: THREE.BufferGeometry, material: THREE.Material, count: number, shadow = true) => {
      const mesh = new THREE.InstancedMesh(geo, material, Math.max(1, count));
      mesh.count = count;
      mesh.castShadow = shadow;
      mesh.receiveShadow = shadow;
      this.world.add(mesh);
      return mesh;
    };
    const white = () => mat("#ffffff");

    // "Trees": round fruit trees, or giant glowing mushrooms.
    const trees = spots.tree;
    if (t.tree.kind === "round") {
      const trunks = instanced(new THREE.CylinderGeometry(0.08, 0.13, 0.6, 6), mat(t.tree.trunk), trees.length);
      const crowns = instanced(new THREE.IcosahedronGeometry(0.46, 0), white(), trees.length);
      const fruitSpots = t.tree.fruit ? trees.filter(([x, y]) => (x + y) % 3 === 0) : [];
      const fruit = instanced(new THREE.SphereGeometry(0.07, 6, 4), mat(t.tree.fruit ?? "#fff"), fruitSpots.length * 3);
      trees.forEach(([x, y], i) => {
        const sc = 0.85 + rand() * 0.35;
        const g = groundHeight(y);
        place(trunks, i, x + 0.5, g + 0.3 * sc, y + 0.5, sc);
        place(crowns, i, x + 0.5, g + 0.85 * sc, y + 0.5, sc, rand() * 6, t.tree.crowns[i % t.tree.crowns.length]);
      });
      fruitSpots.forEach(([x, y], i) => {
        for (let k = 0; k < 3; k++) {
          const a = k * 2.1 + x;
          place(fruit, i * 3 + k, x + 0.5 + Math.cos(a) * 0.38, 0.8 + (k % 2) * 0.15, y + 0.5 + Math.sin(a) * 0.38, 1);
        }
      });
    } else {
      const stems = instanced(new THREE.CylinderGeometry(0.1, 0.16, 0.7, 7), mat(t.tree.trunk), trees.length);
      const caps = instanced(
        new THREE.SphereGeometry(0.5, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ roughness: 0.55 }),
        trees.length,
      );
      const dots = instanced(new THREE.SphereGeometry(0.07, 6, 4), glowMat("#ffffff"), trees.length * 4, false);
      trees.forEach(([x, y], i) => {
        const sc = 0.8 + rand() * 0.5;
        const g = groundHeight(y);
        place(stems, i, x + 0.5, g + 0.35 * sc, y + 0.5, sc);
        place(caps, i, x + 0.5, g + 0.62 * sc, y + 0.5, [sc, sc * 0.75, sc], rand() * 6, t.tree.crowns[i % t.tree.crowns.length]);
        for (let k = 0; k < 4; k++) {
          const a = k * 1.6 + i;
          place(dots, i * 4 + k, x + 0.5 + Math.cos(a) * 0.3 * sc, g + (0.62 + 0.26) * sc, y + 0.5 + Math.sin(a) * 0.3 * sc, sc);
        }
      });
    }

    // "Pines": pine trees, or tall glowing crystals.
    const pines = spots.pine;
    if (t.pine.kind === "pine") {
      const trunks = instanced(new THREE.CylinderGeometry(0.07, 0.1, 0.4, 5), mat(t.pine.trunk), pines.length);
      const low = instanced(new THREE.ConeGeometry(0.48, 0.75, 7), white(), pines.length);
      const high = instanced(new THREE.ConeGeometry(0.34, 0.6, 7), white(), pines.length);
      pines.forEach(([x, y], i) => {
        const sc = 0.85 + rand() * 0.45;
        const r = rand() * 6;
        place(trunks, i, x + 0.5, 0.2 * sc, y + 0.5, sc);
        place(low, i, x + 0.5, 0.65 * sc, y + 0.5, sc, r, t.pine.low[i % 3]);
        place(high, i, x + 0.5, 1.05 * sc, y + 0.5, sc, r, t.pine.high[i % 3]);
      });
    } else {
      const bases = instanced(new THREE.CylinderGeometry(0.32, 0.4, 0.14, 6), mat(t.pine.trunk), pines.length);
      const big = instanced(new THREE.OctahedronGeometry(0.3, 0), glowMat("#ffffff", 0.9), pines.length, false);
      const small = instanced(new THREE.OctahedronGeometry(0.16, 0), glowMat("#ffffff", 0.9), pines.length, false);
      pines.forEach(([x, y], i) => {
        const sc = 0.8 + rand() * 0.6;
        const r = rand() * 6;
        place(bases, i, x + 0.5, 0.07, y + 0.5, 1);
        place(big, i, x + 0.5, 0.75 * sc, y + 0.5, [sc, sc * 2.5, sc], r, t.pine.low[i % 3]);
        place(small, i, x + 0.5 + Math.cos(r) * 0.28, 0.4, y + 0.5 + Math.sin(r) * 0.28, [1, 2.2, 1], r, t.pine.high[i % 3]);
      });
    }

    // Rocks, or clusters of gem crystals.
    const rocks = spots.rock;
    if (t.rock.kind === "rock") {
      const mesh = instanced(new THREE.DodecahedronGeometry(0.38, 0), white(), rocks.length);
      rocks.forEach(([x, y], i) => {
        const sc = 0.8 + rand() * 0.5;
        place(mesh, i, x + 0.5, groundHeight(y) + 0.1 + 0.1 * sc, y + 0.5, sc, rand() * 6, t.rock.colors[i % 3]);
      });
    } else {
      const gems = instanced(
        new THREE.OctahedronGeometry(0.22, 0),
        new THREE.MeshStandardMaterial({ roughness: 0.15, metalness: 0.2, flatShading: true }),
        rocks.length * 3,
      );
      rocks.forEach(([x, y], i) => {
        for (let k = 0; k < 3; k++) {
          const a = k * 2.1 + i;
          const sc = 0.7 + rand() * 0.7;
          place(
            gems,
            i * 3 + k,
            x + 0.5 + Math.cos(a) * 0.2,
            groundHeight(y) + 0.3 * sc,
            y + 0.5 + Math.sin(a) * 0.2,
            [sc, sc * 2, sc],
            a,
            t.rock.colors[(i + k) % 3],
          );
        }
      });
    }

    // Flowers (or little glow-buds)
    const flowers = spots.flower;
    const petals = instanced(
      new THREE.IcosahedronGeometry(0.07, 0),
      t.night ? glowMat("#ffffff") : white(),
      flowers.length * 4,
      false,
    );
    flowers.forEach(([x, y], i) => {
      for (let k = 0; k < 4; k++)
        place(petals, i * 4 + k, x + 0.2 + rand() * 0.6, 0.07, y + 0.2 + rand() * 0.6, 1, 0, t.flowers[(i + k) % t.flowers.length]);
    });
  }

  /** Castle (knights) or palace (princess): the same build in different colours. */
  private buildCastle() {
    const l = this.theme.landmark;
    const wall = mat(l.wall);
    const darker = mat(l.wallDark);
    const roof = mat(l.roof);
    const g = groundHeight(0);
    const cx = 20.5;
    const castle = new THREE.Group();

    const keep = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.4, 2.8), wall);
    keep.position.set(cx, g + 1.2, 2.3);
    castle.add(keep);
    for (let i = 0; i < 8; i++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), wall);
      b.position.set(cx - 2.03 + i * 0.58, g + 2.57, 3.52);
      castle.add(b);
    }
    const tower = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.7, 1.8), darker);
    tower.position.set(cx, g + 3.2, 1.9);
    castle.add(tower);
    const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(1.45, 1.5, 4), roof);
    towerRoof.position.set(cx, g + 4.8, 1.9);
    towerRoof.rotation.y = Math.PI / 4;
    castle.add(towerRoof);
    for (const tx of [cx - 2.6, cx + 2.6]) {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 3.4, 10), darker);
      t.position.set(tx, g + 1.7, 3.0);
      castle.add(t);
      const r = new THREE.Mesh(new THREE.ConeGeometry(1.05, 1.6, 10), roof);
      r.position.set(tx, g + 4.2, 3.0);
      castle.add(r);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 4), mat("#4b5563"));
      pole.position.set(tx, g + 5.4, 3.0);
      castle.add(pole);
      const flag = new THREE.Mesh(
        new THREE.PlaneGeometry(0.6, 0.35, 6, 1).translate(0.3, 0, 0),
        mat(l.flag, { side: THREE.DoubleSide, flatShading: false }),
      );
      flag.position.set(tx, g + 5.65, 3.0);
      castle.add(flag);
      this.flags.push(flag);
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.45, 0.1), mat("#2b3245"));
      win.position.set(tx, g + 2.5, 3.86);
      castle.add(win);
    }
    const doorMat = mat(l.door, { emissive: new THREE.Color("#000000") });
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.3, 0.12), doorMat);
    door.position.set(cx, g + 0.65, 3.72);
    castle.add(door);
    const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 16, 1, false, 0, Math.PI), doorMat);
    arch.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    arch.position.set(cx, g + 1.3, 3.72);
    castle.add(arch);
    const light = new THREE.PointLight("#ffd36b", 0, 6);
    light.position.set(cx, g + 1.2, 4.4);
    castle.add(light);
    this.landmarkGlow = { material: doorMat, light };

    this.world.add(this.shadowed(castle));
  }

  /** The aliens' landmark: a mothership hovering over its landing site. */
  private buildMothership() {
    const l = this.theme.landmark;
    const g = groundHeight(0);
    const cx = 20.5;
    const ship = new THREE.Group();
    ship.position.set(cx, g + 3.1, 2.1);

    const hull = new THREE.Mesh(new THREE.SphereGeometry(3.2, 28, 12), mat(l.wall, { metalness: 0.25, roughness: 0.3, flatShading: false }));
    hull.scale.y = 0.2;
    ship.add(hull);
    const belly = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.0, 0.5, 20), mat(l.wallDark, { metalness: 0.25, roughness: 0.4 }));
    belly.position.y = -0.55;
    ship.add(belly);
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(1.35, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: l.roof, transparent: true, opacity: 0.55, roughness: 0.1, emissive: l.roof, emissiveIntensity: 0.35 }),
    );
    dome.position.y = 0.3;
    ship.add(dome);
    const ring = new THREE.Group();
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), glowMat(i % 2 ? l.flag : l.roof));
      bulb.position.set(Math.cos(a) * 2.9, -0.12, Math.sin(a) * 2.9);
      ring.add(bulb);
    }
    ship.add(ring);
    this.spinners.push(ring);
    this.shadowed(ship);

    // Tractor beam down to the final pod: lights up when it unlocks.
    const beamMat = new THREE.MeshBasicMaterial({ color: l.door, transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.6, 2.4, 20, 1, true), beamMat);
    beam.position.set(0, -1.9, 2.2);
    ship.add(beam);
    const light = new THREE.PointLight(l.door, 0, 8);
    light.position.set(0, -1.6, 2.2);
    ship.add(light);
    this.landmarkGlow = { material: beamMat, light };

    // Landing legs, so the tiles underneath are visibly taken.
    for (const [lx, lz] of [
      [-2.6, 0.8],
      [2.6, 0.8],
      [-2.6, -1.2],
      [2.6, -1.2],
    ]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, 3.2, 6), mat(l.wallDark, { metalness: 0.25 }));
      leg.position.set(lx, -1.6, lz);
      leg.castShadow = true;
      ship.add(leg);
    }
    this.world.add(ship);
  }

  private buildGates() {
    const laser = this.theme.bridge.glow;
    const material = laser ? glowMat(this.theme.gate, 0.85) : mat(this.theme.gate);
    for (const gate of GATES) {
      const xs = gate.tiles.map(([x]) => x);
      const zs = gate.tiles.map(([, y]) => y);
      const x0 = Math.min(...xs);
      const x1 = Math.max(...xs) + 1;
      const z0 = Math.min(...zs);
      const z1 = Math.max(...zs) + 1;
      const { alongZ } = gate;
      const group = new THREE.Group();
      const across = alongZ ? x1 - x0 : z1 - z0;
      // The gate stands at the near end of the bridge, where you arrive.
      const cx = alongZ ? (x0 + x1) / 2 : x0 + 0.1;
      const cz = alongZ ? z1 - 0.1 : (z0 + z1) / 2;
      for (let i = 0; i <= 6; i++) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.3, 0.12), material);
        const o = -across / 2 + (i * across) / 6;
        bar.position.set(alongZ ? cx + o : cx, 0.62, alongZ ? cz : cz + o);
        group.add(bar);
      }
      for (const h of [0.35, 1.0]) {
        const beam = new THREE.Mesh(
          new THREE.BoxGeometry(alongZ ? across + 0.3 : 0.16, 0.16, alongZ ? 0.16 : across + 0.3),
          material,
        );
        beam.position.set(cx, h, cz);
        group.add(beam);
      }
      if (!laser) this.shadowed(group, false);
      const label = makeSpriteLabel(320, 128);
      label.sprite.scale.set(1.7, 0.68, 1);
      label.sprite.position.set(cx, 2.0, cz);
      group.add(label.sprite);
      this.world.add(group);
      this.gates.push({ id: gate.id, group, label, needs: this.layout.gateNeeds[gate.id] ?? 0, sink: 0 });
    }
  }

  private buildChests() {
    const c = this.theme.chest;
    const trim = mat(c.trim, { metalness: 0.25, roughness: 0.35 });
    const glowMap = glowTexture("#ffe082");
    for (const spot of this.layout.chests) {
      const boss = !!spot.boss;
      const body = mat(boss ? c.bossBody : c.body);
      const lidMat = mat(boss ? c.bossLid : c.lid);
      const group = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.42, 0.5), body);
      base.position.y = 0.21;
      group.add(base);
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.07, 0.52), trim);
      band.position.y = 0.3;
      group.add(band);
      const treasure = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 0.05, 0.4),
        mat("#ffe066", { emissive: new THREE.Color("#b08000"), emissiveIntensity: 0.7 }),
      );
      treasure.position.y = 0.4;
      group.add(treasure);

      const lid = new THREE.Group();
      lid.position.set(0, 0.42, -0.25);
      const lidMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.72, 10, 1, false, 0, Math.PI), lidMat);
      lidMesh.rotation.set(0, Math.PI / 2, Math.PI / 2);
      lidMesh.position.set(0, 0, 0.25);
      lidMesh.scale.set(1, 1, 0.55);
      lid.add(lidMesh);
      const lidBand = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.52), trim);
      lidBand.position.set(0, 0.07, 0.25);
      lid.add(lidBand);
      const latch = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.04), trim);
      latch.position.set(0, -0.06, 0.51);
      lid.add(latch);
      group.add(lid);
      this.shadowed(group);

      const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: glowMap, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }),
      );
      glow.position.y = 0.45;
      group.add(glow);

      const stars: THREE.Mesh[] = [];
      for (let i = 0; i < 3; i++) {
        const star = new THREE.Mesh(this.starGeometry, mat("#facc15", { metalness: 0.25, roughness: 0.3 }));
        star.scale.setScalar(0.17);
        star.position.set(-0.4 + i * 0.4, 1.25, 0);
        star.visible = false;
        group.add(star);
        stars.push(star);
      }

      const bubble = makeSpriteLabel(128, 128);
      bubble.sprite.scale.set(0.6, 0.6, 1);
      bubble.sprite.visible = false;
      group.add(bubble.sprite);

      let lock: ReturnType<typeof makeSpriteLabel> | null = null;
      if (boss) {
        lock = makeSpriteLabel(128, 128);
        lock.draw("🔒", { bg: "#fde68a", border: "#92400e", pill: true });
        lock.sprite.scale.set(0.5, 0.5, 1);
        lock.sprite.position.set(0, 1.0, 0.2);
        group.add(lock.sprite);
        group.scale.setScalar(1.45);
      }

      group.position.set(spot.tile[0] + 0.5, groundHeight(spot.tile[1]), spot.tile[1] + 0.5);
      this.world.add(group);
      this.chests.push({ id: spot.id, group, lid, glow, stars, bubble, lock, openAmount: 0, boss });
    }
  }

  private buildPlayer() {
    const hero = this.theme.hero;
    const alien = hero === "astronaut";
    const skin = mat(alien ? "#8ee66b" : "#f6c9a0", { flatShading: false });
    const smooth = (color: string, extra: THREE.MeshStandardMaterialParameters = {}) => mat(color, { flatShading: false, ...extra });
    const outfit = () => {
      const m = smooth("#3b82f6");
      this.outfit.push(m);
      return m;
    };
    const p = this.player;
    const add = <T extends THREE.Object3D>(o: T) => {
      p.add(o);
      return o;
    };

    const body = new THREE.Group();
    add(body);
    if (hero === "princess") {
      const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.62, 16), outfit());
      skirt.position.y = 0.42;
      body.add(skirt);
      const top = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.12, 4, 10), outfit());
      top.position.y = 0.72;
      body.add(top);
      const sash = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 6, 16), smooth("#fde047", { metalness: 0.25, roughness: 0.3 }));
      sash.rotation.x = Math.PI / 2;
      sash.position.y = 0.62;
      body.add(sash);
    } else {
      const torso = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.2, 0.22, 4, 12),
        hero === "knight" ? smooth("#cbd5e1", { metalness: 0.25, roughness: 0.3 }) : outfit(),
      );
      torso.position.y = 0.6;
      body.add(torso);
      if (hero === "knight") {
        // Tabard in your own colour over the armour
        const tabard = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.34, 0.44), outfit());
        tabard.position.y = 0.58;
        body.add(tabard);
      }
    }

    const makeLimb = (x: number, y: number, len: number, material: THREE.Material, w: number) => {
      const pivot = new THREE.Group();
      pivot.position.set(x, y, 0);
      const limb = new THREE.Mesh(new THREE.CapsuleGeometry(w / 2, len, 3, 6), material);
      limb.position.y = -len / 2 - w / 2;
      pivot.add(limb);
      return add(pivot);
    };
    const legMat = hero === "knight" ? smooth("#94a3b8", { metalness: 0.25, roughness: 0.35 }) : hero === "astronaut" ? smooth("#e2e8f0") : smooth("#fbcfe8");
    const armMat = hero === "knight" ? smooth("#cbd5e1", { metalness: 0.25, roughness: 0.3 }) : hero === "astronaut" ? smooth("#e2e8f0") : skin;
    const legL = makeLimb(-0.09, 0.42, 0.22, legMat, 0.11);
    const legR = makeLimb(0.09, 0.42, 0.22, legMat, 0.11);
    const armL = makeLimb(-0.25, 0.76, 0.2, armMat, 0.08);
    const armR = makeLimb(0.25, 0.76, 0.2, armMat, 0.08);

    const head = add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), skin));
    head.position.y = 1.0;
    for (const ex of [-0.075, 0.075]) {
      const eye = add(new THREE.Mesh(new THREE.SphereGeometry(alien ? 0.05 : 0.03, 8, 6), smooth("#111827", { roughness: 0.2 })));
      eye.position.set(ex, 1.02, 0.18);
      if (alien) eye.scale.set(1, 1.35, 0.6);
    }
    const smile = add(new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 4, 10, Math.PI), mat("#9a3412")));
    smile.position.set(0, 0.94, 0.185);
    smile.rotation.z = Math.PI;

    if (hero === "knight") {
      const steel = smooth("#94a3b8", { metalness: 0.25, roughness: 0.3 });
      const helmet = add(new THREE.Mesh(new THREE.SphereGeometry(0.225, 20, 12, 0, Math.PI * 2, 0, Math.PI / 1.9), steel));
      helmet.position.y = 1.02;
      const neck = add(new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, 0.14, 20, 1, true, Math.PI * 0.75, Math.PI * 1.5), steel));
      (neck.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
      neck.position.y = 0.94;
      const plume = add(new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.34, 8), outfit()));
      plume.position.set(0, 1.36, -0.04);
      plume.rotation.x = -0.35;
      const shield = add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 6), outfit()));
      shield.rotation.x = Math.PI / 2;
      shield.position.set(0, 0.66, -0.23);
      const boss = add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), smooth("#fde047", { metalness: 0.25, roughness: 0.3 })));
      boss.position.set(0, 0.66, -0.27);
    } else if (hero === "princess") {
      const hairMat = smooth("#f5c542");
      const hair = add(new THREE.Mesh(new THREE.SphereGeometry(0.212, 20, 12, 0, Math.PI * 2, 0, Math.PI / 1.8), hairMat));
      hair.position.y = 1.01;
      hair.rotation.x = -0.4;
      const tail = add(new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.3, 4, 8), hairMat));
      tail.position.set(0, 0.82, -0.17);
      const gold = smooth("#fde047", { metalness: 0.25, roughness: 0.25 });
      const crown = add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.07, 12, 1, true), gold));
      (crown.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
      crown.position.y = 1.22;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const tip = add(new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 4), gold));
        tip.position.set(Math.cos(a) * 0.115, 1.29, Math.sin(a) * 0.115);
      }
      const gem = add(new THREE.Mesh(new THREE.OctahedronGeometry(0.035), outfit()));
      gem.position.set(0, 1.23, 0.12);
    } else {
      const glass = add(
        new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 24, 16),
          new THREE.MeshStandardMaterial({ color: "#bfefff", transparent: true, opacity: 0.28, roughness: 0.05 }),
        ),
      );
      glass.position.y = 1.02;
      glass.castShadow = false;
      const collar = add(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 6, 18), outfit()));
      collar.rotation.x = Math.PI / 2;
      collar.position.y = 0.84;
      for (const ax of [-0.09, 0.09]) {
        const stalk = add(new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 4), skin));
        stalk.position.set(ax, 1.25, 0);
        stalk.rotation.z = -ax * 3;
        const tip = add(new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), glowMat("#39ff9c")));
        tip.position.set(ax * 1.5, 1.33, 0);
      }
      const tank = add(new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.2, 4, 8), smooth("#94a3b8", { metalness: 0.25, roughness: 0.3 })));
      tank.position.set(0, 0.66, -0.22);
    }

    p.traverse((o) => {
      if ((o as THREE.Mesh).isMesh && !(o as THREE.Mesh).material.toString().includes("Basic")) o.castShadow = true;
    });
    this.limbs = { body, legL, legR, armL, armR };
    // Held above the head while carrying (gap match); what it holds is written on a label above it.
    this.crate = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.3, 0.44), smooth(this.theme.arena.accent, { roughness: 0.5 }));
    this.crate.position.set(0, 1.62, 0.02);
    this.crate.castShadow = true;
    this.crate.visible = false;
    p.add(this.crate);
    this.scene.add(p);

    // A soft blob under the hero, so a jump reads clearly.
    this.shadowBlob = new THREE.Mesh(
      new THREE.CircleGeometry(0.3, 20),
      new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.25, depthWrite: false }),
    );
    this.shadowBlob.rotation.x = -Math.PI / 2;
    this.scene.add(this.shadowBlob);
  }

  private buildSky() {
    if (this.theme.night) {
      const rand = rng(5);
      const positions: number[] = [];
      for (let i = 0; i < 700; i++) {
        const a = rand() * Math.PI * 2;
        const e = rand() * 1.3 - 0.15;
        const r = 150;
        positions.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      const stars = new THREE.Points(geo, new THREE.PointsMaterial({ color: "#ffffff", size: 1.1, sizeAttenuation: true, fog: false }));
      stars.position.set(MAP_W / 2, 0, MAP_H / 2);
      this.scene.add(stars);
      // A ringed planet on the horizon
      const planet = new THREE.Group();
      planet.add(new THREE.Mesh(new THREE.SphereGeometry(9, 24, 16), new THREE.MeshBasicMaterial({ color: "#ff8fd0", fog: false })));
      const ring = new THREE.Mesh(new THREE.RingGeometry(11, 15, 40), new THREE.MeshBasicMaterial({ color: "#ffd9f0", side: THREE.DoubleSide, transparent: true, opacity: 0.7, fog: false }));
      ring.rotation.x = 1.2;
      planet.add(ring);
      planet.position.set(MAP_W / 2 - 30, 22, -70);
      this.scene.add(planet);
      return;
    }
    const white = mat("#ffffff", { roughness: 1 });
    const rand = rng(3);
    for (let i = 0; i < 9; i++) {
      const cloud = new THREE.Group();
      for (let k = 0; k < 4; k++) {
        const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6 + rand() * 0.5, 0), white);
        puff.position.set(k * 0.7 - 1, rand() * 0.3, rand() * 0.5);
        cloud.add(puff);
      }
      cloud.position.set(rand() * (MAP_W + 20) - 10, 8 + rand() * 2, rand() * (MAP_H + 10) - 5);
      this.clouds.push(cloud);
      this.scene.add(cloud);
    }
  }

  // ── The arena ─────────────────────────────────────────────────────

  private buildArenaShell() {
    const a = this.theme.arena;
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 0.8, 48), mat(a.floor, { flatShading: false }));
    floor.position.y = -0.4;
    floor.receiveShadow = true;
    this.arena.add(floor);
    const under = new THREE.Mesh(new THREE.ConeGeometry(12, 7, 12), mat(a.rim));
    under.rotation.x = Math.PI;
    under.position.y = -4.3;
    this.arena.add(under);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(12, 0.22, 8, 64), this.theme.night ? glowMat(a.rim) : mat(a.rim));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.05;
    this.arena.add(rim);
    const inner = new THREE.Mesh(
      new THREE.RingGeometry(10.2, 10.5, 64),
      new THREE.MeshBasicMaterial({ color: a.accent, transparent: true, opacity: 0.5, toneMapped: false }),
    );
    inner.rotation.x = -Math.PI / 2;
    inner.position.y = 0.01;
    this.arena.add(inner);
    // Banner poles around the back half
    for (let i = 0; i < 9; i++) {
      const ang = Math.PI + (i / 8) * Math.PI;
      const x = Math.cos(ang) * 11.2;
      const z = Math.sin(ang) * 11.2;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 3.2, 6), mat(a.rim));
      pole.position.set(x, 1.6, z);
      pole.castShadow = true;
      this.arena.add(pole);
      const cloth = new THREE.Mesh(
        new THREE.PlaneGeometry(0.9, 0.55, 6, 1).translate(0.45, 0, 0),
        this.theme.night
          ? new THREE.MeshBasicMaterial({ color: i % 2 ? a.accent : a.rim, side: THREE.DoubleSide, toneMapped: false })
          : mat(i % 2 ? a.accent : a.rim, { side: THREE.DoubleSide, flatShading: false }),
      );
      cloth.position.set(x, 2.85, z);
      this.arena.add(cloth);
      this.flags.push(cloth);
    }
    this.arena.add(this.arenaStage);

    // The flag planted on the number line
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6), mat("#475569"));
    pole.position.y = 0.8;
    this.flag.add(pole);
    this.flagCloth = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.42).translate(0.35, 0, 0), new THREE.MeshBasicMaterial({ color: a.accent, side: THREE.DoubleSide, toneMapped: false }));
    this.flagCloth.position.y = 1.36;
    this.flag.add(this.flagCloth);
    this.flag.visible = false;
    this.arena.add(this.flag);
  }

  /** Enter (spec + pads) or leave (null) the arena. */
  setArena(spec: ArenaSpec | null, pads: Pad[] = [], field: Field = fieldFor(false)) {
    this.field = field;
    // Clear the previous stage
    for (const child of [...this.arenaStage.children]) {
      this.arenaStage.remove(child);
      child.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const m = mesh.material as THREE.Material | undefined;
        if (m) {
          (m as THREE.MeshBasicMaterial).map?.dispose();
          m.dispose();
        }
      });
    }
    this.pads = [];
    this.board = null;
    this.picture = null;
    this.arenaSpec = spec;
    this.arena.visible = !!spec;
    this.world.visible = !spec;
    this.flag.visible = false;
    this.camSnap = true;
    this.applyInset();
    if (!spec) return;

    const a = this.theme.arena;
    for (const pad of pads) {
      if (pad.role === "label") {
        // A heading, not a pad. A short one is a signpost here; a long one is an HTML label the page draws.
        if (!pad.overlay) {
          const signW = Math.max(pad.size, 1.6) + 0.4;
          const signH = signW * (208 / 512);
          const label = makeLabelTexture(512, 208);
          label.draw(pad.label, { bg: a.pad, border: a.padEdge });
          const board = new THREE.Mesh(
            new THREE.PlaneGeometry(signW, signH),
            new THREE.MeshBasicMaterial({ map: label.texture, transparent: true, toneMapped: false }),
          );
          board.position.set(pad.x, 0.45 + signH / 2, pad.z - 0.35);
          board.rotation.x = -0.45;
          this.arenaStage.add(board);
        }
        continue;
      }
      const group = new THREE.Group();
      group.position.set(pad.x, 0, pad.z);
      const edge = new THREE.Mesh(new THREE.BoxGeometry(pad.size + 0.16, 0.1, pad.size + 0.16), mat(a.padEdge));
      edge.position.y = 0.05;
      edge.receiveShadow = true;
      group.add(edge);
      const topMat = new THREE.MeshStandardMaterial({ color: a.pad, roughness: 0.6, emissive: "#000000" });
      const top = new THREE.Mesh(new THREE.BoxGeometry(pad.size, 0.16, pad.size), topMat);
      top.position.y = 0.14;
      top.castShadow = true;
      top.receiveShadow = true;
      group.add(top);

      const flat = pad.role === "key" || pad.role === "back" || pad.role === "check" || pad.role === "cell";
      const label = flat ? makeLabelTexture(256, 256) : makeLabelTexture(512, 208);
      let sign: THREE.Object3D | null = null;
      if (flat) {
        const face = new THREE.Mesh(
          new THREE.PlaneGeometry(pad.size * 0.92, pad.size * 0.92),
          new THREE.MeshBasicMaterial({ map: label.texture, transparent: true, toneMapped: false }),
        );
        face.rotation.x = -Math.PI / 2;
        face.position.y = 0.225;
        top.add(face);
        face.position.y = 0.085;
      } else if (!pad.overlay) {
        // A signpost behind the pad, tilted towards the camera
        // As wide as a short answer needs, unless the layout says its neighbours stand closer than that.
        const signW = Math.min(Math.max(pad.size, 2.6) + 0.6, pad.span ?? Infinity);
        const signH = signW * (208 / 512);
        const post = new THREE.Group();
        const board = new THREE.Mesh(
          new THREE.PlaneGeometry(signW, signH),
          new THREE.MeshBasicMaterial({ map: label.texture, transparent: true, toneMapped: false }),
        );
        board.position.y = 0.55 + signH / 2;
        board.rotation.x = -0.45;
        post.add(board);
        for (const lx of [-signW * 0.3, signW * 0.3]) {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.08), mat(a.padEdge));
          leg.position.set(lx, 0.35, 0.05);
          leg.castShadow = true;
          post.add(leg);
        }
        post.position.set(0, 0, -pad.size / 2 - 0.45);
        group.add(post);
        sign = post;
      }
      this.arenaStage.add(group);
      this.pads.push({ pad, group, top, topMat, label, sign, y: 0 });
    }

    if (spec.kind === "entry") {
      const label = makeLabelTexture(1024, 256);
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(7.2, 1.8),
        new THREE.MeshBasicMaterial({ map: label.texture, transparent: true, toneMapped: false }),
      );
      // Behind the keys: further back on an upright field, which is deeper.
      mesh.position.set(0, field.portrait ? 1.5 : 2.1, field.portrait ? -8.6 : -6.4);
      mesh.rotation.x = field.portrait ? -0.75 : -0.35;
      this.arenaStage.add(mesh);
      this.board = { mesh, label };
    }

    if (spec.picture && (spec.kind === "hotspot" || spec.kind === "point" || spec.kind === "gap")) {
      this.buildPicture(spec.picture, spec.areas, field);
      // The pictures you carry are drawn on the floor picture where you put them down.
      const picture = this.picture as NonNullable<QuestScene["picture"]> | null;
      for (const choice of spec.choices) {
        if (!choice.image || !picture) continue;
        const image = new Image();
        image.onload = () => {
          picture.carried.set(choice.id, image);
          picture.key = "";
        };
        image.src = choice.image;
      }
    }

    if (spec.kind === "slider") {
      // The number line runs across a wide field and up an upright one.
      const r = runwayOf(field);
      const alongX = r.axis === "x";
      const length = Math.abs(r.to - r.from);
      const mid = (r.from + r.to) / 2;
      const box = (along: number, height: number, across: number) =>
        new THREE.BoxGeometry(alongX ? along : across, height, alongX ? across : along);
      const at = (along: number, y: number, across: number): [number, number, number] =>
        alongX ? [along, y, across] : [across, y, along];
      const line = new THREE.Mesh(box(length + 0.8, 0.16, r.half * 2), mat(a.pad, { flatShading: false }));
      line.position.set(...at(mid, 0.08, r.cross));
      line.receiveShadow = true;
      this.arenaStage.add(line);
      const edge = new THREE.Mesh(box(length + 1.0, 0.1, r.half * 2 + 0.2), mat(a.padEdge));
      edge.position.set(...at(mid, 0.04, r.cross));
      this.arenaStage.add(edge);
      // Ticks: 10 small steps, a label on every second one.
      const majors = 10;
      for (let i = 0; i <= majors; i++) {
        const value = spec.min + ((spec.max - spec.min) * i) / majors;
        const [x, z] = runwayPoint(spec, field, value);
        const big = i % 2 === 0;
        const tick = new THREE.Mesh(
          box(big ? 0.1 : 0.05, 0.02, big ? r.half * 2 : r.half),
          new THREE.MeshBasicMaterial({ color: a.accent, toneMapped: false }),
        );
        tick.position.set(x, 0.175, z);
        this.arenaStage.add(tick);
        if (big) {
          const label = makeLabelTexture(256, 128);
          label.draw(String(Math.round(value)), { bg: "#ffffff", border: a.accent, pill: true });
          const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 0.75),
            new THREE.MeshBasicMaterial({ map: label.texture, transparent: true, toneMapped: false }),
          );
          // Behind the line when it runs across, to its left when it runs away from you.
          if (alongX) mesh.position.set(x, 0.9, z - r.half - 0.6);
          else mesh.position.set(x - r.half - 1.1, 0.5, z);
          mesh.rotation.x = alongX ? -0.45 : -0.9;
          this.arenaStage.add(mesh);
        }
      }
    }
  }

  /** Lays the interaction's picture on the floor, so you answer by walking onto it. */
  private buildPicture(source: Picture, areas: Area[], field: Field) {
    const a = this.theme.arena;
    const f = pictureFrame(source, field);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(f.w + 0.3, 0.12, f.d + 0.3), mat(a.padEdge));
    frame.position.set(f.cx, 0.06, f.cz);
    frame.receiveShadow = true;
    this.arenaStage.add(frame);

    // Unlit, so the picture keeps the colours its author gave it.
    const paperMaterial = new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false });
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(f.w, f.d), paperMaterial);
    paper.rotation.x = -Math.PI / 2;
    paper.position.set(f.cx, 0.125, f.cz);
    this.arenaStage.add(paper);

    const image = new Image();
    image.onload = () => {
      // The stage may have been cleared, or rebuilt for another part, while the picture loaded.
      if (paper.parent !== this.arenaStage) return;
      const canvas = document.createElement("canvas");
      canvas.width = Math.min(2048, Math.max(1024, source.width * 2));
      canvas.height = Math.round((canvas.width * source.height) / source.width);
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      paperMaterial.map = texture;
      paperMaterial.needsUpdate = true;
    };
    image.src = source.src;

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = Math.round((1024 * source.height) / source.width);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    const marks = new THREE.Mesh(
      new THREE.PlaneGeometry(f.w, f.d),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }),
    );
    marks.rotation.x = -Math.PI / 2;
    marks.position.set(f.cx, 0.135, f.cz);
    marks.renderOrder = 1;
    this.arenaStage.add(marks);
    this.picture = { source, areas, canvas, texture, px: canvas.width / source.width, key: "", carried: new Map() };
  }

  /** Repaints the marks on the picture: hotspot outlines, what is picked, and marked points. */
  private drawPictureMarks(view: PictureView) {
    const picture = this.picture;
    if (!picture) return;
    const ctx = picture.canvas.getContext("2d")!;
    const k = picture.px;
    ctx.clearRect(0, 0, picture.canvas.width, picture.canvas.height);
    const trace = (area: Area) => {
      const c = area.coords;
      ctx.beginPath();
      if (area.shape === "circle") ctx.arc(c[0] * k, c[1] * k, c[2] * k, 0, Math.PI * 2);
      else if (area.shape === "ellipse") ctx.ellipse(c[0] * k, c[1] * k, c[2] * k, c[3] * k, 0, 0, Math.PI * 2);
      else if (area.shape === "rect") ctx.rect(c[0] * k, c[1] * k, (c[2] - c[0]) * k, (c[3] - c[1]) * k);
      else if (area.shape === "poly") {
        for (let i = 0; i + 1 < c.length; i += 2) ctx[i ? "lineTo" : "moveTo"](c[i] * k, c[i + 1] * k);
        ctx.closePath();
      } else ctx.rect(0, 0, picture.canvas.width, picture.canvas.height);
    };
    const tone = view.look === "correct" ? "34,197,94" : view.look === "wrong" ? "239,68,68" : "14,165,233";
    for (const area of picture.areas) {
      trace(area);
      const filled = view.placed.some(([spot]) => spot === area.id);
      if (filled) {
        // Something was put down here: the spot takes the colour of the answer, and what lies on it is drawn below.
        ctx.fillStyle = `rgba(${tone},0.3)`;
        ctx.fill();
        ctx.lineWidth = view.hover === area.id ? 10 : 6;
        ctx.strokeStyle = view.hover === area.id ? "#f59e0b" : `rgb(${tone})`;
        ctx.stroke();
      } else if (view.eliminated.includes(area.id)) {
        ctx.fillStyle = "rgba(100,116,139,0.6)";
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(51,65,85,0.9)";
        ctx.stroke();
      } else if (view.selected.includes(area.id)) {
        ctx.fillStyle = `rgba(${tone},0.45)`;
        ctx.fill();
        ctx.lineWidth = 8;
        ctx.strokeStyle = `rgb(${tone})`;
        ctx.stroke();
      } else if (view.hover === area.id) {
        ctx.fillStyle = "rgba(250,204,21,0.3)";
        ctx.fill();
        ctx.lineWidth = 8;
        ctx.strokeStyle = "#f59e0b";
        ctx.stroke();
      } else {
        // A quiet outline: enough to see where you can jump, not enough to give the answer away.
        ctx.lineWidth = 6;
        ctx.strokeStyle = "rgba(15,23,42,0.35)";
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(255,255,255,0.95)";
        ctx.stroke();
      }
    }
    // What was carried here: its picture, or its text on a card, inside the spot it lies on.
    for (const area of picture.areas) {
      const here = view.placed.filter(([spot]) => spot === area.id);
      if (!here.length) continue;
      const [left, top, right, bottom] = areaBox(area, picture.source).map((n) => n * k);
      // Several on one spot share it, one under the other.
      const slot = (bottom - top) / here.length;
      here.forEach(([, choiceId], i) => {
        const cx = (left + right) / 2;
        const cy = top + slot * (i + 0.5);
        const maxW = Math.max(24, right - left - 8);
        const maxH = Math.max(18, slot - 8);
        const image = picture.carried.get(choiceId);
        if (image && image.naturalWidth > 0) {
          const fit = Math.min(maxW / image.naturalWidth, maxH / image.naturalHeight);
          const w = image.naturalWidth * fit;
          const h = image.naturalHeight * fit;
          ctx.drawImage(image, cx - w / 2, cy - h / 2, w, h);
          return;
        }
        const text = this.arenaSpec?.choices.find((choice) => choice.id === choiceId)?.label || "●";
        // A card may be a little wider than a small spot, so a word stays readable.
        const room = Math.max(maxW, 150);
        const fitted = (lines: string[], rows: number) => {
          let size = Math.min(40, (maxH * 0.72) / rows);
          ctx.font = `bold ${size}px system-ui, sans-serif`;
          while (size > 12 && lines.some((line) => ctx.measureText(line).width > room - 24)) {
            size -= 2;
            ctx.font = `bold ${size}px system-ui, sans-serif`;
          }
          return size;
        };
        // One line when that stays readable, else two, split at the space nearest the middle.
        let lines = [text];
        let size = fitted(lines, 1);
        const spaces = [...text.matchAll(/ /g)].map((match) => match.index);
        if (size < 34 && spaces.length) {
          const cut = spaces.reduce((best, at) => (Math.abs(at - text.length / 2) < Math.abs(best - text.length / 2) ? at : best));
          const two = [text.slice(0, cut), text.slice(cut + 1)];
          const twoSize = fitted(two, 2);
          if (twoSize > size) {
            lines = two;
            size = twoSize;
          }
        }
        ctx.font = `bold ${size}px system-ui, sans-serif`;
        const w = Math.min(room, Math.max(...lines.map((line) => ctx.measureText(line).width)) + 24);
        const h = size * (lines.length * 1.2 + 0.4);
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = `rgb(${tone})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#0f172a";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        lines.forEach((line, n) => ctx.fillText(line, cx, cy + (n - (lines.length - 1) / 2) * size * 1.2 + size * 0.05, room - 12));
      });
    }
    for (const [u, v] of view.points) {
      const x = u * k;
      const y = v * k;
      ctx.lineWidth = 5;
      ctx.strokeStyle = `rgb(${tone})`;
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.moveTo(x - 30, y);
      ctx.lineTo(x + 30, y);
      ctx.moveTo(x, y - 30);
      ctx.lineTo(x, y + 30);
      ctx.stroke();
      ctx.fillStyle = `rgb(${tone})`;
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    picture.texture.needsUpdate = true;
  }

  private updatePad(view: PadMesh, state: PadView | undefined, t: number, dt: number) {
    const a = this.theme.arena;
    const look = state?.look ?? "idle";
    const base =
      look === "correct"
        ? "#22c55e"
        : look === "wrong"
          ? "#ef4444"
          : look === "gone"
            ? "#64748b"
            : (state?.tint ?? (look === "selected" ? SELECTED : a.pad));
    view.topMat.color.set(base);
    view.topMat.emissive.set(look === "correct" ? "#15803d" : look === "selected" ? base : "#000000");
    view.topMat.emissiveIntensity = look === "correct" ? 0.6 + Math.sin(t * 8) * 0.3 : look === "selected" ? 0.25 : 0;
    const targetY = look === "gone" ? -0.5 : look === "selected" ? -0.05 : look === "correct" ? 0.12 + Math.sin(t * 6) * 0.04 : 0;
    view.y += (targetY - view.y) * Math.min(1, dt * 8);
    view.group.position.y = view.y;

    if (view.pad.overlay) return;
    const flat = !view.sign;
    const dark = look === "selected" || look === "correct" || look === "wrong" || !!state?.tint;
    view.label.draw(state?.mark ?? view.pad.label, {
      bg: flat ? base : look === "gone" ? "#cbd5e1" : "#ffffff",
      fg: flat ? (dark ? "#ffffff" : "#1f2937") : look === "gone" ? "#94a3b8" : "#1f2937",
      border: look === "correct" ? "#15803d" : look === "wrong" ? "#b91c1c" : (state?.tint ?? (look === "selected" ? SELECTED : a.padEdge)),
      badge: state?.badge,
      badgeColor: look === "correct" ? "#16a34a" : look === "wrong" ? "#dc2626" : (state?.tint ?? SELECTED),
      alpha: look === "gone" ? 0.6 : 1,
    });
  }

  // ── Per frame ─────────────────────────────────────────────────────

  resize() {
    const w = this.container.clientWidth || 1;
    const h = this.container.clientHeight || 1;
    this.renderer.setSize(w, h);
    this.width = w;
    this.height = h;
    this.aspect = w / h;
    this.camera.aspect = this.aspect;
    this.applyInset();
  }

  /**
   * Reserve room for a panel: `left` pixels beside the arena (a wide screen) or
   * `top` pixels above it (a phone). The arena camera then frames the rest.
   */
  setInset(left: number, top = 0) {
    const nextLeft = Math.max(0, Math.min(left, this.width * 0.6));
    const nextTop = Math.max(0, Math.min(top, this.height * 0.6));
    if (nextLeft === this.inset && nextTop === this.insetTop) return;
    this.inset = nextLeft;
    this.insetTop = nextTop;
    this.applyInset();
  }

  private applyInset() {
    const left = this.arenaSpec ? this.inset : 0;
    const top = this.arenaSpec ? this.insetTop : 0;
    if (left > 0 || top > 0) this.camera.setViewOffset(this.width, this.height, -left / 2, -top / 2, this.width, this.height);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
  }

  /** Where a point in the scene lands on screen, in pixels from the canvas's top left. */
  screenPoint(x: number, y: number, z: number): { x: number; y: number } {
    const v = new THREE.Vector3(x, y, z).project(this.camera);
    return { x: ((v.x + 1) / 2) * this.width, y: ((1 - v.y) / 2) * this.height };
  }

  /** The point on the floor under a screen position, in world units. */
  pickGround(clientX: number, clientY: number): [number, number] | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
    const point = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(this.groundPlane, point)) return null;
    return [point.x, point.z];
  }

  /** Stars and confetti bursting out of a spot. */
  celebrate(x: number, z: number, stars: number, big = false) {
    const floor = this.arenaSpec ? 0 : groundHeight(z);
    const origin = new THREE.Vector3(x, floor + 0.8, z);
    const colors = ["#f43f5e", "#22c55e", "#3b82f6", "#eab308", "#a855f7", "#06b6d4"];
    const count = big ? 110 : 44;
    for (let i = 0; i < count; i++) {
      const isStar = i < (big ? 34 : 6 + stars * 4);
      const mesh = isStar
        ? new THREE.Mesh(this.starGeometry, mat("#facc15", { emissive: new THREE.Color("#a16207"), emissiveIntensity: 0.5 }))
        : new THREE.Mesh(
            new THREE.PlaneGeometry(0.14, 0.08),
            new THREE.MeshBasicMaterial({ color: colors[i % colors.length], side: THREE.DoubleSide, toneMapped: false }),
          );
      if (isStar) mesh.scale.setScalar(0.09 + Math.random() * 0.06);
      mesh.position.copy(origin);
      const a = Math.random() * Math.PI * 2;
      const sp = 1.2 + Math.random() * (big ? 4 : 2.2);
      const vel = new THREE.Vector3(Math.cos(a) * sp, 3.5 + Math.random() * (big ? 4.5 : 2.5), Math.sin(a) * sp);
      const spin = new THREE.Vector3(Math.random() * 8, Math.random() * 8, Math.random() * 8);
      this.scene.add(mesh);
      this.particles.push({ mesh, vel, spin, life: 1.6 + Math.random(), floor: floor + 0.05 });
    }
    // Starts low, beside the hero's head: answer labels hang further back and would cover it higher up.
    if (stars > 0) this.floatText(x, floor + 1.25, z, `+${stars} ★`);
  }

  floatText(x: number, y: number, z: number, text: string, bg = "#fde047") {
    const label = makeSpriteLabel(384, 128);
    label.draw(text, { bg, fg: "#78350f", border: "#b45309", pill: true });
    label.sprite.scale.set(1.8, 0.6, 1);
    label.sprite.position.set(x, y, z);
    this.scene.add(label.sprite);
    this.floaters.push({ label, life: 1.8 });
  }

  /** A puff of dust, e.g. when landing a jump. */
  puff(x: number, z: number) {
    const floor = this.arenaSpec ? 0.2 : groundHeight(z);
    for (let i = 0; i < 7; i++) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 6, 4),
        new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.7 }),
      );
      mesh.position.set(x, floor + 0.08, z);
      const a = (i / 7) * Math.PI * 2;
      this.scene.add(mesh);
      this.particles.push({
        mesh,
        vel: new THREE.Vector3(Math.cos(a) * 1.4, 0.9, Math.sin(a) * 1.4),
        spin: new THREE.Vector3(),
        life: 0.45,
        floor: floor + 0.03,
      });
    }
  }

  update(state: FrameState, dt: number) {
    this.time += dt;
    const t = this.time;
    const inArena = !!state.arena;
    const floor = inArena ? 0 : groundHeight(state.player.z);

    // Hero
    const p = this.player;
    p.position.set(state.player.x, floor + state.player.y, state.player.z);
    let dh = state.player.heading - p.rotation.y;
    dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    p.rotation.y += dh * Math.min(1, dt * 12);
    const air = state.player.y > 0.02;
    const walk = state.player.walking && !air ? Math.sin(state.player.step * 11) : 0;
    const { legL, legR, armL, armR, body } = this.limbs;
    legL.rotation.x = air ? 0.5 : walk * 0.7;
    legR.rotation.x = air ? -0.3 : -walk * 0.7;
    // Carrying: both arms hold the crate up, whatever the legs do.
    const carrying = !!state.arena?.carrying;
    this.crate.visible = carrying;
    if (carrying) this.crate.position.y = 1.62 + Math.sin(t * 6) * 0.015;
    armL.rotation.x = air || carrying ? -2.6 : -walk * 0.8;
    armR.rotation.x = air || carrying ? -2.6 : walk * 0.8;
    body.position.y = state.player.walking && !air ? Math.abs(walk) * 0.04 : Math.sin(t * 2.5) * 0.012;
    if (state.player.color !== this.playerColor) {
      this.playerColor = state.player.color;
      this.outfit.forEach((m) => m.color.set(state.player.color));
    }
    this.shadowBlob.position.set(state.player.x, floor + (inArena ? 0.24 : 0.02), state.player.z);
    const blob = Math.max(0.35, 1 - state.player.y * 0.35);
    this.shadowBlob.scale.setScalar(blob);
    // On a picture the hero casts no real shadow (it is unlit), so the blob stays to show where the feet are.
    this.shadowBlob.visible = air || (inArena && !!this.picture);

    // Camera: follows from behind in the world, overlooks the whole stage in the arena.
    // In the arena only the part beside the panel counts as the screen.
    const free = inArena ? Math.max(0.3, (this.width - this.inset) / this.height) : this.aspect;
    const narrow = Math.max(1, 1.45 / free);
    let look: THREE.Vector3;
    let offset: THREE.Vector3;
    const fog = this.scene.fog as THREE.Fog;
    if (inArena && this.field.portrait) {
      // An upright field is looked at from steeper above, from as far as it takes to fit:
      // its width across the screen, its depth in the part of the screen below the panel.
      const tanV = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
      const room = Math.max(0.25, (this.height - this.insetTop) / this.height);
      const direction = new THREE.Vector3(0, 16, 8.5).normalize();
      const forWidth = (this.field.halfW + 0.8) / (tanV * this.aspect);
      const forDepth = ((this.field.halfD + 1.6) * direction.y) / (tanV * room);
      const distance = Math.max(forWidth, forDepth);
      // A little towards the near side: it looms larger, and it is where the hero starts.
      look = new THREE.Vector3(state.player.x * 0.05, 0, 0.4 + state.player.z * 0.04);
      offset = direction.multiplyScalar(distance);
      // The world's fog would swallow a stage seen from this far.
      fog.near = distance + 12;
      fog.far = distance + 55;
    } else if (inArena) {
      look = new THREE.Vector3(state.player.x * 0.12, 0, -2.6 + state.player.z * 0.1);
      offset = new THREE.Vector3(0, 13.5 * narrow, 12.5 * narrow);
      fog.near = this.theme.fog.near * narrow;
      fog.far = this.theme.fog.far * narrow + 10;
    } else {
      fog.near = this.theme.fog.near;
      fog.far = this.theme.fog.far;
      look = new THREE.Vector3(state.player.x, 0.4, state.player.z);
      const zoom = this.aspect < 1 ? 1.35 : 1;
      offset = new THREE.Vector3(0, 8.2 * zoom, 7.2 * zoom);
    }
    const k = this.camSnap ? 1 : Math.min(1, dt * 5);
    this.camTarget.lerp(look, k);
    this.camera.position.lerp(this.camTarget.clone().add(offset), k);
    this.camera.lookAt(this.camTarget);
    this.camSnap = false;

    this.sun.position.copy(this.camTarget).add(new THREE.Vector3(-7, 14, 8));
    this.sun.target.position.copy(this.camTarget);

    this.flags.forEach((f, i) => {
      const g = f.geometry.attributes.position as THREE.BufferAttribute;
      for (let n = 0; n < g.count; n++) {
        const x = g.getX(n);
        g.setZ(n, Math.sin(x * 8 - t * 6 + i) * 0.1 * x);
      }
      g.needsUpdate = true;
    });
    for (const c of this.clouds) {
      // The arena camera sits above the clouds: they would drift through the picture.
      c.visible = !inArena;
      c.position.x += dt * 0.35;
      if (c.position.x > MAP_W + 14) c.position.x = -14;
    }

    if (inArena) this.updateArena(state, t, dt);
    else this.updateWorld(state, t, dt);

    // Walk-target ring
    if (state.target) {
      this.targetRing.visible = true;
      this.targetRing.position.set(state.target[0], (inArena ? 0.25 : groundHeight(state.target[1])) + 0.03, state.target[1]);
      this.targetRing.scale.setScalar(1 + Math.sin(t * 8) * 0.12);
    } else this.targetRing.visible = false;

    // Particles and floating texts
    this.particles = this.particles.filter((pt) => {
      pt.life -= dt;
      pt.vel.y -= 9 * dt;
      pt.mesh.position.addScaledVector(pt.vel, dt);
      if (pt.mesh.position.y < pt.floor) {
        pt.mesh.position.y = pt.floor;
        pt.vel.multiplyScalar(0.4);
        pt.vel.y = Math.abs(pt.vel.y) * 0.5;
      }
      pt.mesh.rotation.x += pt.spin.x * dt;
      pt.mesh.rotation.y += pt.spin.y * dt;
      pt.mesh.rotation.z += pt.spin.z * dt;
      if (pt.life < 0.4) pt.mesh.scale.multiplyScalar(0.9);
      if (pt.life <= 0) {
        this.scene.remove(pt.mesh);
        if (pt.mesh.geometry !== this.starGeometry) pt.mesh.geometry.dispose();
        (pt.mesh.material as THREE.Material).dispose();
        return false;
      }
      return true;
    });
    this.floaters = this.floaters.filter((f) => {
      f.life -= dt;
      f.label.sprite.position.y += dt * 0.9;
      f.label.sprite.material.opacity = Math.min(1, f.life);
      if (f.life <= 0) {
        this.scene.remove(f.label.sprite);
        f.label.sprite.material.map?.dispose();
        f.label.sprite.material.dispose();
        return false;
      }
      return true;
    });

    this.renderer.render(this.scene, this.camera);
  }

  private updateArena(state: FrameState, t: number, dt: number) {
    const arena = state.arena!;
    for (const view of this.pads) this.updatePad(view, arena.pads[view.pad.id], t, dt);
    if (this.board) {
      this.board.mesh.visible = arena.display !== null;
      if (arena.display !== null)
        this.board.label.draw(arena.display, { bg: "#0f172a", fg: "#fde047", border: this.theme.arena.accent });
    }
    this.marker.sprite.visible = arena.marker !== null;
    if (arena.marker !== null) {
      this.marker.draw(arena.marker, { bg: "#fde047", fg: "#78350f", border: "#b45309", pill: true });
      this.marker.sprite.position.set(state.player.x, 2.0 + state.player.y + Math.sin(t * 5) * 0.05, state.player.z);
    }
    if (this.picture && arena.picture) {
      const key = JSON.stringify(arena.picture);
      if (key !== this.picture.key) {
        this.picture.key = key;
        this.drawPictureMarks(arena.picture);
      }
    }
    this.flag.visible = arena.flag !== null;
    if (arena.flag !== null) {
      this.flag.position.set(arena.flag[0], 0.16, arena.flag[1]);
      (this.flagCloth.material as THREE.MeshBasicMaterial).color.set(
        arena.flagLook === "correct" ? "#22c55e" : arena.flagLook === "wrong" ? "#ef4444" : this.theme.arena.accent,
      );
    }
  }

  private updateWorld(state: FrameState, t: number, dt: number) {
    this.marker.sprite.visible = false;

    // Water waves
    const pos = this.water.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] = Math.sin(this.waterBase[i] * 0.9 + t * 1.6) * 0.05 + Math.cos(this.waterBase[i + 2] * 1.1 + t * 1.3) * 0.05;
    }
    pos.needsUpdate = true;
    this.spinners.forEach((s) => (s.rotation.y = t * 0.8));

    // The landmark lights up when the final chest unlocks
    const bossOpen = state.openCount >= this.layout.bossNeeds;
    if (this.landmarkGlow) {
      const { material, light } = this.landmarkGlow;
      const pulse = Math.sin(t * 3);
      if (material instanceof THREE.MeshStandardMaterial) {
        material.emissive.set(bossOpen ? "#f5b400" : "#000000");
        material.emissiveIntensity = bossOpen ? 0.6 + pulse * 0.25 : 0;
      } else material.opacity = bossOpen ? 0.4 + pulse * 0.12 : 0.08;
      light.intensity = bossOpen ? 4 + pulse : 0;
    }

    // Gates sink away when they open
    for (const gate of this.gates) {
      const closed = state.closedGates.has(gate.id);
      gate.label.draw(`🔑 ${Math.min(state.openCount, gate.needs)} / ${gate.needs}`, { bg: "#fde68a", fg: "#78350f", border: "#92400e", pill: true });
      gate.sink += ((closed ? 0 : 1) - gate.sink) * Math.min(1, dt * 2.5);
      gate.group.position.y = -gate.sink * 1.7;
      gate.group.visible = gate.sink < 0.98;
      gate.label.sprite.visible = closed;
    }

    // Chests
    for (const chest of this.chests) {
      const progress = state.chests[chest.id];
      const open = !!progress && (progress.solved || progress.revealed);
      const locked = chest.boss && !bossOpen;
      const near = state.nearChest === chest.id;
      chest.openAmount += ((open ? 1 : 0) - chest.openAmount) * Math.min(1, dt * 4);
      chest.lid.rotation.x = -1.9 * chest.openAmount + (near && !open && !locked ? -Math.abs(Math.sin(t * 9)) * 0.14 : 0);
      chest.glow.visible = !locked;
      chest.glow.material.opacity = open ? (progress!.solved ? 0.5 : 0.12) : 0.55 + Math.sin(t * 3 + chest.group.position.x) * 0.25;
      chest.glow.scale.setScalar(open ? 1.4 : 1.8 + Math.sin(t * 3) * 0.15);
      chest.stars.forEach((star, i) => {
        star.visible = open && chest.openAmount > 0.6;
        star.rotation.y = t * 2 + i;
        star.position.y = 1.25 + Math.sin(t * 2.5 + i) * 0.06;
        const m = star.material as THREE.MeshStandardMaterial;
        const earned = i < (progress?.stars ?? 0);
        m.color.set(earned ? "#facc15" : "#e5e7eb");
        m.metalness = earned ? 0.5 : 0;
        m.emissive.set(earned ? "#7c5a00" : "#000000");
      });
      chest.bubble.sprite.visible = near && !open;
      if (near && !open) {
        chest.bubble.draw(locked ? "?" : "!", { bg: "#ffffff", fg: locked ? "#6b7280" : "#e11d48", border: "#1f2937", pill: true });
        chest.bubble.sprite.position.y = 1.4 + Math.sin(t * 6) * 0.06;
      }
      if (chest.lock) chest.lock.sprite.visible = locked;
    }
  }

  dispose() {
    this.scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      mesh.geometry?.dispose();
      const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
      (Array.isArray(m) ? m : m ? [m] : []).forEach((x) => {
        (x as THREE.SpriteMaterial).map?.dispose();
        x.dispose();
      });
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
