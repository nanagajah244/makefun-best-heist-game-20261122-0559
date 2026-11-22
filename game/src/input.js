// input.js — keyboard (WASD / arrows) and mouse (click to throw a
// coin). Maps the browser's client coordinates onto canvas pixels so
// a click lands where the player aimed, however the page is scaled.

function createInput(canvas) {
  var input = {
    left: false, right: false, up: false, down: false,
    onClick: null,   // set by main.js: function (x, y) in canvas pixels
    onKey: null,     // set by main.js: function (code) for Enter / R / M / P
  };

  function keyDown(e) {
    var c = e.code;
    if (c === 'ArrowLeft' || c === 'KeyA') input.left = true;
    else if (c === 'ArrowRight' || c === 'KeyD') input.right = true;
    else if (c === 'ArrowUp' || c === 'KeyW') input.up = true;
    else if (c === 'ArrowDown' || c === 'KeyS') input.down = true;
    else if (input.onKey) input.onKey(c);
    if (c === 'ArrowLeft' || c === 'ArrowRight' || c === 'ArrowUp' || c === 'ArrowDown' || c === 'Space') {
      e.preventDefault();
    }
  }

  function keyUp(e) {
    var c = e.code;
    if (c === 'ArrowLeft' || c === 'KeyA') input.left = false;
    else if (c === 'ArrowRight' || c === 'KeyD') input.right = false;
    else if (c === 'ArrowUp' || c === 'KeyW') input.up = false;
    else if (c === 'ArrowDown' || c === 'KeyS') input.down = false;
  }

  function click(e) {
    if (!input.onClick) return;
    var rect = canvas.getBoundingClientRect();
    var x = (e.clientX - rect.left) * (canvas.width / rect.width);
    var y = (e.clientY - rect.top) * (canvas.height / rect.height);
    input.onClick(x, y);
  }

  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);
  canvas.addEventListener('mousedown', click);
  return input;
}
