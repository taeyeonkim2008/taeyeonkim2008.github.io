// ===== Course Review: practice drills + mock exam (Topics 6.11 - 8.13) =====
// Covers the six BC topics that sit outside Units 9 and 10. Values are
// randomized per attempt and every answer is a closed form computed here, so
// the key is derived rather than hand-typed. Built on the app's own
// components (.quiz-container, .numeric-container, .lesson-header, .nav-btn).

const CALC_REVIEW_BEST_KEY = "calcbc_review_best";
let cReview = null;

// ---------- helpers ----------
const cEsc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
const cInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const cPick = a => a[Math.floor(Math.random() * a.length)];
function cShuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const round3 = x => Math.round(x * 1000) / 1000;

// numeric question: answer computed, tolerance scaled to the magnitude
const numQ = (prompt, answer, solution, tol) => ({
  type: "numeric", prompt, answer: round3(answer),
  tolerance: tol != null ? tol : Math.max(0.01, Math.abs(answer) * 0.002),
  solution
});
const mcQ = (prompt, options, correctIndex, solution) => ({
  type: "mc", prompt, options, correct: correctIndex, solution
});
// build MC options from a correct value plus distractors, shuffled
function mcFromValues(prompt, correctVal, distractors, fmt, solution) {
  const opts = cShuffle([correctVal, ...distractors]);
  return mcQ(prompt, opts.map(fmt), opts.indexOf(correctVal), solution);
}

// ---------- topic bank ----------
const CALC_REVIEW_TOPICS = [
  {
    id: "t6-11", name: "Integration by Parts", review: "Topic 6.11",
    make: [
      // ∫₀^a x e^x dx = (a-1)e^a + 1
      () => { const a = cInt(1, 3);
        return numQ(`Evaluate \\(\\displaystyle\\int_0^{${a}} x e^{x}\\,dx\\). (Decimal or exact.)`,
          (a - 1) * Math.exp(a) + 1,
          `\\(u=x,\\ dv=e^x dx\\Rightarrow xe^x-\\int e^x dx=(x-1)e^x\\). Evaluated from 0 to ${a}: \\((${a}-1)e^{${a}}-(-1)\\approx ${round3((a-1)*Math.exp(a)+1)}\\).`); },
      // ∫₁^e ln x dx = 1  (scaled by c)
      () => { const c = cInt(1, 5);
        return numQ(`Evaluate \\(\\displaystyle\\int_1^{e} ${c === 1 ? "" : c}\\ln x\\,dx\\).`,
          c * 1,
          `\\(\\int \\ln x\\,dx = x\\ln x - x\\). From 1 to \\(e\\): \\((e-e)-(0-1)=1\\), times ${c} = ${c}.`); },
      () => mcQ(`For \\(\\displaystyle\\int x^{2}\\ln x\\,dx\\), the best choice of \\(u\\) is:`,
        [`\\(u = x^2\\)`, `\\(u = \\ln x\\)`, `\\(u = x^2\\ln x\\)`, `\\(u = dx\\)`], 1,
        `LIATE puts <strong>L</strong>ogs first. \\(u=\\ln x\\) differentiates to \\(1/x\\), which cancels against \\(dv=x^2dx\\).`),
      () => mcQ(`\\(\\displaystyle\\int x\\sin x\\,dx =\\)`,
        [`\\(-x\\cos x + \\sin x + C\\)`, `\\(x\\cos x - \\sin x + C\\)`,
         `\\(-x\\cos x - \\sin x + C\\)`, `\\(\\frac{x^2}{2}\\sin x + C\\)`], 0,
        `\\(u=x,\\ dv=\\sin x\\,dx\\Rightarrow v=-\\cos x\\): \\(-x\\cos x+\\int\\cos x\\,dx=-x\\cos x+\\sin x+C\\).`),
      // ∫₀^{π/2} x cos x dx = π/2 - 1
      () => numQ(`Evaluate \\(\\displaystyle\\int_0^{\\pi/2} x\\cos x\\,dx\\). (3 decimals.)`,
        Math.PI / 2 - 1,
        `\\(u=x,\\ dv=\\cos x\\,dx\\Rightarrow x\\sin x+\\cos x\\). At \\(\\pi/2\\): \\(\\pi/2+0\\); at 0: \\(0+1\\). Difference \\(=\\pi/2-1\\approx 0.571\\).`)
    ]
  },
  {
    id: "t6-12", name: "Linear Partial Fractions", review: "Topic 6.12",
    make: [
      // (x+k)/((x-a)(x-b)) = A/(x-a) + B/(x-b);  A = (a+k)/(a-b)
      () => { const a = cInt(1, 4), b = -cInt(1, 4), k = cInt(2, 12);
        const A = (a + k) / (a - b);
        return numQ(`If \\(\\dfrac{x+${k}}{(x-${a})(x${b < 0 ? "+" + -b : "-" + b})} = \\dfrac{A}{x-${a}} + \\dfrac{B}{x${b < 0 ? "+" + -b : "-" + b}}\\), find \\(A\\).`,
          A,
          `Cover up \\((x-${a})\\) and set \\(x=${a}\\): \\(A=\\dfrac{${a}+${k}}{${a}-(${b})}=\\dfrac{${a + k}}{${a - b}}\\approx ${round3(A)}\\).`); },
      () => { const a = cInt(1, 4), b = -cInt(1, 4), k = cInt(2, 12);
        const B = (b + k) / (b - a);
        return numQ(`If \\(\\dfrac{x+${k}}{(x-${a})(x${b < 0 ? "+" + -b : "-" + b})} = \\dfrac{A}{x-${a}} + \\dfrac{B}{x${b < 0 ? "+" + -b : "-" + b}}\\), find \\(B\\).`,
          B,
          `Cover up the second factor and set \\(x=${b}\\): \\(B=\\dfrac{${b}+${k}}{${b}-${a}}=\\dfrac{${b + k}}{${b - a}}\\approx ${round3(B)}\\).`); },
      // ∫ dx/(x(x+c)) = (1/c) ln|x/(x+c)|
      () => { const c = cInt(2, 5);
        return mcQ(`\\(\\displaystyle\\int \\frac{dx}{x(x+${c})} =\\)`,
          [`\\(\\frac{1}{${c}}\\ln\\left|\\frac{x}{x+${c}}\\right| + C\\)`,
           `\\(\\ln|x(x+${c})| + C\\)`,
           `\\(\\frac{1}{${c}}\\ln|x(x+${c})| + C\\)`,
           `\\(\\ln\\left|\\frac{x+${c}}{x}\\right| + C\\)`], 0,
          `\\(\\frac{1}{x(x+${c})}=\\frac{1/${c}}{x}-\\frac{1/${c}}{x+${c}}\\), which integrates to \\(\\frac{1}{${c}}\\ln\\left|\\frac{x}{x+${c}}\\right|+C\\).`); },
      // ∫₂^3 dx/(x(x-1)) = ln(4/3)
      () => numQ(`Evaluate \\(\\displaystyle\\int_2^{3} \\frac{dx}{x(x-1)}\\). (3 decimals.)`,
        Math.log(4 / 3),
        `\\(\\frac{1}{x(x-1)}=\\frac{1}{x-1}-\\frac{1}{x}\\), so the antiderivative is \\(\\ln\\left|\\frac{x-1}{x}\\right|\\). From 2 to 3: \\(\\ln\\frac23-\\ln\\frac12=\\ln\\frac43\\approx 0.288\\).`)
    ]
  },
  {
    id: "t6-13", name: "Improper Integrals", review: "Topic 6.13",
    make: [
      // ∫₁^∞ c/x^p dx = c/(p-1)
      () => { const c = cInt(1, 6), p = cInt(2, 5);
        return numQ(`Evaluate \\(\\displaystyle\\int_1^{\\infty} \\frac{${c}}{x^{${p}}}\\,dx\\).`,
          c / (p - 1),
          `\\(\\int_1^\\infty x^{-${p}}dx=\\left[\\frac{x^{${1 - p}}}{${1 - p}}\\right]_1^\\infty=\\frac{1}{${p - 1}}\\), times ${c} gives \\(\\frac{${c}}{${p - 1}}\\approx ${round3(c / (p - 1))}\\).`); },
      () => mcQ(`Which integral <strong>converges</strong>?`,
        [`\\(\\int_1^\\infty \\frac{dx}{x}\\)`, `\\(\\int_1^\\infty \\frac{dx}{\\sqrt{x}}\\)`,
         `\\(\\int_1^\\infty \\frac{dx}{x^{2}}\\)`, `All three diverge`], 2,
        `The p-test: \\(\\int_1^\\infty x^{-p}dx\\) converges exactly when \\(p>1\\). Here \\(p=1,\\ \\tfrac12,\\ 2\\) — only \\(p=2\\) qualifies.`),
      // ∫₀^1 dx/x^q, q<1  =  1/(1-q);  use q = 1/2, 1/3, 2/3
      () => { const [num, den] = cPick([[1, 2], [1, 3], [2, 3]]); const q = num / den;
        return numQ(`Evaluate \\(\\displaystyle\\int_0^{1} \\frac{dx}{x^{${num}/${den}}}\\) (improper at 0). (3 decimals.)`,
          1 / (1 - q),
          `\\(\\int_0^1 x^{-q}dx=\\left[\\frac{x^{1-q}}{1-q}\\right]_0^1=\\frac{1}{1-q}\\) for \\(q<1\\). With \\(q=${num}/${den}\\): \\(\\approx ${round3(1 / (1 - q))}\\).`); },
      () => mcQ(`\\(\\displaystyle\\int_0^{1}\\frac{dx}{\\sqrt{x}}\\) is improper because the integrand is unbounded at 0. It equals:`,
        [`It diverges`, `\\(2\\)`, `\\(1\\)`, `\\(\\frac{1}{2}\\)`], 1,
        `\\(\\lim_{a\\to0^+}[2\\sqrt{x}]_a^1 = 2\\). At a finite endpoint the rule flips: \\(p=\\frac12<1\\) is the convergent case.`)
    ]
  },
  {
    id: "t7-5", name: "Euler's Method", review: "Topic 7.5",
    make: [
      // dy/dx = x + y
      () => { const y0 = cInt(1, 3), h = cPick([0.5, 0.25]), n = cPick([2, 3, 4]);
        let x = 0, y = y0;
        for (let i = 0; i < n; i++) { const s = x + y; y = y + h * s; x = x + h; }
        return numQ(`Given \\(\\frac{dy}{dx} = x + y\\) with \\(y(0) = ${y0}\\), use Euler's method with \\(h = ${h}\\) and <strong>${n} step${n > 1 ? "s" : ""}</strong> to approximate \\(y(${round3(n * h)})\\). (3 decimals.)`,
          y,
          `Each step: \\(y_{new}=y+h(x+y)\\), then \\(x{+}{=}h\\). After ${n} steps from \\((0,${y0})\\) you land on \\(\\approx ${round3(y)}\\).`); },
      // dy/dx = y  (exponential)
      () => { const y0 = cInt(1, 4), h = cPick([0.5, 0.2]), n = cPick([2, 3]);
        let y = y0;
        for (let i = 0; i < n; i++) y = y + h * y;
        return numQ(`Given \\(\\frac{dy}{dx} = y\\) with \\(y(0) = ${y0}\\), use Euler's method with \\(h = ${h}\\) and <strong>${n} steps</strong> to approximate \\(y(${round3(n * h)})\\). (3 decimals.)`,
          y,
          `\\(y_{new}=y+hy=y(1+h)\\). After ${n} steps: \\(${y0}(1+${h})^{${n}}\\approx ${round3(y)}\\).`); },
      // dy/dx = 2x  (one step)
      () => { const x0 = cInt(1, 3), y0 = cInt(1, 5), h = cPick([0.1, 0.2, 0.5]);
        const y1 = y0 + h * (2 * x0);
        return numQ(`Given \\(\\frac{dy}{dx} = 2x\\) with \\(y(${x0}) = ${y0}\\), take <strong>one</strong> Euler step of size \\(h = ${h}\\). Approximate \\(y(${round3(x0 + h)})\\).`,
          y1,
          `Slope at \\((${x0},${y0})\\) is \\(2(${x0})=${2 * x0}\\). So \\(y\\approx ${y0}+${h}(${2 * x0})=${round3(y1)}\\).`); },
      () => mcQ(`If the true solution curve is <strong>concave up</strong>, Euler's method generally produces an:`,
        [`Overestimate`, `Underestimate`, `Exact value`, `Alternating over/under estimate`], 1,
        `Tangent lines lie <em>below</em> a concave-up curve, so stepping along tangents falls short — an underestimate.`)
    ]
  },
  {
    id: "t7-9", name: "Logistic Models", review: "Topic 7.9",
    make: [
      // dP/dt = kP(1 - P/L)
      () => { const k = cPick([0.2, 0.3, 0.4, 0.5]), L = cPick([200, 500, 800, 1000]), P0 = cInt(10, 60);
        return numQ(`A population follows \\(\\frac{dP}{dt} = ${k}P\\left(1 - \\frac{P}{${L}}\\right)\\) with \\(P(0)=${P0}\\). Find \\(\\lim_{t\\to\\infty} P(t)\\).`,
          L,
          `The equation is in standard logistic form, so the carrying capacity is \\(L=${L}\\) — any start between 0 and \\(L\\) approaches it.`, 0.5); },
      // dP/dt = aP - P²/m  →  L = a·m
      () => { const a = cInt(2, 6), m = cPick([25, 50, 100]);
        const L = a * m;
        return numQ(`For \\(\\frac{dP}{dt} = ${a}P - \\frac{P^{2}}{${m}}\\), find the carrying capacity.`,
          L,
          `Factor: \\(${a}P\\left(1-\\frac{P}{${L}}\\right)\\). Or set \\(\\frac{dP}{dt}=0\\): \\(P\\left(${a}-\\frac{P}{${m}}\\right)=0\\Rightarrow P=${L}\\).`, 0.5); },
      // fastest growth at L/2
      () => { const L = cPick([200, 400, 600, 900, 1200]);
        return numQ(`A logistic population has carrying capacity \\(L = ${L}\\). At what population is it growing <strong>fastest</strong>?`,
          L / 2,
          `\\(\\frac{dP}{dt}=kP(1-P/L)\\) is a downward parabola in \\(P\\), maximized at the vertex \\(P=L/2=${L / 2}\\).`, 0.5); },
      () => mcQ(`When the population \\(P\\) is very small compared with the carrying capacity, the logistic model behaves approximately like:`,
        [`Exponential growth \\(\\frac{dP}{dt}\\approx kP\\)`, `Linear growth`,
         `No growth`, `Exponential decay`], 0,
        `With \\(P\\ll L\\) the factor \\((1-P/L)\\approx 1\\), leaving \\(\\frac{dP}{dt}\\approx kP\\) — ordinary exponential growth.`)
    ]
  },
  {
    id: "t8-13", name: "Arc Length", review: "Topic 8.13",
    make: [
      // y = (2/3)x^{3/2} on [0,a]:  L = (2/3)[(1+a)^{3/2} - 1]
      () => { const a = cPick([3, 8, 15]);
        const L = (2 / 3) * (Math.pow(1 + a, 1.5) - 1);
        return numQ(`Find the length of \\(y = \\frac{2}{3}x^{3/2}\\) from \\(x=0\\) to \\(x=${a}\\). (3 decimals.)`,
          L,
          `\\(y'=x^{1/2}\\Rightarrow 1+(y')^2 = 1+x\\), so \\(L=\\int_0^{${a}}\\sqrt{1+x}\\,dx=\\frac{2}{3}\\left[(1+x)^{3/2}\\right]_0^{${a}}=\\frac{2}{3}\\left(${Math.pow(1 + a, 1.5)}-1\\right)\\approx ${round3(L)}\\).`); },
      // straight line y = mx on [0,a]:  L = a√(1+m²)
      () => { const m = cInt(1, 4), a = cInt(2, 6);
        const L = a * Math.sqrt(1 + m * m);
        return numQ(`Find the length of the line \\(y = ${m}x\\) from \\(x=0\\) to \\(x=${a}\\). (3 decimals.)`,
          L,
          `\\(y'=${m}\\), so \\(L=\\int_0^{${a}}\\sqrt{1+${m * m}}\\,dx=${a}\\sqrt{${1 + m * m}}\\approx ${round3(L)}\\). (Same as the distance formula.)`); },
      () => { const c = cInt(2, 5);
        return mcQ(`Which integral gives the arc length of \\(y = ${c}x^{2}\\) on \\([0,1]\\)?`,
          [`\\(\\int_0^1 \\sqrt{1+${4 * c * c}x^{2}}\\,dx\\)`,
           `\\(\\int_0^1 \\sqrt{1+${c}x^{2}}\\,dx\\)`,
           `\\(\\int_0^1 \\sqrt{1+${2 * c}x}\\,dx\\)`,
           `\\(\\int_0^1 (1+${4 * c * c}x^{2})\\,dx\\)`], 0,
          `\\(y'=${2 * c}x\\Rightarrow (y')^2=${4 * c * c}x^2\\). Square the <em>derivative</em>, not the function, and keep it under the root.`); },
      () => mcQ(`The arc length of \\(y=f(x)\\) on \\([a,b]\\) is:`,
        [`\\(\\int_a^b \\sqrt{1+\\left(f'(x)\\right)^{2}}\\,dx\\)`,
         `\\(\\int_a^b \\sqrt{1+f(x)^{2}}\\,dx\\)`,
         `\\(\\int_a^b \\left(1+f'(x)\\right)dx\\)`,
         `\\(\\int_a^b \\sqrt{f'(x)}\\,dx\\)`], 0,
        `Each tiny piece has length \\(\\sqrt{(dx)^2+(dy)^2}=\\sqrt{1+(f')^2}\\,dx\\).`)
    ]
  }
];

// ---------- build ----------
function buildCalcReview(topicIds, perTopic) {
  const qs = [];
  CALC_REVIEW_TOPICS.filter(t => topicIds.includes(t.id)).forEach(t => {
    cShuffle(t.make).slice(0, perTopic).forEach(mk => {
      qs.push({ ...mk(), topic: t.name, topicId: t.id, review: t.review });
    });
  });
  return cShuffle(qs);
}

// ---------- grading ----------
function cGradeOne(q, i) {
  if (q.type === "mc") {
    const sel = cReview.answers[i];
    const pass = sel === q.correct;
    return { pass, detail: pass ? "Correct." : "That's not it." };
  }
  const el = document.getElementById(`cIn_${i}`);
  const val = parseAnswer(el ? el.value : "");
  if (isNaN(val)) return { pass: false, detail: "Couldn't read that — try a decimal (4.667), a fraction (14/3), or an exact form (pi/2)." };
  const pass = Math.abs(val - q.answer) <= q.tolerance;
  return { pass, detail: pass ? "Correct." : `The answer is ${q.answer}.` };
}

function cAttempted(q, i) {
  if (q.type === "mc") return cReview.answers[i] !== undefined;
  const el = document.getElementById(`cIn_${i}`);
  return !!el && el.value.trim() !== "";
}

// ---------- rendering ----------
function cHeader(badge, title, sub) {
  return `<div class="lesson-header">
      <span class="lesson-badge">${cEsc(badge)}</span>
      <h2 class="lesson-title">${cEsc(title)}</h2>
    </div>${sub ? `<p class="cv-sub">${sub}</p>` : ""}`;
}

function openCalcReview() {
  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("lessonView").style.display = "none";
  document.getElementById("reviewView").style.display = "";
  document.querySelectorAll(".lesson-nav li.active").forEach(li => li.classList.remove("active"));
  document.getElementById("sidebar").classList.remove("open");
  renderCalcMenu();
  window.scrollTo(0, 0);
}

function renderCalcMenu() {
  let best = 0;
  try { best = parseInt(localStorage.getItem(CALC_REVIEW_BEST_KEY)) || 0; } catch (_) {}
  const view = document.getElementById("reviewView");
  view.innerHTML = cHeader("Course Review", "Practice — Topics 6.11 to 8.13",
    `Mixed practice over the six BC topics outside Units 9 and 10: integration by parts,
     partial fractions, improper integrals, Euler's method, logistic models and arc length.
     Values are randomized each attempt.${best ? `<br>Best full-exam score: <strong>${best}%</strong>` : ""}`) + `

    <div class="concept-block cv-card" id="cvFull" role="button" tabindex="0">
      <h4>Full Mock Exam</h4>
      <p>6 questions — one from every topic. Scored, with a report of what to review.</p>
    </div>
    <div class="concept-block cv-card" id="cvQuick" role="button" tabindex="0">
      <h4>Quick Quiz</h4>
      <p>4 random questions for a fast check-in.</p>
    </div>

    <h3>Drill one topic</h3>
    <p>Pick a topic and work through several problems from it.</p>
    <div class="cv-topics">
      ${CALC_REVIEW_TOPICS.map(t => `
        <div class="cv-topic" data-topic="${t.id}" role="button" tabindex="0">
          <span class="cv-topic-name">${cEsc(t.name)}</span>
          <span class="cv-topic-day">${cEsc(t.review)}</span>
        </div>`).join("")}
    </div>

    <div class="lesson-nav-buttons">
      <button class="nav-btn" id="cvBack">Back to Topics</button>
    </div>`;

  const bind = (el, fn) => {
    el.addEventListener("click", fn);
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } });
  };
  bind(document.getElementById("cvFull"), () => startCalcReview(CALC_REVIEW_TOPICS.map(t => t.id), 1, "Full Mock Exam"));
  bind(document.getElementById("cvQuick"), () => startCalcReview(cShuffle(CALC_REVIEW_TOPICS.map(t => t.id)).slice(0, 4), 1, "Quick Quiz"));
  view.querySelectorAll(".cv-topic").forEach(el => bind(el, () => {
    const t = CALC_REVIEW_TOPICS.find(x => x.id === el.dataset.topic);
    startCalcReview([t.id], Math.min(3, t.make.length), t.name);
  }));
  document.getElementById("cvBack").addEventListener("click", closeCalcReview);
  renderMath(view);
}

function startCalcReview(topicIds, perTopic, label) {
  cReview = { questions: buildCalcReview(topicIds, perTopic), answers: {}, submitted: false,
              label, isFull: label === "Full Mock Exam" };
  renderCalcReview();
  window.scrollTo(0, 0);
}

function renderCalcReview() {
  const qs = cReview.questions;
  let h = cHeader("Course Review", cReview.label,
    `${qs.length} question${qs.length > 1 ? "s" : ""} — check them as you go, or submit at the end for a score.`);

  qs.forEach((q, i) => {
    if (q.type === "mc") {
      h += `<div class="quiz-container">
          <div class="cv-q-label">Q${i + 1} &middot; ${cEsc(q.topic)}</div>
          <div class="quiz-question">${q.prompt}</div>
          <div class="quiz-options">${q.options.map((o, oi) =>
            `<div class="quiz-option" data-q="${i}" data-o="${oi}">${o}</div>`).join("")}</div>
          <div class="quiz-feedback" id="cFb_${i}"></div>
          <button class="quiz-submit" data-check="${i}">Check Answer</button>
        </div>`;
    } else {
      h += `<div class="numeric-container">
          <div class="numeric-head">🧮 Q${i + 1} &middot; ${cEsc(q.topic)}</div>
          <div class="numeric-prompt">${q.prompt}</div>
          <div class="numeric-row">
            <input type="text" class="numeric-input" id="cIn_${i}" placeholder="e.g. 4.667 or 14/3" spellcheck="false" autocomplete="off">
            <button class="numeric-check-btn" data-check="${i}">Check</button>
          </div>
          <div class="numeric-feedback" id="cFb_${i}"></div>
          <div class="numeric-solution" id="cSol_${i}"></div>
        </div>`;
    }
  });

  h += `<div class="lesson-nav-buttons">
      <button class="nav-btn" id="cvMenu">Back to Menu</button>
      <button class="nav-btn next-btn" id="cvSubmit">Submit &amp; Score</button>
    </div>`;

  const view = document.getElementById("reviewView");
  view.innerHTML = h;

  view.querySelectorAll(".quiz-option").forEach(o => o.addEventListener("click", () => {
    if (o.classList.contains("disabled")) return;
    const qi = o.dataset.q;
    view.querySelectorAll(`.quiz-option[data-q="${qi}"]`).forEach(x => x.classList.remove("selected"));
    o.classList.add("selected");
    cReview.answers[qi] = parseInt(o.dataset.o);
  }));
  view.querySelectorAll("[data-check]").forEach(b =>
    b.addEventListener("click", () => cCheck(+b.dataset.check)));
  view.querySelectorAll(".numeric-input").forEach(inp =>
    inp.addEventListener("keydown", e => { if (e.key === "Enter") cCheck(+inp.id.split("_")[1]); }));
  document.getElementById("cvSubmit").addEventListener("click", cSubmit);
  document.getElementById("cvMenu").addEventListener("click", renderCalcMenu);
  renderMath(view);
}

function cCheck(i) {
  const q = cReview.questions[i];
  const fb = document.getElementById(`cFb_${i}`);
  if (!cAttempted(q, i)) {
    fb.className = q.type === "mc" ? "quiz-feedback visible incorrect-fb" : "numeric-feedback visible fail";
    fb.textContent = "Give it a try first, then check.";
    return;
  }
  const r = cGradeOne(q, i);
  if (q.type === "mc") {
    fb.className = "quiz-feedback visible " + (r.pass ? "correct-fb" : "incorrect-fb");
    fb.innerHTML = (r.pass ? "Correct! " : "Not quite. ") + q.solution;
  } else {
    fb.className = "numeric-feedback visible " + (r.pass ? "pass" : "fail");
    fb.textContent = r.pass ? "✓ Correct!" : `✗ ${r.detail}`;
    const sol = document.getElementById(`cSol_${i}`);
    sol.className = "numeric-solution visible";
    sol.innerHTML = `<strong>Solution:</strong> ${q.solution}`;
    renderMath(sol);
  }
  renderMath(fb);
}

function cSubmit() {
  if (cReview.submitted) return;
  const answered = cReview.questions.filter((q, i) => cAttempted(q, i)).length;
  if (answered < cReview.questions.length &&
      !confirm(`You've answered ${answered} of ${cReview.questions.length}. Submit anyway?`)) return;
  cReview.submitted = true;

  const details = [];
  let score = 0;
  cReview.questions.forEach((q, i) => {
    const r = cGradeOne(q, i);
    if (r.pass) score++;
    details.push({ q, i, pass: r.pass, detail: r.detail });
  });
  cResults(score, details);
}

function cResults(score, details) {
  const total = details.length;
  const pct = Math.round((score / total) * 100);
  if (cReview.isFull) {
    try {
      const best = parseInt(localStorage.getItem(CALC_REVIEW_BEST_KEY)) || 0;
      if (pct > best) localStorage.setItem(CALC_REVIEW_BEST_KEY, String(pct));
    } catch (_) {}
  }

  let verdict, cls;
  if (pct === 100) { verdict = "Perfect — these six are solid."; cls = "great"; }
  else if (pct >= 80) { verdict = "Strong. Tighten the misses below."; cls = "good"; }
  else if (pct >= 60) { verdict = "Decent — drill the topics below."; cls = "ok"; }
  else { verdict = "Worth working back through these topics."; cls = "low"; }

  const missed = [];
  details.filter(d => !d.pass).forEach(d => {
    if (!missed.some(m => m.topic === d.q.topic)) missed.push({ topic: d.q.topic, review: d.q.review });
  });

  let h = cHeader("Results", cReview.label, "") +
    `<div class="cv-score ${cls}">
       <div class="cv-score-num">${score}<span>/${total}</span></div>
       <div class="cv-score-verdict">${pct}% — ${verdict}</div>
     </div>`;

  h += missed.length
    ? `<div class="warning-box"><strong>Review these:</strong><ul>${
        missed.map(m => `<li><strong>${cEsc(m.topic)}</strong> — ${cEsc(m.review)}</li>`).join("")}</ul></div>`
    : `<div class="info-box"><strong>Nothing missed.</strong> Every topic came back clean.</div>`;

  h += `<h3>Question breakdown</h3>`;
  details.forEach(d => {
    h += `<div class="concept-block cv-result ${d.pass ? "pass" : "fail"}">
        <h4>${d.pass ? "&#10003;" : "&#10007;"} Q${d.i + 1} &middot; ${cEsc(d.q.topic)}</h4>
        <p>${d.q.prompt}</p>
        ${d.pass ? "" : `<p class="cv-solution"><strong>Solution:</strong> ${d.q.solution}</p>`}
      </div>`;
  });

  h += `<div class="lesson-nav-buttons">
      <button class="nav-btn" id="cvMenu2">Back to Menu</button>
      <button class="nav-btn next-btn" id="cvAgain">Try again — new values</button>
    </div>`;

  const view = document.getElementById("reviewView");
  view.innerHTML = h;
  renderMath(view);
  window.scrollTo(0, 0);
  document.getElementById("cvAgain").addEventListener("click", () => {
    const ids = [...new Set(cReview.questions.map(q => q.topicId))];
    startCalcReview(ids, cReview.isFull ? 1 : 3, cReview.label);
  });
  document.getElementById("cvMenu2").addEventListener("click", renderCalcMenu);
}

function closeCalcReview() {
  cReview = null;
  document.getElementById("reviewView").style.display = "none";
  showLesson(currentLesson >= 0 ? currentLesson : 0);
}

document.addEventListener("DOMContentLoaded", () => {
  const b = document.getElementById("reviewBtn");
  if (b) b.addEventListener("click", openCalcReview);
  const w = document.getElementById("reviewWelcomeBtn");
  if (w) w.addEventListener("click", openCalcReview);
});
