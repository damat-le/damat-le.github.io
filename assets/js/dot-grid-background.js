// Interactive dot-grid background: a regular grid of small grey dots. Dots
// near the mouse grow, darken, fade to the site's link color and are gently
// pushed away, then spring back.
// Drawn on a fixed canvas behind the page, so the page background stays
// white. No dots are drawn behind text, images or other page elements
// (see TEXT_SELECTOR and BOX_SELECTOR).
(function () {
  "use strict";

  var SPACING = 26; // distance (px) between grid dots
  var DOT_RADIUS = 1.2; // resting dot radius (px)
  var DOT_RADIUS_MAX = 2.6; // dot radius (px) right under the mouse
  var ALPHA = 0.28; // resting dot opacity
  var ALPHA_MAX = 0.75; // dot opacity right under the mouse
  var MOUSE_DISTANCE = 150; // radius (px) of the mouse's influence
  var PUSH = 14; // max distance (px) a dot is pushed away from the mouse
  var EASE = 0.15; // how fast dots follow their target (0–1)
  var COLOR = [110, 110, 110]; // rgb of the dots at rest
  var ACCENT_FALLBACK = [176, 22, 176]; // rgb under the mouse if no link color is found
  var CONTENT_PADDING = 10; // empty margin (px) kept around page elements
  // Text blocks: only the lines of text are kept clear, not the whole block,
  // so dots still fill the empty space beside a short heading or a photo.
  var TEXT_SELECTOR = [
    ".post-header h1",
    ".post-header .desc",
    ".post article p",
    ".post article h2",
    ".post article h3",
    ".post article li",
    ".post article .more-info",
    ".post article .contact-note",
  ].join(",");
  // Other elements: their whole box is kept clear.
  var BOX_SELECTOR = [".navbar", "footer", ".post article table", ".post article img", ".post article .contact-icons a"].join(",");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;";
  document.body.prepend(canvas);
  var ctx = canvas.getContext("2d");

  var width, height, dots, textElements, boxElements, accent;
  var range = document.createRange();
  var mouse = { x: -9999, y: -9999 };

  function resize() {
    var dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    textElements = document.querySelectorAll(TEXT_SELECTOR);
    boxElements = document.querySelectorAll(BOX_SELECTOR);
    accent = linkColor();

    // Center the grid in the viewport.
    var offsetX = (width % SPACING) / 2;
    var offsetY = (height % SPACING) / 2;
    dots = [];
    for (var y = offsetY; y <= height; y += SPACING) {
      for (var x = offsetX; x <= width; x += SPACING) {
        dots.push({ hx: x, hy: y, dx: 0, dy: 0, t: 0 });
      }
    }
  }

  // The theme's link color as [r, g, b], read from a link in the page text.
  function linkColor() {
    var link = document.querySelector(".post article p a");
    var match = link && getComputedStyle(link).color.match(/\d+(\.\d+)?/g);
    return match ? match.slice(0, 3).map(Number) : ACCENT_FALLBACK;
  }

  // Viewport rects of page content, padded. Read on every frame so scrolling
  // and late layout shifts are followed.
  function contentRects() {
    var rects = [];
    function add(r) {
      if (r.width === 0 || r.bottom < -CONTENT_PADDING || r.top > height + CONTENT_PADDING) return;
      rects.push({
        left: r.left - CONTENT_PADDING,
        right: r.right + CONTENT_PADDING,
        top: r.top - CONTENT_PADDING,
        bottom: r.bottom + CONTENT_PADDING,
      });
    }

    for (var i = 0; i < textElements.length; i++) {
      var block = textElements[i].getBoundingClientRect();
      if (block.bottom < -CONTENT_PADDING || block.top > height + CONTENT_PADDING) continue;
      range.selectNodeContents(textElements[i]);
      var lines = range.getClientRects();
      for (var j = 0; j < lines.length; j++) add(lines[j]);
    }
    for (var k = 0; k < boxElements.length; k++) add(boxElements[k].getBoundingClientRect());
    return rects;
  }

  function hidden(x, y, rects) {
    for (var i = 0; i < rects.length; i++) {
      var r = rects[i];
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return true;
    }
    return false;
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    var rects = contentRects();
    var ease = reduceMotion ? 1 : EASE;

    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];

      // Target state from the mouse: 0 far away, 1 right under it.
      var mx = d.hx - mouse.x;
      var my = d.hy - mouse.y;
      var dist = Math.sqrt(mx * mx + my * my);
      var strength = dist < MOUSE_DISTANCE ? 1 - dist / MOUSE_DISTANCE : 0;
      strength *= strength;
      var push = reduceMotion ? 0 : strength * PUSH;
      var tx = dist > 0 ? (mx / dist) * push : 0;
      var ty = dist > 0 ? (my / dist) * push : 0;

      d.dx += (tx - d.dx) * ease;
      d.dy += (ty - d.dy) * ease;
      d.t += (strength - d.t) * ease;

      if (hidden(d.hx, d.hy, rects)) continue;

      var r = Math.round(COLOR[0] + (accent[0] - COLOR[0]) * d.t);
      var g = Math.round(COLOR[1] + (accent[1] - COLOR[1]) * d.t);
      var b = Math.round(COLOR[2] + (accent[2] - COLOR[2]) * d.t);
      ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + (ALPHA + (ALPHA_MAX - ALPHA) * d.t) + ")";
      ctx.beginPath();
      ctx.arc(d.hx + d.dx, d.hy + d.dy, DOT_RADIUS + (DOT_RADIUS_MAX - DOT_RADIUS) * d.t, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop() {
    if (!document.hidden) draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", function () {
    resize();
    if (reduceMotion) draw();
  });
  window.addEventListener("scroll", function () {
    if (reduceMotion) draw();
  });
  window.addEventListener("mousemove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (reduceMotion) draw();
  });
  document.addEventListener("mouseleave", function () {
    mouse.x = mouse.y = -9999;
    if (reduceMotion) draw();
  });

  resize();
  if (reduceMotion) {
    draw(); // no animation: dots highlight under the mouse but don't move
  } else {
    loop();
  }
})();
