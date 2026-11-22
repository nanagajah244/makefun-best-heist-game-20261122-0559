// guards.js — the night guards. Each walks a loop of waypoints,
// pauses to look around, and watches a vision cone in front of him.
// Spotting the thief turns the cone red and raises the alarm; a guard
// who keeps eyes on the thief closes in, and one who loses him walks
// to the last place he was seen, looks around, then goes back on patrol.

var GUARD_VIEW_RANGE = 235;
var GUARD_VIEW_FOV = 1.25; // about 72 degrees
var GUARD_CHASE_SPEED = 96;
var GUARD_SEARCH_TIME = 2.2;

function createGuards() {
  return GUARD_DEFS.map(function (def) {
    return {
      name: def.name,
      color: def.color,
      speed: def.speed,
      pause: def.pause,
      waypoints: def.waypoints,
      x: def.waypoints[0].x,
      y: def.waypoints[0].y,
      wp: 1, // next waypoint
      wait: 0,
      facing: Math.PI / 2,
      radius: 15,
      state: 'patrol', // patrol | chase | search | investigate
      seenTimer: 0,    // how long the thief has been in view, continuously
      lostTimer: 0,    // how long since the thief was last seen
      lastSeen: null,  // {x, y} of the thief's last spotted position
      searchTimer: 0,
      investigateTarget: null,
      investigateTimer: 0,
      scanPhase: 0,    // sweeping look direction while waiting / searching
    };
  });
}

// Does this guard see the thief right now?
function guardSeesThief(guard, thief) {
  var d = dist(guard.x, guard.y, thief.x, thief.y);
  if (d > GUARD_VIEW_RANGE) return false;
  var ang = Math.atan2(thief.y - guard.y, thief.x - guard.x);
  if (Math.abs(angleDiff(ang, guard.facing)) > GUARD_VIEW_FOV / 2) return false;
  return hasLineOfSight(guard.x, guard.y, thief.x, thief.y, OBSTACLES);
}

function guardStepToward(guard, tx, ty, speed, dt) {
  var dx = tx - guard.x, dy = ty - guard.y;
  var d = Math.sqrt(dx * dx + dy * dy);
  if (d < 2) return true;
  guard.facing = Math.atan2(dy, dx);
  var step = Math.min(d, speed * dt);
  moveCircleWithCollision(guard, guard.radius, (dx / d) * step, (dy / d) * step, OBSTACLES);
  guard.x = clamp(guard.x, WORLD.room.x + guard.radius, WORLD.room.x + WORLD.room.w - guard.radius);
  guard.y = clamp(guard.y, WORLD.room.y + guard.radius, WORLD.room.y + WORLD.room.h - guard.radius);
  return d <= step + 1;
}

function updateGuard(guard, thief, dt, alarm) {
  var sees = guardSeesThief(guard, thief);
  guard.seesNow = sees; // render.js turns the cone red while this holds
  if (sees) {
    guard.seenTimer += dt;
    guard.lostTimer = 0;
    guard.lastSeen = { x: thief.x, y: thief.y };
    // Stare straight at the thief while he is in view.
    guard.facing = Math.atan2(thief.y - guard.y, thief.x - guard.x);
    // The alarm climbs while any guard holds the thief in sight.
    var closeness = 1 - dist(guard.x, guard.y, thief.x, thief.y) / GUARD_VIEW_RANGE;
    alarm.rise((14 + 26 * closeness) * dt);
    // A guard who has held the thief in sight closes in to grab him.
    if (guard.seenTimer > 0.9) guard.state = 'chase';
  } else {
    guard.seenTimer = 0;
    guard.lostTimer += dt;
  }

  if (guard.state === 'chase') {
    if (sees) {
      var arrived = guardStepToward(guard, thief.x, thief.y, GUARD_CHASE_SPEED, dt);
      if (dist(guard.x, guard.y, thief.x, thief.y) < guard.radius + thief.radius + 4) {
        alarm.set(100); // caught red-handed
      }
      if (arrived) alarm.set(100);
    } else if (guard.lostTimer > 1.2 && guard.lastSeen) {
      guard.state = 'search';
      guard.searchTimer = 0;
    }
  } else if (guard.state === 'search') {
    if (sees) {
      guard.state = 'chase';
    } else if (guard.lastSeen) {
      var there = guardStepToward(guard, guard.lastSeen.x, guard.lastSeen.y, guard.speed * 1.4, dt);
      if (there) {
        guard.searchTimer += dt;
        guard.scanPhase += dt * 1.6;
        guard.facing = guard.scanPhase;
        if (guard.searchTimer > GUARD_SEARCH_TIME) {
          guard.state = 'patrol';
          guard.lastSeen = null;
        }
      }
    } else {
      guard.state = 'patrol';
    }
  } else if (guard.state === 'investigate') {
    if (sees) {
      guard.state = 'chase';
      guard.investigateTarget = null;
    } else if (guard.investigateTarget) {
      var done = guardStepToward(
        guard, guard.investigateTarget.x, guard.investigateTarget.y,
        guard.speed * 1.5, dt
      );
      if (done) {
        guard.investigateTimer += dt;
        guard.scanPhase += dt * 1.6;
        guard.facing = guard.scanPhase;
        if (guard.investigateTimer > 1.6) {
          guard.state = 'patrol';
          guard.investigateTarget = null;
          guard.investigateTimer = 0;
        }
      }
    } else {
      guard.state = 'patrol';
    }
  } else {
    // Patrol: walk the loop, pausing at each waypoint to look around.
    if (sees) return; // state flips to chase above; wait for it
    if (guard.wait > 0) {
      guard.wait -= dt;
      guard.scanPhase += dt * 0.9;
      guard.facing = guard.scanPhase;
      if (guard.wait <= 0) guard.scanPhase = guard.facing;
      return;
    }
    var target = guard.waypoints[guard.wp];
    var reached = guardStepToward(guard, target.x, target.y, guard.speed, dt);
    if (reached) {
      guard.wp = (guard.wp + 1) % guard.waypoints.length;
      guard.wait = guard.pause;
      guard.scanPhase = guard.facing;
    }
  }
}

function updateGuards(guards, thief, dt, alarm) {
  for (var i = 0; i < guards.length; i++) {
    updateGuard(guards[i], thief, dt, alarm);
  }
}

// A coin clink pulls every guard in earshot toward the sound.
function distractGuards(guards, x, y) {
  for (var i = 0; i < guards.length; i++) {
    var g = guards[i];
    if (g.state === 'chase') continue; // a guard on the thief ignores coins
    if (dist(g.x, g.y, x, y) < 300) {
      g.state = 'investigate';
      g.investigateTarget = { x: x, y: y };
      g.investigateTimer = 0;
      g.seenTimer = 0;
    }
  }
}
