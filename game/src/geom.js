// geom.js — small geometry helpers for The Midnight Vault.
// No dependencies. Everything here is pure math: distances, angles,
// circle-vs-rectangle collision and line-of-sight tests the guards,
// cameras and the thief all share.

function clamp(v, lo, hi) {
  return v < lo ? lo : (v > hi ? hi : v);
}

function dist(x1, y1, x2, y2) {
  var dx = x2 - x1, dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// Shortest signed difference between two angles, in (-PI, PI].
function angleDiff(a, b) {
  var d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d <= -Math.PI) d += Math.PI * 2;
  return d;
}

function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

// Push a circle of radius rad out of a rectangle it overlaps.
// Returns true when a correction was applied.
function resolveCircleRect(p, rad, r) {
  var cx = clamp(p.x, r.x, r.x + r.w);
  var cy = clamp(p.y, r.y, r.y + r.h);
  var dx = p.x - cx, dy = p.y - cy;
  var d2 = dx * dx + dy * dy;
  if (d2 >= rad * rad) return false;
  if (d2 === 0) {
    // Centre is inside the rectangle: push out along the shallowest side.
    var left = p.x - r.x, right = r.x + r.w - p.x;
    var top = p.y - r.y, bottom = r.y + r.h - p.y;
    var m = Math.min(left, right, top, bottom);
    if (m === left) p.x = r.x - rad;
    else if (m === right) p.x = r.x + r.w + rad;
    else if (m === top) p.y = r.y - rad;
    else p.y = r.y + r.h + rad;
    return true;
  }
  var d = Math.sqrt(d2);
  p.x = cx + (dx / d) * rad;
  p.y = cy + (dy / d) * rad;
  return true;
}

// Move a circle by (dx, dy) while sliding along any rectangle it hits.
// Axis-separated movement gives clean sliding around display cases.
function moveCircleWithCollision(p, rad, dx, dy, rects) {
  p.x += dx;
  for (var i = 0; i < rects.length; i++) resolveCircleRect(p, rad, rects[i]);
  p.y += dy;
  for (var j = 0; j < rects.length; j++) resolveCircleRect(p, rad, rects[j]);
}

// Liang-Barsky test: does the segment (x1,y1)-(x2,y2) cross rectangle r?
function segmentHitsRect(x1, y1, x2, y2, r) {
  var dx = x2 - x1, dy = y2 - y1;
  var t0 = 0, t1 = 1;
  var p = [-dx, dx, -dy, dy];
  var q = [x1 - r.x, r.x + r.w - x1, y1 - r.y, r.y + r.h - y1];
  for (var i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
    } else {
      var t = q[i] / p[i];
      if (p[i] < 0) {
        if (t > t1) return false;
        if (t > t0) t0 = t;
      } else {
        if (t < t0) return false;
        if (t < t1) t1 = t;
      }
    }
  }
  return true;
}

// True when nothing blocks the view between two points.
function hasLineOfSight(x1, y1, x2, y2, rects) {
  for (var i = 0; i < rects.length; i++) {
    if (segmentHitsRect(x1, y1, x2, y2, rects[i])) return false;
  }
  return true;
}

// Distance along a ray from (ox,oy) in direction `angle` to the first
// rectangle it hits, capped at maxDist. Used to clip vision cones so
// they stop at display cases and pillars instead of shining through them.
function rayHitDistance(ox, oy, angle, maxDist, rects) {
  var dx = Math.cos(angle), dy = Math.sin(angle);
  var best = maxDist;
  for (var i = 0; i < rects.length; i++) {
    var r = rects[i];
    var tmin = 0, tmax = best;
    var ok = true;
    // X slab.
    if (dx === 0) {
      if (ox < r.x || ox > r.x + r.w) ok = false;
    } else {
      var tx1 = (r.x - ox) / dx, tx2 = (r.x + r.w - ox) / dx;
      var lo = Math.min(tx1, tx2), hi = Math.max(tx1, tx2);
      if (lo > tmin) tmin = lo;
      if (hi < tmax) tmax = hi;
      if (tmin > tmax) ok = false;
    }
    // Y slab.
    if (ok) {
      if (dy === 0) {
        if (oy < r.y || oy > r.y + r.h) ok = false;
      } else {
        var ty1 = (r.y - oy) / dy, ty2 = (r.y + r.h - oy) / dy;
        var loy = Math.min(ty1, ty2), hiy = Math.max(ty1, ty2);
        if (loy > tmin) tmin = loy;
        if (hiy < tmax) tmax = hiy;
        if (tmin > tmax) ok = false;
      }
    }
    if (ok && tmin >= 0 && tmin < best) best = tmin;
  }
  return best;
}

// Nearest point to (x, y) that a circle of radius rad can stand on
// without overlapping any rectangle. Used so a thrown coin never lands
// inside a display case.
function nearestWalkable(x, y, rad, rects, bounds) {
  x = clamp(x, bounds.x + rad, bounds.x + bounds.w - rad);
  y = clamp(y, bounds.y + rad, bounds.y + bounds.h - rad);
  for (var i = 0; i < rects.length; i++) {
    var r = rects[i];
    if (x > r.x - rad && x < r.x + r.w + rad && y > r.y - rad && y < r.y + r.h + rad) {
      var left = x - (r.x - rad), right = (r.x + r.w + rad) - x;
      var top = y - (r.y - rad), bottom = (r.y + r.h + rad) - y;
      var m = Math.min(left, right, top, bottom);
      if (m === left) x = r.x - rad;
      else if (m === right) x = r.x + r.w + rad;
      else if (m === top) y = r.y - rad;
      else y = r.y + r.h + rad;
    }
  }
  return { x: x, y: y };
}
