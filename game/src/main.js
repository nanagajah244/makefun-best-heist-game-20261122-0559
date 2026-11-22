// main.js — The Midnight Vault: the loop, the states, the coin throws
// and the screenshot scenes. Wires thief, guards, cameras, alarm, loot,
// input and sound together; render.js does all the drawing.

var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');

var game = {
  state: 'title', // title | playing | paused | won | caught
  time: 0,        // seconds of play (title screen keeps its own clock)
  finalTime: 0,
  thief: null,
  guards: null,
  cameras: null,
  alarm: null,
  loot: null,
  coins: [],      // thrown coins: flying ones and ones resting on the floor
  input: null,
  audio: null,
  lastAlarmBeep: 0,
};

function resetGame() {
  game.thief = createThief();
  game.guards = createGuards();
  game.cameras = createCameras();
  game.alarm = wireAlarm(createAlarm());
  game.loot = createLoot();
  game.coins = [];
  game.time = 0;
  game.finalTime = 0;
  game.lastAlarmBeep = 0;
}

game.onLootTaken = function () {
  soundPickup(game.audio);
};

game.onEscape = function () {
  if (game.state !== 'playing') return;
  game.state = 'won';
  game.finalTime = game.time;
  soundWin(game.audio);
};

function throwCoin(x, y) {
  if (game.state !== 'playing') return;
  if (game.thief.coins <= 0) return;
  if (game.coins.some(function (c) { return c.flying; })) return;
  var target = nearestWalkable(x, y, 8, OBSTACLES, WORLD.room);
  game.thief.coins -= 1;
  game.coins.push({
    flying: true,
    x0: game.thief.x, y0: game.thief.y,
    x1: target.x, y1: target.y,
    x: game.thief.x, y: game.thief.y,
    t: 0, dur: 0.45, rest: 0,
  });
}

function updateCoins(dt) {
  for (var i = game.coins.length - 1; i >= 0; i--) {
    var coin = game.coins[i];
    if (coin.flying) {
      coin.t += dt;
      if (coin.t >= coin.dur) {
        coin.flying = false;
        coin.x = coin.x1;
        coin.y = coin.y1;
        coin.rest = 0;
        soundCoin(game.audio);
        distractGuards(game.guards, coin.x1, coin.y1);
      }
    } else {
      coin.rest += dt;
      if (coin.rest > 3.5) game.coins.splice(i, 1);
    }
  }
}

function update(dt) {
  game.time += dt;
  if (game.state === 'title') {
    // The gallery lives behind the title: guards walk, cameras sweep.
    updateGuards(game.guards, game.thief, dt, game.alarm);
    updateCameras(game.cameras, game.thief, dt, game.alarm, game.time);
    game.alarm.value = 0;
    return;
  }
  if (game.state !== 'playing') return;

  updateThief(game.thief, game.input, dt);
  updateGuards(game.guards, game.thief, dt, game.alarm);
  updateCameras(game.cameras, game.thief, dt, game.alarm, game.time);
  updateCoins(dt);
  updateLoot(game.loot, game.thief, game);
  updateAlarm(game.alarm, dt);

  // A rising alarm beeps as it crosses each quarter.
  var quarter = Math.floor(game.alarm.value / 25);
  if (quarter > game.lastAlarmBeep && game.alarm.value < 100) {
    game.lastAlarmBeep = quarter;
    soundAlarmTick(game.audio);
  }
  if (game.alarm.value >= 100) {
    game.state = 'caught';
    soundCaught(game.audio);
  }
}

var lastTs = 0;
function loop(ts) {
  var dt = Math.min(0.05, (ts - lastTs) / 1000 || 0);
  lastTs = ts;
  update(dt);
  render(ctx, game);
  requestAnimationFrame(loop);
}

// Screenshot scenes: fixed starting states for the game's own shots.
// They set real game state through the same code paths as play — the
// cover shows the room, the thief mid-crossing, guard cones, a camera,
// the glowing idol and a part-filled alarm meter, all in one frame.
function applyScene(name) {
  if (name === 'cover') {
    game.state = 'playing';
    game.time = 42;
    // Rook mid-room, just outside every cone: the whole heist in one frame.
    game.thief.x = 620; game.thief.y = 500;
    game.thief.facing = -Math.PI / 2;
    game.alarm.value = 42; game.alarm.peak = 42;
    placeGuard(0, 500, 380, 0);          // Marco mid-loop, looking right
    placeGuard(1, 1000, 300, Math.PI / 2); // Sofia mid-loop, looking down
    placeGuard(2, 700, 170, Math.PI);     // Viktor by the idol, looking left
  } else if (name === 'stealth') {
    game.state = 'playing';
    game.time = 67;
    // Rook slips past Marco's cone edge, close enough to feel it.
    game.thief.x = 745; game.thief.y = 470;
    game.thief.facing = -Math.PI / 2;
    game.alarm.value = 12; game.alarm.peak = 18;
    placeGuard(0, 650, 380, 0);          // Marco's cone sweeps just past Rook
    placeGuard(1, 900, 300, -Math.PI / 2);
    placeGuard(2, 520, 170, 0);
  } else if (name === 'alarm') {
    game.state = 'playing';
    game.time = 96;
    // Rook spotted at long range: Marco is closing in, cone burning red,
    // alarm high but not yet full — the near-caught moment.
    game.thief.x = 730; game.thief.y = 445;
    game.thief.facing = Math.PI;
    game.alarm.value = 68; game.alarm.peak = 68;
    game.lastAlarmBeep = 2;
    placeGuard(0, 545, 385, Math.atan2(60, 185), 'chase'); // Marco closing in, cone red
    placeGuard(1, 1000, 480, -Math.PI / 2);
    placeGuard(2, 820, 260, Math.PI / 2);
    game.coins.push({ flying: false, x: 700, y: 500, t: 0, dur: 0.45, rest: 1 });
  } else if (name === 'win') {
    game.state = 'won';
    game.time = 87.4;
    game.finalTime = 87.4;
    game.loot.taken = true;
    game.thief.x = EXIT.x; game.thief.y = EXIT.y - 10;
    game.thief.coins = 2;
    game.alarm.value = 24; game.alarm.peak = 61;
    placeGuard(0, 350, 500, Math.PI / 2);
    placeGuard(1, 1100, 300, Math.PI);
    placeGuard(2, 520, 260, 0);
  }
}

function placeGuard(i, x, y, facing, state) {
  var g = game.guards[i];
  g.x = x; g.y = y;
  g.facing = facing;
  g.scanPhase = facing;
  g.state = state || 'patrol';
  g.wait = 0;
  g.seenTimer = state === 'chase' ? 1.2 : 0;
  g.lastSeen = state === 'chase' ? { x: game.thief.x, y: game.thief.y } : null;
}

function init() {
  resetGame();
  game.audio = createAudio();
  game.input = createInput(canvas);
  game.input.onClick = function (x, y) {
    audioUnlock(game.audio);
    if (game.state === 'title') {
      game.state = 'playing';
      soundClick(game.audio);
      return;
    }
    if (game.state === 'playing') throwCoin(x, y);
  };
  game.input.onKey = function (code) {
    audioUnlock(game.audio);
    if (code === 'Enter' || code === 'Space') {
      if (game.state === 'title') { game.state = 'playing'; soundClick(game.audio); }
      else if (game.state === 'paused') game.state = 'playing';
    } else if (code === 'KeyR') {
      resetGame();
      game.state = 'playing';
      soundClick(game.audio);
    } else if (code === 'KeyM') {
      game.audio.muted = !game.audio.muted;
    } else if (code === 'KeyP') {
      if (game.state === 'playing') game.state = 'paused';
      else if (game.state === 'paused') game.state = 'playing';
    }
  };
  var scene = new URLSearchParams(window.location.search).get('scene');
  if (scene) applyScene(scene);
  requestAnimationFrame(loop);
}

init();
