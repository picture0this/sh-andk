// ============================================================
//  منطق لعبة "شعندك؟"
// ============================================================

(function () {
  "use strict";

  // ---------- الحالة ----------
  var state = {
    teams: [
      { name: "", score: 0 },
      { name: "", score: 0 }
    ],
    winLimit: GAME_DEFAULTS.winLimit,
    round: null,          // { sub, items:[itemA, itemB], step }
    winShownFor: [false, false]
  };

  // ---------- عناصر الصفحة ----------
  var $ = function (id) { return document.getElementById(id); };
  var screens = document.querySelectorAll(".screen");
  var nameInputs = [$("teamName1"), $("teamName2")];
  var scoreEls = [$("score1"), $("score2")];
  var qrObjects = { main: null, r1: null, r2: null };
  var timer = { total: GAME_DEFAULTS.timerSeconds, left: GAME_DEFAULTS.timerSeconds, handle: null, paused: false };
  var RING_LEN = 326.7;

  // ---------- الحفظ والاسترجاع ----------
  function save() {
    try {
      localStorage.setItem("shaandak", JSON.stringify({
        teams: state.teams, winLimit: state.winLimit
      }));
    } catch (e) { /* التخزين غير متاح — نكمل بدون حفظ */ }
  }

  function load() {
    try {
      var raw = localStorage.getItem("shaandak");
      if (!raw) return;
      var data = JSON.parse(raw);
      if (data && data.teams && data.teams.length === 2) {
        state.teams = data.teams;
        state.winLimit = data.winLimit || GAME_DEFAULTS.winLimit;
      }
    } catch (e) { /* بيانات تالفة — نبدأ من جديد */ }
  }

  // ---------- أدوات ----------
  function teamDisplayName(i) {
    return state.teams[i].name.trim() || (i === 0 ? "الفريق الاول" : "الفريق الثاني");
  }

  function showToast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(showToast.h);
    showToast.h = setTimeout(function () { t.hidden = true; }, 1600);
  }

  function makeQr(holderId, key, text) {
    var holder = $(holderId);
    holder.innerHTML = "";
    qrObjects[key] = new QRCode(holder, {
      text: text,
      width: 230,
      height: 230,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  function beep(freq, dur) {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      beep.ctx = beep.ctx || new Ctx();
      var o = beep.ctx.createOscillator();
      var g = beep.ctx.createGain();
      o.frequency.value = freq;
      o.type = "square";
      g.gain.value = 0.06;
      o.connect(g); g.connect(beep.ctx.destination);
      o.start();
      o.stop(beep.ctx.currentTime + dur);
    } catch (e) { /* الصوت غير متاح */ }
  }

  // ---------- التنقل بين الشاشات ----------
  function showScreen(id) {
    screens.forEach(function (s) { s.classList.toggle("active", s.id === id); });
    var home = id === "screen-home";
    $("homeBtn").hidden = home;
    // أسماء الفرق تتغير فقط خارج اللعب
    nameInputs.forEach(function (inp) { inp.disabled = !home; });
    // زر "اختر البطاقة هنا" يظهر بشاشة الفئات الفرعية فقط
    var showPick = id === "screen-sub";
    $("pickCard1").hidden = !showPick;
    $("pickCard2").hidden = !showPick;
    if (home) stopTimer();
  }

  // ---------- النقاط ----------
  function renderScores() {
    scoreEls[0].textContent = state.teams[0].score;
    scoreEls[1].textContent = state.teams[1].score;
  }

  function changeScore(teamIdx, delta) {
    var t = state.teams[teamIdx];
    t.score = Math.max(0, t.score + delta);
    renderScores();
    save();
    checkWin(teamIdx);
  }

  function checkWin(teamIdx) {
    var t = state.teams[teamIdx];
    if (t.score >= state.winLimit && !state.winShownFor[teamIdx]) {
      state.winShownFor[teamIdx] = true;
      $("winnerText").textContent = "🏆 " + teamDisplayName(teamIdx) + " فاز!";
      $("winOverlay").hidden = false;
      beep(880, 0.15); setTimeout(function () { beep(1174, 0.25); }, 180);
    }
    if (t.score < state.winLimit) state.winShownFor[teamIdx] = false;
  }

  // ---------- الشاشة الرئيسية ----------
  function renderMainGrid() {
    var grid = $("mainGrid");
    grid.innerHTML = "";
    MAIN_CATEGORIES.forEach(function (cat) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cat-card" + (cat.mystery ? " mystery" : "");
      if (!cat.mystery) {
        var img = document.createElement("img");
        img.src = cat.img;
        img.alt = cat.name;
        img.onerror = function () { btn.classList.add("noimg"); };
        btn.appendChild(img);
      }
      var label = document.createElement("span");
      label.className = "cat-name";
      label.textContent = cat.name;
      btn.appendChild(label);

      btn.addEventListener("click", function () {
        if (cat.playable) {
          renderSubRow();
          showScreen("screen-sub");
        } else {
          btn.classList.remove("shake");
          void btn.offsetWidth; // إعادة تشغيل الأنيميشن
          btn.classList.add("shake");
          showToast("قريباً!");
        }
      });
      grid.appendChild(btn);
    });
  }

  // ---------- الفئات الفرعية ----------
  function renderSubRow() {
    var row = $("subRow");
    row.innerHTML = "";
    SUB_CATEGORIES.forEach(function (sub) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sub-card";
      var img = document.createElement("img");
      img.src = sub.img;
      img.alt = sub.name;
      img.onerror = function () { btn.classList.add("noimg"); };
      btn.appendChild(img);
      var label = document.createElement("span");
      label.className = "cat-name";
      label.textContent = sub.name;
      btn.appendChild(label);
      btn.addEventListener("click", function () { startRound(sub); });
      row.appendChild(btn);
    });
  }

  // ---------- الجولة ----------
  function startRound(sub) {
    if (!sub.items || sub.items.length < 2) {
      showToast("هذي الفئة ما فيها بطاقات كافية");
      return;
    }
    var a = Math.floor(Math.random() * sub.items.length);
    var b = Math.floor(Math.random() * (sub.items.length - 1));
    if (b >= a) b++; // نضمن بطاقتين مختلفتين
    state.round = { sub: sub, items: [sub.items[a], sub.items[b]], step: 0 };
    showQrStep();
  }

  function showQrStep() {
    var r = state.round;
    $("qrTeamLabel").textContent = "بطاقة " + teamDisplayName(r.step) + " — صوّرها بتلفونكم 📱";
    makeQr("qrHolder", "main", r.items[r.step].url);
    showScreen("screen-qr");
  }

  function qrNext() {
    var r = state.round;
    if (!r) return;
    if (r.step === 0) {
      r.step = 1;
      showQrStep();
    } else {
      startTimer();
      showScreen("screen-timer");
    }
  }

  // ---------- العدّاد ----------
  function renderTimer() {
    $("timerNum").textContent = timer.left;
    var frac = timer.left / timer.total;
    $("ringFg").style.strokeDashoffset = (RING_LEN * (1 - frac)).toFixed(1);
    document.querySelector(".timer-wrap").classList.toggle("low", timer.left <= 10);
  }

  function tick() {
    if (timer.paused) return;
    timer.left--;
    if (timer.left <= 0) {
      timer.left = 0;
      stopTimer();
      beep(220, 0.5);
    } else if (timer.left <= 5) {
      beep(660, 0.08);
    }
    renderTimer();
  }

  function startTimer() {
    stopTimer();
    timer.left = timer.total;
    timer.paused = false;
    $("timerPauseBtn").classList.remove("paused");
    renderTimer();
    timer.handle = setInterval(tick, 1000);
  }

  function stopTimer() {
    if (timer.handle) { clearInterval(timer.handle); timer.handle = null; }
  }

  function pauseTimer() {
    timer.paused = !timer.paused;
    $("timerPauseBtn").classList.toggle("paused", timer.paused);
  }

  // ---------- الكشف والفائز ----------
  function showReveal() {
    stopTimer();
    var r = state.round;
    if (!r) return;
    $("revealName1").textContent = teamDisplayName(0);
    $("revealName2").textContent = teamDisplayName(1);
    makeQr("revealQr1", "r1", r.items[0].url);
    makeQr("revealQr2", "r2", r.items[1].url);
    showScreen("screen-reveal");
  }

  function declareWinner(teamIdx) {
    changeScore(teamIdx, GAME_DEFAULTS.roundPoints);
    showToast("+" + GAME_DEFAULTS.roundPoints + " لـ " + teamDisplayName(teamIdx) + " 🎉");
    state.round = null;
    showScreen("screen-home");
  }

  // ---------- ربط الأحداث ----------
  function bindEvents() {
    // أزرار النقاط (+ / −)
    document.querySelectorAll(".score-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var team = parseInt(btn.dataset.team, 10);
        var delta = parseInt(btn.dataset.delta, 10) * GAME_DEFAULTS.roundPoints;
        changeScore(team, delta);
      });
    });

    // أسماء الفرق
    nameInputs.forEach(function (inp, i) {
      inp.addEventListener("input", function () {
        state.teams[i].name = inp.value;
        save();
      });
    });

    // حد نقاط الفوز
    $("winLimit").addEventListener("change", function () {
      var v = parseInt(this.value, 10);
      if (!v || v < 100) { v = GAME_DEFAULTS.winLimit; this.value = v; }
      state.winLimit = v;
      state.winShownFor = [false, false];
      save();
    });

    $("qrNextBtn").addEventListener("click", qrNext);
    $("timerResetBtn").addEventListener("click", startTimer);
    $("timerPauseBtn").addEventListener("click", pauseTimer);
    $("timerNextBtn").addEventListener("click", showReveal);

    document.querySelectorAll(".winner-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        declareWinner(parseInt(btn.dataset.team, 10));
      });
    });

    $("noWinnerBtn").addEventListener("click", function () {
      state.round = null;
      showScreen("screen-home");
    });

    $("homeBtn").addEventListener("click", function () {
      state.round = null;
      showScreen("screen-home");
    });

    // نافذة الفوز
    $("newGameBtn").addEventListener("click", function () {
      state.teams[0].score = 0;
      state.teams[1].score = 0;
      state.winShownFor = [false, false];
      renderScores();
      save();
      $("winOverlay").hidden = true;
      state.round = null;
      showScreen("screen-home");
    });
    $("keepPlayingBtn").addEventListener("click", function () {
      $("winOverlay").hidden = true;
    });
  }

  // ---------- البداية ----------
  load();
  nameInputs[0].value = state.teams[0].name;
  nameInputs[1].value = state.teams[1].name;
  $("winLimit").value = state.winLimit;
  renderScores();
  renderMainGrid();
  bindEvents();
  showScreen("screen-home");
})();
