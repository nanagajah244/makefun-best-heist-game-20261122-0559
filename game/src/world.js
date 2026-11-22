// world.js — the layout of the Midnight Vault gallery.
// One room, one night: a museum gallery with display cases, pillars,
// paintings, a pedestal holding the Golden Idol, an entry door and an
// exit door. All positions are in canvas pixels (1280 x 800).

var WORLD = {
  width: 1280,
  height: 800,
  // The playable room, inside the walls. The HUD lives above it.
  room: { x: 56, y: 84, w: 1168, h: 676 },
  wall: 14,
};

// Everything solid the thief and the guards walk around, and that
// blocks a guard's or camera's line of sight.
var OBSTACLES = [
  // Display cases (glass cabinets with glittering pieces inside).
  { x: 300, y: 220, w: 180, h: 90, kind: 'case', label: 'Jewels' },
  { x: 620, y: 300, w: 200, h: 90, kind: 'case', label: 'Relics' },
  { x: 950, y: 380, w: 180, h: 90, kind: 'case', label: 'Crowns' },
  { x: 300, y: 520, w: 180, h: 90, kind: 'case', label: 'Coins' },
  { x: 700, y: 560, w: 160, h: 80, kind: 'case', label: 'Masks' },
  // Marble pillars.
  { x: 500, y: 168, w: 46, h: 46, kind: 'pillar' },
  { x: 1050, y: 216, w: 46, h: 46, kind: 'pillar' },
  { x: 480, y: 640, w: 46, h: 46, kind: 'pillar' },
  { x: 980, y: 620, w: 46, h: 46, kind: 'pillar' },
  // The idol's pedestal (solid; the idol itself floats above it).
  { x: 852, y: 148, w: 56, h: 56, kind: 'pedestal' },
];

// Paintings on the walls — decoration only, drawn by render.js.
var PAINTINGS = [
  { x: 220, y: 88, w: 90, h: 12, hue: '#7a5a2e' },
  { x: 560, y: 88, w: 110, h: 12, hue: '#4a6a8a' },
  { x: 1020, y: 88, w: 90, h: 12, hue: '#6a3a4a' },
  { x: 60, y: 300, w: 12, h: 100, hue: '#3a6a4a' },
  { x: 60, y: 560, w: 12, h: 100, hue: '#8a7a3a' },
  { x: 1208, y: 300, w: 12, h: 100, hue: '#5a3a7a' },
];

// The red carpet runner down the middle of the gallery (visual only).
var CARPET = { x: 56, y: 400, w: 1168, h: 72 };

// Where the thief slips in, where the Golden Idol waits, where he escapes.
var ENTRY = { x: 130, y: 700 };
var LOOT = { x: 880, y: 176 };
var EXIT = { x: 1150, y: 700 };

// The three guards and the loops they walk, all night, every night.
var GUARD_DEFS = [
  {
    name: 'Marco', color: '#3a5a9a',
    speed: 58, pause: 1.4,
    waypoints: [
      { x: 350, y: 380 }, { x: 650, y: 380 },
      { x: 650, y: 500 }, { x: 350, y: 500 },
    ],
  },
  {
    name: 'Sofia', color: '#9a3a5a',
    speed: 62, pause: 1.1,
    waypoints: [
      { x: 900, y: 300 }, { x: 1100, y: 300 },
      { x: 1100, y: 480 }, { x: 900, y: 480 },
    ],
  },
  {
    name: 'Viktor', color: '#3a8a5a',
    speed: 52, pause: 1.8,
    waypoints: [
      { x: 520, y: 170 }, { x: 820, y: 170 },
      { x: 820, y: 260 }, { x: 520, y: 260 },
    ],
  },
];

// The two wall cameras and the arcs they sweep.
var CAMERA_DEFS = [
  { x: 420, y: 100, from: 0.6, to: 2.5, period: 7.0, range: 310, fov: 0.7 },
  { x: 1214, y: 380, from: 2.2, to: 4.1, period: 8.0, range: 310, fov: 0.7 },
];
