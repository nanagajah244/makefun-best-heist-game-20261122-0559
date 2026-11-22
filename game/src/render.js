// render.js — every pixel of The Midnight Vault, drawn on one canvas.
// The room, the cones, the guards, the cameras, the thief, the loot,
// the alarm meter and the screens are all drawn here from the live
// game state, so a screenshot always shows the game as it really is.

var HUD_H = 72;

function drawVisionCone(ctx, x, y, angle, fov, range, fill, edge) {
  var rays = 26;
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (var i = 0; i <= rays; i++) {
    var a = angle - fov / 2 + (fov * i) / rays;
    var d = rayHitDistance(x, y, a, range, OBSTACLES);
    ctx.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawRoom(ctx, time, loot) {
  var room = WORLD.room;
  // Floor: dark marble tiles.
  ctx.fillStyle = '#1b1626';
  ctx.fillRect(room.x, room.y, room.w, room.h);
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  ctx.lineWidth = 1;
  for (var tx = room.x; tx < room.x + room.w; tx += 58) {
    ctx.beginPath(); ctx.moveTo(tx, room.y); ctx.lineTo(tx, room.y + room.h); ctx.stroke();
  }
  for (var ty = room.y; ty < room.y + room.h; ty += 58) {
    ctx.beginPath(); ctx.moveTo(room.x, ty); ctx.lineTo(room.x + room.w, ty); ctx.stroke();
  }
  // The red carpet runner.
  ctx.fillStyle = '#5a1620';
  ctx.fillRect(CARPET.x, CARPET.y, CARPET.w, CARPET.h);
  ctx.strokeStyle = '#8a2a34';
  ctx.lineWidth = 2;
  ctx.strokeRect(CARPET.x + 3, CARPET.y + 3, CARPET.w - 6, CARPET.h - 6);
  ctx.fillStyle = '#c8a24a';
  ctx.font = '11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('—  THE GRAND GALLERY  —', CARPET.x + CARPET.w / 2, CARPET.y + CARPET.h / 2 + 4);

  // Walls with a gold trim.
  ctx.fillStyle = '#0d0a14';
  ctx.fillRect(room.x - WORLD.wall, room.y - WORLD.wall, room.w + 2 * WORLD.wall, WORLD.wall);
  ctx.fillRect(room.x - WORLD.wall, room.y + room.h, room.w + 2 * WORLD.wall, WORLD.wall);
  ctx.fillRect(room.x - WORLD.wall, room.y, WORLD.wall, room.h);
  ctx.fillRect(room.x + room.w, room.y, WORLD.wall, room.h);
  ctx.strokeStyle = '#c8a24a';
  ctx.lineWidth = 2;
  ctx.strokeRect(room.x - 1, room.y - 1, room.w + 2, room.h + 2);

  // Paintings.
  for (var p = 0; p < PAINTINGS.length; p++) {
    var pg = PAINTINGS[p];
    ctx.fillStyle = '#2a2118';
    ctx.fillRect(pg.x - 3, pg.y - 3, pg.w + 6, pg.h + 6);
    ctx.fillStyle = pg.hue;
    ctx.fillRect(pg.x, pg.y, pg.w, pg.h);
  }

  // Display cases, pillars, pedestal.
  for (var i = 0; i < OBSTACLES.length; i++) {
    var o = OBSTACLES[i];
    if (o.kind === 'case') {
      ctx.fillStyle = '#241d33';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = 'rgba(160,200,255,0.16)';
      ctx.fillRect(o.x + 4, o.y + 4, o.w - 8, o.h - 8);
      ctx.strokeStyle = '#c8a24a';
      ctx.lineWidth = 2;
      ctx.strokeRect(o.x, o.y, o.w, o.h);
      // The glittering piece inside.
      var tw = 0.5 + 0.5 * Math.sin(time * 2 + i * 1.7);
      ctx.fillStyle = 'rgba(255,220,120,' + (0.5 + 0.5 * tw) + ')';
      ctx.beginPath();
      ctx.arc(o.x + o.w / 2, o.y + o.h / 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d8c8a0';
      ctx.font = '11px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(o.label, o.x + o.w / 2, o.y + o.h - 10);
    } else if (o.kind === 'pillar') {
      ctx.fillStyle = '#3a3248';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = '#8a7a5a';
      ctx.lineWidth = 2;
      ctx.strokeRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = '#4a4058';
      ctx.fillRect(o.x + 6, o.y + 6, o.w - 12, o.h - 12);
    } else if (o.kind === 'pedestal') {
      ctx.fillStyle = '#2a2118';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.strokeStyle = '#c8a24a';
      ctx.lineWidth = 2;
      ctx.strokeRect(o.x, o.y, o.w, o.h);
    }
  }

  // The Golden Idol, glowing on its pedestal.
  if (!loot.taken) {
    var pulse = 0.6 + 0.4 * Math.sin(time * 3);
    var glow = ctx.createRadialGradient(LOOT.x, LOOT.y, 4, LOOT.x, LOOT.y, 70);
    glow.addColorStop(0, 'rgba(255,215,90,' + (0.55 * pulse + 0.25) + ')');
    glow.addColorStop(1, 'rgba(255,215,90,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(LOOT.x, LOOT.y, 70, 0, Math.PI * 2);
    ctx.fill();
    // The idol: a little golden figure.
    ctx.fillStyle = '#ffd75a';
    ctx.beginPath();
    ctx.moveTo(LOOT.x, LOOT.y - 16);
    ctx.lineTo(LOOT.x + 11, LOOT.y + 2);
    ctx.lineTo(LOOT.x, LOOT.y + 16);
    ctx.lineTo(LOOT.x - 11, LOOT.y + 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff0b0';
    ctx.beginPath();
    ctx.arc(LOOT.x, LOOT.y - 6, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Sparkles.
    for (var s = 0; s < 4; s++) {
      var sa = time * 1.5 + (s * Math.PI) / 2;
      var sx = LOOT.x + Math.cos(sa) * 26;
      var sy = LOOT.y + Math.sin(sa) * 20 - 6;
      drawSparkle(ctx, sx, sy, 4 + 2 * Math.sin(time * 4 + s));
    }
    ctx.fillStyle = '#ffd75a';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('GOLDEN IDOL', LOOT.x, LOOT.y - 30);
  }

  // Doors on the bottom wall.
  drawDoor(ctx, ENTRY.x, 'ENTRY', '#8a8a9a', false);
  drawDoor(ctx, EXIT.x, 'EXIT', loot.taken ? '#3fe07a' : '#5a7a5a', loot.taken);
}

function drawSparkle(ctx, x, y, r) {
  ctx.strokeStyle = 'rgba(255,240,180,0.9)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - r, y); ctx.lineTo(x + r, y);
  ctx.moveTo(x, y - r); ctx.lineTo(x, y + r);
  ctx.stroke();
}

function drawDoor(ctx, cx, label, color, lit) {
  var room = WORLD.room;
  var y = room.y + room.h;
  ctx.fillStyle = lit ? color : '#241d33';
  ctx.fillRect(cx - 42, y - 4, 84, 16);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 42, y - 4, 84, 16);
  ctx.fillStyle = color;
  ctx.font = 'bold 12px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, cx, y - 12);
  if (lit) {
    var glow = ctx.createRadialGradient(cx, y, 4, cx, y, 60);
    glow.addColorStop(0, 'rgba(63,224,122,0.35)');
    glow.addColorStop(1, 'rgba(63,224,122,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, y - 6, 60, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGuard(ctx, guard, time) {
  // The cone burns red the instant the guard's eyes land on the thief,
  // not only once he starts the chase — that is the warning to run.
  var alerted = guard.seesNow || guard.state === 'chase';
  var suspicious = guard.state === 'search' || guard.state === 'investigate';
  var fill = alerted
    ? 'rgba(224,64,48,0.30)'
    : suspicious ? 'rgba(224,160,48,0.22)' : 'rgba(255,214,90,0.13)';
  var edge = alerted
    ? 'rgba(224,64,48,0.55)'
    : suspicious ? 'rgba(224,160,48,0.45)' : 'rgba(255,214,90,0.35)';
  drawVisionCone(ctx, guard.x, guard.y, guard.facing, GUARD_VIEW_FOV, GUARD_VIEW_RANGE, fill, edge);
  // Shadow, body, cap, facing tick.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(guard.x, guard.y + 12, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = guard.color;
  ctx.beginPath();
  ctx.arc(guard.x, guard.y, guard.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#101018';
  ctx.beginPath();
  ctx.arc(guard.x, guard.y - 4, 8, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = '#101018';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  ctx.lineTo(guard.x + Math.cos(guard.facing) * 20, guard.y + Math.sin(guard.facing) * 20);
  ctx.stroke();
  // "!" when closing in, "?" when suspicious.
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  if (alerted) {
    ctx.fillStyle = '#ff5040';
    ctx.fillText('!', guard.x, guard.y - 22);
  } else if (suspicious) {
    ctx.fillStyle = '#ffb040';
    ctx.fillText('?', guard.x, guard.y - 22);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '11px Georgia, serif';
  ctx.fillText(guard.name, guard.x, guard.y + 28);
}

function drawCamera(ctx, cam) {
  var fill = cam.seesThief ? 'rgba(224,64,48,0.30)' : 'rgba(150,200,255,0.14)';
  var edge = cam.seesThief ? 'rgba(224,64,48,0.55)' : 'rgba(150,200,255,0.4)';
  drawVisionCone(ctx, cam.x, cam.y, cam.angle, cam.fov, cam.range, fill, edge);
  // Wall mount and lens.
  ctx.fillStyle = '#2a2a38';
  ctx.fillRect(cam.x - 9, cam.y - 9, 18, 18);
  ctx.strokeStyle = '#8a8a9a';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cam.x - 9, cam.y - 9, 18, 18);
  ctx.fillStyle = cam.seesThief ? '#ff4030' : '#40d0ff';
  ctx.beginPath();
  ctx.arc(cam.x + Math.cos(cam.angle) * 5, cam.y + Math.sin(cam.angle) * 5, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawThief(ctx, thief, time) {
  var bob = thief.moving ? Math.sin(thief.walkPhase) * 2 : 0;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(thief.x, thief.y + 12, 13, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hooded figure: dark cloak, pale mask, a glint of the eyes.
  ctx.fillStyle = '#1c2436';
  ctx.beginPath();
  ctx.arc(thief.x, thief.y + bob * 0.3, thief.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e8e8f0';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#d8d0c0';
  ctx.beginPath();
  ctx.arc(
    thief.x + Math.cos(thief.facing) * 5, thief.y + Math.sin(thief.facing) * 5 + bob * 0.3,
    5.5, 0, Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = '#101018';
  ctx.beginPath();
  ctx.arc(thief.x + Math.cos(thief.facing) * 7, thief.y + Math.sin(thief.facing) * 7 + bob * 0.3, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = '11px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('ROOK', thief.x, thief.y - 20);
}

function drawCoin(ctx, coin, time) {
  var x = coin.x, y = coin.y;
  if (coin.flying) {
    var t = coin.t / coin.dur;
    x = coin.x0 + (coin.x1 - coin.x0) * t;
    y = coin.y0 + (coin.y1 - coin.y0) * t - Math.sin(t * Math.PI) * 34;
  }
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(coin.flying ? coin.x1 : x, coin.flying ? coin.y1 : y + 5, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd75a';
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#a8842a';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function alarmColor(value) {
  if (value < 40) return '#3fae5a';
  if (value < 70) return '#e0a030';
  return '#e04030';
}

function drawHUD(ctx, game) {
  var alarm = game.alarm;
  // Panel.
  ctx.fillStyle = '#0d0a14';
  ctx.fillRect(0, 0, WORLD.width, HUD_H);
  ctx.strokeStyle = '#c8a24a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, HUD_H); ctx.lineTo(WORLD.width, HUD_H);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#c8a24a';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText('THE MIDNIGHT VAULT', 24, 30);
  ctx.fillStyle = '#8a8a9a';
  ctx.font = '12px Georgia, serif';
  ctx.fillText('one room · one idol · no witnesses', 24, 52);

  // Alarm meter.
  var mx = 430, my = 18, mw = 420, mh = 24;
  ctx.fillStyle = '#e8e8f0';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', mx, my + 17);
  var bx = mx + 62, bw = mw - 62;
  ctx.fillStyle = '#241d33';
  ctx.fillRect(bx, my, bw, mh);
  ctx.strokeStyle = alarm.value > 60 ? '#ff5040' : '#5a4a6a';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, my, bw, mh);
  var pulse = alarm.value > 60 ? 0.75 + 0.25 * Math.sin(game.time * 8) : 1;
  ctx.globalAlpha = pulse;
  ctx.fillStyle = alarmColor(alarm.value);
  ctx.fillRect(bx + 2, my + 2, (bw - 4) * (alarm.value / 100), mh - 4);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(Math.round(alarm.value) + '%', bx + bw / 2, my + 17);
  ctx.fillStyle = '#8a8a9a';
  ctx.font = '12px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(alarm.value > 60 ? 'THEY ARE ON TO YOU' : 'stay out of the cones', mx, my + 42);

  // Idol status, coins, time.
  var rx = 920;
  ctx.textAlign = 'left';
  ctx.fillStyle = game.loot.taken ? '#ffd75a' : '#5a5a6a';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.fillText(game.loot.taken ? 'IDOL  ● SECURED' : 'IDOL  ○ NOT TAKEN', rx, 28);
  ctx.fillStyle = '#e8e8f0';
  ctx.fillText('COINS  ', rx, 52);
  for (var c = 0; c < 3; c++) {
    ctx.fillStyle = c < game.thief.coins ? '#ffd75a' : '#3a3a48';
    ctx.beginPath();
    ctx.arc(rx + 62 + c * 20, 48, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#e8e8f0';
  ctx.textAlign = 'right';
  ctx.fillText('TIME  ' + formatTime(game.time), WORLD.width - 24, 28);
  ctx.fillStyle = '#8a8a9a';
  ctx.font = '12px Georgia, serif';
  ctx.fillText(game.loot.taken ? 'reach the EXIT!' : 'steal the idol first', WORLD.width - 24, 52);
  ctx.textAlign = 'left';

  // Objective strip under the room.
  ctx.fillStyle = '#8a8a9a';
  ctx.font = '13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    'WASD / Arrows — move   ·   Click — throw a coin to distract a guard   ·   R — restart   ·   M — mute',
    WORLD.width / 2, WORLD.height - 12
  );
  ctx.textAlign = 'left';
}

function formatTime(t) {
  var s = Math.floor(t);
  var m = Math.floor(s / 60);
  s = s % 60;
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

function drawPanel(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(8,6,14,0.72)';
  ctx.fillRect(0, HUD_H, WORLD.width, WORLD.height - HUD_H);
  var pw = 640, ph = 300 + lines.length * 0;
  var px = (WORLD.width - pw) / 2, py = 200;
  ctx.fillStyle = '#14101c';
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(px, py, pw, ph);
  ctx.fillStyle = accent;
  ctx.font = 'bold 40px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, WORLD.width / 2, py + 70);
  ctx.fillStyle = '#e8e8f0';
  ctx.font = '17px Georgia, serif';
  for (var i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], WORLD.width / 2, py + 120 + i * 30);
  }
  ctx.textAlign = 'left';
}

function drawTitleScreen(ctx) {
  drawPanel(ctx, 'THE MIDNIGHT VAULT', [
    'A one-room heist. Cross the gallery, steal the Golden Idol,',
    'and slip out the EXIT — without a guard or a camera ever',
    'holding you in its sight. Get seen and the alarm climbs.',
    'At 100%, the night is over.',
    '',
    'WASD / Arrows — move      Click — throw a coin (3 only)',
    'Guards follow the clink. Cameras never blink.',
    '',
    'Press ENTER or click to begin',
  ], '#c8a24a');
}

function drawWinScreen(ctx, game) {
  drawPanel(ctx, 'HEIST COMPLETE!', [
    'The Golden Idol is yours, and the gallery never knew you were there.',
    '',
    'Time:  ' + formatTime(game.finalTime) + '      Peak alarm:  ' + Math.round(game.alarm.peak) + '%' +
      '      Coins used:  ' + (3 - game.thief.coins),
    '',
    'Press R to run it again',
  ], '#3fe07a');
}

function drawCaughtScreen(ctx, game) {
  drawPanel(ctx, 'CAUGHT!', [
    'The alarm hit 100%. The guards have you, and the idol stays',
    'on its pedestal for another night.',
    '',
    'Peak alarm:  ' + Math.round(game.alarm.peak) + '%      Time survived:  ' + formatTime(game.time),
    '',
    'Press R to try again',
  ], '#e04030');
}

function render(ctx, game) {
  ctx.clearRect(0, 0, WORLD.width, WORLD.height);
  drawRoom(ctx, game.time, game.loot);
  for (var i = 0; i < game.cameras.length; i++) drawCamera(ctx, game.cameras[i]);
  for (var g = 0; g < game.guards.length; g++) drawGuard(ctx, game.guards[g], game.time);
  for (var c = 0; c < game.coins.length; c++) drawCoin(ctx, game.coins[c], game.time);
  drawThief(ctx, game.thief, game.time);
  // Red vignette while the alarm runs hot.
  if (game.alarm.value > 60) {
    var a = ((game.alarm.value - 60) / 40) * (0.22 + 0.08 * Math.sin(game.time * 6));
    var vg = ctx.createRadialGradient(
      WORLD.width / 2, WORLD.height / 2, WORLD.height * 0.35,
      WORLD.width / 2, WORLD.height / 2, WORLD.height * 0.75
    );
    vg.addColorStop(0, 'rgba(224,40,30,0)');
    vg.addColorStop(1, 'rgba(224,40,30,' + a + ')');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  }
  drawHUD(ctx, game);
  if (game.state === 'title') drawTitleScreen(ctx);
  else if (game.state === 'won') drawWinScreen(ctx, game);
  else if (game.state === 'caught') drawCaughtScreen(ctx, game);
  else if (game.state === 'paused') {
    drawPanel(ctx, 'PAUSED', ['Press P or ENTER to keep stealing.'], '#c8a24a');
  }
}
