var pyReady = false;
let currentLesson = -1;
let progress = {};
const STORAGE_KEY = "py30_progress";

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  loadProgress();
  renderNav();
  updateGlobalProgress();
  updateWelcomeStats();
  setupEventListeners();
  spawnPyWorker();
});

// ===== Python runner =====
// Python executes in a Web Worker (background thread), so user code can
// never freeze the page. A watchdog kills runs that exceed the timeout —
// almost always an infinite loop — and restarts the runtime automatically.
const PY_TIMEOUT_MS = 10000;
let pyWorker = null;
let pyWorkerReady = null;
let pyMsgId = 0;
const pyPending = new Map();

function spawnPyWorker() {
  pyReady = false;
  const status = document.getElementById("pyodideStatus");
  pyWorker = new Worker("py-worker.js");
  pyWorkerReady = new Promise(resolve => {
    pyWorker.onmessage = (e) => {
      if (e.data.type === "ready") {
        pyReady = true;
        if (status) {
          status.textContent = "Python runtime ready";
          status.classList.add("ready");
        }
        resolve();
        return;
      }
      const pending = pyPending.get(e.data.id);
      if (pending) {
        clearTimeout(pending.timer);
        pyPending.delete(e.data.id);
        pending.resolve(e.data);
      }
    };
    pyWorker.onerror = () => {
      if (status) status.textContent = "Python runtime failed to load — code editors disabled";
    };
  });
}

function restartPyWorker() {
  try { pyWorker.terminate(); } catch (_) {}
  for (const [, pending] of pyPending) {
    clearTimeout(pending.timer);
    pending.resolve({ timeout: true, output: "", error: null, result: null });
  }
  pyPending.clear();
  const status = document.getElementById("pyodideStatus");
  if (status) {
    status.classList.remove("ready");
    status.textContent = "Restarting Python runtime...";
  }
  spawnPyWorker();
}

// Returns { output, error, result, timeout } — never rejects.
async function runPython(code, opts = {}) {
  await pyWorkerReady;
  return new Promise(resolve => {
    const id = ++pyMsgId;
    const timer = setTimeout(() => {
      pyPending.delete(id);
      restartPyWorker();
      resolve({ timeout: true, output: "", error: null, result: null });
    }, opts.timeoutMs || PY_TIMEOUT_MS);
    pyPending.set(id, { resolve, timer });
    pyWorker.postMessage({ id, code, stdin: opts.stdin ?? null, isolate: !!opts.isolate });
  });
}

// ===== Progress =====
function loadProgress() {
  try {
    progress = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    progress = {};
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function markComplete(lessonId) {
  setComplete(lessonId, true);
}

// Set (or clear) a single lesson's completion without touching anything else.
// NOTE: we store an explicit `false` rather than deleting the key. The cloud
// sync merges completed lessons as a union, so a missing key would get
// resurrected from the other device on the next pull — an explicit false wins.
function setComplete(lessonId, done) {
  progress[lessonId] = !!done;
  saveProgress();
  updateGlobalProgress();
  renderNav();
  updateCompleteToggle();
}

function updateGlobalProgress() {
  const total = LESSONS.length;
  const done = LESSONS.filter(l => progress[l.id]).length;
  const pct = Math.round((done / total) * 100);
  document.getElementById("globalProgress").style.width = pct + "%";
  document.getElementById("progressLabel").textContent = pct + "% complete";
}

function updateWelcomeStats() {
  document.getElementById("totalLessons").textContent = LESSONS.length;
  let exercises = 0, quizzes = 0;
  LESSONS.forEach(l => l.sections.forEach(s => {
    if (s.type === "exercise") exercises++;
    if (s.type === "quiz") quizzes++;
  }));
  document.getElementById("totalExercises").textContent = exercises;
  document.getElementById("totalQuizzes").textContent = quizzes;
}


// Reflects the current lesson's completion state on the footer toggle button.
function updateCompleteToggle() {
  const btn = document.getElementById("completeToggle");
  if (!btn || currentLesson < 0 || !LESSONS[currentLesson]) return;
  const done = !!progress[LESSONS[currentLesson].id];
  btn.textContent = done ? "\u2713 Completed \u2014 click to undo" : "Mark as complete";
  btn.classList.toggle("is-complete", done);
}

// ===== Navigation =====
function renderNav() {
  const nav = document.getElementById("lessonNav");
  nav.innerHTML = "";
  LESSONS.forEach((lesson, i) => {
    const li = document.createElement("li");
    const done = !!progress[lesson.id];
    li.className = (i === currentLesson ? "active" : "") + (done ? " completed" : "");
    li.innerHTML = `<span class="nav-check${done ? " toggleable" : ""}"${done ? ' title="Click to mark as not complete"' : ""}>${done ? "&#10003;" : (i + 1)}</span><span class="nav-label">${lesson.title}</span>`;
    li.addEventListener("click", () => showLesson(i));
    if (done) {
      li.querySelector(".nav-check").addEventListener("click", (e) => {
        e.stopPropagation();          // un-check instead of navigating
        setComplete(lesson.id, false);
      });
    }
    nav.appendChild(li);
  });
}

function setupEventListeners() {
  document.getElementById("startBtn").addEventListener("click", () => {
    const first = LESSONS.findIndex(l => !progress[l.id]);
    showLesson(first >= 0 ? first : 0);
  });
  document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentLesson > 0) showLesson(currentLesson - 1);
  });
  document.getElementById("nextBtn").addEventListener("click", () => {
    markComplete(LESSONS[currentLesson].id);
    if (currentLesson < LESSONS.length - 1) showLesson(currentLesson + 1);
  });
  document.getElementById("resetProgress").addEventListener("click", () => {
    if (confirm("Reset all progress? This cannot be undone.")) {
      progress = {};
      saveProgress();
      currentLesson = -1;
      renderNav();
      updateGlobalProgress();
      document.getElementById("welcomeScreen").style.display = "";
      document.getElementById("lessonView").style.display = "none";
    }
  });
  document.getElementById("sidebarToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });
  const completeToggle = document.getElementById("completeToggle");
  if (completeToggle) {
    completeToggle.addEventListener("click", () => {
      const id = LESSONS[currentLesson].id;
      setComplete(id, !progress[id]);
    });
  }
}

// ===== Lesson Rendering =====
function showLesson(index) {
  currentLesson = index;
  const lesson = LESSONS[index];

  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("lessonView").style.display = "";
  document.getElementById("lessonBadge").textContent = lesson.badge;
  document.getElementById("lessonTitle").textContent = lesson.title;
  document.getElementById("prevBtn").disabled = index === 0;
  document.getElementById("nextBtn").textContent = index === LESSONS.length - 1 ? "Finish the Course!" : "Next Day";

  const body = document.getElementById("lessonBody");
  body.innerHTML = "";

  lesson.sections.forEach((section, si) => {
    const el = renderSection(section, `${lesson.id}_${si}`);
    body.appendChild(el);
  });

  if (typeof renderOriginalPanel === "function") renderOriginalPanel(index);

  renderNav();
  updateCompleteToggle();
  document.getElementById("sidebar").classList.remove("open");
  window.scrollTo(0, 0);
}

function renderSection(section, uid) {
  const div = document.createElement("div");

  switch (section.type) {
    case "text":
      div.innerHTML = section.content;
      break;

    case "code-block":
      div.innerHTML = `<div class="code-block">${escapeHtml(section.code)}</div>`;
      break;

    case "editor":
      div.appendChild(createEditor(section, uid));
      break;

    case "quiz":
      div.appendChild(createQuiz(section, uid));
      break;

    case "exercise":
      div.appendChild(createExercise(section, uid));
      break;
  }

  return div;
}

// ===== Code Editor =====
function createEditor(section, uid) {
  const container = document.createElement("div");
  if (section.description) {
    const desc = document.createElement("p");
    desc.textContent = section.description;
    desc.style.fontSize = ".9rem";
    desc.style.color = "var(--text-muted)";
    desc.style.marginBottom = ".5rem";
    container.appendChild(desc);
  }

  const editorWrap = document.createElement("div");
  editorWrap.className = "editor-container";
  editorWrap.innerHTML = `
    <div class="editor-header">
      <span class="editor-title"><span class="editor-dot"></span> Python</span>
      <div class="editor-actions">
        <button class="reset-code-btn" data-uid="${uid}">Reset</button>
        <button class="run-btn" data-uid="${uid}">Run &#9654;</button>
      </div>
    </div>
    <textarea class="code-input" id="editor_${uid}" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off">${section.starterCode}</textarea>
    <div class="output-container" id="output_${uid}">
      <div class="output-label">Output</div>
      <pre class="output-text" id="outputText_${uid}"></pre>
    </div>
  `;

  container.appendChild(editorWrap);

  setTimeout(() => {
    const textarea = document.getElementById(`editor_${uid}`);
    const runBtn = editorWrap.querySelector(".run-btn");
    const resetBtn = editorWrap.querySelector(".reset-code-btn");
    // The view can be swapped (another lesson, or Course Review) before this
    // deferred callback runs — bail out rather than throwing on missing nodes.
    if (!textarea || !runBtn || !resetBtn) return;

    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + "    " + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }
    });

    runBtn.addEventListener("click", () => runCode(uid));
    resetBtn.addEventListener("click", () => {
      textarea.value = section.starterCode;
      const out = document.getElementById(`output_${uid}`);
      out.classList.remove("visible");
    });
  }, 0);

  return container;
}

async function runCode(uid, extraCode, onResult) {
  if (!pyReady) {
    showOutput(uid, "Python runtime is still loading. Please wait...", true);
    return;
  }

  const textarea = document.getElementById(`editor_${uid}`);
  const code = textarea.value;

  const runBtn = textarea.closest(".editor-container").querySelector(".run-btn");
  const runBtnLabel = runBtn.innerHTML;
  runBtn.disabled = true;
  runBtn.textContent = "Running...";

  let fullCode = code;
  if (extraCode) fullCode += "\n" + extraCode;

  const r = await runPython(fullCode);

  if (r.timeout) {
    showOutput(uid,
      "⏱ Stopped after 10 seconds — this looks like an infinite loop!\n" +
      "Check that your loop condition eventually becomes False (or add a break),\n" +
      "then press Run again. The Python runtime is restarting in the background.",
      true);
    if (onResult) onResult("FAIL: timed out — possible infinite loop");
  } else if (r.error) {
    if (r.output) showOutput(uid, r.output + "\n" + r.error, true);
    else showOutput(uid, r.error, true);
    if (onResult) onResult("FAIL: " + r.error.split("\n").pop());
  } else {
    showOutput(uid, r.output || "(No output)", false);
    if (onResult) onResult(r.result);
  }

  runBtn.disabled = false;
  runBtn.innerHTML = runBtnLabel;
}

function showOutput(uid, text, isError) {
  const container = document.getElementById(`output_${uid}`);
  const pre = document.getElementById(`outputText_${uid}`);
  container.classList.add("visible");
  pre.textContent = text;
  pre.className = "output-text" + (isError ? " error" : "");
}

// ===== Quiz =====
function createQuiz(section, uid) {
  const container = document.createElement("div");
  container.className = "quiz-container";

  let optionsHtml = section.options.map((opt, i) =>
    `<div class="quiz-option" data-index="${i}" data-uid="${uid}">${escapeHtml(opt)}</div>`
  ).join("");

  container.innerHTML = `
    <div class="quiz-question">${section.question}</div>
    <div class="quiz-options" id="quizOptions_${uid}">${optionsHtml}</div>
    <div class="quiz-feedback" id="quizFeedback_${uid}"></div>
    <button class="quiz-submit" id="quizSubmit_${uid}">Check Answer</button>
  `;

  setTimeout(() => {
    let selected = -1;
    const options = container.querySelectorAll(".quiz-option");
    const feedback = document.getElementById(`quizFeedback_${uid}`);
    const submitBtn = document.getElementById(`quizSubmit_${uid}`);
    if (!feedback || !submitBtn) return;   // view swapped before this ran

    options.forEach(opt => {
      opt.addEventListener("click", () => {
        if (opt.classList.contains("disabled")) return;
        options.forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        selected = parseInt(opt.dataset.index);
      });
    });

    submitBtn.addEventListener("click", () => {
      if (selected === -1) return;
      options.forEach(o => o.classList.add("disabled"));

      if (selected === section.correct) {
        options[selected].classList.add("correct");
        feedback.className = "quiz-feedback visible correct-fb";
        feedback.textContent = "Correct! " + section.explanation;
      } else {
        options[selected].classList.add("incorrect");
        options[section.correct].classList.add("correct");
        feedback.className = "quiz-feedback visible incorrect-fb";
        feedback.textContent = "Not quite. " + section.explanation;
      }
      submitBtn.style.display = "none";
    });
  }, 0);

  return container;
}

// ===== Exercise =====
function createExercise(section, uid) {
  const container = document.createElement("div");
  container.className = "exercise-container";

  const promptDiv = document.createElement("div");
  promptDiv.className = "exercise-prompt";
  promptDiv.innerHTML = section.prompt;

  const header = document.createElement("div");
  header.className = "exercise-header";
  header.innerHTML = `<span class="exercise-icon">&#128187;</span><span class="exercise-label">Exercise</span>`;

  container.appendChild(header);
  container.appendChild(promptDiv);

  const editorWrap = document.createElement("div");
  editorWrap.style.borderTop = "none";
  editorWrap.innerHTML = `
    <div class="editor-container" style="border-radius:0;border-top:0">
      <div class="editor-header">
        <span class="editor-title"><span class="editor-dot"></span> Your Solution</span>
        <div class="editor-actions">
          <button class="reset-code-btn" data-uid="${uid}">Reset</button>
          <button class="run-btn" data-uid="${uid}" style="background:var(--accent);color:#00222b">Submit &#10003;</button>
        </div>
      </div>
      <textarea class="code-input" id="editor_${uid}" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off">${section.starterCode}</textarea>
      <div class="output-container" id="output_${uid}">
        <div class="output-label">Output</div>
        <pre class="output-text" id="outputText_${uid}"></pre>
      </div>
    </div>
    <div class="exercise-result" id="result_${uid}"></div>
  `;

  container.appendChild(editorWrap);

  setTimeout(() => {
    const textarea = document.getElementById(`editor_${uid}`);
    const runBtn = editorWrap.querySelector(".run-btn");
    const resetBtn = editorWrap.querySelector(".reset-code-btn");
    // The view can be swapped (another lesson, or Course Review) before this
    // deferred callback runs — bail out rather than throwing on missing nodes.
    if (!textarea || !runBtn || !resetBtn) return;

    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + "    " + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }
    });

    runBtn.addEventListener("click", () => {
      runCode(uid, section.testCode, (result) => {
        const el = document.getElementById(`result_${uid}`);
        el.classList.add("visible");
        if (result && result.startsWith("PASS")) {
          el.className = "exercise-result visible pass";
          el.textContent = "All tests passed!";
        } else {
          el.className = "exercise-result visible fail";
          el.textContent = result || "Something went wrong.";
        }
      });
    });

    resetBtn.addEventListener("click", () => {
      textarea.value = section.starterCode;
      document.getElementById(`output_${uid}`).classList.remove("visible");
      document.getElementById(`result_${uid}`).classList.remove("visible");
    });
  }, 0);

  return container;
}

// ===== Helpers =====
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
