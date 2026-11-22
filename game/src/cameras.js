// cameras.js — the wall cameras. Each sweeps its arc on a slow,
// regular rhythm, watching a pale cone. A thief caught in a camera's
// cone is seen just as surely as by a guard — and the alarm climbs
// faster, because the camera never blinks.

function createCameras() {
  return CAMERA_DEFS.map(function (def) {
    return {
      x: def.x,
      y: def.y,
      from: def.from,
      to: def.to,
      period: def.period,
      range: def.range,
      fov: def.fov,
      // The sweep is a smooth sine so the camera eases at each end.
      angle: (def.from + def.to) / 2,
      phase: 0,
      seesThief: false,
    };
  });
}

function updateCamera(cam, thief, dt, alarm, time) {
  var mid = (cam.from + cam.to) / 2;
  var amp = (cam.to - cam.from) / 2;
  cam.angle = mid + amp * Math.sin((time / cam.period) * Math.PI * 2);
  cam.phase = time;

  var d = dist(cam.x, cam.y, thief.x, thief.y);
  var seen = false;
  if (d <= cam.range) {
    var ang = Math.atan2(thief.y - cam.y, thief.x - cam.x);
    if (Math.abs(angleDiff(ang, cam.angle)) <= cam.fov / 2) {
      seen = hasLineOfSight(cam.x, cam.y, thief.x, thief.y, OBSTACLES);
    }
  }
  cam.seesThief = seen;
  if (seen) {
    var closeness = 1 - d / cam.range;
    alarm.rise((20 + 22 * closeness) * dt);
  }
}

function updateCameras(cameras, thief, dt, alarm, time) {
  for (var i = 0; i < cameras.length; i++) {
    updateCamera(cameras[i], thief, dt, alarm, time);
  }
}
