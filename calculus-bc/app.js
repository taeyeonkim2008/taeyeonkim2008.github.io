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
  progress[lessonId] = true;
  saveProgress();
  updateGlobalProgress();
  renderNav();
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

// ===== Navigation =====
function renderNav() {
  const nav = document.getElementById("lessonNav");
  nav.innerHTML = "";
  LESSONS.forEach((lesson, i) => {
    const li = document.createElement("li");
    li.className = (i === currentLesson ? "active" : "") + (progress[lesson.id] ? " completed" : "");
    li.innerHTML = `<span class="nav-check">${progress[lesson.id] ? "&#10003;" : (i + 1)}</span><span class="nav-label">${lesson.title}</span>`;
    li.addEventListener("click", () => showLesson(i));
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

// ===== Numeric Free Response =====
function createNumeric(section, uid) {
  const container = document.createElement("div");
  container.className = "numeric-container";
  container.innerHTML = `
    <div class="numeric-head">🧮 Free Response</div>
    <div class="numeric-prompt">${section.prompt}</div>
    <div class="numeric-row">
      <input type="text" class="numeric-input" placeholder="Your answer..." spellcheck="false" autocomplete="off">
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
    const raw = input.value.trim().replace(/,/g, "");
    if (!raw) return;
    const val = parseFloat(raw);
    if (isNaN(val)) {
      feedback.className = "numeric-feedback visible fail";
      feedback.textContent = "Enter a number (decimals are fine).";
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
