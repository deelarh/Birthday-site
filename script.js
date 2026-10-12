(function () {
  "use strict";

  /* ---------- settings ---------- */
  var STORAGE_KEY = "abubakar_bday_played_v1";
  var WINNING_INDEX = 1; // slice #2 "One-day getaway" (0-based index). The wheel always lands here.

  var PRIZES = [
    { lines: ["Weekend trip", "Ziba Resort, Lagos"], color: "#004d98", text: "#ffffff" },
    { lines: ["One-day getaway", "with Fadu in Abuja"], color: "#a50044", text: "#ffffff" },
    { lines: ["Forehead kisses", "+ back neck rub"], color: "#edbb00", text: "#0b1f4b" },
    { lines: ["Barca tickets to", "their next game"], color: "#0b1f4b", text: "#ffffff" },
    { lines: ["A blank check"], color: "#7a0033", text: "#ffffff" }
  ];

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }

  function safeGet() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function safeSet() {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch (e) { /* ignore */ }
  }
  function safeClear() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  }

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function show(id) {
    var screens = document.querySelectorAll(".screen");
    for (var i = 0; i < screens.length; i++) screens[i].classList.remove("active");
    $(id).classList.add("active");
    window.scrollTo(0, 0);
  }

  /* ---------- confetti ---------- */
  var canvas = $("confetti");
  var ctx = canvas.getContext("2d");
  var particles = [];
  var running = false;
  var COLORS = ["#edbb00", "#a50044", "#004d98", "#ffffff", "#ff6fa3"];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  function burst(count, originX, originY) {
    if (reduceMotion) return;
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 4 + Math.random() * 9;
      particles.push({
        x: originX, y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6,
        size: 6 + Math.random() * 6,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.4,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        life: 0
      });
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  function rain(durationMs) {
    if (reduceMotion) return;
    var end = Date.now() + durationMs;
    (function drop() {
      burst(6, Math.random() * canvas.width, -10);
      if (Date.now() < end) setTimeout(drop, 120);
    })();
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.vy += 0.22;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
      if (p.y > canvas.height + 30 || p.life > 400) particles.splice(i, 1);
    }
    if (particles.length) requestAnimationFrame(tick);
    else { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }

  /* ---------- balloons ---------- */
  function launchBalloons() {
    if (reduceMotion) return;
    var box = $("balloons");
    for (var i = 0; i < 16; i++) {
      var b = document.createElement("div");
      b.className = "balloon";
      b.style.left = (Math.random() * 92) + "%";
      b.style.background = COLORS[i % 4];
      b.style.animationDuration = (7 + Math.random() * 6) + "s";
      b.style.animationDelay = (Math.random() * 3) + "s";
      box.appendChild(b);
    }
    setTimeout(function () { box.innerHTML = ""; }, 17000);
  }

  /* ---------- birthday screen ---------- */
  function buildTitle() {
    var title = $("bdayTitle");
    title.innerHTML = "";
    var words = ["Happy", "Birthday!"];
    var n = 0;
    words.forEach(function (w) {
      var span = document.createElement("span");
      span.className = "word";
      w.split("").forEach(function (ch) {
        var c = document.createElement("span");
        c.className = "ch";
        c.textContent = ch;
        c.style.animationDelay = (n * 0.07) + "s";
        n++;
        span.appendChild(c);
      });
      title.appendChild(span);
    });
    $("bdayName").style.animationDelay = "1.1s";
    $("bdayAka").style.animationDelay = "1.6s";
  }

  function playBirthday() {
    show("s-bday");
    buildTitle();
    launchBalloons();
    setTimeout(function () { burst(120, window.innerWidth / 2, window.innerHeight * 0.35); }, 500);
    setTimeout(function () { burst(120, window.innerWidth * 0.2, window.innerHeight * 0.5); }, 1300);
    setTimeout(function () { burst(120, window.innerWidth * 0.8, window.innerHeight * 0.5); }, 1900);
    setTimeout(function () { $("toWheel").classList.remove("hidden"); }, 3800);
  }

  /* ---------- wheel ---------- */
  function drawWheel() {
    var c = $("wheelCanvas");
    var g = c.getContext("2d");
    var size = c.width;
    var cx = size / 2, cy = size / 2, r = size / 2;
    var n = PRIZES.length;
    var slice = (Math.PI * 2) / n;
    var start = -Math.PI / 2; // slice 0 starts at the top and goes clockwise

    PRIZES.forEach(function (p, i) {
      var a0 = start + i * slice;
      var a1 = a0 + slice;
      g.beginPath();
      g.moveTo(cx, cy);
      g.arc(cx, cy, r, a0, a1);
      g.closePath();
      g.fillStyle = p.color;
      g.fill();
      g.strokeStyle = "rgba(255,255,255,0.35)";
      g.lineWidth = 3;
      g.stroke();

      g.save();
      g.translate(cx, cy);
      g.rotate(a0 + slice / 2);
      g.textAlign = "right";
      g.textBaseline = "middle";
      g.fillStyle = p.text;
      g.font = "800 27px 'Bricolage Grotesque', 'Trebuchet MS', sans-serif";
      var lineH = 32;
      var offset = -((p.lines.length - 1) * lineH) / 2;
      p.lines.forEach(function (line, k) {
        g.fillText(line, r - 34, offset + k * lineH);
      });
      g.restore();
    });
  }

  var spun = false;

  function spin() {
    if (spun || safeGet()) return;
    spun = true;
    safeSet(); // lock it in immediately, even if he refreshes mid-spin
    $("spin").disabled = true;

    var n = PRIZES.length;
    var sliceDeg = 360 / n;
    var centre = WINNING_INDEX * sliceDeg + sliceDeg / 2;
    var jitter = (Math.random() - 0.5) * (sliceDeg * 0.6); // lands somewhere inside the slice, not always dead centre
    var turns = 6;
    var target = 360 * turns - centre + jitter;

    var wheel = $("wheel");
    var finished = false;
    function done() {
      if (finished) return;
      finished = true;
      setTimeout(showResult, 700);
    }
    wheel.addEventListener("transitionend", done, { once: true });
    setTimeout(done, reduceMotion ? 2200 : 7200);

    // force a reflow so the transition always runs
    void wheel.offsetWidth;
    wheel.style.transform = "rotate(" + target + "deg)";
  }

  function showResult() {
    show("s-result");
    burst(160, window.innerWidth / 2, window.innerHeight * 0.4);
    rain(3500);
  }

  /* ---------- wire up ---------- */
  function init() {
    // Private testing helper: open index.html?reset to clear the one-spin lock on this device.
    if (/[?&]reset\b/.test(window.location.search)) {
      safeClear();
      if (window.history && history.replaceState) {
        history.replaceState(null, "", window.location.pathname);
      }
    }

    drawWheel();

    $("yes").addEventListener("click", function () {
      if (safeGet()) { showResult(); return; }
      playBirthday();
    });
    $("no").addEventListener("click", function () { show("s-no"); });
    $("back").addEventListener("click", function () { show("s-confirm"); });
    $("toWheel").addEventListener("click", function () { show("s-wheel"); });
    $("spin").addEventListener("click", spin);

    // Already played? Skip straight to the prize after the name check.
    if (safeGet()) { $("spin").disabled = true; }
  }

  init();
})();
