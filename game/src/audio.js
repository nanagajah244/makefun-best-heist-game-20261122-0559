// audio.js — all sound is synthesised with WebAudio. No audio files,
// no network, nothing to load. Sounds start only after the player's
// first key or click, which is when the browser allows audio.

function createAudio() {
  return {
    ctx: null,
    muted: false,
  };
}

function audioUnlock(audio) {
  if (audio.ctx) return;
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audio.ctx = new AC();
  } catch (e) {
    audio.ctx = null;
  }
}

function audioTone(audio, freq, dur, type, gain, when) {
  if (!audio.ctx || audio.muted) return;
  try {
    var t0 = audio.ctx.currentTime + (when || 0);
    var osc = audio.ctx.createOscillator();
    var g = audio.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.12, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(audio.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  } catch (e) { /* sound is decoration; never break the game */ }
}

function soundCoin(audio) {
  audioTone(audio, 1568, 0.09, 'triangle', 0.10);
  audioTone(audio, 2093, 0.14, 'triangle', 0.08, 0.07);
}

function soundPickup(audio) {
  audioTone(audio, 523, 0.12, 'sine', 0.12);
  audioTone(audio, 659, 0.12, 'sine', 0.12, 0.09);
  audioTone(audio, 784, 0.20, 'sine', 0.12, 0.18);
  audioTone(audio, 1047, 0.28, 'sine', 0.10, 0.27);
}

function soundAlarmTick(audio) {
  audioTone(audio, 880, 0.10, 'square', 0.05);
  audioTone(audio, 660, 0.10, 'square', 0.05, 0.12);
}

function soundWin(audio) {
  var notes = [523, 659, 784, 1047, 1319];
  for (var i = 0; i < notes.length; i++) {
    audioTone(audio, notes[i], 0.22, 'triangle', 0.11, i * 0.11);
  }
}

function soundCaught(audio) {
  audioTone(audio, 220, 0.35, 'sawtooth', 0.10);
  audioTone(audio, 175, 0.35, 'sawtooth', 0.10, 0.18);
  audioTone(audio, 131, 0.6, 'sawtooth', 0.10, 0.36);
}

function soundClick(audio) {
  audioTone(audio, 440, 0.06, 'sine', 0.06);
}
