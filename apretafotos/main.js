(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var limits = data.limits || { maxFiles: 40, maxFileSizeMB: 25, maxWidthOrHeightDefault: 1600 };

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var escHTML = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  var LIB_COMPRESSION = "lib/vendor/browser-image-compression.js";
  var LIB_JSZIP = "lib/vendor/jszip.min.js";
  var LIB_URL = new URL(LIB_COMPRESSION, document.baseURI).href;

  function loadScript(src) {
    return new Promise(function (ok, err) {
      if (document.querySelector('script[src="' + src + '"]')) return ok();
      var s = document.createElement("script");
      s.src = src;
      s.onload = ok;
      s.onerror = function () { err(new Error(src)); };
      document.body.appendChild(s);
    });
  }

  function saveBlob(blob, name) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    document.dispatchEvent(new CustomEvent("apretafotos:downloaded"));
  }

  function formatBytes(n) {
    if (n == null || isNaN(n)) return "—";
    var v, unit;
    if (n < 1024 * 1024) { v = n / 1024; unit = "KB"; }
    else { v = n / (1024 * 1024); unit = "MB"; }
    var s = v.toFixed(v >= 100 ? 0 : 1).replace(".", ",");
    return s + " " + unit;
  }

  function extForType(type) {
    if (type === "image/webp") return "webp";
    if (type === "image/png") return "png";
    return "jpg";
  }

  function isHeic(file) {
    return /\.heic$|\.heif$/i.test(file.name || "") || /heic|heif/i.test(file.type || "");
  }

  function isSupportedImage(file) {
    return /^image\/(jpeg|png|webp)$/.test(file.type || "") ||
      /\.(jpe?g|png|webp)$/i.test(file.name || "");
  }

  // -------- Feature detection ------------------------------------------------
  function detectCapabilities() {
    var ok = !!(window.File && window.Blob && window.FileReader &&
      document.createElement("canvas").getContext && URL && URL.createObjectURL);
    var webpSupported = false;
    try {
      webpSupported = document.createElement("canvas").toDataURL("image/webp").indexOf("data:image/webp") === 0;
    } catch (e) { webpSupported = false; }
    return { ok: ok, webpSupported: webpSupported };
  }

  // -------- State --------------------------------------------------------
  var state = {
    mode: "target",
    files: [],          // {id, file, status, errorMsg, originalSize, resultBlob, finalSize, outName, hitTarget}
    selectedId: null,
    engineLoaded: false,
    zipLoaded: false,
    caps: null,
    nextId: 1
  };

  var toolCard = $("#toolCard");

  function setCardState(s) { toolCard.setAttribute("data-state", s); }

  // -------- Mounts (presets) ----------------------------------------------
  function mountPresets() {
    var wrap = $("#presetButtons");
    if (!wrap || wrap.children.length > 0 || !data.presets) return;
    wrap.innerHTML = data.presets.map(function (p) {
      return '<button type="button" class="preset-btn" data-target-kb="' + p.targetKB +
        '" data-preset-id="' + escHTML(p.id) + '" aria-pressed="false" title="' + escHTML(p.note) + '">' +
        escHTML(p.label) + '</button>';
    }).join("");
  }

  function updateLimitsUI() {
    var lf = $("#limitFiles"), ls = $("#limitSize");
    if (lf) lf.textContent = limits.maxFiles;
    if (ls) ls.textContent = limits.maxFileSizeMB;
    var rw = $("#resizeWidth");
    if (rw) rw.value = limits.maxWidthOrHeightDefault;
  }

  // -------- Tabs ------------------------------------------------------------
  function initTabs() {
    var tabTarget = $("#tabTarget"), tabQuality = $("#tabQuality");
    var panelTarget = $("#panelTarget"), panelQuality = $("#panelQuality");
    function activate(mode) {
      state.mode = mode;
      var toTarget = mode === "target";
      tabTarget.setAttribute("aria-selected", String(toTarget));
      tabQuality.setAttribute("aria-selected", String(!toTarget));
      panelTarget.hidden = !toTarget;
      panelQuality.hidden = toTarget;
      panelTarget.classList.toggle("is-hidden", !toTarget);
      panelQuality.classList.toggle("is-hidden", toTarget);
      scheduleReprocess();
    }
    tabTarget.addEventListener("click", function () { activate("target"); });
    tabQuality.addEventListener("click", function () { activate("quality"); });
  }

  // -------- Presets / target input ------------------------------------------
  function initTargetControls() {
    var wrap = $("#presetButtons");
    var targetInput = $("#targetKB");
    wrap.addEventListener("click", function (e) {
      var btn = e.target.closest(".preset-btn");
      if (!btn) return;
      $$(".preset-btn", wrap).forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      btn.setAttribute("aria-pressed", "true");
      targetInput.value = btn.dataset.targetKb;
      scheduleReprocess();
    });
    targetInput.addEventListener("input", function () {
      $$(".preset-btn", wrap).forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.targetKb === targetInput.value));
      });
      scheduleReprocess();
    });
  }

  function initQualityControls() {
    var slider = $("#qualitySlider"), out = $("#qualityValue");
    slider.addEventListener("input", function () { out.textContent = slider.value; });
    slider.addEventListener("change", function () { scheduleReprocess(); });
  }

  function initOptionControls() {
    var optResize = $("#optResize"), resizeWidth = $("#resizeWidth");
    var optWebp = $("#optWebp"), optExif = $("#optExif");

    function syncResize() { resizeWidth.disabled = !optResize.checked; }
    syncResize();
    optResize.addEventListener("change", function () { syncResize(); scheduleReprocess(); });
    resizeWidth.addEventListener("change", scheduleReprocess);
    optWebp.addEventListener("change", scheduleReprocess);
    optExif.addEventListener("change", scheduleReprocess);
  }

  // -------- Reprocess debounce ------------------------------------------
  var reprocessTimer = null;
  function scheduleReprocess() {
    if (!state.files.length) return;
    clearTimeout(reprocessTimer);
    reprocessTimer = setTimeout(function () { runCompression(state.files); }, 250);
  }

  function getSettings() {
    return {
      mode: state.mode,
      targetKB: Math.max(10, Number($("#targetKB").value) || 500),
      quality: Math.min(100, Math.max(1, Number($("#qualitySlider").value) || 80)),
      resize: $("#optResize").checked,
      resizeWidth: Math.max(100, Number($("#resizeWidth").value) || limits.maxWidthOrHeightDefault),
      webp: $("#optWebp").checked && state.caps.webpSupported,
      stripExif: $("#optExif").checked
    };
  }

  // -------- Compression -----------------------------------------------------
  function compressOne(file, settings) {
    var opts = {
      useWebWorker: true,
      libURL: LIB_URL,
      preserveExif: !settings.stripExif
    };
    if (settings.webp) opts.fileType = "image/webp";
    if (settings.resize) opts.maxWidthOrHeight = settings.resizeWidth;
    if (settings.mode === "target") {
      opts.maxSizeMB = settings.targetKB / 1024;
      opts.initialQuality = 0.92;
    } else {
      opts.initialQuality = settings.quality / 100;
    }
    return window.imageCompression(file, opts);
  }

  function validateAndQueue(fileList) {
    var incoming = Array.prototype.slice.call(fileList);
    if (!incoming.length) return;

    var room = limits.maxFiles - state.files.length;
    var overflow = incoming.length > room;
    if (room <= 0) {
      showError("Ya tienes " + limits.maxFiles + " archivos cargados, el máximo del lote. Descarga o reinicia antes de añadir más.");
      return;
    }
    var accepted = incoming.slice(0, room);
    if (overflow) {
      showError("Has soltado más de " + limits.maxFiles + " archivos en total: solo se procesarán los primeros " + limits.maxFiles + ".");
    }

    var entries = accepted.map(function (file) {
      var entry = {
        id: state.nextId++, file: file, status: "pending", errorMsg: "",
        originalSize: file.size, resultBlob: null, finalSize: null, outName: "", hitTarget: null
      };
      if (isHeic(file)) {
        entry.status = "error";
        entry.errorMsg = "HEIC no soportado todavía. Expórtala como JPG desde el iPhone (Compartir → Opciones de foto → Formato más compatible) y vuelve a subirla.";
      } else if (!isSupportedImage(file)) {
        entry.status = "error";
        entry.errorMsg = "Formato no admitido. Usa JPG, PNG o WebP.";
      } else if (file.size > limits.maxFileSizeMB * 1024 * 1024) {
        entry.status = "error";
        entry.errorMsg = "Supera los " + limits.maxFileSizeMB + " MB permitidos por archivo.";
      }
      return entry;
    });

    state.files = state.files.concat(entries);
    hideError();
    renderTable();
    $("#resultsWrap").hidden = false;
    runCompression(entries.filter(function (e) { return e.status !== "error"; }));
  }

  function runCompression(entries) {
    var toRun = entries.filter(function (e) { return true; });
    if (!toRun.length) { renderTable(); updateSummary(); return; }

    setCardState("working");
    var settings = getSettings();

    var ensureEngine = state.engineLoaded ? Promise.resolve() : (function () {
      $("#engineStatus").hidden = false;
      $("#engineStatus").innerHTML = '<span class="spinner" aria-hidden="true"></span> Preparando el motor de compresión… (solo la primera vez)';
      return loadScript(LIB_COMPRESSION).then(function () { state.engineLoaded = true; });
    })();

    ensureEngine.then(function () {
      $("#engineStatus").hidden = true;
      toRun.forEach(function (e) { e.status = "working"; e.errorMsg = ""; });
      renderTable();

      var queue = toRun.slice();
      var CONCURRENCY = 3;
      var active = 0;
      var done = 0;

      return new Promise(function (resolveAll) {
        function pump() {
          if (!queue.length && active === 0) { resolveAll(); return; }
          while (active < CONCURRENCY && queue.length) {
            let entry = queue.shift();
            active++;
            processEntry(entry, settings)
              .catch(function (err) {
                entry.status = "error";
                entry.errorMsg = humanCompressError(err);
              })
              .then(function () {
                active--; done++;
                renderRow(entry);
                updateSummary();
                pump();
              });
          }
        }
        pump();
      });
    }).then(function () {
      setCardState("done");
      if (state.selectedId == null) {
        var firstOk = state.files.find(function (e) { return e.status === "done"; });
        if (firstOk) selectRow(firstOk.id);
      } else {
        var stillThere = state.files.find(function (e) { return e.id === state.selectedId; });
        if (stillThere && stillThere.status === "done") renderCompare(stillThere);
      }
    }).catch(function (err) {
      $("#engineStatus").hidden = true;
      showError("No se ha podido preparar el motor de compresión en este navegador. Prueba a recargar la página o usar otro navegador. (" + (err && err.message ? err.message : err) + ")");
      setCardState("error");
    });
  }

  function processEntry(entry, settings) {
    return compressOne(entry.file, settings).then(function (blob) {
      if (entry.resultBlob) { try { URL.revokeObjectURL(entry._resultUrl); } catch (e) {} }
      entry.resultBlob = blob;
      entry.finalSize = blob.size;
      entry.status = "done";
      entry.hitTarget = settings.mode !== "target" || blob.size <= settings.targetKB * 1024;
      var ext = extForType(blob.type || entry.file.type);
      var base = (entry.file.name || "imagen").replace(/\.[^.]+$/, "");
      entry.outName = base + "-comprimida." + ext;
    });
  }

  function humanCompressError(err) {
    var msg = err && err.message ? err.message : String(err);
    if (/memory|allocat/i.test(msg)) return "La imagen es demasiado grande para procesarla en este dispositivo.";
    return "No se ha podido comprimir esta imagen.";
  }

  // -------- Rendering ---------------------------------------------------
  function renderTable() {
    var body = $("#resultsBody");
    body.innerHTML = state.files.map(rowHTML).join("");
    $$("tr[data-row-id]", body).forEach(function (tr) {
      tr.addEventListener("click", function (e) {
        if (e.target.closest(".dl-one")) return;
        selectRow(Number(tr.dataset.rowId));
      });
    });
    $$(".dl-one", body).forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var entry = state.files.find(function (f) { return f.id === Number(btn.dataset.rowId); });
        if (entry && entry.resultBlob) saveBlob(entry.resultBlob, entry.outName);
      });
    });
  }

  function renderRow(entry) {
    var tr = $('tr[data-row-id="' + entry.id + '"]');
    if (!tr) return renderTable();
    tr.outerHTML = rowHTML(entry);
    var newTr = $('tr[data-row-id="' + entry.id + '"]');
    newTr.addEventListener("click", function (e) {
      if (e.target.closest(".dl-one")) return;
      selectRow(entry.id);
    });
    var btn = $(".dl-one", newTr);
    if (btn) btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (entry.resultBlob) saveBlob(entry.resultBlob, entry.outName);
    });
    if (state.selectedId === entry.id) newTr.classList.add("is-selected");
  }

  function rowHTML(entry) {
    var thumbSrc = entry._thumbUrl || (entry._thumbUrl = URL.createObjectURL(entry.file));
    var selected = state.selectedId === entry.id ? " is-selected" : "";
    if (entry.status === "error") {
      return '<tr data-row-id="' + entry.id + '" class="' + selected.trim() + '">' +
        '<td><img class="thumb" src="' + thumbSrc + '" alt="" loading="lazy"></td>' +
        '<td class="fname">' + escHTML(entry.file.name) + '</td>' +
        '<td class="num">' + formatBytes(entry.originalSize) + '</td>' +
        '<td colspan="2" class="row-error">' + escHTML(entry.errorMsg) + '</td>' +
        '<td></td></tr>';
    }
    if (entry.status === "working" || entry.status === "pending") {
      return '<tr data-row-id="' + entry.id + '" class="' + selected.trim() + '">' +
        '<td><img class="thumb" src="' + thumbSrc + '" alt="" loading="lazy"></td>' +
        '<td class="fname">' + escHTML(entry.file.name) + '</td>' +
        '<td class="num">' + formatBytes(entry.originalSize) + '</td>' +
        '<td colspan="2"><span class="spinner" aria-hidden="true"></span> comprimiendo…</td>' +
        '<td></td></tr>';
    }
    var savedPct = Math.max(0, Math.round((1 - entry.finalSize / entry.originalSize) * 100));
    var warn = entry.hitTarget === false ? ' title="No se ha podido bajar más de este peso sin degradar demasiado la imagen."' : "";
    return '<tr data-row-id="' + entry.id + '" class="' + selected.trim() + '">' +
      '<td><img class="thumb" src="' + thumbSrc + '" alt="" loading="lazy"></td>' +
      '<td class="fname">' + escHTML(entry.file.name) + '</td>' +
      '<td class="num">' + formatBytes(entry.originalSize) + '</td>' +
      '<td class="num"' + warn + '>' + formatBytes(entry.finalSize) + (entry.hitTarget === false ? " ⚠️" : "") + '</td>' +
      '<td class="saved">−' + savedPct + '%</td>' +
      '<td><button type="button" class="dl-one" data-row-id="' + entry.id + '">Descargar</button></td></tr>';
  }

  function selectRow(id) {
    state.selectedId = id;
    $$("#resultsBody tr").forEach(function (tr) {
      tr.classList.toggle("is-selected", Number(tr.dataset.rowId) === id);
    });
    var entry = state.files.find(function (f) { return f.id === id; });
    if (entry && entry.status === "done") renderCompare(entry);
  }

  function renderCompare(entry) {
    var wrap = $("#compareWrap");
    wrap.hidden = false;
    var afterUrl = entry._afterUrl || (entry._afterUrl = URL.createObjectURL(entry.resultBlob));
    var beforeUrl = entry._thumbUrl || (entry._thumbUrl = URL.createObjectURL(entry.file));
    $("#compareAfter").src = afterUrl;
    $("#compareBefore").src = beforeUrl;
    $("#compareName").textContent = entry.file.name;
    var slider = $("#compareSlider");
    slider.value = 50;
    $("#compareBeforeWrap").style.clipPath = "inset(0 50% 0 0)";
  }

  function initCompareSlider() {
    var slider = $("#compareSlider");
    slider.addEventListener("input", function () {
      $("#compareBeforeWrap").style.clipPath = "inset(0 " + (100 - slider.value) + "% 0 0)";
    });
  }

  function updateSummary() {
    var done = state.files.filter(function (f) { return f.status === "done"; });
    var summary = $("#resultsSummary");
    if (!done.length) { summary.textContent = ""; return; }
    var origTotal = done.reduce(function (a, f) { return a + f.originalSize; }, 0);
    var finalTotal = done.reduce(function (a, f) { return a + f.finalSize; }, 0);
    var savedBytes = Math.max(0, origTotal - finalTotal);
    var pct = origTotal ? Math.round((savedBytes / origTotal) * 100) : 0;
    summary.innerHTML = "Has ahorrado <span class=\"num\">" + formatBytes(savedBytes) + "</span> · <span class=\"num\">" + pct + "%</span> del lote (" + done.length + " imagen" + (done.length === 1 ? "" : "es") + ")";
  }

  // -------- Dropzone / input --------------------------------------------
  function initDropzone() {
    var dz = $("#dropzone"), input = $("#fileInput");
    input.addEventListener("change", function () {
      validateAndQueue(input.files);
      input.value = "";
    });
    ["dragenter", "dragover"].forEach(function (ev) {
      dz.addEventListener(ev, function (e) {
        e.preventDefault(); e.stopPropagation();
        dz.classList.add("is-dragover");
      });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      dz.addEventListener(ev, function (e) {
        e.preventDefault(); e.stopPropagation();
        dz.classList.remove("is-dragover");
      });
    });
    dz.addEventListener("drop", function (e) {
      var dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length) validateAndQueue(dt.files);
    });
    document.addEventListener("paste", function (e) {
      var items = (e.clipboardData && e.clipboardData.files) || [];
      if (items.length) validateAndQueue(items);
    });
  }

  // -------- ZIP download --------------------------------------------------
  function initZip() {
    $("#downloadZipBtn").addEventListener("click", function () {
      var done = state.files.filter(function (f) { return f.status === "done"; });
      if (!done.length) return;
      var btn = $("#downloadZipBtn");
      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Preparando ZIP…";
      (state.zipLoaded ? Promise.resolve() : loadScript(LIB_JSZIP).then(function () { state.zipLoaded = true; }))
        .then(function () {
          var zip = new window.JSZip();
          var used = {};
          done.forEach(function (entry) {
            var name = entry.outName;
            if (used[name]) { used[name]++; name = name.replace(/(\.[^.]+)$/, "-" + used[name] + "$1"); }
            else used[name] = 1;
            zip.file(name, entry.resultBlob);
          });
          return zip.generateAsync({ type: "blob" });
        })
        .then(function (blob) { saveBlob(blob, "apretafotos.zip"); })
        .catch(function () { showError("No se ha podido generar el ZIP. Descarga las imágenes una a una."); })
        .then(function () { btn.disabled = false; btn.textContent = original; });
    });
  }

  // -------- Reset -----------------------------------------------------------
  function initReset() {
    $("#resetBtn").addEventListener("click", function () {
      state.files.forEach(function (f) {
        try { if (f._thumbUrl) URL.revokeObjectURL(f._thumbUrl); } catch (e) {}
        try { if (f._afterUrl) URL.revokeObjectURL(f._afterUrl); } catch (e) {}
      });
      state.files = [];
      state.selectedId = null;
      $("#resultsBody").innerHTML = "";
      $("#resultsSummary").textContent = "";
      $("#resultsWrap").hidden = true;
      $("#compareWrap").hidden = true;
      hideError();
      setCardState("idle");
    });
  }

  // -------- Download ad dialog ---------------------------------------------
  function initAdDialog() {
    var dialog = $("#adDialog");
    if (!dialog || typeof dialog.showModal !== "function") return;
    document.addEventListener("apretafotos:downloaded", function () {
      if (dialog.open) return;
      setTimeout(function () {
        try { dialog.showModal(); } catch (e) {}
      }, 350);
    });
    $("#adDialogClose").addEventListener("click", function () { dialog.close(); });
    $("#adDialogContinue").addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });
  }

  // -------- Errors ------------------------------------------------------
  function showError(msg) {
    var el = $("#errorState");
    el.hidden = false;
    el.textContent = msg;
  }
  function hideError() { $("#errorState").hidden = true; }

  // -------- Boot --------------------------------------------------------
  function boot() {
    $("#year").textContent = new Date().getFullYear();
    state.caps = detectCapabilities();

    safe(mountPresets, "mountPresets");
    safe(updateLimitsUI, "updateLimitsUI");

    if (!state.caps.ok) {
      setCardState("error");
      showError("Tu navegador no soporta esta herramienta (necesita soporte de File, Blob y Canvas). Prueba con una versión reciente de Chrome, Firefox, Safari o Edge.");
      $("#dropzone").setAttribute("aria-disabled", "true");
      $("#fileInput").disabled = true;
      return;
    }

    if (!state.caps.webpSupported) {
      var webpCk = $("#optWebp");
      webpCk.checked = false;
      webpCk.disabled = true;
      $("#webpNote").textContent = "No disponible en este navegador (no puede exportar WebP).";
    }

    safe(initTabs, "initTabs");
    safe(initTargetControls, "initTargetControls");
    safe(initQualityControls, "initQualityControls");
    safe(initOptionControls, "initOptionControls");
    safe(initDropzone, "initDropzone");
    safe(initZip, "initZip");
    safe(initReset, "initReset");
    safe(initCompareSlider, "initCompareSlider");
    safe(initAdDialog, "initAdDialog");

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
