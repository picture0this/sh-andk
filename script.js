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
    honest: null,         // { answerTeam } — جولة "خلك صريح" الحالية
    noword: null,         // { items:[itemA, itemB], step } — جولة "ولا كلمة"
    qa: { picked: [], used: {}, started: false, current: null, turn: 0 }, // "سؤال و جواب"
    honestTurn: 0,        // لتبديل الفريق السائل كل جولة
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
    // زر إعادة اختيار الفئات يظهر داخل لعبة "سؤال و جواب" فقط
    $("qaResetBtn").hidden = !(id === "screen-qa-board" || id === "screen-qa-q");
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
        if (cat.id === "guess") {
          renderSubRow();
          showScreen("screen-sub");
        } else if (cat.id === "honest") {
          renderHonestRow();
          showScreen("screen-honest-sub");
        } else if (cat.id === "noword") {
          showScreen("screen-noword-start");
        } else if (cat.id === "qa") {
          // اللعبة شغالة؟ نرجع للوحة بنفس الفئات والأسئلة المستخدمة
          if (state.qa.started) {
            renderQaBoard();
            showScreen("screen-qa-board");
          } else {
            renderQaPick();
            showScreen("screen-qa-pick");
          }
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
  function renderCardRow(rowId, list, onPick) {
    var row = $(rowId);
    row.innerHTML = "";
    list.forEach(function (sub) {
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
      btn.addEventListener("click", function () { onPick(sub, btn); });
      row.appendChild(btn);
    });
  }

  function renderSubRow() {
    renderCardRow("subRow", SUB_CATEGORIES, startRound);
  }

  function renderHonestRow() {
    renderCardRow("honestRow", HONEST_CATEGORIES, startHonestRound);
  }

  // ---------- جولة "خلك صريح" ----------
  function startHonestRound(sub) {
    if (!sub.questions || !sub.questions.length) {
      showToast("هذي الفئة ما فيها أسئلة");
      return;
    }
    var ask = state.honestTurn % 2;   // الفريق السائل يتبدل كل جولة
    var ans = 1 - ask;
    var q = sub.questions[Math.floor(Math.random() * sub.questions.length)];
    state.honest = { answerTeam: ans };
    $("honestQuestion").textContent = q
      .replace("{ask}", teamDisplayName(ask))
      .replace("{ans}", teamDisplayName(ans));
    showScreen("screen-honest-q");
  }

  function endHonestRound(answered) {
    var h = state.honest;
    if (!h) return;
    if (answered) {
      changeScore(h.answerTeam, GAME_DEFAULTS.roundPoints);
      showToast("+" + GAME_DEFAULTS.roundPoints + " لـ " + teamDisplayName(h.answerTeam) + " 🎉");
    } else {
      showToast("امتنع عن الاجابة — بدون نقاط");
    }
    state.honest = null;
    state.honestTurn++;
    showScreen("screen-honest-sub");
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
    $("qrNextBtn").textContent = "Next";
    makeQr("qrHolder", "main", r.items[r.step].url);
    showScreen("screen-qr");
  }

  function qrNext() {
    if (state.noword) {
      showTimerScreen("noword");
      return;
    }
    var r = state.round;
    if (!r) return;
    if (r.step === 0) {
      r.step = 1;
      showQrStep();
    } else {
      showTimerScreen("guess");
    }
  }

  // ---------- "سؤال و جواب" (سين جيم) ----------
  function renderQaPick() {
    renderCardRow("qaPickRow", SUB_CATEGORIES, toggleQaPick);
    var kids = $("qaPickRow").children;
    SUB_CATEGORIES.forEach(function (sub, i) {
      if (state.qa.picked.indexOf(sub.id) !== -1) kids[i].classList.add("selected");
    });
    updateQaStart();
  }

  function toggleQaPick(sub, btn) {
    var i = state.qa.picked.indexOf(sub.id);
    if (i !== -1) {
      state.qa.picked.splice(i, 1);
      btn.classList.remove("selected");
    } else if (state.qa.picked.length >= 6) {
      showToast("الحد الأقصى ٦ فئات");
      return;
    } else {
      state.qa.picked.push(sub.id);
      btn.classList.add("selected");
    }
    updateQaStart();
  }

  function updateQaStart() {
    $("qaStartBtn").disabled = state.qa.picked.length === 0;
  }

  function renderQaBoard() {
    var board = $("qaBoard");
    board.innerHTML = "";
    board.style.gridTemplateColumns = "repeat(" + state.qa.picked.length + ", 1fr)";
    state.qa.picked.forEach(function (id) {
      var sub = null;
      SUB_CATEGORIES.forEach(function (s) { if (s.id === id) sub = s; });
      var qs = QA_QUESTIONS[id];
      if (!sub || !qs) return;

      var col = document.createElement("div");
      col.className = "qa-col";
      var head = document.createElement("div");
      head.className = "qa-cat";
      head.textContent = sub.name;
      col.appendChild(head);

      qs.forEach(function (q, idx) {
        var key = id + "-" + idx;
        var b = document.createElement("button");
        b.type = "button";
        b.className = "qa-val";
        b.textContent = q.pts;
        if (state.qa.used[key]) b.disabled = true;
        b.addEventListener("click", function () { openQaQuestion(sub, q, key); });
        col.appendChild(b);
      });
      board.appendChild(col);
    });
  }

  function openQaQuestion(sub, q, key) {
    state.qa.current = { q: q, key: key };
    $("qaTurnLabel").textContent = "سؤال لـ «" + teamDisplayName(state.qa.turn) + "»";
    $("qaMeta").textContent = sub.name + " — " + q.pts + " نقطة";
    $("qaQuestion").textContent = q.q;
    $("qaAnswer").textContent = q.a;
    $("qaAnswer").hidden = true;
    $("qaRevealBtn").hidden = false;
    $("qaTeam1Btn").textContent = teamDisplayName(0);
    $("qaTeam2Btn").textContent = teamDisplayName(1);
    $("qaAwardRow").hidden = true;
    mountTimer("qaTimerSlot");
    startTimer();
    showScreen("screen-qa-q");
  }

  function qaReveal() {
    stopTimer();
    $("qaAnswer").hidden = false;
    $("qaRevealBtn").hidden = true;
    $("qaAwardRow").hidden = false;
  }

  function qaAward(teamIdx) {
    stopTimer();
    var c = state.qa.current;
    if (!c) return;
    if (teamIdx >= 0) {
      changeScore(teamIdx, c.q.pts);
      showToast("+" + c.q.pts + " لـ " + teamDisplayName(teamIdx) + " 🎉");
    }
    state.qa.used[c.key] = true;
    state.qa.current = null;
    state.qa.turn = 1 - state.qa.turn; // الدور للفريق الثاني
    renderQaBoard();
    showScreen("screen-qa-board");
  }

  function qaReset() {
    state.qa.used = {};
    state.qa.started = false;
    state.qa.current = null;
    $("qaResetOverlay").hidden = true;
    renderQaPick();
    showScreen("screen-qa-pick");
  }

  // ---------- جولة "ولا كلمة" ----------
  function startNowordRound() {
    var a = Math.floor(Math.random() * NOWORD_ITEMS.length);
    var b = Math.floor(Math.random() * (NOWORD_ITEMS.length - 1));
    if (b >= a) b++; // بطاقة مختلفة لكل فريق
    state.noword = { items: [NOWORD_ITEMS[a], NOWORD_ITEMS[b]], step: 0 };
    showNowordQr();
  }

  function showNowordQr() {
    var n = state.noword;
    $("qrTeamLabel").textContent = "بطاقة " + teamDisplayName(n.step) + " — صوّرها بتلفونكم 📱";
    $("qrNextBtn").textContent = "بلش اللعب";
    makeQr("qrHolder", "main", n.items[n.step].url);
    showScreen("screen-qr");
  }

  function nowordResult(right) {
    stopTimer();
    var n = state.noword;
    if (!n) return;
    if (right) {
      changeScore(n.step, GAME_DEFAULTS.roundPoints);
      showToast("+" + GAME_DEFAULTS.roundPoints + " لـ " + teamDisplayName(n.step) + " 🎉");
    } else {
      showToast("ما عرفوها — بدون نقاط");
    }
    if (n.step === 0) {
      n.step = 1;
      showNowordQr();
    } else {
      state.noword = null;
      showScreen("screen-noword-start");
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
    $("nowordPauseBtn").classList.remove("paused");
    $("qaTimerPauseBtn").classList.remove("paused");
    renderTimer();
    timer.handle = setInterval(tick, 1000);
  }

  function stopTimer() {
    if (timer.handle) { clearInterval(timer.handle); timer.handle = null; }
  }

  function pauseTimer() {
    timer.paused = !timer.paused;
    $("timerPauseBtn").classList.toggle("paused", timer.paused);
    $("nowordPauseBtn").classList.toggle("paused", timer.paused);
    $("qaTimerPauseBtn").classList.toggle("paused", timer.paused);
  }

  // العدّاد عنصر واحد — ننقله للشاشة اللي تحتاجه
  function mountTimer(slotId) {
    $(slotId).appendChild($("timerWrap"));
  }

  // شاشة العدّاد مشتركة — الأزرار تتغير حسب اللعبة
  function showTimerScreen(mode) {
    mountTimer("timerSlot");
    $("guessTimerBtns").hidden = mode !== "guess";
    $("nowordTimerBtns").hidden = mode !== "noword";
    startTimer();
    showScreen("screen-timer");
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
    $("honestAnswerBtn").addEventListener("click", function () { endHonestRound(true); });
    $("honestSkipBtn").addEventListener("click", function () { endHonestRound(false); });
    $("qaStartBtn").addEventListener("click", function () {
      state.qa.started = true;
      renderQaBoard();
      showScreen("screen-qa-board");
    });
    $("qaRevealBtn").addEventListener("click", qaReveal);
    $("qaTimerResetBtn").addEventListener("click", startTimer);
    $("qaTimerPauseBtn").addEventListener("click", pauseTimer);
    $("qaTeam1Btn").addEventListener("click", function () { qaAward(0); });
    $("qaTeam2Btn").addEventListener("click", function () { qaAward(1); });
    $("qaNoneBtn").addEventListener("click", function () { qaAward(-1); });
    $("qaResetBtn").addEventListener("click", function () { $("qaResetOverlay").hidden = false; });
    $("qaResetOkBtn").addEventListener("click", qaReset);
    $("qaResetCancelBtn").addEventListener("click", function () { $("qaResetOverlay").hidden = true; });
    $("nowordStartBtn").addEventListener("click", startNowordRound);
    $("nowordResetBtn").addEventListener("click", startTimer);
    $("nowordPauseBtn").addEventListener("click", pauseTimer);
    $("nowordRightBtn").addEventListener("click", function () { nowordResult(true); });
    $("nowordWrongBtn").addEventListener("click", function () { nowordResult(false); });
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
      state.noword = null;
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
