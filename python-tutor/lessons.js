const LESSONS = [
  // ===== LESSON 1: Variables & Data Types =====
  {
    id: "variables",
    title: "Variables & Data Types",
    badge: "Lesson 1",
    sections: [
      {
        type: "text",
        content: `
<h3>What is a Variable?</h3>
<p>A <strong>variable</strong> is a name that refers to a value stored in your computer's memory. Think of it as a labeled box where you can put data.</p>
<p>In Python, you create a variable by using the <code>=</code> sign (the <strong>assignment operator</strong>):</p>
`
      },
      {
        type: "code-block",
        code: `name = "Taeyeon"
age = 18
gpa = 3.95
is_student = True`
      },
      {
        type: "text",
        content: `
<h3>Python's Core Data Types</h3>
<p>Every value in Python has a <strong>type</strong>. The four basic types you need to know:</p>
<ul>
  <li><strong>int</strong> — whole numbers: <code>42</code>, <code>-7</code>, <code>0</code></li>
  <li><strong>float</strong> — decimal numbers: <code>3.14</code>, <code>-0.5</code>, <code>2.0</code></li>
  <li><strong>str</strong> — text (strings): <code>"hello"</code>, <code>'world'</code></li>
  <li><strong>bool</strong> — True or False: <code>True</code>, <code>False</code></li>
</ul>
<p>You can check a value's type with the built-in <code>type()</code> function:</p>
`
      },
      {
        type: "editor",
        starterCode: `x = 42\nprint(type(x))\n\ny = 3.14\nprint(type(y))\n\nname = "Python"\nprint(type(name))\n\nflag = True\nprint(type(flag))`,
        description: "Run this code to see Python's type() function in action."
      },
      {
        type: "text",
        content: `
<h3>Type Conversion (Casting)</h3>
<p>You can convert between types using <code>int()</code>, <code>float()</code>, <code>str()</code>, and <code>bool()</code>:</p>
`
      },
      {
        type: "code-block",
        code: `# String to integer
num_str = "42"
num = int(num_str)    # 42

# Integer to float
x = float(5)          # 5.0

# Number to string
s = str(100)          # "100"

# Anything to bool
bool(0)     # False
bool(1)     # True
bool("")    # False
bool("hi")  # True`
      },
      {
        type: "text",
        content: `
<div class="info-box"><strong>Key Rule:</strong> Variable names must start with a letter or underscore, can contain letters, digits, and underscores, and are <strong>case-sensitive</strong> (<code>Name</code> and <code>name</code> are different variables).</div>
`
      },
      {
        type: "exercise",
        prompt: `Create a variable called <code>temperature</code> set to <code>98.6</code>, and a variable called <code>unit</code> set to <code>"F"</code>. Then print them together like: <code>98.6 F</code>`,
        starterCode: `# Create your variables below\n\n\n# Print them (hint: use comma in print)\n`,
        testCode: `
try:
    assert temperature == 98.6, "temperature should be 98.6"
    assert unit == "F", 'unit should be "F"'
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      },
      {
        type: "quiz",
        question: `What is the output of <code>type(3.0)</code>?`,
        options: [
          "<class 'float'>",
          "<class 'int'>",
          "<class 'str'>",
          "<class 'double'>"
        ],
        correct: 0,
        explanation: "3.0 has a decimal point, so Python treats it as a float — even though it's a whole number."
      },
      {
        type: "quiz",
        question: `What does <code>bool("")</code> return?`,
        options: ["True", "False", "None", "Error"],
        correct: 1,
        explanation: "An empty string is 'falsy' in Python. Empty collections, zero, None, and empty strings all convert to False."
      }
    ]
  },

  // ===== LESSON 2: Operators =====
  {
    id: "operators",
    title: "Operators & Expressions",
    badge: "Lesson 2",
    sections: [
      {
        type: "text",
        content: `
<h3>Arithmetic Operators</h3>
<p>Python supports all standard math operations, plus a few extras:</p>
<ul>
  <li><code>+</code> Addition, <code>-</code> Subtraction, <code>*</code> Multiplication</li>
  <li><code>/</code> Division (always returns a float!)</li>
  <li><code>//</code> Floor division (rounds down to nearest int)</li>
  <li><code>%</code> Modulo (remainder after division)</li>
  <li><code>**</code> Exponentiation (power)</li>
</ul>
`
      },
      {
        type: "editor",
        starterCode: `print(10 / 3)    # Regular division\nprint(10 // 3)   # Floor division\nprint(10 % 3)    # Remainder\nprint(2 ** 10)   # 2 to the power of 10`,
        description: "Run this to see how each operator works. Pay close attention to / vs //"
      },
      {
        type: "text",
        content: `
<div class="warning-box"><strong>Exam Trap:</strong> <code>10 / 3</code> gives <code>3.3333...</code> (float), but <code>10 // 3</code> gives <code>3</code> (int). The placement exam LOVES testing this distinction.</div>

<h3>Comparison Operators</h3>
<p>These compare two values and return <code>True</code> or <code>False</code>:</p>
<ul>
  <li><code>==</code> Equal to (not <code>=</code>, which is assignment!)</li>
  <li><code>!=</code> Not equal to</li>
  <li><code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code> Less/greater than (or equal)</li>
</ul>

<h3>Logical Operators</h3>
<p>Combine boolean expressions:</p>
<ul>
  <li><code>and</code> — both must be True</li>
  <li><code>or</code> — at least one must be True</li>
  <li><code>not</code> — flips True/False</li>
</ul>
`
      },
      {
        type: "editor",
        starterCode: `x = 15\n\nprint(x > 10 and x < 20)   # Both true?\nprint(x == 15 or x == 20)  # At least one true?\nprint(not (x > 100))       # Flip the result`,
        description: "Experiment with logical operators."
      },
      {
        type: "text",
        content: `
<h3>Augmented Assignment</h3>
<p>Shorthand for updating a variable:</p>
`
      },
      {
        type: "code-block",
        code: `x = 10
x += 5   # same as x = x + 5  → 15
x -= 3   # same as x = x - 3  → 12
x *= 2   # same as x = x * 2  → 24
x //= 5  # same as x = x // 5 → 4`
      },
      {
        type: "text",
        content: `
<h3>Operator Precedence</h3>
<p>From highest to lowest priority: <code>**</code> → <code>* / // %</code> → <code>+ -</code> → <code>comparisons</code> → <code>not</code> → <code>and</code> → <code>or</code>. When in doubt, use parentheses!</p>
`
      },
      {
        type: "quiz",
        question: "What is the value of <code>17 % 5</code>?",
        options: ["2", "3", "3.4", "12"],
        correct: 0,
        explanation: "17 divided by 5 is 3 remainder 2. The % operator returns the remainder."
      },
      {
        type: "quiz",
        question: "What is the value of <code>7 // 2</code>?",
        options: ["3", "3.5", "4", "3.0"],
        correct: 0,
        explanation: "// is floor division. 7 / 2 = 3.5, floored to 3. Since both operands are ints, the result is int 3."
      },
      {
        type: "exercise",
        prompt: `Given a total number of <code>seconds = 3661</code>, calculate the number of <strong>hours</strong>, <strong>minutes</strong>, and remaining <strong>seconds</strong>. Print each one. (Hint: use <code>//</code> and <code>%</code>)`,
        starterCode: `seconds = 3661\n\nhours = \nminutes = \nremaining = \n\nprint("Hours:", hours)\nprint("Minutes:", minutes)\nprint("Seconds:", remaining)`,
        testCode: `
try:
    assert hours == 1, f"hours should be 1, got {hours}"
    assert minutes == 1, f"minutes should be 1, got {minutes}"
    assert remaining == 1, f"remaining should be 1, got {remaining}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== LESSON 3: Strings =====
  {
    id: "strings",
    title: "Strings & String Methods",
    badge: "Lesson 3",
    sections: [
      {
        type: "text",
        content: `
<h3>Creating Strings</h3>
<p>Strings are sequences of characters, created with single or double quotes:</p>
`
      },
      {
        type: "code-block",
        code: `greeting = "Hello, World!"
name = 'Python'
multiline = """This string
spans multiple
lines."""`
      },
      {
        type: "text",
        content: `
<h3>String Indexing & Slicing</h3>
<p>Every character has an <strong>index</strong>, starting at <code>0</code>. Negative indices count from the end.</p>
`
      },
      {
        type: "editor",
        starterCode: `s = "PYTHON"\n\nprint(s[0])     # First character\nprint(s[-1])    # Last character\nprint(s[1:4])   # Characters 1,2,3\nprint(s[:3])    # First 3 characters\nprint(s[3:])    # From index 3 to end\nprint(s[::2])   # Every other character`,
        description: "Indexing and slicing are HEAVILY tested. Run this and study the pattern."
      },
      {
        type: "text",
        content: `
<div class="info-box"><strong>Slicing syntax:</strong> <code>s[start:stop:step]</code> — start is inclusive, stop is exclusive. This is one of the most important concepts for the exam.</div>

<h3>Essential String Methods</h3>
`
      },
      {
        type: "editor",
        starterCode: `s = "  Hello, World!  "\n\nprint(s.strip())        # Remove whitespace\nprint(s.lower())        # Lowercase\nprint(s.upper())        # Uppercase\nprint(s.strip().replace("World", "NYU"))\nprint("hello".count("l"))  # Count occurrences\nprint("hello".find("ll"))  # Find index\nprint("hello".startswith("he"))  # True/False`,
        description: "These string methods come up frequently on the exam."
      },
      {
        type: "text",
        content: `
<h3>String Concatenation & f-Strings</h3>
<p>You can combine strings with <code>+</code> or use <strong>f-strings</strong> (formatted string literals) — the modern, preferred way:</p>
`
      },
      {
        type: "code-block",
        code: `name = "Taeyeon"
age = 18

# Concatenation (old way)
print("Hi, " + name + "! You are " + str(age))

# f-string (preferred)
print(f"Hi, {name}! You are {age}")
print(f"Next year you'll be {age + 1}")`
      },
      {
        type: "text",
        content: `
<h3>String Operations</h3>
<ul>
  <li><code>len(s)</code> — returns the length of a string</li>
  <li><code>"x" in s</code> — checks if "x" exists in the string (returns bool)</li>
  <li><code>s * 3</code> — repeats the string 3 times</li>
  <li><code>s.split(",")</code> — splits into a list at each comma</li>
  <li><code>",".join(list)</code> — joins a list into a string with commas</li>
</ul>
`
      },
      {
        type: "quiz",
        question: `What does <code>"HELLO"[1:4]</code> return?`,
        options: ['"ELL"', '"HELL"', '"HEL"', '"ELLO"'],
        correct: 0,
        explanation: 'Index 1 is "E", and the slice goes up to (but not including) index 4. So we get characters at indices 1, 2, 3 → "ELL".'
      },
      {
        type: "quiz",
        question: `What does <code>"abcdef"[::-1]</code> return?`,
        options: ['"fedcba"', '"abcdef"', '"acdf"', 'Error'],
        correct: 0,
        explanation: 'A step of -1 reverses the string. This is a classic Python trick for reversing strings.'
      },
      {
        type: "exercise",
        prompt: `Given the string <code>email = "student@nyu.edu"</code>, extract just the <strong>domain name</strong> (the part after @, without ".edu") and store it in a variable called <code>domain</code>. It should equal <code>"nyu"</code>.`,
        starterCode: `email = "student@nyu.edu"\n\n# Extract the domain name\ndomain = \n\nprint(domain)`,
        testCode: `
try:
    assert domain == "nyu", f'domain should be "nyu", got "{domain}"'
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== LESSON 4: Input/Output =====
  {
    id: "io",
    title: "Input & Output",
    badge: "Lesson 4",
    sections: [
      {
        type: "text",
        content: `
<h3>The print() Function</h3>
<p><code>print()</code> displays output to the screen. It's more flexible than most beginners realize:</p>
`
      },
      {
        type: "editor",
        starterCode: `# Multiple arguments separated by space\nprint("Hello", "World", 2026)\n\n# Custom separator\nprint("A", "B", "C", sep="-")\n\n# Custom end character (default is newline)\nprint("Loading", end="...")\nprint("Done!")`,
        description: "Explore print()'s sep and end parameters."
      },
      {
        type: "text",
        content: `
<h3>The input() Function</h3>
<p><code>input()</code> pauses the program and waits for the user to type something. It <strong>always returns a string</strong>.</p>
`
      },
      {
        type: "code-block",
        code: `name = input("What is your name? ")
print(f"Hello, {name}!")

# input() ALWAYS returns a string, so convert if needed:
age = int(input("How old are you? "))
print(f"Next year you'll be {age + 1}")`
      },
      {
        type: "text",
        content: `
<div class="warning-box"><strong>Common Exam Mistake:</strong> Forgetting that <code>input()</code> returns a <strong>string</strong>. If you do <code>x = input()</code> and the user types <code>5</code>, then <code>x</code> is <code>"5"</code> (a string), not <code>5</code> (an integer). You must use <code>int()</code> or <code>float()</code> to convert it.</div>

<h3>Formatted Output</h3>
<p>For the exam, you should know multiple ways to format output:</p>
`
      },
      {
        type: "code-block",
        code: `name = "Taeyeon"
score = 95.678

# f-string (best)
print(f"Name: {name}, Score: {score:.2f}")

# .format() method
print("Name: {}, Score: {:.2f}".format(name, score))

# % formatting (old style, but still on exams)
print("Name: %s, Score: %.2f" % (name, score))`
      },
      {
        type: "quiz",
        question: `If the user types <code>10</code> when prompted, what is the type of <code>x</code> after <code>x = input("Enter: ")</code>?`,
        options: ["str", "int", "float", "depends on what they type"],
        correct: 0,
        explanation: "input() ALWAYS returns a string, regardless of what the user types. You must explicitly convert it."
      },
      {
        type: "quiz",
        question: `What does <code>print("a", "b", "c", sep="")</code> output?`,
        options: ['"abc"', '"a b c"', '"a, b, c"', 'Error'],
        correct: 0,
        explanation: 'sep="" means no separator between arguments, so they get concatenated directly.'
      }
    ]
  },

  // ===== LESSON 5: Conditionals =====
  {
    id: "conditionals",
    title: "Conditionals (if/elif/else)",
    badge: "Lesson 5",
    sections: [
      {
        type: "text",
        content: `
<h3>Making Decisions with if</h3>
<p>Conditionals let your program choose different paths based on conditions. Python uses <strong>indentation</strong> (not braces) to define code blocks.</p>
`
      },
      {
        type: "code-block",
        code: `score = 85

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"

print(f"Grade: {grade}")`
      },
      {
        type: "text",
        content: `
<div class="info-box"><strong>Indentation matters!</strong> Python uses 4 spaces (or 1 tab) to define blocks of code. Inconsistent indentation causes <code>IndentationError</code>.</div>

<h3>How Conditions Work</h3>
<p>The condition after <code>if</code> is evaluated to a boolean. Python checks each branch <strong>in order</strong> and runs the <strong>first</strong> one that's True, then skips the rest.</p>
`
      },
      {
        type: "editor",
        starterCode: `# Try changing the value of x\nx = 0\n\nif x > 0:\n    print("Positive")\nelif x < 0:\n    print("Negative")\nelse:\n    print("Zero")`,
        description: "Modify x to test each branch."
      },
      {
        type: "text",
        content: `
<h3>Nested Conditionals</h3>
<p>You can put if statements inside other if statements:</p>
`
      },
      {
        type: "code-block",
        code: `age = 20
has_id = True

if age >= 18:
    if has_id:
        print("Entry allowed")
    else:
        print("Need ID")
else:
    print("Too young")`
      },
      {
        type: "text",
        content: `
<h3>Conditional Expressions (Ternary)</h3>
<p>A compact one-line if/else:</p>
`
      },
      {
        type: "code-block",
        code: `age = 20
status = "adult" if age >= 18 else "minor"
print(status)  # "adult"`
      },
      {
        type: "quiz",
        question: `What does this print?<br><code>x = 15</code><br><code>if x > 10:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;print("A")</code><br><code>if x > 5:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;print("B")</code>`,
        options: ['A then B (both)', 'Only A', 'Only B', 'Error'],
        correct: 0,
        explanation: 'These are TWO separate if statements, not if/elif. Both conditions are checked independently, and both are true, so both print.'
      },
      {
        type: "exercise",
        prompt: `Write a program that sets <code>result</code> to <code>"even"</code> if <code>num</code> is even, and <code>"odd"</code> if it's odd. Use the modulo operator <code>%</code>.`,
        starterCode: `num = 7\n\n# Set result to "even" or "odd"\n\n\nprint(result)`,
        testCode: `
try:
    num = 7
    assert result == "odd", f'result should be "odd" for num=7, got "{result}"'
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      },
      {
        type: "quiz",
        question: `What is the value of <code>"even" if 10 % 2 == 0 else "odd"</code>?`,
        options: ['"even"', '"odd"', 'True', 'Error'],
        correct: 0,
        explanation: '10 % 2 == 0 is True, so the ternary expression evaluates to "even".'
      }
    ]
  },

  // ===== LESSON 6: While Loops =====
  {
    id: "while-loops",
    title: "While Loops",
    badge: "Lesson 6",
    sections: [
      {
        type: "text",
        content: `
<h3>The while Loop</h3>
<p>A <code>while</code> loop repeats a block of code <strong>as long as</strong> its condition is True:</p>
`
      },
      {
        type: "editor",
        starterCode: `count = 1\nwhile count <= 5:\n    print(f"Count: {count}")\n    count += 1\n\nprint("Done!")`,
        description: "A basic counting loop. What happens if you remove 'count += 1'? (Infinite loop!)"
      },
      {
        type: "text",
        content: `
<div class="warning-box"><strong>Infinite loops:</strong> If the condition never becomes False, the loop runs forever. Always make sure something in the loop changes the condition.</div>

<h3>break and continue</h3>
<ul>
  <li><code>break</code> — immediately exits the loop</li>
  <li><code>continue</code> — skips the rest of this iteration, goes back to the condition check</li>
</ul>
`
      },
      {
        type: "editor",
        starterCode: `# break example\ni = 0\nwhile True:\n    if i >= 5:\n        break\n    print(i)\n    i += 1\n\nprint("---")\n\n# continue example: skip even numbers\ni = 0\nwhile i < 10:\n    i += 1\n    if i % 2 == 0:\n        continue\n    print(i)`,
        description: "break exits the loop entirely; continue skips to the next iteration."
      },
      {
        type: "text",
        content: `
<h3>Common Patterns</h3>
`
      },
      {
        type: "code-block",
        code: `# Summing numbers
total = 0
i = 1
while i <= 100:
    total += i
    i += 1
print(f"Sum 1-100: {total}")

# Sentinel loop (loop until special value)
# password = ""
# while password != "secret":
#     password = input("Enter password: ")

# Counter-controlled loop
count = 0
n = 12345
while n > 0:
    count += 1
    n //= 10
print(f"Number of digits: {count}")`
      },
      {
        type: "exercise",
        prompt: `Using a while loop, calculate the <strong>factorial</strong> of <code>n</code> (n! = n × (n-1) × ... × 1). Store the result in <code>factorial</code>.`,
        starterCode: `n = 5\nfactorial = 1\n\n# Write your while loop here\n\n\nprint(f"{n}! = {factorial}")`,
        testCode: `
try:
    assert factorial == 120, f"5! should be 120, got {factorial}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      },
      {
        type: "quiz",
        question: `How many times does this loop print?<br><code>i = 10</code><br><code>while i > 0:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;print(i)</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;i -= 3</code>`,
        options: ["4", "3", "10", "Infinite"],
        correct: 0,
        explanation: "i goes: 10, 7, 4, 1 (printed), then becomes -2 and the loop stops. That's 4 prints."
      }
    ]
  },

  // ===== LESSON 7: For Loops =====
  {
    id: "for-loops",
    title: "For Loops & range()",
    badge: "Lesson 7",
    sections: [
      {
        type: "text",
        content: `
<h3>The for Loop</h3>
<p>A <code>for</code> loop iterates over a <strong>sequence</strong> (string, list, range, etc.), executing the body once for each element:</p>
`
      },
      {
        type: "editor",
        starterCode: `# Looping over a string\nfor char in "PYTHON":\n    print(char)\n\nprint("---")\n\n# Looping over a list\ncolors = ["red", "green", "blue"]\nfor color in colors:\n    print(f"Color: {color}")`,
        description: "For loops automatically handle iteration — no counter needed."
      },
      {
        type: "text",
        content: `
<h3>The range() Function</h3>
<p><code>range()</code> generates a sequence of numbers. It's the most common way to write counting loops:</p>
<ul>
  <li><code>range(5)</code> → 0, 1, 2, 3, 4</li>
  <li><code>range(2, 6)</code> → 2, 3, 4, 5</li>
  <li><code>range(0, 10, 2)</code> → 0, 2, 4, 6, 8</li>
  <li><code>range(5, 0, -1)</code> → 5, 4, 3, 2, 1</li>
</ul>
`
      },
      {
        type: "editor",
        starterCode: `# range(stop)\nfor i in range(5):\n    print(i, end=" ")\nprint()\n\n# range(start, stop)\nfor i in range(1, 6):\n    print(i, end=" ")\nprint()\n\n# range(start, stop, step)\nfor i in range(10, 0, -2):\n    print(i, end=" ")\nprint()`,
        description: "Master range() — it appears on nearly every placement exam."
      },
      {
        type: "text",
        content: `
<h3>Useful Loop Patterns</h3>
`
      },
      {
        type: "code-block",
        code: `# Accumulator pattern
total = 0
for i in range(1, 11):
    total += i
print(f"Sum: {total}")   # 55

# enumerate() — get index AND value
fruits = ["apple", "banana", "cherry"]
for i, fruit in enumerate(fruits):
    print(f"{i}: {fruit}")

# Nested loops
for i in range(3):
    for j in range(3):
        print(f"({i},{j})", end=" ")
    print()`
      },
      {
        type: "quiz",
        question: `What does <code>list(range(1, 10, 3))</code> return?`,
        options: ["[1, 4, 7]", "[1, 3, 6, 9]", "[1, 4, 7, 10]", "[3, 6, 9]"],
        correct: 0,
        explanation: "Start at 1, step by 3: 1, 4, 7. The next would be 10, but 10 is not less than the stop value 10."
      },
      {
        type: "exercise",
        prompt: `Write a for loop that calculates the sum of all <strong>even</strong> numbers from 2 to 20 (inclusive). Store the result in <code>total</code>.`,
        starterCode: `total = 0\n\n# Write your loop here\n\n\nprint(f"Sum of evens 2-20: {total}")`,
        testCode: `
try:
    expected = sum(range(2, 21, 2))
    assert total == expected, f"Expected {expected}, got {total}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      },
      {
        type: "quiz",
        question: `How many times does this loop execute?<br><code>for i in range(3):</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;for j in range(4):</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;print("*")</code>`,
        options: ["12", "7", "4", "3"],
        correct: 0,
        explanation: "The outer loop runs 3 times, and for each outer iteration, the inner loop runs 4 times. 3 × 4 = 12."
      }
    ]
  },

  // ===== LESSON 8: Lists =====
  {
    id: "lists",
    title: "Lists",
    badge: "Lesson 8",
    sections: [
      {
        type: "text",
        content: `
<h3>Creating Lists</h3>
<p>A <strong>list</strong> is an ordered, mutable collection of items. Lists can hold any type and can be mixed:</p>
`
      },
      {
        type: "code-block",
        code: `numbers = [1, 2, 3, 4, 5]
names = ["Alice", "Bob", "Charlie"]
mixed = [1, "hello", True, 3.14]
empty = []

# Lists can be nested
matrix = [[1, 2], [3, 4], [5, 6]]`
      },
      {
        type: "text",
        content: `
<h3>Indexing & Slicing (Same as Strings!)</h3>
<p>Lists use the exact same indexing and slicing rules as strings:</p>
`
      },
      {
        type: "editor",
        starterCode: `nums = [10, 20, 30, 40, 50]\n\nprint(nums[0])      # First\nprint(nums[-1])     # Last\nprint(nums[1:4])    # Slice\nprint(nums[::-1])   # Reversed\n\n# But unlike strings, lists are MUTABLE:\nnums[0] = 99\nprint(nums)`,
        description: "Key difference from strings: you CAN modify list elements."
      },
      {
        type: "text",
        content: `
<h3>Essential List Methods</h3>
`
      },
      {
        type: "editor",
        starterCode: `fruits = ["apple", "banana"]\n\nfruits.append("cherry")       # Add to end\nprint(fruits)\n\nfruits.insert(1, "blueberry") # Insert at index\nprint(fruits)\n\nfruits.remove("banana")       # Remove by value\nprint(fruits)\n\npopped = fruits.pop()         # Remove & return last\nprint(f"Popped: {popped}")\nprint(fruits)\n\nnums = [3, 1, 4, 1, 5]\nnums.sort()\nprint(f"Sorted: {nums}")\nprint(f"Length: {len(nums)}")`,
        description: "These methods modify the list in-place (except pop which also returns the removed item)."
      },
      {
        type: "text",
        content: `
<h3>List Operations</h3>
`
      },
      {
        type: "code-block",
        code: `a = [1, 2, 3]
b = [4, 5, 6]

print(a + b)        # [1, 2, 3, 4, 5, 6]
print(a * 3)        # [1, 2, 3, 1, 2, 3, 1, 2, 3]
print(3 in a)       # True
print(len(a))       # 3
print(min(a))       # 1
print(max(a))       # 3
print(sum(a))       # 6`
      },
      {
        type: "text",
        content: `
<h3>List Comprehensions</h3>
<p>A compact way to create lists from existing sequences:</p>
`
      },
      {
        type: "editor",
        starterCode: `# Basic: [expression for item in iterable]\nsquares = [x**2 for x in range(1, 6)]\nprint(squares)\n\n# With filter: [expression for item in iterable if condition]\nevens = [x for x in range(1, 11) if x % 2 == 0]\nprint(evens)\n\n# Transform strings\nwords = ["hello", "world"]\nupper = [w.upper() for w in words]\nprint(upper)`,
        description: "List comprehensions are Pythonic and frequently tested."
      },
      {
        type: "quiz",
        question: `What is the output of <code>[x*2 for x in range(4)]</code>?`,
        options: ["[0, 2, 4, 6]", "[2, 4, 6, 8]", "[0, 1, 2, 3]", "[1, 2, 3, 4]"],
        correct: 0,
        explanation: "range(4) gives 0,1,2,3. Each is multiplied by 2: 0,2,4,6."
      },
      {
        type: "quiz",
        question: `After <code>a = [1,2,3]</code> and <code>b = a</code>, what happens when you do <code>b.append(4)</code>?`,
        options: ["Both a and b are [1,2,3,4]", "Only b is [1,2,3,4]", "Error", "a is [1,2,3], b is [4]"],
        correct: 0,
        explanation: "b = a does NOT copy the list. Both variables point to the SAME list in memory. This is called aliasing."
      },
      {
        type: "exercise",
        prompt: `Given <code>nums = [4, 8, 15, 16, 23, 42]</code>, use a list comprehension to create a new list called <code>big</code> containing only the numbers greater than 10.`,
        starterCode: `nums = [4, 8, 15, 16, 23, 42]\n\nbig = \n\nprint(big)`,
        testCode: `
try:
    assert big == [15, 16, 23, 42], f"Expected [15, 16, 23, 42], got {big}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== LESSON 9: Functions =====
  {
    id: "functions",
    title: "Functions",
    badge: "Lesson 9",
    sections: [
      {
        type: "text",
        content: `
<h3>Defining Functions</h3>
<p>Functions are reusable blocks of code. You define them with <code>def</code>, and call them by name:</p>
`
      },
      {
        type: "editor",
        starterCode: `def greet(name):\n    return f"Hello, {name}!"\n\nmessage = greet("Taeyeon")\nprint(message)\n\n# Function with multiple parameters\ndef add(a, b):\n    return a + b\n\nprint(add(3, 5))`,
        description: "Functions take parameters and return values."
      },
      {
        type: "text",
        content: `
<h3>Parameters & Arguments</h3>
<p>Functions can have <strong>default parameters</strong>, making some arguments optional:</p>
`
      },
      {
        type: "code-block",
        code: `def power(base, exponent=2):
    return base ** exponent

print(power(3))      # 9 (uses default exponent=2)
print(power(3, 3))   # 27
print(power(2, 10))  # 1024`
      },
      {
        type: "text",
        content: `
<h3>Return vs. Print</h3>
<div class="warning-box"><strong>Crucial distinction:</strong> <code>return</code> sends a value back to the caller. <code>print()</code> just displays text. A function without <code>return</code> returns <code>None</code>.</div>
`
      },
      {
        type: "editor",
        starterCode: `def add_print(a, b):\n    print(a + b)     # Displays but returns None\n\ndef add_return(a, b):\n    return a + b     # Returns the value\n\nresult1 = add_print(3, 5)\nresult2 = add_return(3, 5)\n\nprint(f"result1 = {result1}")  # None!\nprint(f"result2 = {result2}")  # 8`,
        description: "See the difference? This trips up many students on the exam."
      },
      {
        type: "text",
        content: `
<h3>Scope</h3>
<p>Variables created inside a function are <strong>local</strong> — they only exist inside that function. Variables outside are <strong>global</strong>.</p>
`
      },
      {
        type: "editor",
        starterCode: `x = 10  # Global\n\ndef my_func():\n    x = 20  # Local (different variable!)\n    print(f"Inside: x = {x}")\n\nmy_func()\nprint(f"Outside: x = {x}")  # Still 10!`,
        description: "The local x inside the function does NOT change the global x."
      },
      {
        type: "text",
        content: `
<h3>Multiple Return Values</h3>
<p>Python functions can return multiple values as a tuple:</p>
`
      },
      {
        type: "code-block",
        code: `def min_max(numbers):
    return min(numbers), max(numbers)

lo, hi = min_max([3, 1, 4, 1, 5, 9])
print(f"Min: {lo}, Max: {hi}")`
      },
      {
        type: "quiz",
        question: `What does this function return?<br><code>def mystery(x):</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;x = x + 1</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;print(x)</code>`,
        options: ["None", "x + 1", "x", "Error"],
        correct: 0,
        explanation: "The function prints x+1 but has no return statement, so it returns None by default."
      },
      {
        type: "exercise",
        prompt: `Write a function called <code>is_palindrome</code> that takes a string and returns <code>True</code> if it reads the same forwards and backwards (case-insensitive), <code>False</code> otherwise. Then test it.`,
        starterCode: `def is_palindrome(s):\n    # Your code here\n    pass\n\n# Test it\nprint(is_palindrome("racecar"))  # True\nprint(is_palindrome("hello"))    # False\nprint(is_palindrome("Madam"))    # True`,
        testCode: `
try:
    assert is_palindrome("racecar") == True
    assert is_palindrome("hello") == False
    assert is_palindrome("Madam") == True
    assert is_palindrome("A") == True
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      },
      {
        type: "quiz",
        question: `What happens when you call a function with fewer arguments than parameters (no defaults)?`,
        options: ["TypeError", "Returns None", "Uses 0 as default", "Uses None as default"],
        correct: 0,
        explanation: "Python raises a TypeError telling you the function is missing required arguments."
      }
    ]
  },

  // ===== LESSON 10: Modules =====
  {
    id: "modules",
    title: "Modules",
    badge: "Lesson 10",
    sections: [
      {
        type: "text",
        content: `
<h3>What is a Module?</h3>
<p>A <strong>module</strong> is a file containing Python code (functions, variables, classes) that you can <strong>import</strong> and reuse in your own programs. Python comes with a huge <strong>standard library</strong> of built-in modules.</p>
<p>Think of it this way: instead of writing everything from scratch, you can pull in code that someone else already wrote.</p>
`
      },
      {
        type: "text",
        content: `
<h3>Importing Modules</h3>
<p>There are several ways to import:</p>
`
      },
      {
        type: "editor",
        starterCode: `# Method 1: import the whole module\nimport math\n\nprint(math.sqrt(16))    # 4.0\nprint(math.pi)          # 3.14159...\nprint(math.floor(3.7))  # 3\nprint(math.ceil(3.2))   # 4`,
        description: "With 'import math', you access everything through 'math.___'"
      },
      {
        type: "editor",
        starterCode: `# Method 2: import specific things\nfrom math import sqrt, pi\n\nprint(sqrt(25))   # 5.0 — no 'math.' prefix needed\nprint(pi)         # 3.14159...`,
        description: "With 'from math import ...', you use the names directly."
      },
      {
        type: "editor",
        starterCode: `# Method 3: import with an alias\nimport math as m\n\nprint(m.sqrt(9))   # 3.0\nprint(m.pi)        # 3.14159...`,
        description: "Aliases give modules shorter names."
      },
      {
        type: "text",
        content: `
<h3>Common Built-in Modules</h3>
<p>You should know these exist for the exam:</p>
<ul>
  <li><code>math</code> — math functions: <code>sqrt()</code>, <code>floor()</code>, <code>ceil()</code>, <code>pi</code>, <code>pow()</code></li>
  <li><code>random</code> — random numbers: <code>randint(a, b)</code>, <code>random()</code>, <code>choice(list)</code></li>
  <li><code>string</code> — string constants: <code>ascii_lowercase</code>, <code>digits</code></li>
</ul>
`
      },
      {
        type: "editor",
        starterCode: `import random\n\n# Random integer between 1 and 10 (inclusive)\nprint(random.randint(1, 10))\n\n# Random choice from a list\ncolors = ["red", "blue", "green"]\nprint(random.choice(colors))`,
        description: "Run this multiple times — you'll get different results each time!"
      },
      {
        type: "text",
        content: `
<h3>Your Own Modules</h3>
<p>Any Python file can be used as a module. If you have a file called <code>helpers.py</code> with a function <code>greet()</code>, you can import it:</p>
`
      },
      {
        type: "code-block",
        code: `# helpers.py
def greet(name):
    return f"Hello, {name}!"

# main.py
import helpers
print(helpers.greet("Taeyeon"))

# or:
from helpers import greet
print(greet("Taeyeon"))`
      },
      {
        type: "text",
        content: `
<div class="info-box"><strong>Key difference:</strong> <code>import math</code> gives you the whole module (use <code>math.sqrt()</code>). <code>from math import sqrt</code> gives you just that function (use <code>sqrt()</code> directly). The exam may test whether you know which syntax requires the module prefix.</div>
`
      },
      {
        type: "quiz",
        question: `After <code>import math</code>, which is the correct way to get the square root of 25?`,
        options: ["math.sqrt(25)", "sqrt(25)", "math(sqrt(25))", "import sqrt(25)"],
        correct: 0,
        explanation: "When you import the whole module, you must use the module name as a prefix: math.sqrt(25)."
      },
      {
        type: "quiz",
        question: `After <code>from math import pi</code>, which is correct?`,
        options: ["print(pi)", "print(math.pi)", "Both work", "Neither works"],
        correct: 0,
        explanation: "With 'from math import pi', you imported pi directly into your namespace. You use it without the math. prefix. Using math.pi would actually cause a NameError since you didn't import the math module itself."
      },
      {
        type: "exercise",
        prompt: `Using the <code>math</code> module, calculate the <strong>hypotenuse</strong> of a right triangle with sides <code>a = 3</code> and <code>b = 4</code>. Store the result in <code>hypotenuse</code>. (Hint: hypotenuse = sqrt(a² + b²))`,
        starterCode: `import math\n\na = 3\nb = 4\n\nhypotenuse = \n\nprint(hypotenuse)`,
        testCode: `
try:
    assert hypotenuse == 5.0, f"Expected 5.0, got {hypotenuse}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== LESSON 11: Tuples & Dictionaries =====
  {
    id: "tuples-dicts",
    title: "Tuples & Dictionaries",
    badge: "Lesson 11",
    sections: [
      {
        type: "text",
        content: `
<h3>Tuples</h3>
<p>Tuples are like lists, but <strong>immutable</strong> — once created, they cannot be changed:</p>
`
      },
      {
        type: "editor",
        starterCode: `# Creating tuples\npoint = (3, 4)\ncolors = ("red", "green", "blue")\nsingle = (42,)   # Note the comma for single-element tuple\n\nprint(point[0])       # Indexing works\nprint(colors[1:])     # Slicing works\nprint(len(colors))    # len() works\n\n# Tuple unpacking\nx, y = point\nprint(f"x={x}, y={y}")\n\n# This would cause an error:\n# point[0] = 10  # TypeError!`,
        description: "Tuples are immutable — you can read but not modify."
      },
      {
        type: "text",
        content: `
<div class="info-box"><strong>When to use tuples vs lists:</strong> Use tuples for fixed collections (coordinates, RGB colors, database records). Use lists when you need to add/remove/change elements.</div>

<h3>Dictionaries</h3>
<p>Dictionaries store <strong>key-value pairs</strong>. They're one of Python's most powerful data structures:</p>
`
      },
      {
        type: "editor",
        starterCode: `student = {\n    "name": "Taeyeon",\n    "age": 18,\n    "gpa": 3.95,\n    "courses": ["CS101", "MATH201"]\n}\n\n# Access values by key\nprint(student["name"])\nprint(student.get("age"))\n\n# Add or update\nstudent["year"] = "Freshman"\nstudent["gpa"] = 4.0\n\n# Delete\ndel student["age"]\n\nprint(student)`,
        description: "Dictionaries use keys instead of numeric indices."
      },
      {
        type: "text",
        content: `
<h3>Dictionary Methods</h3>
`
      },
      {
        type: "code-block",
        code: `d = {"a": 1, "b": 2, "c": 3}

print(d.keys())      # dict_keys(['a', 'b', 'c'])
print(d.values())    # dict_values([1, 2, 3])
print(d.items())     # dict_items([('a', 1), ('b', 2), ('c', 3)])

# Safe access with default
print(d.get("z", 0))  # 0 (key doesn't exist, returns default)

# Check if key exists
print("a" in d)        # True
print("z" in d)        # False`
      },
      {
        type: "text",
        content: `
<h3>Looping Through Dictionaries</h3>
`
      },
      {
        type: "editor",
        starterCode: `scores = {"Alice": 95, "Bob": 87, "Charlie": 92}\n\n# Loop through keys\nfor name in scores:\n    print(f"{name}: {scores[name]}")\n\nprint("---")\n\n# Loop through key-value pairs\nfor name, score in scores.items():\n    print(f"{name} scored {score}")`,
        description: "The .items() method is the cleanest way to iterate over both keys and values."
      },
      {
        type: "quiz",
        question: `What does <code>{"a": 1, "b": 2}["c"]</code> raise?`,
        options: ["KeyError", "None", "IndexError", "0"],
        correct: 0,
        explanation: 'Accessing a non-existent key with [] raises KeyError. Use .get("c") or .get("c", default) for safe access.'
      },
      {
        type: "exercise",
        prompt: `Given a list of words, create a dictionary called <code>freq</code> that maps each word to the number of times it appears.`,
        starterCode: `words = ["apple", "banana", "apple", "cherry", "banana", "apple"]\n\nfreq = {}\n\n# Count frequencies\n\n\nprint(freq)`,
        testCode: `
try:
    assert freq == {"apple": 3, "banana": 2, "cherry": 1}, f"Expected apple:3, banana:2, cherry:1 — got {freq}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      },
      {
        type: "quiz",
        question: `What is the type of <code>(1,)</code>?`,
        options: ["tuple", "int", "list", "set"],
        correct: 0,
        explanation: "The trailing comma makes it a tuple. Without the comma, (1) is just the integer 1 in parentheses."
      }
    ]
  },

  // ===== LESSON 12: Exam Practice =====
  {
    id: "exam-practice",
    title: "Exam Practice & Review",
    badge: "Final Review",
    sections: [
      {
        type: "text",
        content: `
<h3>Placement Exam Strategy</h3>
<p>The NYU CS placement exam tests your ability to <strong>read and trace</strong> Python code, <strong>predict outputs</strong>, and <strong>write short programs</strong>. Here's what to focus on:</p>
<ul>
  <li>Trace code carefully — write out variable values at each step</li>
  <li>Watch for <code>//</code> vs <code>/</code>, <code>=</code> vs <code>==</code></li>
  <li>Remember: <code>input()</code> returns strings, <code>range()</code> excludes the stop value</li>
  <li>Know your string/list slicing cold</li>
  <li>Understand mutability: lists are mutable, strings and tuples are not</li>
  <li>Know how nested loops produce output — trace each iteration</li>
</ul>

<h3>Practice Problems</h3>
<p>These are exam-style questions. Try to solve them without running the code first!</p>
`
      },
      {
        type: "quiz",
        question: `What is the output?<br><code>x = [1, 2, 3, 4, 5]</code><br><code>print(x[1:4][::-1])</code>`,
        options: ["[4, 3, 2]", "[5, 4, 3]", "[2, 3, 4]", "[3, 2, 1]"],
        correct: 0,
        explanation: "x[1:4] gives [2, 3, 4]. Then [::-1] reverses it to [4, 3, 2]."
      },
      {
        type: "quiz",
        question: `What does this print?<br><code>def f(x, y=[]):</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;y.append(x)</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;return y</code><br><br><code>print(f(1))</code><br><code>print(f(2))</code>`,
        options: ["[1] then [1, 2]", "[1] then [2]", "Error", "[1] then [1]"],
        correct: 0,
        explanation: "Mutable default arguments are shared across calls! The same list is reused, so the second call sees the appended 1 from the first call."
      },
      {
        type: "quiz",
        question: `What is the value of <code>result</code>?<br><code>result = 0</code><br><code>for i in range(1, 5):</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;if i % 2 == 0:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;result += i</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;else:</code><br><code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;result -= i</code>`,
        options: ["2", "0", "-2", "10"],
        correct: 0,
        explanation: "i=1: result = 0-1 = -1. i=2: result = -1+2 = 1. i=3: result = 1-3 = -2. i=4: result = -2+4 = 2."
      },
      {
        type: "exercise",
        prompt: `Write a function <code>second_largest(nums)</code> that returns the second largest unique value in a list. You can assume the list has at least 2 unique values.`,
        starterCode: `def second_largest(nums):\n    # Your code here\n    pass\n\nprint(second_largest([3, 1, 4, 1, 5, 9]))  # 5\nprint(second_largest([10, 10, 5, 5, 1]))   # 5`,
        testCode: `
try:
    assert second_largest([3, 1, 4, 1, 5, 9]) == 5
    assert second_largest([10, 10, 5, 5, 1]) == 5
    assert second_largest([1, 2]) == 1
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      },
      {
        type: "quiz",
        question: `What does this print?<br><code>d = {"a": 1, "b": 2}</code><br><code>d["c"] = d.get("a", 0) + d.get("c", 0)</code><br><code>print(d["c"])</code>`,
        options: ["1", "0", "3", "KeyError"],
        correct: 0,
        explanation: 'd.get("a", 0) returns 1 (key exists), d.get("c", 0) returns 0 (key doesn\'t exist yet, uses default). So d["c"] = 1 + 0 = 1.'
      },
      {
        type: "exercise",
        prompt: `Write a function <code>flatten(nested)</code> that takes a list of lists and returns a single flat list containing all elements.`,
        starterCode: `def flatten(nested):\n    # Your code here\n    pass\n\nprint(flatten([[1, 2], [3, 4], [5]]))  # [1, 2, 3, 4, 5]\nprint(flatten([[], [1], [2, 3]]))      # [1, 2, 3]`,
        testCode: `
try:
    assert flatten([[1, 2], [3, 4], [5]]) == [1, 2, 3, 4, 5]
    assert flatten([[], [1], [2, 3]]) == [1, 2, 3]
    assert flatten([]) == []
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      },
      {
        type: "text",
        content: `
<h3>You're Ready!</h3>
<p>If you can comfortably solve these problems and trace through the quiz questions correctly, you have a strong foundation for the NYU CS placement exam. Key things to review one more time:</p>
<ol>
  <li><strong>Data types</strong> and type conversion</li>
  <li><strong>String/list slicing</strong> with start:stop:step</li>
  <li><strong>for/while loops</strong> with range()</li>
  <li><strong>Functions</strong> — parameters, return vs print, scope</li>
  <li><strong>Dictionaries</strong> — access, iteration, .get()</li>
  <li><strong>Modules</strong> — import vs from...import</li>
  <li><strong>Nested loops</strong> — tracing output line by line</li>
</ol>
<p>Go back and redo any exercises you found challenging. Good luck!</p>
`
      }
    ]
  }
];
