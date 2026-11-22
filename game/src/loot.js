// loot.js — the Golden Idol and the exit door. Win the night by
// grabbing the idol and reaching the exit. Get caught first, and the
// night ends the other way.

function createLoot() {
  return {
    taken: false,
    // Sparkle phase for the idol's glow; driven by the game clock.
    sparkle: 0,
  };
}

function updateLoot(loot, thief, game) {
  if (!loot.taken && dist(thief.x, thief.y, LOOT.x, LOOT.y) < 34) {
    loot.taken = true;
    game.onLootTaken();
  }
  if (loot.taken && dist(thief.x, thief.y, EXIT.x, EXIT.y) < 40) {
    game.onEscape();
  }
}
