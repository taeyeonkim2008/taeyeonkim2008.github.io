// ===== Course Review: LeetCode-style drills + a full mock exam =====
// Covers an intro programming course end to end (Days 1-21) and adds the two
// topics the course teaches that the day-by-day app doesn't: recursion and
// basic algorithms. Coding problems are graded by hidden tests; tracing
// questions have their answers computed by actually running Python.

const REVIEW_BEST_KEY = "py30_review_best";

let reviewState = null;

// ---------- small helpers ----------
const rvEsc = s => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
const rvNorm = s => String(s).replace(/\r/g, "").split("\n").map(l => l.replace(/\s+$/, "")).join("\n").replace(/\n+$/, "");
const rint = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = a => a[Math.floor(Math.random() * a.length)];
const pyLit = x => JSON.stringify(x);
function rvShuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
// Compute a tracing answer by really running the code.
async function pyOut(code) {
  const r = await runPython(code, { isolate: true });
  return (r.timeout || r.error) ? "ERROR" : rvNorm(r.output);
}
// Strip comments and string literals so a constraint check can't false-positive on
// the starter's own "# no sorted()" note or on a student's prose comment.
function rvCodeOnly(src) {
  return String(src)
    .replace(/"""[\s\S]*?"""/g, '""')
    .replace(/'''[\s\S]*?'''/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/#[^\n]*/g, "");
}

// Shorthands for building questions
const predictQ = (prompt, code, expected, explain) => ({ type: "predict", prompt, code, expected, explain });
const mcQ = (prompt, code, options, correct, explain) => ({ type: "mc", prompt, code, options, correct, explain });
const codeQ = (prompt, starter, tests, explain, forbid) => ({ type: "code", prompt, starter, testCode: tests, explain, forbid: forbid || [] });
const T = body => `try:\n${body}\n    __result = "PASS"\nexcept Exception as e:\n    __result = "FAIL: " + str(e)`;

const WORDS = ["python", "banana", "keyboard", "elephant", "umbrella", "rhythm", "monkey", "guitar", "ocean", "syntax"];

// ---------- the topic bank ----------
const REVIEW_TOPICS = [
  {
    id: "basics", name: "Variables, Types & Operators", review: "Days 1-3",
    make: [
      async () => { const a = rint(13, 98), b = rint(2, 9);
        const c = `print(${a} // ${b}, ${a} % ${b})`;
        return predictQ("What is the exact output?", c, await pyOut(c),
          "// is floor division (how many whole times it fits), % is the remainder left over."); },
      async () => { const a = rint(2, 5), b = rint(2, 3), c2 = rint(10, 40), d = rint(2, 6);
        const c = `print(${a} ** ${b} + ${c2} // ${d})`;
        return predictQ("What number is printed?", c, await pyOut(c),
          "Precedence: ** first, then // , then +."); },
      async () => mcQ("Which is NOT a valid variable name?", null,
        ["total_2", "_count", "2nd_place", "myVar"], 2,
        "Names can't start with a digit. Everything else here is legal."),
      async () => { const c = `x = "5"\ny = 2\nprint(x * y)`;
        return predictQ("What is printed?", c, await pyOut(c),
          'A string times an int repeats the string — it does NOT do math. "5" * 2 is "55".'); }
    ]
  },
  {
    id: "strings", name: "Strings", review: "Day 4",
    make: [
      async () => { const w = pick(["PYTHON", "COMPUTER", "PROGRAM", "VARIABLE"]);
        const i = rint(0, 2), j = rint(i + 2, w.length);
        const c = `print("${w}"[${i}:${j}])`;
        return predictQ("What is printed? (exact text, no quotes)", c, await pyOut(c),
          "Slicing is [start:stop] — start included, stop excluded."); },
      async () => { const w = pick(["hello world", "python rocks", "keep going"]);
        const c = `s = "  ${w.toUpperCase()}  "\nprint(s.strip().lower().replace(" ", "-"))`;
        return predictQ("What is printed?", c, await pyOut(c),
          "Method chaining runs left to right: strip the spaces, lowercase it, then swap the space for a dash."); },
      async () => { const w = pick(WORDS);
        return codeQ("Write <code>count_vowels(s)</code> returning how many vowels (a, e, i, o, u) are in <code>s</code>. Case-insensitive.",
          "def count_vowels(s):\n    # your code here\n    pass\n",
          T(`    assert count_vowels(${pyLit(w)}) == ${(w.match(/[aeiou]/g) || []).length}\n    assert count_vowels("XYZ") == 0\n    assert count_vowels("AEIou") == 5`),
          "Loop over s.lower() and count characters that appear in \"aeiou\"."); },
      async () => codeQ("Write <code>is_palindrome(s)</code> returning True if <code>s</code> reads the same forwards and backwards, ignoring case.",
        "def is_palindrome(s):\n    # your code here\n    pass\n",
        T(`    assert is_palindrome("racecar") == True\n    assert is_palindrome("Madam") == True\n    assert is_palindrome("hello") == False\n    assert is_palindrome("A") == True`),
        "Lowercase it, then compare the string to its reverse (s[::-1]).")
    ]
  },
  {
    id: "lists", name: "Lists", review: "Day 5",
    make: [
      async () => { const c = `a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)`;
        return predictQ("What is printed?", c, await pyOut(c),
          "b = a does NOT copy — both names point to the same list, so appending through b shows up in a. Use a.copy() for a real copy."); },
      async () => { const n = Array.from({length: 5}, () => rint(1, 30));
        const c = `nums = ${pyLit(n)}\nnums.sort()\nprint(nums[0], nums[-1])`;
        return predictQ("What is the exact output?", c, await pyOut(c),
          ".sort() sorts in place, so index 0 is the smallest and -1 the largest."); },
      async () => codeQ("Write <code>remove_duplicates(items)</code> returning a new list with duplicates removed, <strong>keeping the original order</strong>.",
        "def remove_duplicates(items):\n    # your code here\n    pass\n",
        T(`    assert remove_duplicates([1,2,2,3,4,4,4,5]) == [1,2,3,4,5]\n    assert remove_duplicates([]) == []\n    assert remove_duplicates(["a","b","a"]) == ["a","b"]`),
        "Build a result list; append each item only if it isn't already in the result. (set() would lose the order.)"),
      async () => codeQ("Write <code>second_largest(nums)</code> returning the second largest <strong>distinct</strong> value.",
        "def second_largest(nums):\n    # your code here\n    pass\n",
        T(`    assert second_largest([3,1,4,1,5,9]) == 5\n    assert second_largest([10,10,5,5,1]) == 5\n    assert second_largest([2,1]) == 1`),
        "Remove duplicates, sort, then take the second-from-last element.")
    ]
  },
  {
    id: "tuples-sets", name: "Tuples & Sets", review: "Days 6-7",
    make: [
      async () => { const c = `print(len({1, 2, 2, 3, 3, 3}))`;
        return predictQ("What number is printed?", c, await pyOut(c),
          "Sets keep only unique values, so this is {1, 2, 3}."); },
      async () => mcQ("What is the type of <code>(7)</code> — no comma?", null,
        ["tuple", "int", "list", "SyntaxError"], 1,
        "(7) is just 7 in parentheses. A one-element tuple needs the comma: (7,)."),
      async () => { const c = `a = {1,2,3,4}\nb = {3,4,5}\nprint(sorted(a & b), sorted(a - b))`;
        return predictQ("What is the exact output?", c, await pyOut(c),
          "& is intersection (in both), - is difference (in the first only)."); },
      async () => codeQ("Write <code>common(a, b)</code> returning a <strong>sorted list</strong> of values appearing in both lists.",
        "def common(a, b):\n    # your code here\n    pass\n",
        T(`    assert common([1,2,3,4],[3,4,5]) == [3,4]\n    assert common([1],[2]) == []\n    assert common([5,5,6],[6,5]) == [5,6]`),
        "Convert both to sets, intersect with &, then sorted().")
    ]
  },
  {
    id: "dicts", name: "Dictionaries", review: "Day 8",
    make: [
      async () => { const c = `d = {"a": 1, "b": 2}\nprint(d.get("c", 0) + d.get("a", 0))`;
        return predictQ("What number is printed?", c, await pyOut(c),
          '.get(key, default) returns the default when the key is missing instead of crashing.'); },
      async () => mcQ("What does <code>d[\"missing\"]</code> do when the key isn't in the dict?", null,
        ["Returns None", "Raises KeyError", "Returns 0", "Creates the key"], 1,
        "Square brackets raise KeyError. Use .get() if the key might be absent."),
      async () => { const pool = ["a","b","c"], ws = Array.from({length: rint(5,7)}, () => pick(pool));
        const exp = {}; ws.forEach(w => exp[w] = (exp[w]||0)+1);
        return codeQ("Write <code>word_count(words)</code> returning a dict mapping each word to how many times it appears.",
          "def word_count(words):\n    # your code here\n    pass\n",
          T(`    assert word_count(${pyLit(ws)}) == ${pyLit(exp)}\n    assert word_count([]) == {}`),
          "Start with {} and use d[w] = d.get(w, 0) + 1 for each word."); },
      async () => codeQ("Write <code>invert(d)</code> returning a new dict with keys and values swapped.",
        "def invert(d):\n    # your code here\n    pass\n",
        T(`    assert invert({"a":1,"b":2}) == {1:"a",2:"b"}\n    assert invert({}) == {}`),
        "Loop over d.items() and build {value: key}.")
    ]
  },
  {
    id: "conditionals", name: "Conditionals", review: "Day 9",
    make: [
      async () => mcQ("Which value is <strong>truthy</strong>?", null,
        ["0", '"" (empty string)', "[] (empty list)", '"False" (the string)'], 3,
        'Any non-empty string is truthy — even "False". Only empty containers, 0 and None are falsy.'),
      async () => { const x = rint(1, 30);
        const c = `x = ${x}\nif x > 20:\n    print("big")\nelif x > 10:\n    print("medium")\nelse:\n    print("small")`;
        return predictQ("What is printed?", c, await pyOut(c),
          "Python runs the FIRST branch whose condition is true, then skips the rest."); },
      async () => codeQ("Write <code>grade(score)</code>: 90+ -> \"A\", 80-89 -> \"B\", 70-79 -> \"C\", 60-69 -> \"D\", below 60 -> \"F\".",
        "def grade(score):\n    # your code here\n    pass\n",
        T(`    assert grade(95) == "A" and grade(90) == "A"\n    assert grade(89) == "B"\n    assert grade(75) == "C"\n    assert grade(60) == "D"\n    assert grade(12) == "F"`),
        "An if/elif chain checked from the top down — order matters."),
      async () => { const c = `x = 7\nprint("even" if x % 2 == 0 else "odd")`;
        return predictQ("What is printed?", c, await pyOut(c),
          "A conditional expression: value_if_true if condition else value_if_false."); }
    ]
  },
  {
    id: "loops", name: "Loops", review: "Day 10",
    make: [
      async () => { const s = rint(9, 16), st = pick([2, 3, 4]);
        const c = `i = ${s}\nwhile i > 0:\n    print(i, end=' ')\n    i -= ${st}`;
        return predictQ("What is the exact output? (values separated by single spaces)", c, await pyOut(c),
          "Print, then subtract the step, until the condition fails."); },
      async () => { const a = rint(2, 3), b = rint(3, 4);
        const c = `count = 0\nfor i in range(${a}):\n    for j in range(${b}):\n        count += 1\nprint(count)`;
        return predictQ("What number is printed?", c, await pyOut(c),
          "The inner loop runs fully for each outer iteration, so it's outer x inner."); },
      async () => { const a = rint(1, 4), b = rint(8, 14);
        const c = `total = 0\nfor i in range(${a}, ${b}):\n    total += i\nprint(total)`;
        return predictQ("What number is printed?", c, await pyOut(c),
          "range(a, b) stops BEFORE b. Add each value to the accumulator."); },
      async () => codeQ("Write <code>digit_sum(n)</code> returning the sum of the digits of a positive integer, using a loop.",
        "def digit_sum(n):\n    # your code here\n    pass\n",
        T(`    assert digit_sum(1234) == 10\n    assert digit_sum(999) == 27\n    assert digit_sum(5) == 5`),
        "n % 10 gives the last digit; n // 10 drops it. Repeat until n is 0."),
      async () => { const c = `for n in range(10):\n    if n == 5:\n        break\n    if n % 2 == 0:\n        continue\n    print(n, end=' ')`;
        return predictQ("What is the exact output?", c, await pyOut(c),
          "continue skips the rest of this pass; break leaves the loop entirely."); }
    ]
  },
  {
    id: "functions", name: "Functions", review: "Day 11",
    make: [
      async () => mcQ("A function prints a value but has no <code>return</code>. What does calling it evaluate to?", null,
        ['The printed value', "0", "None", "True"], 2,
        "No return means the function returns None. print displays; return hands a value back."),
      async () => { const c = `x = 10\ndef f():\n    x = 99\nf()\nprint(x)`;
        return predictQ("What number is printed?", c, await pyOut(c),
          "Assigning inside a function makes a NEW local variable — the global x is untouched."); },
      async () => codeQ("Write <code>sum_all(*args)</code> returning the sum of every number passed (0 for no arguments).",
        "def sum_all(*args):\n    # your code here\n    pass\n",
        T(`    assert sum_all(1,2,3) == 6\n    assert sum_all() == 0\n    assert sum_all(7) == 7`),
        "*args collects the arguments into a tuple you can loop over or sum()."),
      async () => codeQ("Write <code>min_max(nums)</code> returning a <strong>tuple</strong> <code>(smallest, largest)</code>.",
        "def min_max(nums):\n    # your code here\n    pass\n",
        T(`    assert min_max([3,1,4,1,5]) == (1,5)\n    assert min_max([7]) == (7,7)\n    assert type(min_max([1,2])) == tuple`),
        "Return two values separated by a comma — Python packs them into a tuple.")
    ]
  },
  {
    id: "modules", name: "Modules", review: "Day 12",
    make: [
      async () => mcQ("After <code>from math import sqrt</code>, which call is correct?", null,
        ["math.sqrt(16)", "sqrt(16)", "math.sqrt.16", "import sqrt(16)"], 1,
        "from-import brings the name itself into your file, so you call it directly."),
      async () => codeQ("Using the <code>math</code> module, write <code>hypotenuse(a, b)</code> returning the length of the hypotenuse.",
        "import math\n\ndef hypotenuse(a, b):\n    # your code here\n    pass\n",
        T(`    assert hypotenuse(3,4) == 5.0\n    assert hypotenuse(6,8) == 10.0`),
        "math.sqrt(a**2 + b**2)."),
      async () => { const c = `import math\nprint(math.floor(7.9), math.ceil(7.1))`;
        return predictQ("What is the exact output?", c, await pyOut(c),
          "floor rounds down, ceil rounds up."); }
    ]
  },
  {
    id: "comprehensions", name: "List Comprehensions", review: "Day 13",
    make: [
      async () => { const n = rint(4, 6);
        const c = `print([x * x for x in range(${n})])`;
        return predictQ("What is printed?", c, await pyOut(c),
          "range starts at 0 — square each value in turn."); },
      async () => codeQ("Using a <strong>single list comprehension</strong>, write <code>evens_squared(nums)</code> returning the squares of only the even numbers.",
        "def evens_squared(nums):\n    # your code here\n    pass\n",
        T(`    assert evens_squared([1,2,3,4,5,6]) == [4,16,36]\n    assert evens_squared([1,3]) == []`),
        "[x**2 for x in nums if x % 2 == 0]"),
      async () => codeQ("Write <code>long_words(words, n)</code> returning the words longer than <code>n</code> characters, uppercased.",
        "def long_words(words, n):\n    # your code here\n    pass\n",
        T(`    assert long_words(["hi","hello","hey"], 2) == ["HELLO","HEY"]\n    assert long_words([], 1) == []`),
        "[w.upper() for w in words if len(w) > n]")
    ]
  },
  {
    id: "errors", name: "Errors & Exceptions", review: "Days 15 & 17",
    make: [
      async () => mcQ("What error does <code>int(\"abc\")</code> raise?", null,
        ["TypeError", "SyntaxError", "ValueError", "NameError"], 2,
        "The type (str) is acceptable but the VALUE can't convert — that's ValueError."),
      async () => mcQ("What error does <code>\"2\" + 2</code> raise?", null,
        ["TypeError", "ValueError", "No error, prints 4", 'No error, prints "22"'], 0,
        "Mismatched types. Convert first: int(\"2\") + 2 or \"2\" + str(2)."),
      async () => mcQ("When does a <code>finally</code> block run?", null,
        ["Only on an exception", "Only without an exception", "Never", "Always — exception or not"], 3,
        "finally always runs, which is why it's used for cleanup."),
      async () => codeQ("Write <code>safe_divide(a, b)</code> returning <code>a / b</code>, or <code>None</code> if b is zero. Use try/except.",
        "def safe_divide(a, b):\n    # your code here\n    pass\n",
        T(`    assert safe_divide(10,2) == 5.0\n    assert safe_divide(5,0) is None\n    assert safe_divide(9,3) == 3.0`),
        "Wrap the division in try, catch ZeroDivisionError, return None from the except block."),
      async () => codeQ("Write <code>to_int(s)</code> returning the integer value of string <code>s</code>, or <code>-1</code> if it isn't a valid number.",
        "def to_int(s):\n    # your code here\n    pass\n",
        T(`    assert to_int("42") == 42\n    assert to_int("abc") == -1\n    assert to_int("-7") == -7`),
        "try: return int(s) / except ValueError: return -1")
    ]
  },
  {
    id: "files", name: "File Handling", review: "Day 19",
    make: [
      async () => mcQ("You open an existing file with mode <code>\"w\"</code>. What happens to its contents?", null,
        ["Preserved, writes go to the end", "Erased immediately", "FileExistsError", "Opened read-only"], 1,
        '"w" truncates the file the moment it opens. Use "a" to append.'),
      async () => codeQ("Write <code>save_and_count(lines)</code> that writes each string in <code>lines</code> to <code>data.txt</code> (one per line), then reads the file back and returns the number of lines.",
        "def save_and_count(lines):\n    # your code here\n    pass\n",
        T(`    assert save_and_count(["a","b","c"]) == 3\n    assert save_and_count(["only"]) == 1`),
        "Open with \"w\" and write each line plus \\n, then reopen with \"r\" and count readlines()."),
      async () => codeQ("Write <code>word_total(text)</code> that writes <code>text</code> to <code>doc.txt</code>, reads it back, and returns the total number of words.",
        "def word_total(text):\n    # your code here\n    pass\n",
        T(`    assert word_total("one two three") == 3\n    assert word_total("hello") == 1`),
        "Write the text, read it back, then len(content.split()).")
    ]
  },
  {
    id: "classes", name: "Classes & Objects", review: "Day 21",
    make: [
      async () => mcQ("Inside a method, what does <code>self</code> refer to?", null,
        ["The class itself", "The specific object the method was called on", "The parent class", "Nothing — it's decorative"], 1,
        "self IS the instance: when you call p.greet(), self is p, which is how the method reaches that object's own data."),
      async () => codeQ("Write a class <code>Rectangle</code> with <code>__init__(self, width, height)</code>, plus <code>area()</code> and <code>perimeter()</code> methods.",
        "class Rectangle:\n    # your code here\n    pass\n",
        T(`    r = Rectangle(4,5)\n    assert r.area() == 20\n    assert r.perimeter() == 18\n    s = Rectangle(3,3)\n    assert s.area() == 9`),
        "Store width and height on self in __init__, then use them in the methods."),
      async () => codeQ("Write a class <code>BankAccount</code>: <code>__init__(self, balance=0)</code>, <code>deposit(amount)</code>, and <code>withdraw(amount)</code> — a withdrawal larger than the balance must leave the balance unchanged.",
        "class BankAccount:\n    # your code here\n    pass\n",
        T(`    a = BankAccount(100)\n    a.deposit(50); a.withdraw(30)\n    assert a.balance == 120\n    a.withdraw(1000)\n    assert a.balance == 120\n    assert BankAccount().balance == 0`),
        "Guard the withdrawal with an if: only subtract when amount <= self.balance."),
      async () => codeQ("Write a class <code>Counter</code> with <code>__init__(self)</code> starting at 0, an <code>increment()</code> method, and a <code>value()</code> method returning the count.",
        "class Counter:\n    # your code here\n    pass\n",
        T(`    c = Counter()\n    assert c.value() == 0\n    c.increment(); c.increment()\n    assert c.value() == 2\n    d = Counter()\n    assert d.value() == 0`),
        "Set self.count = 0 in __init__. Each object gets its own count.")
    ]
  },
  {
    id: "recursion", name: "Recursion", review: "Not in the day-by-day app — course topic",
    make: [
      async () => { const n = rint(3, 5);
        const c = `def f(n):\n    if n == 0:\n        return 0\n    return n + f(n - 1)\nprint(f(${n}))`;
        return predictQ("What number is printed?", c, await pyOut(c),
          `Each call adds n and recurses on n-1 until the base case returns 0 — so it sums ${n} down to 1.`); },
      async () => mcQ("What happens to a recursive function with <strong>no base case</strong>?", null,
        ["RecursionError (maximum depth exceeded)", "Returns None", "Returns 0", "It silently stops"], 0,
        "Without a base case it calls itself forever; Python stops it at the recursion limit."),
      async () => codeQ("Write <code>factorial(n)</code> <strong>recursively</strong> (no loops). 0! is 1.",
        "def factorial(n):\n    # must call itself — no loops\n    pass\n",
        T(`    assert factorial(0) == 1\n    assert factorial(1) == 1\n    assert factorial(5) == 120\n    assert factorial(7) == 5040`),
        "Base case: n <= 1 returns 1. Recursive case: return n * factorial(n-1).", [["\\bfor\\b", "Use recursion, not a loop."], ["\\bwhile\\b", "Use recursion, not a loop."]]),
      async () => codeQ("Write <code>sum_digits(n)</code> <strong>recursively</strong>, returning the sum of the digits of a positive integer.",
        "def sum_digits(n):\n    # must call itself — no loops\n    pass\n",
        T(`    assert sum_digits(5) == 5\n    assert sum_digits(1234) == 10\n    assert sum_digits(999) == 27`),
        "Base case: n < 10 returns n. Otherwise n % 10 + sum_digits(n // 10).", [["\\bfor\\b", "Use recursion, not a loop."], ["\\bwhile\\b", "Use recursion, not a loop."]]),
      async () => codeQ("Write <code>power(base, exp)</code> <strong>recursively</strong> without using <code>**</code>. Anything to the 0 power is 1.",
        "def power(base, exp):\n    # must call itself — no loops, no **\n    pass\n",
        T(`    assert power(2,0) == 1\n    assert power(2,10) == 1024\n    assert power(3,4) == 81\n    assert power(7,1) == 7`),
        "Base case: exp == 0 returns 1. Otherwise base * power(base, exp - 1).",
        [["\\*\\*", "Don\'t use the ** operator — build it up recursively."], ["\\bfor\\b", "Use recursion, not a loop."], ["\\bwhile\\b", "Use recursion, not a loop."]]),
      async () => codeQ("Write <code>reverse(s)</code> <strong>recursively</strong>, returning the string reversed. Don't use slicing tricks like <code>[::-1]</code>.",
        "def reverse(s):\n    # must call itself\n    pass\n",
        T(`    assert reverse("") == ""\n    assert reverse("a") == "a"\n    assert reverse("abc") == "cba"\n    assert reverse("Python") == "nohtyP"`),
        "Base case: a string shorter than 2 returns itself. Otherwise reverse(s[1:]) + s[0].",
        [["\\[::-1\\]", "No slicing trick — use recursion."]])
    ]
  },
  {
    id: "algorithms", name: "Search, Sort & Patterns", review: "Not in the day-by-day app — course topic",
    make: [
      async () => { const c = `s = ""\nfor ch in "abc":\n    s = ch + s\nprint(s)`;
        return predictQ("What is printed?", c, await pyOut(c),
          'Each character is put in FRONT of the result: "" -> "a" -> "ba" -> "cba". This is the reversal pattern.'); },
      async () => codeQ("Write <code>linear_search(items, target)</code> returning the index of <code>target</code>, or <code>-1</code> if it isn't there.",
        "def linear_search(items, target):\n    # your code here\n    pass\n",
        T(`    assert linear_search([4,2,7,1], 7) == 2\n    assert linear_search([4,2,7,1], 9) == -1\n    assert linear_search([], 1) == -1\n    assert linear_search([5], 5) == 0`),
        "Walk the indices with range(len(items)); return i the moment you find it, and -1 after the loop."),
      async () => codeQ("Write <code>find_max(nums)</code> returning the largest value <strong>without</strong> using <code>max()</code>. Return <code>None</code> for an empty list.",
        "def find_max(nums):\n    # no max() allowed\n    pass\n",
        T(`    assert find_max([3,7,2,9,1]) == 9\n    assert find_max([-5,-2,-9]) == -2\n    assert find_max([4]) == 4\n    assert find_max([]) is None`),
        "Start with the first element as the best-so-far, then replace it whenever you see something bigger.",
        [["\\bmax\\s*\\(", "Find it yourself instead of calling max()."]]),
      async () => codeQ("Write <code>bubble_sort(nums)</code> returning a sorted list <strong>without</strong> using <code>sorted()</code> or <code>.sort()</code>.",
        "def bubble_sort(nums):\n    # no sorted() or .sort()\n    pass\n",
        T(`    assert bubble_sort([64,25,12,22,11]) == [11,12,22,25,64]\n    assert bubble_sort([]) == []\n    assert bubble_sort([1]) == [1]\n    assert bubble_sort([3,1,2]) == [1,2,3]`),
        "Repeatedly walk the list swapping neighbours that are out of order, until a full pass makes no swaps.",
        [["\\bsorted\\s*\\(", "Sort it yourself."], ["\\.sort\\s*\\(", "Sort it yourself."]]),
      async () => codeQ("Write <code>count_matching(items, target)</code> returning how many times <code>target</code> appears — without using <code>.count()</code>.",
        "def count_matching(items, target):\n    # no .count()\n    pass\n",
        T(`    assert count_matching([1,2,2,3,2], 2) == 3\n    assert count_matching([], 1) == 0\n    assert count_matching(["a","b"], "c") == 0`),
        "Keep a counter, add 1 each time an item equals the target.",
        [["\\.count\\s*\\(", "Count it yourself."]])
    ]
  }
];

// ---------- build a question set ----------
async function buildReview(topicIds, perTopic) {
  const topics = REVIEW_TOPICS.filter(t => topicIds.includes(t.id));
  const qs = [];
  for (const t of topics) {
    const makers = rvShuffle(t.make).slice(0, perTopic);
    for (const m of makers) {
      const q = await m();
      qs.push({ ...q, topic: t.name, topicId: t.id, review: t.review, points: 1 });
    }
  }
  return rvShuffle(qs);
}

// ---------- grading ----------
async function rvGradeOne(q, idx) {
  if (q.type === "mc") {
    const sel = reviewState.answers[idx];
    const pass = sel === q.correct;
    return { pass, detail: pass ? "Correct." : `Correct answer: ${q.options[q.correct]}` };
  }
  if (q.type === "predict") {
    const el = document.getElementById(`rvIn_${idx}`);
    const pass = rvNorm(el ? el.value : "") === rvNorm(q.expected);
    return { pass, detail: pass ? "Correct." : `Correct answer: ${q.expected}` };
  }
  const el = document.getElementById(`rvCode_${idx}`);
  const src = el ? el.value : "";
  // Constraint checks live here, not in Python: exec'd functions have no source
  // file, so inspect.getsource() can't see them.
  const codeOnly = rvCodeOnly(src);
  for (const [pattern, msg] of (q.forbid || [])) {
    if (new RegExp(pattern).test(codeOnly)) return { pass: false, detail: msg };
  }
  const r = await runPython(src + "\n" + q.testCode, { isolate: true });
  if (r.timeout) return { pass: false, detail: "Stopped after 10 seconds — likely an infinite loop." };
  if (r.error) return { pass: false, detail: "Error: " + r.error.split("\n").pop() };
  const res = r.result == null ? "" : String(r.result);
  return { pass: res.startsWith("PASS"), detail: res || "No result produced." };
}

function rvAttempted(q, idx) {
  if (q.type === "mc") return reviewState.answers[idx] !== undefined;
  if (q.type === "predict") { const e = document.getElementById(`rvIn_${idx}`); return !!e && e.value.trim() !== ""; }
  const e = document.getElementById(`rvCode_${idx}`);
  return !!e && e.value.trim() !== "" && e.value.trim() !== (q.starter || "").trim();
}

// ---------- rendering ----------
function openReview() {
  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("lessonView").style.display = "none";
  document.getElementById("reviewView").style.display = "";
  document.querySelectorAll(".lesson-nav li.active").forEach(li => li.classList.remove("active"));
  document.getElementById("sidebar").classList.remove("open");
  renderReviewMenu();
  window.scrollTo(0, 0);
}

function renderReviewMenu() {
  let best = 0;
  try { best = parseInt(localStorage.getItem(REVIEW_BEST_KEY)) || 0; } catch (_) {}
  const view = document.getElementById("reviewView");
  view.innerHTML = `
    <div class="rv-head">
      <span class="rv-badge">Course Review</span>
      <h2 class="rv-title">Intro Programming — Practice</h2>
      <p class="rv-sub">Coding problems graded by hidden tests, plus output-tracing questions.
      Covers the whole course, including <strong>recursion</strong> and <strong>algorithms</strong> —
      the two topics the day-by-day lessons don't teach.
      ${best ? `<br><span class="rv-best">Best full-exam score: ${best}%</span>` : ""}</p>
    </div>

    <div class="rv-modes">
      <button class="rv-mode-btn primary" id="rvFullBtn">
        <span class="rv-mode-title">Full Mock Exam</span>
        <span class="rv-mode-desc">15 questions — one from every topic. Scored, with a weak-spot report.</span>
      </button>
      <button class="rv-mode-btn" id="rvQuickBtn">
        <span class="rv-mode-title">Quick Quiz</span>
        <span class="rv-mode-desc">6 random questions for a fast check-in.</span>
      </button>
    </div>

    <h3 class="rv-drill-title">Or drill one topic</h3>
    <p class="rv-drill-sub">LeetCode style — pick an area and work problems from it.</p>
    <div class="rv-topic-grid">
      ${REVIEW_TOPICS.map(t => `
        <button class="rv-topic-btn" data-topic="${t.id}">
          <span class="rv-topic-name">${t.name}</span>
          <span class="rv-topic-day">${t.review}</span>
        </button>`).join("")}
    </div>
    <div class="rv-footer-actions">
      <button class="rv-quit-btn" id="rvBackBtn">Back to Lessons</button>
    </div>
  `;

  document.getElementById("rvFullBtn").addEventListener("click", () => startReview(REVIEW_TOPICS.map(t => t.id), 1, "Full Mock Exam"));
  document.getElementById("rvQuickBtn").addEventListener("click", () => {
    const some = rvShuffle(REVIEW_TOPICS.map(t => t.id)).slice(0, 6);
    startReview(some, 1, "Quick Quiz");
  });
  view.querySelectorAll(".rv-topic-btn").forEach(b =>
    b.addEventListener("click", () => {
      const t = REVIEW_TOPICS.find(x => x.id === b.dataset.topic);
      startReview([t.id], Math.min(3, t.make.length), t.name + " Drill");
    }));
  document.getElementById("rvBackBtn").addEventListener("click", closeReview);
}

async function startReview(topicIds, perTopic, label) {
  if (!pyReady) { alert("The Python runtime is still loading — give it a few seconds and try again."); return; }
  const view = document.getElementById("reviewView");
  view.innerHTML = `<div class="rv-loading">Generating problems…</div>`;
  const questions = await buildReview(topicIds, perTopic);
  reviewState = { questions, answers: {}, submitted: false, label, isFull: label === "Full Mock Exam" };
  renderReview();
  window.scrollTo(0, 0);
}

function renderReview() {
  const view = document.getElementById("reviewView");
  const qs = reviewState.questions;
  let h = `
    <div class="rv-head">
      <span class="rv-badge">${rvEsc(reviewState.label)}</span>
      <h2 class="rv-title">${qs.length} question${qs.length > 1 ? "s" : ""}</h2>
      <p class="rv-sub">Check each answer as you go, or submit at the end for a score. No timer.</p>
    </div>`;

  qs.forEach((q, i) => {
    h += `<div class="rv-q" id="rvQ_${i}">
      <div class="rv-q-head"><span class="rv-q-num">Q${i + 1}</span><span class="rv-q-topic">${rvEsc(q.topic)}</span></div>
      <div class="rv-q-prompt">${q.prompt}</div>`;
    if (q.code) h += `<pre class="rv-code">${rvEsc(q.code)}</pre>`;
    if (q.type === "mc") {
      h += `<div class="rv-options">` + q.options.map((o, oi) =>
        `<div class="rv-option" data-q="${i}" data-o="${oi}">${rvEsc(o)}</div>`).join("") + `</div>`;
    } else if (q.type === "predict") {
      h += `<input type="text" class="rv-input" id="rvIn_${i}" placeholder="Type the exact output…" spellcheck="false" autocomplete="off">`;
    } else {
      h += `<textarea class="rv-code-input" id="rvCode_${i}" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off">${rvEsc(q.starter || "")}</textarea>`;
    }
    h += `<div class="rv-actions">`;
    if (q.type === "code") h += `<button class="rv-run" data-q="${i}">Run &#9654;</button><button class="rv-reset" data-q="${i}">Reset</button>`;
    h += `<button class="rv-check" data-q="${i}">Check answer</button></div>`;
    if (q.type === "code") h += `<div class="rv-out" id="rvOut_${i}" style="display:none"></div>`;
    h += `<div class="rv-fb" id="rvFb_${i}" style="display:none"></div></div>`;
  });

  h += `<div class="rv-footer-actions">
      <button class="rv-submit" id="rvSubmit">Submit &amp; Score</button>
      <button class="rv-quit-btn" id="rvQuit">Back to Menu</button>
    </div>`;
  view.innerHTML = h;

  view.querySelectorAll(".rv-option").forEach(o => o.addEventListener("click", () => {
    if (o.classList.contains("locked")) return;
    const qi = o.dataset.q;
    view.querySelectorAll(`.rv-option[data-q="${qi}"]`).forEach(x => x.classList.remove("sel"));
    o.classList.add("sel");
    reviewState.answers[qi] = parseInt(o.dataset.o);
  }));
  view.querySelectorAll(".rv-code-input").forEach(ta => ta.addEventListener("keydown", e => {
    if (e.key === "Tab") { e.preventDefault();
      const s = ta.selectionStart, en = ta.selectionEnd;
      ta.value = ta.value.slice(0, s) + "    " + ta.value.slice(en);
      ta.selectionStart = ta.selectionEnd = s + 4; }
  }));
  view.querySelectorAll(".rv-run").forEach(b => b.addEventListener("click", () => rvRun(+b.dataset.q)));
  view.querySelectorAll(".rv-reset").forEach(b => b.addEventListener("click", () => rvReset(+b.dataset.q)));
  view.querySelectorAll(".rv-check").forEach(b => b.addEventListener("click", () => rvCheck(+b.dataset.q)));
  document.getElementById("rvSubmit").addEventListener("click", rvSubmit);
  document.getElementById("rvQuit").addEventListener("click", renderReviewMenu);
}

async function rvRun(i) {
  const ta = document.getElementById(`rvCode_${i}`);
  const out = document.getElementById(`rvOut_${i}`);
  out.style.display = "block";
  out.className = "rv-out";
  out.innerHTML = `<div class="rv-out-label">Running…</div>`;
  const r = await runPython(ta.value, { isolate: true });
  if (r.timeout) { out.className = "rv-out err"; out.innerHTML = `<div class="rv-out-label">Output</div><pre class="rv-out-text err">Stopped after 10 seconds — this looks like an infinite loop.</pre>`; return; }
  if (r.error) { out.className = "rv-out err"; out.innerHTML = `<div class="rv-out-label">Output</div><pre class="rv-out-text err">${rvEsc(r.error)}</pre>`; return; }
  out.innerHTML = `<div class="rv-out-label">Output</div><pre class="rv-out-text">${r.output ? rvEsc(r.output) : "(no output — add print(...) to see values, or Check answer to test it)"}</pre>`;
}

function rvReset(i) {
  const q = reviewState.questions[i];
  document.getElementById(`rvCode_${i}`).value = q.starter || "";
  const o = document.getElementById(`rvOut_${i}`); if (o) { o.style.display = "none"; o.innerHTML = ""; }
  const f = document.getElementById(`rvFb_${i}`); f.style.display = "none"; f.innerHTML = "";
}

async function rvCheck(i) {
  const q = reviewState.questions[i];
  const fb = document.getElementById(`rvFb_${i}`);
  if (!rvAttempted(q, i)) {
    fb.style.display = "block"; fb.className = "rv-fb neutral";
    fb.innerHTML = `<div class="rv-fb-head">Give it a try first, then check.</div>`;
    return;
  }
  fb.style.display = "block"; fb.className = "rv-fb neutral";
  fb.innerHTML = `<div class="rv-fb-head">Checking…</div>`;
  const r = await rvGradeOne(q, i);
  fb.className = "rv-fb " + (r.pass ? "ok" : "no");
  let html = `<div class="rv-fb-head">${r.pass ? "✓ Correct!" : "✗ Not quite."}</div>`;
  if (!r.pass) {
    html += `<div class="rv-fb-detail">${rvEsc(r.detail)}</div>`;
    html += `<div class="rv-fb-hint"><strong>Hint:</strong> ${q.explain}</div>`;
  }
  fb.innerHTML = html;
}

async function rvSubmit() {
  if (reviewState.submitted) return;
  const answered = reviewState.questions.filter((q, i) => rvAttempted(q, i)).length;
  if (answered < reviewState.questions.length &&
      !confirm(`You've answered ${answered} of ${reviewState.questions.length}. Submit anyway?`)) return;
  reviewState.submitted = true;
  const btn = document.getElementById("rvSubmit");
  btn.disabled = true; btn.textContent = "Grading…";

  const details = [];
  let score = 0;
  for (let i = 0; i < reviewState.questions.length; i++) {
    const q = reviewState.questions[i];
    const r = await rvGradeOne(q, i);
    if (r.pass) score++;
    details.push({ q, i, pass: r.pass, detail: r.detail });
  }
  rvResults(score, details);
}

function rvResults(score, details) {
  const total = details.length;
  const pct = Math.round((score / total) * 100);
  if (reviewState.isFull) {
    try {
      const best = parseInt(localStorage.getItem(REVIEW_BEST_KEY)) || 0;
      if (pct > best) localStorage.setItem(REVIEW_BEST_KEY, String(pct));
    } catch (_) {}
  }

  let verdict, cls;
  if (pct === 100) { verdict = "Perfect. You're ready for this course."; cls = "great"; }
  else if (pct >= 80) { verdict = "Strong — tighten the misses below and you're in good shape."; cls = "good"; }
  else if (pct >= 60) { verdict = "Decent foundation. Drill the weak topics below."; cls = "ok"; }
  else { verdict = "Worth reviewing these topics properly before the semester."; cls = "low"; }

  const missedTopics = [];
  details.filter(d => !d.pass).forEach(d => {
    if (!missedTopics.some(m => m.topic === d.q.topic))
      missedTopics.push({ topic: d.q.topic, review: d.q.review });
  });

  let h = `<div class="rv-score ${cls}">
      <div class="rv-score-num">${score}<span>/${total}</span></div>
      <div class="rv-score-pct">${pct}%</div>
      <div class="rv-score-verdict">${verdict}</div>
    </div>`;

  if (missedTopics.length) {
    h += `<div class="rv-review-box"><h3>Review these:</h3><ul>` +
      missedTopics.map(m => `<li><strong>${rvEsc(m.topic)}</strong> &rarr; ${rvEsc(m.review)}</li>`).join("") +
      `</ul></div>`;
  } else {
    h += `<div class="rv-review-box all-ok"><h3>Nothing missed. That's the level you want walking in.</h3></div>`;
  }

  h += `<h3 class="rv-breakdown-title">Breakdown</h3>`;
  details.forEach(d => {
    h += `<div class="rv-result ${d.pass ? "pass" : "fail"}">
      <div class="rv-result-head">${d.pass ? "✓" : "✗"} Q${d.i + 1} · ${rvEsc(d.q.topic)}</div>
      <div class="rv-result-prompt">${d.q.prompt}</div>`;
    if (d.q.code) h += `<pre class="rv-code small">${rvEsc(d.q.code)}</pre>`;
    if (!d.pass) h += `<div class="rv-fb-detail">${rvEsc(d.detail)}</div>
      <div class="rv-fb-hint"><strong>Hint:</strong> ${d.q.explain}</div>`;
    h += `</div>`;
  });

  h += `<div class="rv-footer-actions">
      <button class="rv-submit" id="rvAgain">Try again (new problems)</button>
      <button class="rv-quit-btn" id="rvMenu">Back to Menu</button>
    </div>`;

  const view = document.getElementById("reviewView");
  view.innerHTML = h;
  window.scrollTo(0, 0);
  document.getElementById("rvAgain").addEventListener("click", () => {
    const ids = [...new Set(reviewState.questions.map(q => q.topicId))];
    startReview(ids, reviewState.isFull ? 1 : Math.min(3, ids.length === 1 ? 3 : 1), reviewState.label);
  });
  document.getElementById("rvMenu").addEventListener("click", renderReviewMenu);
}

function closeReview() {
  reviewState = null;
  document.getElementById("reviewView").style.display = "none";
  showLesson(currentLesson >= 0 ? currentLesson : 0);
}

document.addEventListener("DOMContentLoaded", () => {
  const b = document.getElementById("reviewBtn");
  if (b) b.addEventListener("click", openReview);
  const w = document.getElementById("reviewWelcomeBtn");
  if (w) w.addEventListener("click", openReview);
});
