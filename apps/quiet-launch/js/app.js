(function () {
  var catalog = window.QUIET_CATALOG;
  var home = document.getElementById("home");
  var photos = document.getElementById("photos");
  var photo = document.getElementById("photo");
  var photoName = document.getElementById("photo-name");
  var status = document.getElementById("status");
  var rows = [];
  var focusAt = [0, 0];
  var slide = {images: [], index: 0, timer: 0, base: ""};

  function say(text) {
    status.textContent = text;
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

  function openHdmi(number) {
    var api = window.webapis;
    var setter = api && api.tv && api.tv.window && api.tv.window.setSource;
    if (!setter) {
      say("HDMI " + number + " is not available from this page. Use the TV source button.");
      return;
    }
    try {
      setter.call(api.tv.window, {type: "HDMI", number: number});
      say("Asked the TV for HDMI " + number + ".");
    } catch (err) {
      say("HDMI " + number + " was refused (" + err + ").");
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

  function showSlide() {
    var item = slide.images[slide.index];
    photo.src = imageUrl(item);
    photoName.textContent = (item && item.name) || ("Picture " + (slide.index + 1));
  }

  function step(delta) {
    if (!slide.images.length) return;
    slide.index = (slide.index + delta + slide.images.length) % slide.images.length;
    showSlide();
    restartTimer();
  }

  function restartTimer() {
    window.clearInterval(slide.timer);
    slide.timer = window.setInterval(function () { step(1); }, 20000);
  }

  function closePhotos() {
    window.clearInterval(slide.timer);
    photos.hidden = true;
    home.hidden = false;
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
    if (inPhotos) {
      if (key === 37) step(-1);
      else if (key === 39) step(1);
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

  document.addEventListener("keydown", onKey);
  registerBack();
  render();
})();
