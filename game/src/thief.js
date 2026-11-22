// thief.js — Rook, the thief. Moves with WASD or the arrow keys,
// slides along display cases, and can be seen, caught or victorious.

function createThief() {
  return {
    x: ENTRY.x,
    y: ENTRY.y,
    radius: 14,
    speed: 205,
    facing: -Math.PI / 2, // looking up the room, toward the idol
    moving: false,
    // Coins the thief can throw as a distraction (see input.js).
    coins: 3,
    // Frames since the thief last moved; render.js uses it for the
    // little bob of the walk animation.
    walkPhase: 0,
  };
}

function updateThief(thief, input, dt) {
  var dx = 0, dy = 0;
  if (input.left) dx -= 1;
  if (input.right) dx += 1;
  if (input.up) dy -= 1;
  if (input.down) dy += 1;
  thief.moving = (dx !== 0 || dy !== 0);
  if (!thief.moving) return;
  var len = Math.sqrt(dx * dx + dy * dy);
  dx /= len; dy /= len;
  thief.facing = Math.atan2(dy, dx);
  thief.walkPhase += dt * 10;
  moveCircleWithCollision(
    thief, thief.radius,
    dx * thief.speed * dt, dy * thief.speed * dt,
    OBSTACLES
  );
  // Keep the thief inside the room.
  thief.x = clamp(thief.x, WORLD.room.x + thief.radius, WORLD.room.x + WORLD.room.w - thief.radius);
  thief.y = clamp(thief.y, WORLD.room.y + thief.radius, WORLD.room.y + WORLD.room.h - thief.radius);
}
