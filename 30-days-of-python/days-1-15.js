const LESSONS = [

  // ===== DAY 1: Introduction =====
  {
    id: "intro",
    title: "Introduction & Hello World",
    badge: "Day 1",
    sections: [
      {
        type: "text",
        content: `
<h3>Welcome to 30 Days of Python</h3>
<p><strong>Python</strong> is a high-level programming language loved for its clean, readable syntax. It powers web apps, data science, AI, automation, and more. Over the next 30 days you'll go from your very first line of code to building API responses — one day at a time.</p>
<h3>Your First Program</h3>
<p>The traditional first program prints a greeting to the screen. In Python, that's a single line:</p>
`
      },
      {
        type: "editor",
        starterCode: `print("Hello, World!")\n\n# This is a comment — Python ignores everything after the # symbol\nprint("Welcome to 30 Days of Python")  # comments can go here too\n\n# Python is also a calculator:\nprint(2 + 3)\nprint(10 * 4)`,
        description: "Click Run to execute your first Python program. Then change the text and run it again!"
      },
      {
        type: "text",
        content: `
<h3>Python as a Calculator</h3>
<p>Python handles all the basic math operations out of the box:</p>
`
      },
      {
        type: "code-block",
        code: `print(7 + 3)    # addition       -> 10
print(7 - 3)    # subtraction    -> 4
print(7 * 3)    # multiplication -> 21
print(7 / 3)    # division       -> 2.3333333333333335
print(7 // 3)   # floor division -> 2
print(7 % 3)    # remainder      -> 1
print(7 ** 3)   # power          -> 343`
      },
      {
        type: "text",
        content: `
<div class="info-box"><strong>How this course works:</strong> every day has runnable code editors (experiment freely — you can't break anything), quizzes to test understanding, and a graded exercise. Complete the exercise before moving on!</div>
`
      },
      {
        type: "quiz",
        question: `What does the <code>#</code> symbol do in Python?`,
        options: [
          "Marks a number",
          "Starts a comment that Python ignores",
          "Prints text to the screen",
          "Imports a module"
        ],
        correct: 1,
        explanation: "Everything after # on a line is a comment — notes for humans that Python skips entirely."
      },
      {
        type: "exercise",
        prompt: `Calculate how many <strong>seconds are in a day</strong> and store the result in a variable called <code>seconds_in_day</code>. Compute it with math (hours × minutes × seconds) — don't just type the final number!`,
        starterCode: `# How many seconds are in one day?\nseconds_in_day = \n\nprint(seconds_in_day)`,
        testCode: `
try:
    assert seconds_in_day == 86400, f"Expected 86400, got {seconds_in_day}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 2: Variables & Built-in Functions =====
  {
    id: "variables",
    title: "Variables & Built-in Functions",
    badge: "Day 2",
    sections: [
      {
        type: "text",
        content: `
<h3>Variables</h3>
<p>A variable is a name bound to a value with <code>=</code>. Rules for names:</p>
<ul>
  <li>Start with a letter or underscore — never a digit</li>
  <li>Only letters, digits, and underscores (no spaces or dashes)</li>
  <li>Case-sensitive: <code>age</code> and <code>Age</code> are different</li>
  <li>Convention: <code>snake_case</code> for variables (<code>first_name</code>, not <code>firstName</code>)</li>
</ul>
`
      },
      {
        type: "editor",
        starterCode: `first_name = "Asabeneh"\nage = 250\nis_learning = True\n\n# Multiple assignment in one line:\nx, y, z = 1, 2, 3\nprint(x, y, z)\n\n# Reassigning is fine — the old value is replaced\nage = 26\nprint(first_name, "is", age)`,
        description: "Variables can be created, read, and reassigned freely."
      },
      {
        type: "text",
        content: `
<h3>Built-in Functions</h3>
<p>Python ships with dozens of ready-to-use functions. The ones you'll use constantly:</p>
<ul>
  <li><code>print()</code> — display output</li>
  <li><code>len()</code> — length of a string, list, etc.</li>
  <li><code>type()</code> — what type a value is</li>
  <li><code>int()</code>, <code>float()</code>, <code>str()</code>, <code>bool()</code> — convert between types</li>
  <li><code>round()</code>, <code>abs()</code>, <code>min()</code>, <code>max()</code>, <code>sum()</code> — math helpers</li>
  <li><code>input()</code> — read text from the user (always returns a <strong>string</strong>!)</li>
</ul>
`
      },
      {
        type: "editor",
        starterCode: `word = "python"\nprint(len(word))        # 6\nprint(type(word))       # <class 'str'>\nprint(type(3.14))       # <class 'float'>\n\nprint(int("42") + 1)    # 43 — string converted to int\nprint(round(3.14159, 2)) # 3.14\nprint(abs(-7))          # 7\nprint(max(4, 9, 2))     # 9`,
        description: "Try the built-ins. What happens if you call int(\"hello\")? (Run it — errors are learning!)"
      },
      {
        type: "quiz",
        question: `Which of these is <strong>NOT</strong> a valid variable name?`,
        options: ["my_var", "_temp", "2nd_place", "name2"],
        correct: 2,
        explanation: "Variable names cannot start with a digit. 2nd_place is invalid; name2 is fine because the digit isn't first."
      },
      {
        type: "exercise",
        prompt: `Swap the values of <code>a</code> and <code>b</code> so that <code>a</code> becomes 10 and <code>b</code> becomes 5. (Hint: Python can do this in one line — <code>a, b = b, a</code> — or use a temporary variable.)`,
        starterCode: `a = 5\nb = 10\n\n# Swap them below\n\n\nprint(a, b)  # should print: 10 5`,
        testCode: `
try:
    assert a == 10, f"a should be 10, got {a}"
    assert b == 5, f"b should be 5, got {b}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 3: Operators =====
  {
    id: "operators",
    title: "Operators",
    badge: "Day 3",
    sections: [
      {
        type: "text",
        content: `
<h3>Arithmetic, Comparison & Logic</h3>
<ul>
  <li><strong>Arithmetic:</strong> <code>+ - * /</code>, plus <code>//</code> (floor division), <code>%</code> (remainder), <code>**</code> (power)</li>
  <li><strong>Comparison:</strong> <code>== != &lt; &gt; &lt;= &gt;=</code> — always produce <code>True</code> or <code>False</code></li>
  <li><strong>Logical:</strong> <code>and</code>, <code>or</code>, <code>not</code></li>
  <li><strong>Assignment shortcuts:</strong> <code>+= -= *= //=</code> etc.</li>
  <li><strong>Membership:</strong> <code>in</code> / <code>not in</code> — is a value inside a sequence?</li>
</ul>
`
      },
      {
        type: "editor",
        starterCode: `print(15 / 4)    # 3.75  (/ always gives a float)\nprint(15 // 4)   # 3     (floor division rounds down)\nprint(15 % 4)    # 3     (remainder)\nprint(2 ** 8)    # 256\n\nage = 20\nprint(age >= 18 and age < 65)   # True\nprint(not (age == 20))          # False\n\nprint("y" in "python")          # True\n\nscore = 10\nscore += 5   # same as score = score + 5\nprint(score)`,
        description: "The difference between / and // trips up every beginner — burn it in now."
      },
      {
        type: "text",
        content: `
<div class="info-box"><strong>Precedence:</strong> <code>**</code> first, then <code>* / // %</code>, then <code>+ -</code>, then comparisons, then <code>not</code> → <code>and</code> → <code>or</code>. When in doubt, add parentheses.</div>
`
      },
      {
        type: "quiz",
        question: `What is the value of <code>3 ** 2 % 5</code>?`,
        options: ["1", "4", "9", "0"],
        correct: 1,
        explanation: "** binds tighter than %: 3 ** 2 = 9 first, then 9 % 5 = 4."
      },
      {
        type: "exercise",
        prompt: `Calculate the <strong>area of a circle</strong> with the given radius using the formula: area = π × r². Store it in <code>area</code>.`,
        starterCode: `pi = 3.14159\nradius = 5\n\narea = \n\nprint(area)`,
        testCode: `
try:
    assert round(area, 2) == 78.54, f"Expected ~78.54, got {area}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 4: Strings =====
  {
    id: "strings",
    title: "Strings",
    badge: "Day 4",
    sections: [
      {
        type: "text",
        content: `
<h3>Creating Strings</h3>
<p>Single quotes, double quotes, or triple quotes for multi-line. <strong>Escape sequences</strong> insert special characters: <code>\\n</code> (new line), <code>\\t</code> (tab), <code>\\\\</code> (backslash), <code>\\"</code> (quote inside quotes).</p>
<p><strong>f-strings</strong> are the modern way to build strings from variables — prefix with <code>f</code> and drop expressions inside <code>{ }</code>.</p>
`
      },
      {
        type: "editor",
        starterCode: `print("Line one\\nLine two")\nprint("Name:\\tAsabeneh")\nprint("She said \\"hi\\"")\n\nname = "Python"\nversion = 3.12\nprint(f"I am learning {name} {version}")\nprint(f"2 + 2 is {2 + 2}")`,
        description: "Escape sequences + f-strings. The {} in an f-string can hold any expression."
      },
      {
        type: "text",
        content: `
<h3>Indexing & Slicing</h3>
<p>Each character has an index starting at <code>0</code>; negatives count from the end. Slices use <code>[start:stop:step]</code> — start inclusive, stop <strong>exclusive</strong>.</p>
<h3>String Methods</h3>
<p>Strings come loaded with methods. They never modify the original (strings are <strong>immutable</strong>) — they return a new string.</p>
`
      },
      {
        type: "editor",
        starterCode: `s = "thirty days of python"\n\nprint(s[0])          # t\nprint(s[-1])         # n\nprint(s[7:11])       # days\nprint(s[::-1])       # reversed!\n\nprint(s.upper())\nprint(s.title())           # Thirty Days Of Python\nprint(s.replace("python", "coding"))\nprint(s.split(" "))        # list of words\nprint(s.find("days"))      # 7 (index where it starts)\nprint(s.count("t"))        # 3\nprint("   messy   ".strip())\nprint("-".join(["a", "b", "c"]))   # a-b-c`,
        description: "The big six: upper/lower, split, join, strip, replace, find. You'll use these forever."
      },
      {
        type: "quiz",
        question: `What does <code>"python"[1:4]</code> return?`,
        options: ['"pyt"', '"yth"', '"ytho"', '"th"'],
        correct: 1,
        explanation: 'Indices 1, 2, 3 (stop index 4 is excluded): "y", "t", "h" -> "yth".'
      },
      {
        type: "quiz",
        question: `What does <code>"-".join(["a", "b", "c"])</code> return?`,
        options: ['["a-b-c"]', '"abc"', '"a-b-c"', '"a b c"'],
        correct: 2,
        explanation: 'join glues list items into one string using the separator string it was called on: "a-b-c".'
      },
      {
        type: "exercise",
        prompt: `Given the sentence, create: <code>words</code> (a list of its words), <code>word_count</code> (how many words), and <code>shout</code> (the whole sentence uppercased).`,
        starterCode: `sentence = "I am learning Python every day"\n\nwords = \nword_count = \nshout = \n\nprint(words)\nprint(word_count)\nprint(shout)`,
        testCode: `
try:
    assert words == ["I", "am", "learning", "Python", "every", "day"], f"words is wrong: {words}"
    assert word_count == 6, f"word_count should be 6, got {word_count}"
    assert shout == "I AM LEARNING PYTHON EVERY DAY", f"shout is wrong: {shout}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 5: Lists =====
  {
    id: "lists",
    title: "Lists",
    badge: "Day 5",
    sections: [
      {
        type: "text",
        content: `
<h3>Python's Workhorse Collection</h3>
<p>A <strong>list</strong> is an ordered, changeable collection: <code>fruits = ["apple", "banana", "cherry"]</code>. Indexing and slicing work exactly like strings — but unlike strings, lists are <strong>mutable</strong>: you can change, add, and remove items.</p>
`
      },
      {
        type: "editor",
        starterCode: `fruits = ["apple", "banana", "cherry"]\n\nfruits[0] = "avocado"        # replace by index\nfruits.append("date")        # add to end\nfruits.insert(1, "blueberry") # insert at position\nfruits.remove("banana")      # remove by value\nlast = fruits.pop()          # remove & return last\n\nprint(fruits)\nprint("Removed:", last)\nprint("Length:", len(fruits))\nprint("cherry" in fruits)`,
        description: "The core mutation methods: append, insert, remove, pop."
      },
      {
        type: "editor",
        starterCode: `nums = [40, 10, 30, 20]\n\nprint(sorted(nums))   # NEW sorted list, original untouched\nprint(nums)\n\nnums.sort()           # sorts IN PLACE, returns None\nprint(nums)\nnums.reverse()\nprint(nums)\n\n# The aliasing trap:\na = [1, 2, 3]\nb = a          # NOT a copy — both names point to the SAME list\nb.append(4)\nprint(a)       # [1, 2, 3, 4] — a changed too!\n\nc = a.copy()   # a real copy\nc.append(99)\nprint(a)       # unchanged\nprint(c)`,
        description: "sort() vs sorted(), and the #1 list gotcha: b = a does not copy."
      },
      {
        type: "quiz",
        question: `After <code>a = [1, 2]</code> then <code>b = a</code> then <code>b.append(3)</code>, what is <code>a</code>?`,
        options: ["[1, 2]", "[1, 2, 3]", "[3]", "Error"],
        correct: 1,
        explanation: "b = a makes both names point to the same list object, so appending through b also shows up in a. Use a.copy() for an independent copy."
      },
      {
        type: "exercise",
        prompt: `Build a new list <code>unique</code> containing the values of <code>nums</code> with duplicates removed, <strong>keeping the original order</strong>. (Hint: loop over nums; append each value only if it's not already in unique.)`,
        starterCode: `nums = [1, 2, 2, 3, 4, 4, 4, 5]\nunique = []\n\n# your loop here\n\n\nprint(unique)`,
        testCode: `
try:
    assert unique == [1, 2, 3, 4, 5], f"Expected [1, 2, 3, 4, 5], got {unique}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 6: Tuples =====
  {
    id: "tuples",
    title: "Tuples",
    badge: "Day 6",
    sections: [
      {
        type: "text",
        content: `
<h3>Immutable Sequences</h3>
<p>A <strong>tuple</strong> is like a list that can never change after creation: <code>point = (3, 4)</code>. Use tuples for fixed groups of values — coordinates, RGB colors, (min, max) pairs. Because they can't change, they're safe to pass around and can even be dictionary keys.</p>
`
      },
      {
        type: "editor",
        starterCode: `point = (3, 4)\nrgb = (255, 128, 0)\nsingle = (42,)          # single-element tuple NEEDS the comma\n\nprint(point[0], point[1])\nprint(len(rgb))\nprint(rgb.count(255), rgb.index(128))\n\n# Unpacking — assign all at once:\nx, y = point\nprint(f"x={x}, y={y}")\n\n# Convert back and forth:\nnums = list(point)      # tuple -> list (now editable)\nnums.append(5)\nback = tuple(nums)      # list -> tuple (locked again)\nprint(back)\n\n# point[0] = 99   # uncomment to see: TypeError!`,
        description: "Unpacking tuples is everywhere in Python — functions returning multiple values use it."
      },
      {
        type: "quiz",
        question: `What is the type of <code>(5)</code> — with no comma?`,
        options: ["tuple", "int", "list", "SyntaxError"],
        correct: 1,
        explanation: "(5) is just the number 5 in parentheses. A one-element tuple requires the trailing comma: (5,)."
      },
      {
        type: "exercise",
        prompt: `Write a function <code>min_max(numbers)</code> that returns a <strong>tuple</strong> of the smallest and largest values: <code>(smallest, largest)</code>.`,
        starterCode: `def min_max(numbers):\n    # return a tuple: (smallest, largest)\n    pass\n\nprint(min_max([3, 1, 4, 1, 5]))  # (1, 5)`,
        testCode: `
try:
    assert min_max([3, 1, 4, 1, 5]) == (1, 5)
    assert type(min_max([2, 7])) == tuple, "Must return a tuple, not a list"
    assert min_max([9]) == (9, 9)
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 7: Sets =====
  {
    id: "sets",
    title: "Sets",
    badge: "Day 7",
    sections: [
      {
        type: "text",
        content: `
<h3>Unordered, Unique</h3>
<p>A <strong>set</strong> holds unique values with no order: <code>{1, 2, 3}</code>. Duplicates vanish automatically — which makes sets perfect for de-duplication and for math-style operations between groups.</p>
<ul>
  <li><code>|</code> or <code>.union()</code> — everything in either set</li>
  <li><code>&amp;</code> or <code>.intersection()</code> — only items in both</li>
  <li><code>-</code> or <code>.difference()</code> — in the first but not the second</li>
  <li><code>^</code> — in one or the other, but not both</li>
</ul>
`
      },
      {
        type: "editor",
        starterCode: `nums = {1, 2, 2, 3, 3, 3}\nprint(nums)              # duplicates removed automatically\n\nnums.add(4)\nnums.discard(1)          # remove (no error if missing)\nprint(nums)\n\nfrontend = {"html", "css", "js"}\nbackend = {"python", "sql", "js"}\n\nprint(frontend | backend)    # union\nprint(frontend & backend)    # intersection: {'js'}\nprint(frontend - backend)    # in frontend only\nprint(frontend ^ backend)    # in exactly one\n\nprint({"html", "css"} <= frontend)   # subset check: True`,
        description: "Set operators read like math. Note there's no indexing — sets have no order."
      },
      {
        type: "quiz",
        question: `What is <code>len({1, 2, 2, 3, 3, 3})</code>?`,
        options: ["6", "1", "3", "Error"],
        correct: 2,
        explanation: "Sets keep only unique values, so the set is {1, 2, 3} — length 3."
      },
      {
        type: "exercise",
        prompt: `Use sets to find the values that appear in <strong>both</strong> lists, and store them as a <strong>sorted list</strong> in <code>overlap</code>. (Hint: convert to sets, use <code>&amp;</code>, then <code>sorted()</code>.)`,
        starterCode: `a = [1, 2, 3, 4, 5, 6]\nb = [4, 5, 6, 7, 8]\n\noverlap = \n\nprint(overlap)`,
        testCode: `
try:
    assert overlap == [4, 5, 6], f"Expected [4, 5, 6], got {overlap}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 8: Dictionaries =====
  {
    id: "dicts",
    title: "Dictionaries",
    badge: "Day 8",
    sections: [
      {
        type: "text",
        content: `
<h3>Key → Value Pairs</h3>
<p>A <strong>dictionary</strong> maps keys to values — like a real dictionary maps words to definitions. It's arguably Python's most important data structure.</p>
`
      },
      {
        type: "editor",
        starterCode: `person = {\n    "first_name": "Asabeneh",\n    "country": "Finland",\n    "skills": ["Python", "JS"],\n    "is_married": True\n}\n\nprint(person["country"])          # read by key\nperson["age"] = 250               # add a new key\nperson["country"] = "Norway"      # update\ndel person["is_married"]          # delete\n\nprint(person.get("city"))          # None — no crash\nprint(person.get("city", "Unknown")) # default value\n\nprint("skills" in person)          # keys membership\n\nfor key, value in person.items():\n    print(f"{key}: {value}")`,
        description: ".get() with a default is the safe way to read keys that might not exist."
      },
      {
        type: "text",
        content: `
<div class="info-box"><strong>Three views:</strong> <code>d.keys()</code>, <code>d.values()</code>, and <code>d.items()</code> (key-value pairs, perfect for loops).</div>
`
      },
      {
        type: "quiz",
        question: `What happens when you run <code>d["missing"]</code> on a dict without that key?`,
        options: ["Returns None", "KeyError is raised", "Returns 0", "The key is created"],
        correct: 1,
        explanation: "Square-bracket access on a missing key raises KeyError. Use d.get(\"missing\") to get None (or a default) instead."
      },
      {
        type: "exercise",
        prompt: `Build <code>inverted</code> — a dictionary with the keys and values of <code>codes</code> swapped, e.g. <code>{"United States": "us", ...}</code>. (Hint: loop over <code>codes.items()</code>.)`,
        starterCode: `codes = {"us": "United States", "fr": "France", "jp": "Japan"}\ninverted = {}\n\n# your loop here\n\n\nprint(inverted)`,
        testCode: `
try:
    assert inverted == {"United States": "us", "France": "fr", "Japan": "jp"}, f"Got: {inverted}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 9: Conditionals =====
  {
    id: "conditionals",
    title: "Conditionals",
    badge: "Day 9",
    sections: [
      {
        type: "text",
        content: `
<h3>Making Decisions</h3>
<p><code>if</code> / <code>elif</code> / <code>else</code> chooses a path. Python checks each condition top-down and runs the <strong>first</strong> block whose condition is true. Indentation (4 spaces) defines the blocks.</p>
<p><strong>Truthiness:</strong> in a condition, <code>0</code>, <code>""</code>, <code>[]</code>, <code>{}</code>, and <code>None</code> all count as <code>False</code>. Everything else is <code>True</code>.</p>
`
      },
      {
        type: "editor",
        starterCode: `temp = 25\n\nif temp > 30:\n    print("Hot")\nelif temp > 15:\n    print("Nice")\nelse:\n    print("Cold")\n\n# Truthiness in action:\nitems = []\nif items:\n    print("You have items")\nelse:\n    print("Empty list is falsy!")\n\n# One-line conditional (ternary):\nage = 20\nstatus = "adult" if age >= 18 else "minor"\nprint(status)`,
        description: "Change temp to test each branch. Note how the empty list behaves."
      },
      {
        type: "quiz",
        question: `Which of these is <strong>truthy</strong>?`,
        options: ["0", '"" (empty string)', "[] (empty list)", '"False" (the string)'],
        correct: 3,
        explanation: 'Any NON-empty string is truthy — even the string "False"! Only empty containers, zero, and None are falsy.'
      },
      {
        type: "exercise",
        prompt: `Write a function <code>grade(score)</code>: 90+ → <code>"A"</code>, 80–89 → <code>"B"</code>, 70–79 → <code>"C"</code>, 60–69 → <code>"D"</code>, below 60 → <code>"F"</code>.`,
        starterCode: `def grade(score):\n    # your if/elif/else chain here\n    pass\n\nprint(grade(95), grade(82), grade(71), grade(65), grade(30))`,
        testCode: `
try:
    assert grade(95) == "A" and grade(90) == "A"
    assert grade(89) == "B" and grade(82) == "B"
    assert grade(71) == "C"
    assert grade(65) == "D" and grade(60) == "D"
    assert grade(30) == "F"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 10: Loops =====
  {
    id: "loops",
    title: "Loops",
    badge: "Day 10",
    sections: [
      {
        type: "text",
        content: `
<h3>Repeat Yourself (Without Repeating Yourself)</h3>
<p><code>while</code> repeats as long as a condition holds. <code>for</code> walks through each item of a sequence. <code>range(start, stop, step)</code> generates number sequences — stop is always <strong>excluded</strong>.</p>
`
      },
      {
        type: "editor",
        starterCode: `# while: countdown\ncount = 3\nwhile count > 0:\n    print(count)\n    count -= 1\nprint("Lift off!")\n\n# for over a list\nfor lang in ["Python", "JS", "Rust"]:\n    print("I know", lang)\n\n# range forms\nprint(list(range(5)))         # 0..4\nprint(list(range(2, 10, 3)))  # 2, 5, 8`,
        description: "while needs something inside the loop to eventually make the condition false!"
      },
      {
        type: "editor",
        starterCode: `# break exits; continue skips to the next round\nfor n in range(10):\n    if n == 5:\n        break\n    if n % 2 == 0:\n        continue\n    print(n)          # 1, 3\n\n# enumerate: index + value together\nfor i, fruit in enumerate(["apple", "banana"]):\n    print(i, fruit)\n\n# zip: walk two lists in parallel\nnames = ["Ana", "Ben"]\nscores = [90, 85]\nfor name, score in zip(names, scores):\n    print(f"{name}: {score}")`,
        description: "break / continue / enumerate / zip — the four tools that make loops elegant."
      },
      {
        type: "quiz",
        question: `What does <code>list(range(2, 10, 3))</code> produce?`,
        options: ["[2, 5, 8, 11]", "[3, 6, 9]", "[2, 5, 8]", "[2, 4, 6, 8]"],
        correct: 2,
        explanation: "Start at 2, step by 3: 2, 5, 8. The next value 11 is past the stop (10), and stop is always excluded."
      },
      {
        type: "exercise",
        prompt: `Complete <code>digit_sum(n)</code> so it adds up the digits of <code>n</code> using a <strong>while</strong> loop. (Hint: <code>n % 10</code> gives the last digit; <code>n // 10</code> drops it.)`,
        starterCode: `def digit_sum(n):\n    total = 0\n    # your while loop here\n\n    return total\n\nprint(digit_sum(1234))  # 10\nprint(digit_sum(999))   # 27`,
        testCode: `
try:
    assert digit_sum(1234) == 10, f"digit_sum(1234) gave {digit_sum(1234)}"
    assert digit_sum(999) == 27
    assert digit_sum(5) == 5
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 11: Functions =====
  {
    id: "functions",
    title: "Functions",
    badge: "Day 11",
    sections: [
      {
        type: "text",
        content: `
<h3>Reusable Blocks</h3>
<p>Define with <code>def</code>, hand back a result with <code>return</code>. Parameters can have <strong>defaults</strong>, and callers can pass arguments by <strong>keyword</strong>. A function with no <code>return</code> gives back <code>None</code>.</p>
`
      },
      {
        type: "editor",
        starterCode: `def greet(name, greeting="Hello"):\n    return f"{greeting}, {name}!"\n\nprint(greet("Asabeneh"))\nprint(greet("Ada", "Welcome"))\nprint(greet(greeting="Hei", name="Aino"))  # keyword args, any order\n\ndef shout(text):\n    print(text.upper())      # prints, but returns None!\n\nresult = shout("hi there")\nprint(result)                # None — print is not return`,
        description: "return sends a value back; print just displays. Mixing them up is the classic beginner bug."
      },
      {
        type: "editor",
        starterCode: `# *args collects extra positional arguments into a TUPLE\ndef describe(*args):\n    print(type(args), args)\n\ndescribe(1, 2, 3)\n\n# **kwargs collects keyword arguments into a DICT\ndef profile(**kwargs):\n    for key, value in kwargs.items():\n        print(f"{key} = {value}")\n\nprofile(name="Asabeneh", country="Finland")\n\n# Scope: variables inside functions are local\nx = 10\ndef change():\n    x = 99   # a NEW local x — the global is untouched\nchange()\nprint(x)     # still 10`,
        description: "*args and **kwargs let functions accept any number of arguments."
      },
      {
        type: "quiz",
        question: `A function body runs <code>print("done")</code> but has no <code>return</code>. What does calling it evaluate to?`,
        options: ['"done"', "0", "None", "True"],
        correct: 2,
        explanation: "No return statement means the function returns None. The print is a side effect, not a return value."
      },
      {
        type: "exercise",
        prompt: `Write <code>sum_all(*args)</code> that returns the sum of every number passed to it — including zero arguments (which should return 0).`,
        starterCode: `def sum_all(*args):\n    pass\n\nprint(sum_all(1, 2, 3))   # 6\nprint(sum_all(10, 20))    # 30\nprint(sum_all())          # 0`,
        testCode: `
try:
    assert sum_all(1, 2, 3) == 6
    assert sum_all(10, 20) == 30
    assert sum_all() == 0
    assert sum_all(5) == 5
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 12: Modules =====
  {
    id: "modules",
    title: "Modules",
    badge: "Day 12",
    sections: [
      {
        type: "text",
        content: `
<h3>Code You Can Import</h3>
<p>A <strong>module</strong> is a file of Python code you can pull into your program. Python's <strong>standard library</strong> ships with hundreds: <code>math</code>, <code>random</code>, <code>os</code>, <code>sys</code>, <code>datetime</code>, <code>json</code>…</p>
<ul>
  <li><code>import math</code> → use as <code>math.sqrt(16)</code></li>
  <li><code>from math import sqrt, pi</code> → use directly: <code>sqrt(16)</code></li>
  <li><code>import math as m</code> → alias: <code>m.sqrt(16)</code></li>
</ul>
`
      },
      {
        type: "editor",
        starterCode: `import math\nfrom random import randint\n\nprint(math.sqrt(144))     # 12.0\nprint(math.floor(9.81))   # 9\nprint(math.ceil(9.1))     # 10\nprint(math.pi)\n\nprint(randint(1, 6))      # roll a die — rerun for new numbers!\n\nimport statistics as st\nprint(st.mean([2, 4, 6]))  # 4`,
        description: "Three import styles in one script. Run it a few times — randint changes."
      },
      {
        type: "code-block",
        code: `# Your own files are modules too!
# ---- mymodule.py ----
def double(x):
    return x * 2

# ---- main.py ----
import mymodule
print(mymodule.double(21))   # 42

from mymodule import double
print(double(21))            # 42`
      },
      {
        type: "quiz",
        question: `After <code>from math import sqrt</code>, which call is correct?`,
        options: ["math.sqrt(16)", "sqrt(16)", "math.sqrt.16", "import.sqrt(16)"],
        correct: 1,
        explanation: "from math import sqrt brings sqrt itself into your namespace — call it directly. (math.sqrt would need import math.)"
      },
      {
        type: "exercise",
        prompt: `Use <code>math.sqrt</code> to compute the hypotenuse of a right triangle with legs 6 and 8 (formula: √(a² + b²)). Store it in <code>hypotenuse</code>.`,
        starterCode: `import math\n\na = 6\nb = 8\n\nhypotenuse = \n\nprint(hypotenuse)`,
        testCode: `
try:
    assert hypotenuse == 10.0, f"Expected 10.0, got {hypotenuse}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 13: List Comprehension =====
  {
    id: "comprehensions",
    title: "List Comprehension",
    badge: "Day 13",
    sections: [
      {
        type: "text",
        content: `
<h3>Loops, Compressed</h3>
<p>A <strong>list comprehension</strong> builds a list in one readable line: <code>[expression for item in iterable if condition]</code>. It replaces the append-in-a-loop pattern.</p>
`
      },
      {
        type: "editor",
        starterCode: `nums = [1, 2, 3, 4, 5, 6]\n\n# The loop way:\ndoubled = []\nfor n in nums:\n    doubled.append(n * 2)\nprint(doubled)\n\n# The comprehension way — same result, one line:\nprint([n * 2 for n in nums])\n\n# With a filter:\nprint([n for n in nums if n % 2 == 0])       # evens only\nprint([n ** 2 for n in nums if n > 3])       # squares of 4,5,6\n\n# Works on strings too:\nwords = ["hello", "world", "python"]\nprint([w.upper() for w in words])\n\n# Bonus: dict & set comprehensions exist too\nprint({w: len(w) for w in words})\nprint({len(w) for w in words})`,
        description: "Read them aloud: 'n times 2, for each n in nums'. If it fits in one breath, use a comprehension."
      },
      {
        type: "quiz",
        question: `What does <code>[x * x for x in range(4)]</code> produce?`,
        options: ["[1, 4, 9, 16]", "[0, 1, 4, 9]", "[0, 2, 4, 6]", "[1, 2, 3, 4]"],
        correct: 1,
        explanation: "range(4) is 0,1,2,3 — squared: 0, 1, 4, 9. Remember range starts at 0!"
      },
      {
        type: "exercise",
        prompt: `In a <strong>single list comprehension</strong>, build <code>evens_squared</code>: the squares of only the even numbers in <code>nums</code>.`,
        starterCode: `nums = [1, 2, 3, 4, 5, 6, 7, 8]\n\nevens_squared = \n\nprint(evens_squared)`,
        testCode: `
try:
    assert evens_squared == [4, 16, 36, 64], f"Expected [4, 16, 36, 64], got {evens_squared}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 14: Higher Order Functions =====
  {
    id: "hof",
    title: "Higher Order Functions",
    badge: "Day 14",
    sections: [
      {
        type: "text",
        content: `
<h3>Functions That Take Functions</h3>
<p>In Python, functions are values — you can pass them around. A <strong>higher-order function</strong> accepts (or returns) another function. A <strong>lambda</strong> is a tiny unnamed function: <code>lambda x: x * 2</code>.</p>
<ul>
  <li><code>map(f, seq)</code> — apply f to every item</li>
  <li><code>filter(f, seq)</code> — keep items where f is True</li>
  <li><code>sorted(seq, key=f)</code> — sort by what f returns</li>
  <li><code>functools.reduce(f, seq)</code> — fold a sequence into one value</li>
</ul>
`
      },
      {
        type: "editor",
        starterCode: `nums = [1, 2, 3, 4, 5]\n\ndoubled = list(map(lambda x: x * 2, nums))\nprint(doubled)\n\nbig = list(filter(lambda x: x > 2, nums))\nprint(big)\n\nwords = ["banana", "fig", "cherry"]\nprint(sorted(words, key=len))          # sort by length\nprint(sorted(words, key=lambda w: w[-1]))  # sort by LAST letter\n\nfrom functools import reduce\ntotal = reduce(lambda a, b: a + b, nums)\nprint(total)   # 15`,
        description: "map/filter return lazy objects — wrap in list() to see the values."
      },
      {
        type: "code-block",
        code: `# Functions can BUILD functions (closures):
def make_multiplier(n):
    def multiply(x):
        return x * n
    return multiply

triple = make_multiplier(3)
print(triple(10))    # 30

# Decorators use this idea to wrap functions — you'll meet
# them in frameworks like Flask: @app.route("/")`
      },
      {
        type: "quiz",
        question: `What does <code>list(filter(lambda x: x &gt; 2, [1, 2, 3, 4]))</code> return?`,
        options: ["[3, 4]", "[1, 2]", "[True, True]", "[2, 3, 4]"],
        correct: 0,
        explanation: "filter keeps only the items where the lambda returns True: 3 and 4."
      },
      {
        type: "exercise",
        prompt: `Sort the list of (fruit, count) tuples by the <strong>count</strong> (the second item), smallest first, using <code>sorted()</code> with a lambda <code>key</code>. Store it in <code>by_count</code>.`,
        starterCode: `fruits = [("apple", 3), ("banana", 1), ("cherry", 2)]\n\nby_count = \n\nprint(by_count)`,
        testCode: `
try:
    assert by_count == [("banana", 1), ("cherry", 2), ("apple", 3)], f"Got: {by_count}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 15: Python Type Errors =====
  {
    id: "type-errors",
    title: "Python Type Errors",
    badge: "Day 15",
    sections: [
      {
        type: "text",
        content: `
<h3>Reading Error Messages</h3>
<p>Errors are Python <em>talking to you</em>. The last line of a traceback names the error type and explains it. The types you'll meet most:</p>
<ul>
  <li><code>SyntaxError</code> — the code isn't valid Python (missing colon, unclosed quote)</li>
  <li><code>NameError</code> — using a variable that doesn't exist</li>
  <li><code>TypeError</code> — wrong type: <code>"2" + 2</code></li>
  <li><code>ValueError</code> — right type, bad value: <code>int("abc")</code></li>
  <li><code>IndexError</code> — sequence index out of range</li>
  <li><code>KeyError</code> — dict key doesn't exist</li>
  <li><code>AttributeError</code> — method/attribute doesn't exist: <code>[1,2].push(3)</code></li>
  <li><code>ZeroDivisionError</code> — dividing by zero</li>
</ul>
`
      },
      {
        type: "editor",
        starterCode: `# Each block triggers a different error — we catch it and print its name\n\ntry:\n    int("abc")\nexcept Exception as e:\n    print(type(e).__name__, "->", e)\n\ntry:\n    "2" + 2\nexcept Exception as e:\n    print(type(e).__name__, "->", e)\n\ntry:\n    [1, 2, 3][10]\nexcept Exception as e:\n    print(type(e).__name__, "->", e)\n\ntry:\n    {"a": 1}["z"]\nexcept Exception as e:\n    print(type(e).__name__, "->", e)\n\ntry:\n    10 / 0\nexcept Exception as e:\n    print(type(e).__name__, "->", e)`,
        description: "Run it, match each error to the list above. Then try causing an AttributeError yourself!"
      },
      {
        type: "quiz",
        question: `What error does <code>int("abc")</code> raise?`,
        options: ["TypeError", "SyntaxError", "ValueError", "NameError"],
        correct: 2,
        explanation: 'The argument is the right TYPE (a string is allowed), but its VALUE can\'t be converted — that\'s ValueError. TypeError would be int([1,2]).'
      },
      {
        type: "quiz",
        question: `What error does <code>"2" + 2</code> raise?`,
        options: ["TypeError", "ValueError", "No error — it prints 4", 'No error — it prints "22"'],
        correct: 0,
        explanation: "You can't add a string and an int — mismatched types is TypeError. Convert first: int(\"2\") + 2 or \"2\" + str(2)."
      }
    ]
  }
];
