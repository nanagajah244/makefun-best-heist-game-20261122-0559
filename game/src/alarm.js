// alarm.js — the alarm meter. It climbs while the thief is seen and
// cools down while he stays hidden. At 100 the night is over: caught.

function createAlarm() {
  return {
    value: 0,      // 0..100
    peak: 0,       // highest value reached this run
    cooling: true, // true while nobody sees the thief
  };
}

function alarmRise(alarm, amount) {
  alarm.value = Math.min(100, alarm.value + amount);
  if (alarm.value > alarm.peak) alarm.peak = alarm.value;
  alarm.cooling = false;
}

function alarmSet(alarm, value) {
  alarm.value = clamp(value, 0, 100);
  if (alarm.value > alarm.peak) alarm.peak = alarm.value;
}

// Called once per frame; the alarm only cools when nothing raised it
// during this frame.
function updateAlarm(alarm, dt) {
  if (alarm.cooling && alarm.value > 0) {
    alarm.value = Math.max(0, alarm.value - 6 * dt);
  }
  alarm.cooling = true;
}

// Attach the methods so the rest of the game calls alarm.rise(n),
// alarm.set(n) on the plain object.
function wireAlarm(alarm) {
  alarm.rise = function (amount) { alarmRise(alarm, amount); };
  alarm.set = function (value) { alarmSet(alarm, value); };
  return alarm;
}
