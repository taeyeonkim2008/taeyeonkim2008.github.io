// ===== Cross-device progress sync =====
// Progress lives in localStorage (per device). This module mirrors it to a
// tiny cloud key-value store (textdb.online) under a key derived from a
// user-chosen "sync phrase". Enter the same phrase on another device and the
// two merge: completed lessons are unioned, exam best score is the max. If
// the network or store is unavailable, the app keeps working locally and
// retries on the next change or focus.

(function () {
  const SYNC_READ = "https://textdb.online/";
  const SYNC_WRITE = "https://textdb.online/update/";
  const APP_ID = "pytutor";
  const SYNC_KEYS = { pytutor_progress: "union", pytutor_exam_best: "max" };
  const PHRASE_STORAGE = "pysync_phrase";
  const PUSH_POLL_MS = 3000;

  let remoteKey = null;
  let lastPushed = null;
  let statusEl = null;
  let btnEl = null;

  // --- hashing (phrase -> storage key) ---
  async function sha256hex(str) {
    if (globalThis.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
    }
    // Fallback for non-secure contexts: not cryptographic, fine for a study app
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
  }

  // --- local state <-> typed object ---
  function readLocal() {
    const out = {};
    for (const [k, mode] of Object.entries(SYNC_KEYS)) {
      if (mode === "union") {
        try { out[k] = JSON.parse(localStorage.getItem(k)) || {}; } catch { out[k] = {}; }
      } else {
        out[k] = parseInt(localStorage.getItem(k)) || 0;
      }
    }
    return out;
  }

  function writeLocal(state) {
    for (const [k, mode] of Object.entries(SYNC_KEYS)) {
      if (mode === "union") localStorage.setItem(k, JSON.stringify(state[k] || {}));
      else localStorage.setItem(k, String(state[k] || 0));
    }
  }

  function mergeStates(a, b) {
    const m = {};
    for (const [k, mode] of Object.entries(SYNC_KEYS)) {
      if (mode === "union") m[k] = Object.assign({}, b[k], a[k]);
      else m[k] = Math.max(a[k] || 0, b[k] || 0);
    }
    return m;
  }

  function refreshUI() {
    try {
      loadProgress();
      renderNav();
      updateGlobalProgress();
    } catch (e) { /* app not ready yet */ }
  }

  // --- network ---
  function fullKey() {
    return `pysync-${remoteKey.slice(0, 40)}-${APP_ID}`;
  }

  async function pull() {
    if (!remoteKey) return;
    try {
      const res = await fetch(SYNC_READ + fullKey());
      if (!res.ok) { setStatus("warn"); return; }
      const text = (await res.text()).trim();
      if (!text) { setStatus("ok"); return; } // first device on this phrase
      const remote = JSON.parse(text);
      const local = readLocal();
      const merged = mergeStates(local, remote);
      if (JSON.stringify(merged) !== JSON.stringify(local)) {
        writeLocal(merged);
        refreshUI();
      }
      setStatus("ok");
    } catch (e) {
      setStatus("warn");
    }
  }

  async function push(serialized) {
    if (!remoteKey) return;
    try {
      const res = await fetch(
        SYNC_WRITE + "?key=" + encodeURIComponent(fullKey()) +
        "&value=" + encodeURIComponent(serialized)
      );
      const body = await res.json();
      if (res.ok && body.status === 1) {
        lastPushed = serialized;
        setStatus("ok");
      } else {
        setStatus("warn");
      }
    } catch (e) {
      setStatus("warn");
    }
  }

  function startLoop() {
    setInterval(() => {
      if (!remoteKey) return;
      const cur = JSON.stringify(readLocal());
      if (cur !== lastPushed) push(cur);
    }, PUSH_POLL_MS);
    window.addEventListener("focus", () => pull());
  }

  // --- UI ---
  function setStatus(state) {
    if (!statusEl) return;
    if (!remoteKey) {
      statusEl.textContent = "Progress saved on this device only";
      statusEl.className = "sync-status";
      btnEl.textContent = "Set up cross-device sync";
      return;
    }
    if (state === "ok") {
      statusEl.textContent = "✓ Syncing progress across devices";
      statusEl.className = "sync-status ok";
    } else {
      statusEl.textContent = "⚠ Sync unavailable — progress saved locally";
      statusEl.className = "sync-status warn";
    }
    btnEl.textContent = "Change sync phrase";
  }

  async function applyPhrase(phrase) {
    phrase = (phrase || "").trim();
    if (!phrase) return;
    localStorage.setItem(PHRASE_STORAGE, phrase);
    remoteKey = await sha256hex(phrase);
    lastPushed = null; // force a push after merge
    await pull();
  }

  function promptForPhrase() {
    const current = localStorage.getItem(PHRASE_STORAGE) || "";
    const phrase = prompt(
      "Pick a sync phrase (like a password — something only you would guess).\n" +
      "Enter the SAME phrase on your other devices to link them.",
      current
    );
    if (phrase !== null) applyPhrase(phrase);
  }

  function injectUI() {
    const footer = document.querySelector(".sidebar-footer");
    if (!footer) return;
    const box = document.createElement("div");
    box.className = "sync-box";
    statusEl = document.createElement("div");
    statusEl.className = "sync-status";
    btnEl = document.createElement("button");
    btnEl.className = "sync-btn";
    btnEl.addEventListener("click", promptForPhrase);
    box.appendChild(statusEl);
    box.appendChild(btnEl);
    footer.insertBefore(box, footer.firstChild);
    setStatus("ok");
  }

  document.addEventListener("DOMContentLoaded", async () => {
    injectUI();
    const phrase = localStorage.getItem(PHRASE_STORAGE);
    if (phrase) {
      remoteKey = await sha256hex(phrase);
      setStatus("ok");
      await pull();
    }
    startLoop();
  });

  // exposed for debugging/testing
  window.__pysync = { pull, push: () => push(JSON.stringify(readLocal())), applyPhrase };
})();
