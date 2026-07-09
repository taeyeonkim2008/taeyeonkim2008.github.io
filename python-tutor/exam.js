// ===== Mock Exam Engine (procedurally generated, no timer) =====
// Every attempt builds 10 fresh questions with randomized values. For any
// question that asks you to predict output, the correct answer is computed by
// actually running the generated code through Python (Pyodide) — so the key is
// always correct and you get effectively unlimited unique exams.

const EXAM_BEST_KEY = "pytutor_exam_best";

// ===== State =====
let examState = null;

// ===== Small helpers =====
function examEscape(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function normalizeOutput(s) {
  return String(s)
    .replace(/\r/g, "")
    .split("\n")
    .map(line => line.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n+$/, "");
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rint(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pyStr(x) { return JSON.stringify(x); } // valid Python literal for ASCII strings/lists/dicts

// ===== Run generated Python to compute an answer key (in the worker) =====
async function pyCapture(code) {
  const r = await runPython(code, { isolate: true });
  if (r.timeout || r.error) return "ERROR";
  return normalizeOutput(r.output);
}

// ===== JS reference implementations (for building randomized test cases) =====
const WORD_POOL = ["python", "banana", "keyboard", "elephant", "umbrella", "rhythm",
  "computer", "language", "function", "variable", "syntax", "monkey", "ocean", "guitar"];

function countVowelsJS(s) { return (s.toLowerCase().match(/[aeiou]/g) || []).length; }
function reverseJS(s) { return s.split("").reverse().join(""); }
function countEvensJS(arr) { return arr.filter(n => n % 2 === 0).length; }
function freqJS(words) { const d = {}; words.forEach(w => d[w] = (d[w] || 0) + 1); return d; }

// ===== Distractors for grid/pattern MC questions =====
function makeDistractors(correct) {
  const lines = correct.split("\n");
  const set = new Set();
  set.add(lines.slice().reverse().join("\n"));                                  // upside-down
  set.add(lines.map(l => l.split("").reverse().join("")).join("\n"));           // mirrored
  if (/[GL]/.test(correct))                                                     // swap G/L
    set.add(correct.replace(/G/g, "§").replace(/L/g, "G").replace(/§/g, "L"));
  if (/\d/.test(correct))                                                       // shift digits
    set.add(correct.replace(/\d/g, d => String((parseInt(d) + 1) % 10)));
  set.delete(correct);
  const arr = [...set].filter(x => x && x !== correct);
  let pad = 0;
  while (arr.length < 3) arr.push(lines.join(" ") + " ".repeat(++pad));
  return arr.slice(0, 3);
}

// ===== Question generators (one per slot) =====
const GEN = {
  // Slot 1: nested-loop grid / pattern (multiple choice)
  async pattern() {
    const kind = choice(["gle", "mult", "triangle"]);
    let code;
    if (kind === "gle") {
      const m = choice([3, 4]);
      code =
`for n in range(${m}):
    for k in range(${m}):
        if n > k:
            print(" G ", end='')
        elif n < k:
            print(" L ", end='')
        else:
            print(" E ", end='')
    print()`;
    } else if (kind === "mult") {
      const n = choice([3, 4]);
      code =
`for i in range(1, ${n + 1}):
    for j in range(1, ${n + 1}):
        print(i * j, end=' ')
    print()`;
    } else {
      const n = choice([4, 5]);
      code =
`for i in range(1, ${n + 1}):
    print("*" * i)`;
    }
    const correct = await pyCapture(code);
    const options = shuffle([correct, ...makeDistractors(correct)]);
    return {
      type: "mc",
      prompt: "What does this print?",
      code,
      options,
      correct: options.indexOf(correct),
      explain: "Trace it row by row: run the outer loop once at a time, and for each outer value walk the whole inner loop before moving on."
    };
  },

  // Slot 2: for-loop accumulator / counter (predict)
  async forLoop() {
    const v = choice(["sum", "count", "step"]);
    let code;
    if (v === "sum") {
      const a = rint(1, 4), b = rint(7, 12);
      code = `total = 0\nfor i in range(${a}, ${b}):\n    total += i\nprint(total)`;
    } else if (v === "count") {
      const a = rint(2, 3), b = rint(3, 4);
      code = `c = 0\nfor i in range(${a}):\n    for j in range(${b}):\n        c += 1\nprint(c)`;
    } else {
      const a = rint(2, 4), b = rint(20, 30);
      code = `total = 0\nfor i in range(0, ${b}, ${a}):\n    total += i\nprint(total)`;
    }
    return {
      type: "predict",
      prompt: "What number is printed?",
      code,
      expected: await pyCapture(code),
      explain: "Step through each iteration and update the accumulator. For nested loops, the inner loop runs fully for every outer iteration."
    };
  },

  // Slot 3: while loop (predict)
  async whileLoop() {
    if (Math.random() < 0.5) {
      const start = rint(9, 16), step = choice([2, 3, 4]);
      const code = `i = ${start}\nwhile i > 0:\n    print(i, end=' ')\n    i -= ${step}`;
      return {
        type: "predict",
        prompt: "What is the exact output? (values separated by single spaces)",
        code,
        expected: await pyCapture(code),
        explain: "Print the value, then subtract the step each pass, until the condition becomes false."
      };
    } else {
      const n = rint(1000, 9999999);
      const code = `n = ${n}\ncount = 0\nwhile n > 0:\n    count += 1\n    n = n // 10\nprint(count)`;
      return {
        type: "predict",
        prompt: "What number is printed?",
        code,
        expected: await pyCapture(code),
        explain: "Integer-dividing by 10 strips one digit each pass, so the loop counts the number of digits."
      };
    }
  },

  // Slot 4: string slicing (predict)
  async slice() {
    const w = choice(["PYTHON", "COMPUTER", "PROGRAM", "VARIABLE", "FUNCTION", "INTEGER"]);
    const v = choice(["range", "reverse", "step", "fromend", "open"]);
    let code;
    if (v === "range") { const i = rint(0, 2), j = rint(i + 2, w.length); code = `print("${w}"[${i}:${j}])`; }
    else if (v === "reverse") code = `print("${w}"[::-1])`;
    else if (v === "step") code = `print("${w}"[::2])`;
    else if (v === "fromend") { const i = rint(2, 4); code = `print("${w}"[-${i}:])`; }
    else { const i = rint(1, 3); code = `print("${w}"[${i}:])`; }
    return {
      type: "predict",
      prompt: "What is printed? (Type the exact text, no quotes.)",
      code,
      expected: await pyCapture(code),
      explain: "Slicing is [start:stop:step] — start inclusive, stop exclusive. A negative step walks backwards; a negative index counts from the end."
    };
  },

  // Slot 5: arithmetic // and % (predict)
  async arith() {
    const v = choice(["divmod", "power", "floorneg", "precedence"]);
    let code;
    if (v === "divmod") { const a = rint(13, 98), b = rint(2, 9); code = `print(${a} // ${b}, ${a} % ${b})`; }
    else if (v === "power") { const a = rint(2, 5), b = rint(2, 4), c = rint(10, 40), d = rint(2, 6); code = `print(${a} ** ${b} + ${c} // ${d})`; }
    else if (v === "floorneg") { const a = rint(-40, -7), b = rint(2, 6); code = `print(${a} // ${b})`; }
    else { const a = rint(2, 6), b = rint(2, 5), c = rint(3, 9); code = `print(${a} + ${b} * ${c})`; }
    return {
      type: "predict",
      prompt: "What is the exact output?",
      code,
      expected: await pyCapture(code),
      explain: "Apply precedence: ** first, then * / // %, then + -. // floors toward negative infinity, % is the remainder."
    };
  },

  // Slot 6: boolean / relational logic (predict)
  async boolean() {
    const v = choice(["and", "ornot", "chain"]);
    let code;
    if (v === "and") { const a = rint(1, 9), b = rint(1, 9), c = rint(1, 9), d = rint(1, 9); code = `print(${a} > ${b} and ${c} < ${d})`; }
    else if (v === "ornot") { const a = rint(1, 9), b = rint(1, 9), c = rint(1, 9), d = rint(1, 9); code = `print(not (${a} == ${b}) or ${c} < ${d})`; }
    else { const xs = shuffle([rint(1, 4), rint(5, 8), rint(9, 12)]); code = `print(${xs[0]} < ${xs[1]} < ${xs[2]})`; }
    return {
      type: "predict",
      prompt: "What is printed? (True or False)",
      code,
      expected: await pyCapture(code),
      explain: "'and' needs both sides true; 'or' needs at least one; 'not' flips it. Python also allows chained comparisons like a < b < c."
    };
  },

  // Slot 7: write a program that reads input (program)
  program() {
    const kind = choice(["largest", "sumuntil", "counteven"]);
    if (kind === "largest") {
      const nums = Array.from({ length: 5 }, () => rint(1, 99));
      // guarantee a unique max so the answer is unambiguous
      const m = Math.max(...nums);
      if (nums.filter(n => n === m).length > 1) nums[0] = m + 1;
      const expected = String(Math.max(...nums));
      return {
        type: "program",
        prompt: "Write a program that reads 5 integers (one per line) with <code>input()</code> and prints the <strong>largest</strong>. Print only the number.",
        starter: "# Read 5 integers and print the largest\n",
        stdin: nums.map(String),
        expected,
        explain: "Read each with int(input()), keep a running maximum (start it at the first value), update it whenever a bigger value appears, then print it."
      };
    } else if (kind === "sumuntil") {
      const nums = Array.from({ length: rint(3, 5) }, () => rint(1, 20));
      const expected = String(nums.reduce((a, b) => a + b, 0));
      return {
        type: "program",
        prompt: "Write a program that keeps reading integers with <code>input()</code> and adds them up, stopping when <code>0</code> is entered. Print only the total.",
        starter: "# Sum integers until 0 is entered\n",
        stdin: nums.map(String).concat(["0"]),
        expected,
        explain: "Use a while loop: read a number, break if it's 0, otherwise add it to a running total, then print the total."
      };
    } else {
      const nums = Array.from({ length: 4 }, () => rint(1, 50));
      const expected = String(countEvensJS(nums));
      return {
        type: "program",
        prompt: "Write a program that reads 4 integers with <code>input()</code> and prints how many are <strong>even</strong>. Print only the number.",
        starter: "# Count how many of 4 integers are even\n",
        stdin: nums.map(String),
        expected,
        explain: "Read each int, test n % 2 == 0, and count the ones that pass."
      };
    }
  },

  // Slot 8: write a counting function (code)
  funcCount() {
    if (Math.random() < 0.5) {
      const words = Array.from({ length: 4 }, () => choice(WORD_POOL));
      const asserts = words.map(w => `    assert count_vowels(${pyStr(w)}) == ${countVowelsJS(w)}`).join("\n");
      return {
        type: "code",
        prompt: "Write a function <code>count_vowels(s)</code> that returns how many vowels (a, e, i, o, u) are in <code>s</code>. Case-insensitive.",
        starter: "def count_vowels(s):\n    # your code here\n    pass\n",
        testCode: `try:\n${asserts}\n    __result = "PASS"\nexcept Exception as e:\n    __result = "FAIL: " + str(e)`,
        explain: "Loop over s.lower() and count each character that is in the string \"aeiou\"."
      };
    } else {
      const lists = Array.from({ length: 3 }, () => Array.from({ length: rint(3, 6) }, () => rint(1, 30)));
      const asserts = lists.map(l => `    assert count_evens(${pyStr(l)}) == ${countEvensJS(l)}`).join("\n");
      return {
        type: "code",
        prompt: "Write a function <code>count_evens(nums)</code> that returns how many numbers in the list <code>nums</code> are even.",
        starter: "def count_evens(nums):\n    # your code here\n    pass\n",
        testCode: `try:\n${asserts}\n    assert count_evens([]) == 0\n    __result = "PASS"\nexcept Exception as e:\n    __result = "FAIL: " + str(e)`,
        explain: "Loop through nums, test each with n % 2 == 0, and increment a counter."
      };
    }
  },

  // Slot 9: write a function that builds output (code)
  funcBuild() {
    if (Math.random() < 0.5) {
      const words = Array.from({ length: 3 }, () => choice(WORD_POOL));
      const asserts = words.map(w => `    assert reverse(${pyStr(w)}) == ${pyStr(reverseJS(w))}`).join("\n");
      return {
        type: "code",
        prompt: "Write a function <code>reverse(s)</code> that returns the string <code>s</code> reversed — <strong>without</strong> using <code>[::-1]</code>.",
        starter: "def reverse(s):\n    # your code here\n    pass\n",
        testCode: `try:\n${asserts}\n    assert reverse("") == ""\n    __result = "PASS"\nexcept Exception as e:\n    __result = "FAIL: " + str(e)`,
        explain: "Build a result string by walking each character and prepending it: result = char + result."
      };
    } else {
      const ns = shuffle([1, rint(2, 3), rint(4, 5)]);
      const star = n => Array.from({ length: n }, (_, i) => "*".repeat(i + 1)).join("\n");
      const asserts = ns.map(n => `    assert stars(${n}) == ${pyStr(star(n))}`).join("\n");
      return {
        type: "code",
        prompt: "Write a function <code>stars(n)</code> that returns a triangle string: rows of 1, 2, … n stars joined by newlines. For <code>n = 3</code> it returns <code>\"*\\n**\\n***\"</code>.",
        starter: "def stars(n):\n    # your code here\n    pass\n",
        testCode: `try:\n${asserts}\n    __result = "PASS"\nexcept Exception as e:\n    __result = "FAIL: " + str(e)`,
        explain: "Build each row as \"*\" * i for i from 1 to n, collect them in a list, then return \"\\n\".join(rows)."
      };
    }
  },

  // Slot 10: dictionary function (code)
  funcDict() {
    if (Math.random() < 0.5) {
      const pool = ["a", "b", "c", "d"];
      const words = Array.from({ length: rint(5, 8) }, () => choice(pool));
      const expected = freqJS(words);
      return {
        type: "code",
        prompt: "Write a function <code>freq(words)</code> that returns a dictionary mapping each word in <code>words</code> to how many times it appears.",
        starter: "def freq(words):\n    # your code here\n    pass\n",
        testCode: `try:\n    assert freq(${pyStr(words)}) == ${pyStr(expected)}\n    assert freq([]) == {}\n    __result = "PASS"\nexcept Exception as e:\n    __result = "FAIL: " + str(e)`,
        explain: "Start with an empty dict and use d[word] = d.get(word, 0) + 1 for each word."
      };
    } else {
      const keys = shuffle(["x", "y", "z", "w"]).slice(0, 3);
      const vals = shuffle([rint(1, 3), rint(4, 6), rint(7, 9)]); // distinct → unique max
      const d = {}; keys.forEach((k, i) => d[k] = vals[i]);
      const top = keys[vals.indexOf(Math.max(...vals))];
      return {
        type: "code",
        prompt: "Write a function <code>top_key(d)</code> that returns the key with the largest value in dictionary <code>d</code>.",
        starter: "def top_key(d):\n    # your code here\n    pass\n",
        testCode: `try:\n    assert top_key(${pyStr(d)}) == ${pyStr(top)}\n    assert top_key({"a": 1}) == "a"\n    __result = "PASS"\nexcept Exception as e:\n    __result = "FAIL: " + str(e)`,
        explain: "Track the best key while looping over d: if d[key] beats the best value so far, update the best key."
      };
    }
  }
};

const EXAM_SLOTS = [
  { topic: "Nested loops (output)",            review: "Lesson 7: For Loops",                       gen: GEN.pattern },
  { topic: "For-loop accumulation",            review: "Lesson 7: For Loops",                       gen: GEN.forLoop },
  { topic: "While loops",                      review: "Lesson 6: While Loops",                     gen: GEN.whileLoop },
  { topic: "String slicing",                   review: "Lesson 3: Strings",                         gen: GEN.slice },
  { topic: "Arithmetic (// and %)",            review: "Lesson 2: Operators",                       gen: GEN.arith },
  { topic: "Boolean & relational logic",       review: "Lesson 2: Operators",                       gen: GEN.boolean },
  { topic: "Writing a program (input + loop)", review: "Lesson 4: Input/Output & Lesson 6/7: Loops", gen: GEN.program },
  { topic: "Writing a function (counting)",    review: "Lesson 9: Functions",                       gen: GEN.funcCount },
  { topic: "Writing a function (building)",    review: "Lesson 3/8: Strings & Lists",               gen: GEN.funcBuild },
  { topic: "Dictionaries",                     review: "Lesson 11: Tuples & Dictionaries",          gen: GEN.funcDict }
];

async function buildExam() {
  const questions = [];
  for (let i = 0; i < EXAM_SLOTS.length; i++) {
    const slot = EXAM_SLOTS[i];
    const q = await slot.gen();
    questions.push({ ...q, slotIndex: i, topic: slot.topic, review: slot.review, points: 10 });
  }
  return shuffle(questions);
}

// ===== Grade a code/program answer (runs in the worker, isolated) =====
async function runExamPython(userCode, opts) {
  if (!pyReady) return { pass: false, detail: "Python runtime not loaded yet.", output: "" };

  let fullCode = userCode || "";
  if (opts.testCode) fullCode += "\n" + opts.testCode;

  const r = await runPython(fullCode, { stdin: opts.stdin || [], isolate: true });

  if (r.timeout) {
    return {
      pass: false,
      detail: "⏱ Stopped after 10 seconds — likely an infinite loop. Check your loop's exit condition and try again.",
      output: ""
    };
  }
  if (r.error) {
    return { pass: false, detail: "Error while running your code: " + r.error.split("\n").pop(), output: r.output };
  }

  if (opts.testCode) {
    const res = r.result == null ? "" : String(r.result);
    return { pass: res.startsWith("PASS"), detail: res || "No result produced.", output: r.output };
  }
  const ok = normalizeOutput(r.output) === normalizeOutput(opts.expected);
  return {
    pass: ok,
    detail: ok ? "Output matched." : `Expected:\n${opts.expected}\n\nYour output:\n${r.output || "(nothing)"}`,
    output: r.output
  };
}

// ===== Run user code just to show its output (no grading) =====
async function runUserOutput(userCode, stdin) {
  if (!pyReady) return { output: "", error: "Python runtime not loaded yet." };
  const r = await runPython(userCode || "", { stdin: stdin || [], isolate: true });
  if (r.timeout) {
    return {
      output: "",
      error: "⏱ Stopped after 10 seconds — this looks like an infinite loop! Check your loop's exit condition and run again."
    };
  }
  return { output: r.output, error: r.error };
}

async function runQuestionCode(idx) {
  const q = examState.questions[idx];
  const el = document.getElementById(`examCode_${idx}`);
  const out = document.getElementById(`examRun_${idx}`);
  if (!el || !out) return;

  out.style.display = "block";
  out.className = "exam-run-output";
  out.innerHTML = `<div class="exam-run-label">Running...</div>`;

  const stdin = q.type === "program" ? (q.stdin || []) : [];
  const r = await runUserOutput(el.value, stdin);

  out.style.display = "block";
  out.className = "exam-run-output" + (r.error ? " error" : "");

  let html = "";
  if (q.type === "program" && stdin.length) {
    html += `<div class="exam-run-label">Input fed: ${examEscape(stdin.join(", "))}</div>`;
  }
  html += `<div class="exam-run-label">Output</div>`;
  if (r.error) {
    html += `<pre class="exam-run-text error">${examEscape(r.error)}</pre>`;
  } else if (r.output) {
    html += `<pre class="exam-run-text">${examEscape(r.output)}</pre>`;
  } else {
    html += `<pre class="exam-run-text muted">(no output — your code didn't print anything. Add print(...) to see values, or click Check answer to test it.)</pre>`;
  }
  out.innerHTML = html;
}

function resetQuestionCode(idx) {
  const q = examState.questions[idx];
  const el = document.getElementById(`examCode_${idx}`);
  if (!el) return;
  el.value = q.starter || "";
  const out = document.getElementById(`examRun_${idx}`);
  if (out) { out.style.display = "none"; out.innerHTML = ""; }
  const fb = document.getElementById(`examFb_${idx}`);
  if (fb) { fb.style.display = "none"; fb.innerHTML = ""; }
  el.focus();
}

// ===== Start / Render =====
async function startExam() {
  if (!pyReady) {
    alert("The Python runtime is still loading — give it a few seconds, then try again.");
    return;
  }

  examState = { questions: await buildExam(), answers: {}, submitted: false };

  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("lessonView").style.display = "none";
  document.getElementById("examView").style.display = "";
  document.querySelectorAll(".lesson-nav li.active").forEach(li => li.classList.remove("active"));

  renderExam();
  document.getElementById("sidebar").classList.remove("open");
  window.scrollTo(0, 0);
}

function renderExam() {
  const view = document.getElementById("examView");
  const qs = examState.questions;

  let html = `
    <div class="exam-topbar">
      <div>
        <span class="exam-badge">Mock Exam</span>
        <h2 class="exam-title">NYU CS Placement — Practice Test</h2>
        <p class="exam-sub">10 questions &middot; 100 points &middot; freshly generated each attempt. No timer — take your time, then submit.</p>
      </div>
    </div>
    <div class="exam-questions">
  `;

  qs.forEach((q, idx) => {
    html += `<div class="exam-q" id="examQ_${idx}">`;
    html += `<div class="exam-q-head"><span class="exam-q-num">Q${idx + 1}</span><span class="exam-q-pts">${q.points} pts</span><span class="exam-q-topic">${q.topic}</span></div>`;
    html += `<div class="exam-q-prompt">${q.prompt}</div>`;
    if (q.code) html += `<pre class="exam-code">${examEscape(q.code)}</pre>`;

    if (q.type === "mc") {
      html += `<div class="exam-options" id="examOpts_${idx}">`;
      q.options.forEach((opt, oi) => {
        html += `<div class="exam-option" data-q="${idx}" data-opt="${oi}"><pre>${examEscape(opt)}</pre></div>`;
      });
      html += `</div>`;
    } else if (q.type === "predict") {
      html += `<input type="text" class="exam-predict-input" id="examInput_${idx}" data-q="${idx}" placeholder="Type the exact output..." spellcheck="false" autocomplete="off">`;
    } else {
      html += `<textarea class="exam-code-input" id="examCode_${idx}" data-q="${idx}" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off">${examEscape(q.starter || "")}</textarea>`;
    }

    const isCodeQ = q.type === "code" || q.type === "program";
    html += `<div class="exam-q-actions">`;
    if (isCodeQ) html += `<button class="exam-run-btn" data-run="${idx}">Run &#9654;</button>`;
    if (isCodeQ) html += `<button class="exam-reset-btn" data-reset="${idx}">Reset</button>`;
    html += `<button class="exam-check-btn" data-check="${idx}">Check answer</button>`;
    html += `</div>`;
    if (isCodeQ) html += `<div class="exam-run-output" id="examRun_${idx}" style="display:none"></div>`;
    html += `<div class="exam-q-feedback" id="examFb_${idx}" style="display:none"></div>`;
    html += `</div>`;
  });

  html += `</div>`;
  html += `
    <div class="exam-footer">
      <button class="exam-submit-btn" id="examSubmitBtn">Submit Exam</button>
      <button class="exam-quit-btn" id="examQuitBtn">Quit to Lessons</button>
    </div>
  `;

  view.innerHTML = html;

  view.querySelectorAll(".exam-option").forEach(optEl => {
    optEl.addEventListener("click", () => {
      const qi = optEl.dataset.q;
      const oi = parseInt(optEl.dataset.opt);
      examState.answers[qi] = oi;
      view.querySelectorAll(`.exam-option[data-q="${qi}"]`).forEach(o => o.classList.remove("selected"));
      optEl.classList.add("selected");
    });
  });

  view.querySelectorAll(".exam-code-input").forEach(ta => {
    ta.addEventListener("keydown", e => {
      if (e.key === "Tab") {
        e.preventDefault();
        const start = ta.selectionStart, end = ta.selectionEnd;
        ta.value = ta.value.substring(0, start) + "    " + ta.value.substring(end);
        ta.selectionStart = ta.selectionEnd = start + 4;
      }
    });
  });

  view.querySelectorAll(".exam-check-btn").forEach(btn => {
    btn.addEventListener("click", () => checkQuestion(parseInt(btn.dataset.check)));
  });

  view.querySelectorAll(".exam-run-btn").forEach(btn => {
    btn.addEventListener("click", () => runQuestionCode(parseInt(btn.dataset.run)));
  });

  view.querySelectorAll(".exam-reset-btn").forEach(btn => {
    btn.addEventListener("click", () => resetQuestionCode(parseInt(btn.dataset.reset)));
  });

  document.getElementById("examSubmitBtn").addEventListener("click", () => submitExam(false));
  document.getElementById("examQuitBtn").addEventListener("click", quitExam);
}

// ===== Submit / Grade =====
function submitExam(skipConfirm) {
  if (examState.submitted) return;
  if (!skipConfirm) {
    const answered = countAnswered();
    if (answered < examState.questions.length) {
      if (!confirm(`You've answered ${answered} of ${examState.questions.length} questions. Submit anyway?`)) return;
    }
  }
  examState.submitted = true;

  const submitBtn = document.getElementById("examSubmitBtn");
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Grading..."; }

  setTimeout(async () => showResults(await gradeExam()), 50);
}

function countAnswered() {
  return examState.questions.filter((q, idx) => isAttempted(q, idx)).length;
}

// Grade a single question. Returns { pass, detail }.
async function gradeOne(q, idx) {
  if (q.type === "mc") {
    const sel = examState.answers[idx];
    const pass = sel === q.correct;
    return { pass, detail: pass ? "Correct." : `Correct answer:\n${q.options[q.correct]}` };
  } else if (q.type === "predict") {
    const el = document.getElementById(`examInput_${idx}`);
    const your = el ? el.value : "";
    const pass = normalizeOutput(your) === normalizeOutput(q.expected);
    return { pass, detail: pass ? "Correct." : `Correct answer: ${q.expected}` };
  } else {
    const el = document.getElementById(`examCode_${idx}`);
    const userCode = el ? el.value : "";
    const r = await runExamPython(userCode, q.type === "program"
      ? { stdin: q.stdin, expected: q.expected }
      : { testCode: q.testCode });
    return { pass: r.pass, detail: r.detail };
  }
}

// Was a question actually attempted (vs left blank / untouched)?
function isAttempted(q, idx) {
  if (q.type === "mc") return examState.answers[idx] !== undefined;
  if (q.type === "predict") {
    const el = document.getElementById(`examInput_${idx}`);
    return !!el && el.value.trim() !== "";
  }
  const el = document.getElementById(`examCode_${idx}`);
  return !!el && el.value.trim() !== "" && el.value.trim() !== (q.starter || "").trim();
}

// Check a single question and show inline feedback.
async function checkQuestion(idx) {
  const q = examState.questions[idx];
  const fb = document.getElementById(`examFb_${idx}`);
  if (!fb) return;

  if (!isAttempted(q, idx)) {
    fb.style.display = "block";
    fb.className = "exam-q-feedback neutral";
    fb.innerHTML = `<div class="exam-fb-head">Enter an answer first, then check.</div>`;
    return;
  }

  fb.style.display = "block";
  fb.className = "exam-q-feedback neutral";
  fb.innerHTML = `<div class="exam-fb-head">Checking...</div>`;

  const res = await gradeOne(q, idx);
  fb.style.display = "block";
  fb.className = "exam-q-feedback " + (res.pass ? "correct" : "incorrect");
  let html = `<div class="exam-fb-head">${res.pass ? "✓ Correct!" : "✗ Not quite."}</div>`;
  if (!res.pass) {
    html += `<div class="exam-fb-detail">${examEscape(res.detail)}</div>`;
    html += `<div class="exam-fb-explain"><strong>How to think about it:</strong> ${q.explain}</div>`;
  }
  fb.innerHTML = html;
}

async function gradeExam() {
  const details = [];
  let score = 0;
  for (let idx = 0; idx < examState.questions.length; idx++) {
    const q = examState.questions[idx];
    const res = await gradeOne(q, idx);
    if (res.pass) score += q.points;
    details.push({ q, idx, pass: res.pass, detail: res.detail });
  }
  return { score, details };
}

function showResults(results) {
  const { score, details } = results;
  const view = document.getElementById("examView");

  let best = 0;
  try { best = parseInt(localStorage.getItem(EXAM_BEST_KEY)) || 0; } catch (_) {}
  if (score > best) { best = score; try { localStorage.setItem(EXAM_BEST_KEY, String(score)); } catch (_) {} }

  const missed = details.filter(d => !d.pass);
  const reviewSet = [];
  missed.forEach(d => { if (!reviewSet.some(r => r.topic === d.q.topic)) reviewSet.push({ topic: d.q.topic, review: d.q.review }); });

  let verdict, verdictClass;
  if (score === 100) { verdict = "Perfect score! You're exam-ready."; verdictClass = "great"; }
  else if (score >= 80) { verdict = "Strong — close to a 100. Tighten the misses below."; verdictClass = "good"; }
  else if (score >= 60) { verdict = "Decent foundation, but not yet. Drill the topics below."; verdictClass = "ok"; }
  else { verdict = "Lots of room to grow. Work through the weak areas below, then retake."; verdictClass = "low"; }

  let html = `
    <div class="exam-results">
      <div class="exam-score-card ${verdictClass}">
        <div class="exam-score-num">${score}<span>/100</span></div>
        <div class="exam-score-verdict">${verdict}</div>
        <div class="exam-score-best">Best score: ${best}/100</div>
      </div>
  `;

  if (reviewSet.length > 0) {
    html += `<div class="exam-review-box"><h3>Focus your studying here:</h3><ul>`;
    reviewSet.forEach(r => { html += `<li><strong>${r.topic}</strong> &rarr; ${r.review}</li>`; });
    html += `</ul></div>`;
  } else {
    html += `<div class="exam-review-box all-correct"><h3>You missed nothing. That's exactly the level you need for a 100.</h3></div>`;
  }

  html += `<h3 class="exam-breakdown-title">Question breakdown</h3><div class="exam-breakdown">`;
  details.forEach(d => {
    const icon = d.pass ? "✓" : "✗";
    const cls = d.pass ? "pass" : "fail";
    html += `<div class="exam-result-q ${cls}">`;
    html += `<div class="exam-result-head"><span class="exam-result-icon">${icon}</span> Q${d.idx + 1} &middot; ${d.q.topic} &middot; ${d.pass ? d.q.points : 0}/${d.q.points} pts</div>`;
    html += `<div class="exam-result-prompt">${d.q.prompt}</div>`;
    if (d.q.code) html += `<pre class="exam-code small">${examEscape(d.q.code)}</pre>`;
    if (!d.pass) {
      html += `<div class="exam-result-detail">${examEscape(d.detail)}</div>`;
      html += `<div class="exam-result-explain"><strong>How to think about it:</strong> ${d.q.explain}</div>`;
    }
    html += `</div>`;
  });
  html += `</div>`;

  html += `
    <div class="exam-footer">
      <button class="exam-submit-btn" id="examRetakeBtn">Retake (new questions)</button>
      <button class="exam-quit-btn" id="examBackBtn">Back to Lessons</button>
    </div>
  </div>`;

  view.innerHTML = html;
  window.scrollTo(0, 0);

  document.getElementById("examRetakeBtn").addEventListener("click", startExam);
  document.getElementById("examBackBtn").addEventListener("click", quitExam);
}

function quitExam() {
  examState = null;
  document.getElementById("examView").style.display = "none";
  if (typeof showLesson === "function") showLesson(0);
  else document.getElementById("welcomeScreen").style.display = "";
}

// ===== Wire entry points =====
document.addEventListener("DOMContentLoaded", () => {
  const examBtn = document.getElementById("examBtn");
  if (examBtn) examBtn.addEventListener("click", startExam);
  const welcomeBtn = document.getElementById("examWelcomeBtn");
  if (welcomeBtn) welcomeBtn.addEventListener("click", startExam);

  try {
    const best = parseInt(localStorage.getItem(EXAM_BEST_KEY));
    if (best > 0) {
      const el = document.getElementById("examBestBadge");
      if (el) el.textContent = `Best: ${best}/100`;
    }
  } catch (_) {}
});
