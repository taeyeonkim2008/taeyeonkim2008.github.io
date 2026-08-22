let currentLesson = -1;
let progress = {};
const STORAGE_KEY = "calcbc_progress";

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  loadProgress();
  renderNav();
  updateGlobalProgress();
  updateWelcomeStats();
  setupEventListeners();
});

// ===== Math rendering (KaTeX) =====
function renderMath(el) {
  if (!el || typeof renderMathInElement !== "function") return;
  renderMathInElement(el, {
    delimiters: [
      { left: "\\[", right: "\\]", display: true },
      { left: "\\(", right: "\\)", display: false }
    ],
    throwOnError: false
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
  let quizzes = 0, numerics = 0;
  LESSONS.forEach(l => l.sections.forEach(s => {
    if (s.type === "quiz") quizzes++;
    if (s.type === "numeric") numerics++;
  }));
  document.getElementById("totalQuizzes").textContent = quizzes;
  document.getElementById("totalExercises").textContent = numerics;
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
  document.getElementById("nextBtn").textContent = index === LESSONS.length - 1 ? "Finish the Course!" : "Next Topic";

  const body = document.getElementById("lessonBody");
  body.innerHTML = "";

  lesson.sections.forEach((section, si) => {
    const el = renderSection(section, `${lesson.id}_${si}`);
    body.appendChild(el);
  });

  renderMath(body);
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

    case "formula":
      div.innerHTML = `<div class="formula-box"><h4>${section.title}</h4><div class="fx">\\[${section.latex}\\]</div></div>`;
      break;

    case "example":
      div.appendChild(createExample(section, uid));
      break;

    case "quiz":
      div.appendChild(createQuiz(section, uid));
      break;

    case "numeric":
      div.appendChild(createNumeric(section, uid));
      break;
  }

  return div;
}

// ===== Worked Example =====
function createExample(section, uid) {
  const box = document.createElement("div");
  box.className = "example-box";
  box.innerHTML = `
    <div class="example-head">✏️ Worked Example — try it first</div>
    <div class="example-prompt">${section.prompt}</div>
    <button class="show-solution-btn">Show solution</button>
    <div class="example-solution">${section.solution}</div>
  `;

  const btn = box.querySelector(".show-solution-btn");
  const sol = box.querySelector(".example-solution");
  btn.addEventListener("click", () => {
    const open = sol.classList.toggle("visible");
    btn.textContent = open ? "Hide solution" : "Show solution";
  });

  return box;
}

// ===== Quiz =====
function createQuiz(section, uid) {
  const container = document.createElement("div");
  container.className = "quiz-container";

  let optionsHtml = section.options.map((opt, i) =>
    `<div class="quiz-option" data-index="${i}">${escapeHtml(opt)}</div>`
  ).join("");

  container.innerHTML = `
    <div class="quiz-question">${section.question}</div>
    <div class="quiz-options">${optionsHtml}</div>
    <div class="quiz-feedback" id="quizFeedback_${uid}"></div>
    <button class="quiz-submit" id="quizSubmit_${uid}">Check Answer</button>
  `;

  let selected = -1;
  const options = container.querySelectorAll(".quiz-option");
  const feedback = container.querySelector(".quiz-feedback");
  const submitBtn = container.querySelector(".quiz-submit");

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
      feedback.innerHTML = "Correct! " + section.explanation;
    } else {
      options[selected].classList.add("incorrect");
      options[section.correct].classList.add("correct");
      feedback.className = "quiz-feedback visible incorrect-fb";
      feedback.innerHTML = "Not quite. " + section.explanation;
    }
    renderMath(feedback);
    submitBtn.style.display = "none";
  });

  return container;
}

// ===== Answer parsing =====
// Students write exact answers, not just decimals: 14/3, pi/2, 2sqrt(3), 3^2.
// Parse those into a number. Returns NaN if the input isn't a valid expression.
// Only digits, operators, parentheses and the tokens pi / e / sqrt are allowed
// through, so nothing else can reach the evaluator.
function parseAnswer(raw) {
  let s = String(raw).trim().toLowerCase();
  if (!s) return NaN;

  s = s.replace(/,/g, "");                      // 1,000

  // plain number (incl. scientific notation) — the common case
  const direct = Number(s);
  if (isFinite(direct)) return direct;

  s = s.replace(/[×·]/g, "*")         // × ·
       .replace(/÷/g, "/")                 // ÷
       .replace(/[−–—]/g, "-")   // unicode minus / dashes
       .replace(/π/g, "pi")                // π
       .replace(/√\s*(\d+(?:\.\d+)?)/g, "sqrt($1)")  // √2
       .replace(/√/g, "sqrt")              // √(...)
       .replace(/\^/g, "**");

  // implicit multiplication: 2pi, 3sqrt(2), 2(1+3), pi e
  s = s.replace(/(\d)\s*(pi\b|e\b|sqrt\b|\()/g, "$1*$2");
  s = s.replace(/(pi\b|\))\s*(\d|pi\b|e\b|sqrt\b|\()/g, "$1*$2");

  // whitelist: blank out known tokens, then allow only safe characters
  const probe = s.replace(/pi/g, "#").replace(/sqrt/g, "#").replace(/\be\b/g, "#");
  if (!/^[0-9#+\-*/().\s]+$/.test(probe)) return NaN;

  const expr = s.replace(/\bpi\b/g, "Math.PI")
                .replace(/\bsqrt\b/g, "Math.sqrt")
                .replace(/\be\b/g, "Math.E");

  try {
    const v = Function('"use strict"; return (' + expr + ');')();
    return typeof v === "number" && isFinite(v) ? v : NaN;
  } catch (_) {
    return NaN;
  }
}

// ===== Numeric Free Response =====
function createNumeric(section, uid) {
  const container = document.createElement("div");
  container.className = "numeric-container";
  container.innerHTML = `
    <div class="numeric-head">🧮 Free Response</div>
    <div class="numeric-prompt">${section.prompt}</div>
    <div class="numeric-row">
      <input type="text" class="numeric-input" placeholder="e.g. 4.667 or 14/3" spellcheck="false" autocomplete="off">
      <button class="numeric-check-btn">Check</button>
    </div>
    <div class="numeric-feedback"></div>
    <div class="numeric-solution"><strong>Solution:</strong> ${section.solution}</div>
  `;

  const input = container.querySelector(".numeric-input");
  const btn = container.querySelector(".numeric-check-btn");
  const feedback = container.querySelector(".numeric-feedback");
  const solution = container.querySelector(".numeric-solution");
  let misses = 0;

  function reveal(correct) {
    solution.classList.add("visible");
    renderMath(solution);
    input.disabled = true;
    btn.disabled = true;
  }

  function check() {
    const raw = input.value.trim();
    if (!raw) return;
    const val = parseAnswer(raw);
    if (isNaN(val)) {
      feedback.className = "numeric-feedback visible fail";
      feedback.textContent = "Couldn't read that. Try a decimal (4.667), a fraction (14/3), or an exact form (pi/2, 2sqrt(3)).";
      return;
    }
    if (Math.abs(val - section.answer) <= section.tolerance) {
      feedback.className = "numeric-feedback visible pass";
      feedback.textContent = "✓ Correct!";
      reveal(true);
    } else {
      misses++;
      feedback.className = "numeric-feedback visible fail";
      feedback.textContent = misses >= 2
        ? "✗ Not yet. One more try — or give up to see the solution."
        : "✗ Not quite — check your work and try again.";
      if (misses >= 2 && !container.querySelector(".give-up-btn")) {
        const giveUp = document.createElement("button");
        giveUp.className = "numeric-check-btn give-up-btn";
        giveUp.style.background = "var(--surface3)";
        giveUp.style.color = "var(--text-muted)";
        giveUp.textContent = "Show solution";
        giveUp.addEventListener("click", () => {
          feedback.className = "numeric-feedback visible fail";
          feedback.textContent = `The answer is ${section.answer}.`;
          reveal(false);
          giveUp.disabled = true;
        });
        container.querySelector(".numeric-row").appendChild(giveUp);
      }
    }
  }

  btn.addEventListener("click", check);
  input.addEventListener("keydown", e => { if (e.key === "Enter") check(); });

  return container;
}

// ===== Helpers =====
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
