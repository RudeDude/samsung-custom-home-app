(function () {
  var catalog = window.QUIET_CATALOG;
  var home = document.getElementById("home");
  var photos = document.getElementById("photos");
  var photo = document.getElementById("photo");
  var photoName = document.getElementById("photo-name");
  var photoTiming = document.getElementById("photo-timing");
  var status = document.getElementById("status");
  var hdmi = document.getElementById("hdmi");
  var hdmiHint = document.getElementById("hdmi-hint");
  var rows = [];
  var focusAt = [0, 0];
  var hdmiOpen = false;
  var hdmiTimer = 0;
  var saverTimer = 0;
  var slide = {images: [], index: 0, timer: 0, nameTimer: 0, base: "", shownUrl: ""};
  var advance = loadAdvance();

  function say(text) {
    status.textContent = text;
  }

  function screensaver(on) {
    var common = window.webapis && window.webapis.appcommon;
    if (!common || !common.setScreenSaver) return;
    var states = common.AppCommonScreenSaverState || {};
    var state = on
      ? (states.SCREEN_SAVER_ON != null ? states.SCREEN_SAVER_ON : 1)
      : (states.SCREEN_SAVER_OFF != null ? states.SCREEN_SAVER_OFF : 0);
    try {
      common.setScreenSaver(state, function () {}, function () {});
    } catch (err) { /* a missing screensaver API should not stop the pictures */ }
  }

  function holdScreen() {
    screensaver(false);
    window.clearInterval(saverTimer);
    saverTimer = window.setInterval(function () { screensaver(false); }, 60000);
  }

  function releaseScreen() {
    window.clearInterval(saverTimer);
    saverTimer = 0;
    screensaver(true);
  }

  function button(item, row, col) {
    var el = document.createElement("button");
    el.className = "card" + (item.tone ? " tone-" + item.tone : "");
    el.type = "button";
    el.dataset.row = String(row);
    el.dataset.col = String(col);
    var title = document.createElement("strong");
    title.textContent = item.title;
    var detail = document.createElement("span");
    detail.textContent = item.detail || "Open";
    el.appendChild(title);
    el.appendChild(detail);
    el.addEventListener("click", function () { activate(item); });
    return el;
  }

  function render() {
    var sources = document.getElementById("sources");
    var dock = document.getElementById("dock");
    rows = [catalog.sources, catalog.apps];
    catalog.sources.forEach(function (item, col) {
      sources.appendChild(button(item, 0, col));
    });
    catalog.apps.forEach(function (item, col) {
      dock.appendChild(button(item, 1, col));
    });
    focus(0, 0);
  }

  function cell(row, col) {
    return document.querySelector('.card[data-row="' + row + '"][data-col="' + col + '"]');
  }

  function focus(row, col) {
    var current = cell(focusAt[0], focusAt[1]);
    if (current) current.tabIndex = -1;
    focusAt = [row, col];
    var next = cell(row, col);
    if (!next) return;
    next.tabIndex = 0;
    next.focus();
  }

  function move(dRow, dCol) {
    var row = focusAt[0] + dRow;
    var col = focusAt[1] + dCol;
    if (row < 0 || row >= rows.length) return;
    if (col < 0) col = 0;
    if (col >= rows[row].length) col = rows[row].length - 1;
    focus(row, col);
  }

  function activate(item) {
    if (item.action === "photos") openPhotos();
    else if (item.action === "hdmi") openHdmi(item.number);
    else launchApp(item);
  }

  function launchApp(item) {
    if (!window.tizen || !tizen.application || !tizen.application.launch) {
      say(item.title + " opens from the installed TV app.");
      return;
    }
    say("Opening " + item.title + "…");
    tizen.application.launch(item.id, function () {
      say(item.title + " opened.");
    }, function (err) {
      say(item.title + " did not open (" + (err && (err.message || err.name) || "unknown") + ").");
    });
  }

  function errText(err) {
    if (!err) return "unknown";
    return err.message || err.name || String(err);
  }

  function isHdmi(source, number) {
    if (!source || source.type == null) return false;
    var type = String(source.type).toUpperCase();
    if (type === "HDMI" + number) return true;
    return type === "HDMI" && Number(source.number) === number;
  }

  function findHdmi(info, number) {
    var lists = [info && info.connected, info && info.disconnected];
    var i, j, list;
    for (i = 0; i < lists.length; i += 1) {
      list = lists[i] || [];
      for (j = 0; j < list.length; j += 1) {
        if (isHdmi(list[j], number)) return list[j];
      }
    }
    return null;
  }

  function showHdmiWindow(source, done) {
    var rect = ["0px", "0px", "1920px", "1080px"];
    try {
      tizen.tvwindow.show(function () {
        tizen.tvwindow.setSource(source, function () { done(); }, function (err) { done(err); });
      }, function (err) { done(err); }, rect, "MAIN", "BEHIND");
    } catch (err) {
      done(err);
    }
  }

  function enterHdmi(number) {
    hdmiOpen = true;
    document.body.classList.add("hdmi-live");
    home.hidden = true;
    hdmi.hidden = false;
    hdmiHint.textContent = "HDMI " + number + ". Back returns to Quiet Launch.";
    revealHdmiHint();
  }

  function hideHdmiHint() {
    window.clearTimeout(hdmiTimer);
    hdmiTimer = 0;
    hdmiHint.classList.add("is-hidden");
  }

  function revealHdmiHint() {
    hdmiHint.classList.remove("is-hidden");
    window.clearTimeout(hdmiTimer);
    hdmiTimer = window.setTimeout(hideHdmiHint, 10000);
  }

  function closeHdmi() {
    hdmiOpen = false;
    hideHdmiHint();
    hdmi.hidden = true;
    document.body.classList.remove("hdmi-live");
    home.hidden = false;
    if (window.tizen && tizen.tvwindow && tizen.tvwindow.hide) {
      try { tizen.tvwindow.hide(function () {}, function () {}); } catch (err) { /* the launcher is already back */ }
    }
    focus(focusAt[0], focusAt[1]);
    say("Arrows move. OK opens. Back returns to Samsung Home.");
  }

  function openHdmi(number) {
    if (!window.tizen || !tizen.systeminfo || !tizen.tvwindow) {
      say("HDMI " + number + " is not available from this page. Use the TV source button.");
      return;
    }
    say("Opening HDMI " + number + "…");
    try {
      tizen.systeminfo.getPropertyValue("VIDEOSOURCE", function (info) {
        var source = findHdmi(info, number);
        if (!source) {
          say("HDMI " + number + " is not on this television.");
          return;
        }
        showHdmiWindow(source, function (err) {
          if (err) {
            say("HDMI " + number + " was refused (" + errText(err) + ").");
            return;
          }
          enterHdmi(number);
        });
      }, function (err) {
        say("HDMI " + number + " could not be listed (" + errText(err) + ").");
      });
    } catch (err) {
      say("HDMI " + number + " was refused (" + errText(err) + ").");
    }
  }

  function photoBase() {
    return String(window.QUIET_PHOTO_BASE || "").replace(/\/$/, "");
  }

  function loadManifest(url) {
    var timer;
    var timedOut = new Promise(function (_, reject) {
      timer = window.setTimeout(function () { reject(new Error("timeout")); }, 4000);
    });
    var request = fetch(url, {cache: "no-store"}).then(function (response) {
      if (!response.ok) throw new Error(String(response.status));
      return response.json();
    });
    return Promise.race([request, timedOut]).then(function (data) {
      window.clearTimeout(timer);
      return data;
    }, function (err) {
      window.clearTimeout(timer);
      throw err;
    });
  }

  function openPhotos() {
    var base = photoBase();
    var fromRemote = false;
    var remote = base ? loadManifest(base + "/manifest.json").then(function (data) {
      fromRemote = true;
      return data;
    }) : Promise.reject(new Error("no server"));
    remote.catch(function () {
      fromRemote = false;
      return loadManifest("photos/manifest.json");
    }).then(function (data) {
      var images = (data && data.images) || [];
      if (!images.length) {
        say("No pictures yet. Add image files on the computer, then open Photos again.");
        return;
      }
      slide.base = fromRemote ? base : "";
      slide.images = images;
      slide.index = 0;
      home.hidden = true;
      photos.hidden = false;
      showSlide();
      restartTimer();
      holdScreen();
    }).catch(function () {
      say("The picture list could not be read.");
    });
  }

  function imageUrl(item) {
    var url = typeof item === "string" ? item : (item && item.url) || "";
    if (/^https?:/i.test(url)) return url;
    if (!slide.base) return url;
    if (url.charAt(0) === "/") return slide.base + url;
    return slide.base + "/" + url.replace(/^\.\//, "");
  }

  function loadAdvance() {
    var saved = {unit: "seconds", seconds: 20, minutes: 1};
    try {
      var data = JSON.parse(window.localStorage.getItem("quietLaunch.advance") || "null");
      if (!data) return saved;
      if (data.unit === "seconds" || data.unit === "minutes") saved.unit = data.unit;
      if (data.seconds >= 5 && data.seconds <= 300 && data.seconds % 5 === 0) saved.seconds = data.seconds;
      if (data.minutes >= 1 && data.minutes <= 60) saved.minutes = data.minutes;
    } catch (err) { /* keep the default 20 seconds */ }
    return saved;
  }

  function saveAdvance() {
    try {
      window.localStorage.setItem("quietLaunch.advance", JSON.stringify(advance));
    } catch (err) { /* the television may block storage; the choice still applies now */ }
  }

  function advanceAmount() {
    return advance.unit === "minutes" ? advance.minutes : advance.seconds;
  }

  function advanceLabel() {
    var amount = advanceAmount();
    var word = advance.unit === "minutes"
      ? (amount === 1 ? "minute" : "minutes")
      : (amount === 1 ? "second" : "seconds");
    return "Advances every " + amount + " " + word;
  }

  function advanceMs() {
    return advance.unit === "minutes" ? advance.minutes * 60000 : advance.seconds * 1000;
  }

  function paintTiming() {
    photoTiming.textContent = advanceLabel();
  }

  function hideOverlay() {
    window.clearTimeout(slide.nameTimer);
    slide.nameTimer = 0;
    document.querySelector(".photo-caption").classList.add("is-hidden");
  }

  function revealOverlay() {
    document.querySelector(".photo-caption").classList.remove("is-hidden");
    window.clearTimeout(slide.nameTimer);
    slide.nameTimer = window.setTimeout(hideOverlay, 10000);
  }

  function showSlide() {
    var item = slide.images[slide.index];
    var url = imageUrl(item);
    if (slide.shownUrl !== url) {
      slide.shownUrl = url;
      photo.src = url;
    }
    photoName.textContent = (item && item.name) || ("Picture " + (slide.index + 1));
    paintTiming();
    revealOverlay();
  }

  function step(delta) {
    if (!slide.images.length) return;
    slide.index = (slide.index + delta + slide.images.length) % slide.images.length;
    showSlide();
    restartTimer();
  }

  function changeAdvance(direction) {
    if (advance.unit === "minutes") {
      advance.minutes = Math.min(60, Math.max(1, advance.minutes + direction));
    } else {
      advance.seconds = Math.min(300, Math.max(5, advance.seconds + direction * 5));
    }
    saveAdvance();
    paintTiming();
    revealOverlay();
    restartTimer();
  }

  function toggleAdvanceUnit() {
    advance.unit = advance.unit === "minutes" ? "seconds" : "minutes";
    saveAdvance();
    paintTiming();
    revealOverlay();
    restartTimer();
  }

  function restartTimer() {
    window.clearInterval(slide.timer);
    slide.timer = window.setInterval(function () { step(1); }, advanceMs());
  }

  function closePhotos() {
    window.clearInterval(slide.timer);
    releaseScreen();
    hideOverlay();
    photos.hidden = true;
    home.hidden = false;
    slide.shownUrl = "";
    photo.removeAttribute("src");
    focus(focusAt[0], focusAt[1]);
    say("Arrows move. OK opens. Back returns to Samsung Home.");
  }

  function onKey(event) {
    var key = event.keyCode || event.which;
    var inPhotos = !photos.hidden;
    if (key === 37 || key === 39 || key === 38 || key === 40 || key === 13 || key === 10009 || key === 10182) {
      event.preventDefault();
    }
    if (hdmiOpen) {
      if (key === 10009 || key === 10182 || key === 27) closeHdmi();
      else revealHdmiHint();
      return;
    }
    if (inPhotos) {
      if (key === 37) step(-1);
      else if (key === 39) step(1);
      else if (key === 38) changeAdvance(1);
      else if (key === 40) changeAdvance(-1);
      else if (key === 13) toggleAdvanceUnit();
      else if (key === 10009 || key === 10182 || key === 27) closePhotos();
      return;
    }
    if (key === 37) move(0, -1);
    else if (key === 39) move(0, 1);
    else if (key === 38) move(-1, 0);
    else if (key === 40) move(1, 0);
    else if (key === 13) {
      var item = rows[focusAt[0]][focusAt[1]];
      if (item) activate(item);
    } else if (key === 10009 || key === 10182) {
      launchApp({title: "Samsung Home", id: "com.samsung.tv.csfs"});
    }
  }

  function registerBack() {
    if (!window.tizen || !tizen.tvinputdevice || !tizen.tvinputdevice.registerKey) return;
    ["Return", "Exit"].forEach(function (name) {
      try { tizen.tvinputdevice.registerKey(name); } catch (err) { /* platform keys still arrive on some sets */ }
    });
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) releaseScreen();
    else if (!photos.hidden) holdScreen();
  });
  document.addEventListener("keydown", onKey);
  registerBack();
  render();
})();
