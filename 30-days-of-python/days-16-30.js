LESSONS.push(

  // ===== DAY 16: Date & Time =====
  {
    id: "datetime",
    title: "Date & Time",
    badge: "Day 16",
    sections: [
      {
        type: "text",
        content: `
<h3>The datetime Module</h3>
<p><code>datetime</code> handles dates, times, and the math between them. Key players: <code>datetime.now()</code>, the <code>date</code> class, <code>timedelta</code> for durations, and <code>strftime</code> / <code>strptime</code> for formatting and parsing.</p>
`
      },
      {
        type: "editor",
        starterCode: `from datetime import datetime, date, timedelta\n\nnow = datetime.now()\nprint(now)\nprint(now.year, now.month, now.day)\n\n# Format a date into a string (strftime = 'string format time')\nprint(now.strftime("%d/%m/%Y"))\nprint(now.strftime("%B %d, %Y at %H:%M"))\n\n# Parse a string INTO a date (strptime = 'string parse time')\nlaunch = datetime.strptime("4 July 2026", "%d %B %Y")\nprint(launch)\n\n# Date math with timedelta\ntoday = date.today()\nprint("In 100 days:", today + timedelta(days=100))`,
        description: "%d=day, %m=month number, %B=month name, %Y=4-digit year, %H:%M=time."
      },
      {
        type: "quiz",
        question: `In <code>strftime</code>, what does <code>%Y</code> produce?`,
        options: ["2-digit year (26)", "Month name", "4-digit year (2026)", "Day of the year"],
        correct: 2,
        explanation: "%Y is the full 4-digit year. Lowercase %y gives the 2-digit version."
      },
      {
        type: "exercise",
        prompt: `Subtract the two dates to find how many days are between New Year's Day 2026 and NYU's first day of class (Sep 2, 2026). Store the integer in <code>days_between</code>. (Hint: subtracting two dates gives a <code>timedelta</code> — use its <code>.days</code>.)`,
        starterCode: `from datetime import date\n\nnew_year = date(2026, 1, 1)\nfirst_class = date(2026, 9, 2)\n\ndays_between = \n\nprint(days_between)`,
        testCode: `
try:
    from datetime import date as __d
    __expected = (__d(2026, 9, 2) - __d(2026, 1, 1)).days
    assert days_between == __expected, f"Expected {__expected}, got {days_between}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 17: Exception Handling =====
  {
    id: "exceptions",
    title: "Exception Handling",
    badge: "Day 17",
    sections: [
      {
        type: "text",
        content: `
<h3>try / except / else / finally</h3>
<p>Yesterday you met the errors; today you <em>handle</em> them. Wrap risky code in <code>try</code>, catch specific errors with <code>except</code>, run success-only code in <code>else</code>, and cleanup code in <code>finally</code> (which runs <strong>no matter what</strong>). You can also <code>raise</code> errors yourself.</p>
`
      },
      {
        type: "editor",
        starterCode: `def convert(text):\n    try:\n        number = int(text)\n    except ValueError:\n        print(f"Can't convert {text!r}")\n    else:\n        print(f"Success: {number}")\n    finally:\n        print("-- attempt finished --")\n\nconvert("42")\nconvert("hello")\n\n# Raising your own errors:\ndef set_age(age):\n    if age < 0:\n        raise ValueError("Age cannot be negative")\n    print("Age set to", age)\n\nset_age(25)\ntry:\n    set_age(-3)\nexcept ValueError as e:\n    print("Caught:", e)`,
        description: "Catch SPECIFIC exceptions (ValueError) rather than a bare except — you'll hide fewer bugs."
      },
      {
        type: "quiz",
        question: `When does the <code>finally</code> block run?`,
        options: [
          "Only when an exception occurs",
          "Only when no exception occurs",
          "Only if there is no else block",
          "Always — exception or not"
        ],
        correct: 3,
        explanation: "finally is guaranteed to run whether the try succeeded, failed, or even returned early — that's why it's used for cleanup."
      },
      {
        type: "exercise",
        prompt: `Write <code>safe_divide(a, b)</code> that returns <code>a / b</code>, but returns <code>None</code> instead of crashing when <code>b</code> is zero. Use try/except with <code>ZeroDivisionError</code>.`,
        starterCode: `def safe_divide(a, b):\n    pass\n\nprint(safe_divide(10, 2))  # 5.0\nprint(safe_divide(5, 0))   # None`,
        testCode: `
try:
    assert safe_divide(10, 2) == 5.0
    assert safe_divide(5, 0) is None
    assert safe_divide(9, 3) == 3.0
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 18: Regular Expressions =====
  {
    id: "regex",
    title: "Regular Expressions",
    badge: "Day 18",
    sections: [
      {
        type: "text",
        content: `
<h3>Pattern Matching Superpowers</h3>
<p>The <code>re</code> module finds patterns in text. Write patterns as raw strings (<code>r"..."</code>) so backslashes survive. The core tokens:</p>
<ul>
  <li><code>\\d</code> digit &nbsp;·&nbsp; <code>\\w</code> letter/digit/underscore &nbsp;·&nbsp; <code>\\s</code> whitespace</li>
  <li><code>+</code> one or more &nbsp;·&nbsp; <code>*</code> zero or more &nbsp;·&nbsp; <code>?</code> optional</li>
  <li><code>[abc]</code> any of these &nbsp;·&nbsp; <code>[A-Z]</code> ranges &nbsp;·&nbsp; <code>^</code> start &nbsp;·&nbsp; <code>$</code> end</li>
</ul>
<p>Main functions: <code>re.search</code> (first match), <code>re.findall</code> (all matches, as a list), <code>re.sub</code> (replace), <code>re.split</code>.</p>
`
      },
      {
        type: "editor",
        starterCode: `import re\n\ntext = "Call 212-998-4500 or 646-555-0199 before 5pm"\n\n# findall: every match, as a list of strings\nphones = re.findall(r"\\d{3}-\\d{3}-\\d{4}", text)\nprint(phones)\n\n# search: the FIRST match (or None)\nm = re.search(r"\\d+pm", text)\nprint(m.group())\n\n# sub: find & replace\nprint(re.sub(r"\\d", "#", "PIN: 4921"))\n\n# split on flexible separators\nprint(re.split(r",\\s*", "a, b,c,   d"))\n\n# Capture the words that start with a capital letter\nprint(re.findall(r"[A-Z]\\w+", "Ada met Grace in London"))`,
        description: "r\"\\d{3}\" means exactly three digits. Change the patterns and re-run to experiment."
      },
      {
        type: "quiz",
        question: `What does <code>re.findall()</code> return when there are matches?`,
        options: [
          "The first match as a string",
          "A list of all matching strings",
          "True",
          "A match object"
        ],
        correct: 1,
        explanation: "findall returns a plain list of every match (search returns a match object for just the first one)."
      },
      {
        type: "exercise",
        prompt: `Use <code>re.findall</code> with the pattern <code>r"\\d+"</code> to pull every number out of the text, convert them to ints, and store the list in <code>numbers</code>.`,
        starterCode: `import re\n\ntext = "I bought 3 apples and 12 oranges for 45 dollars"\n\nnumbers = \n\nprint(numbers)`,
        testCode: `
try:
    assert numbers == [3, 12, 45], f"Expected [3, 12, 45], got {numbers}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 19: File Handling =====
  {
    id: "files",
    title: "File Handling",
    badge: "Day 19",
    sections: [
      {
        type: "text",
        content: `
<h3>Reading & Writing Files</h3>
<p><code>open(name, mode)</code> opens a file: mode <code>"r"</code> read, <code>"w"</code> write (erases existing!), <code>"a"</code> append. Always use <code>with</code> — it closes the file automatically.</p>
<div class="info-box"><strong>Cool fact:</strong> this course runs Python in your browser with an in-memory file system — so the file code below <em>actually works</em>. Files vanish when you reload the page.</div>
`
      },
      {
        type: "editor",
        starterCode: `# Write a file\nwith open("notes.txt", "w") as f:\n    f.write("Day 19: files\\n")\n    f.write("Python makes this easy\\n")\n\n# Append to it\nwith open("notes.txt", "a") as f:\n    f.write("(appended later)\\n")\n\n# Read it all back\nwith open("notes.txt", "r") as f:\n    print(f.read())\n\n# Or line by line\nwith open("notes.txt") as f:\n    for i, line in enumerate(f, 1):\n        print(i, line.strip())`,
        description: "This really writes and reads a file. Try changing the mode 'a' to 'w' and see what happens."
      },
      {
        type: "editor",
        starterCode: `import json\n\n# json.dumps: Python object -> JSON string (for saving/sending)\nperson = {"name": "Asabeneh", "skills": ["Python", "JS"], "age": 250}\ntext = json.dumps(person, indent=2)\nprint(text)\n\n# json.loads: JSON string -> Python object\nraw = '{"city": "Helsinki", "population": 658864}'\ndata = json.loads(raw)\nprint(data["city"], "-", data["population"])`,
        description: "JSON is how programs exchange data — it maps almost 1:1 onto Python dicts and lists."
      },
      {
        type: "quiz",
        question: `You open an existing file with mode <code>"w"</code>. What happens to its old content?`,
        options: [
          "It's preserved — new writes go to the end",
          "It's erased immediately",
          "Python raises FileExistsError",
          "It's backed up automatically"
        ],
        correct: 1,
        explanation: '"w" truncates (wipes) the file the moment it opens. To add to the end instead, use "a" (append).'
      },
      {
        type: "exercise",
        prompt: `Write the three fruits to <code>fruits.txt</code>, one per line. Then read the file back and build <code>fruits_read</code> — a list of the three fruit names (no newline characters!). (Hint: <code>.strip()</code> or <code>.splitlines()</code>.)`,
        starterCode: `fruits = ["apple", "banana", "cherry"]\n\n# 1) write them to fruits.txt, one per line\n\n\n# 2) read the file back into a list of names\nfruits_read = \n\nprint(fruits_read)`,
        testCode: `
try:
    assert fruits_read == ["apple", "banana", "cherry"], f"Got: {fruits_read}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 20: pip & Packages =====
  {
    id: "pip",
    title: "pip & Packages",
    badge: "Day 20",
    sections: [
      {
        type: "text",
        content: `
<h3>The Python Package Index</h3>
<p>Beyond the standard library live <strong>third-party packages</strong> — over 500,000 of them on <strong>PyPI</strong> (the Python Package Index). <code>pip</code> is the tool that installs them onto your machine. These commands run in your <em>terminal</em>, not inside Python:</p>
`
      },
      {
        type: "code-block",
        code: `pip install requests          # install a package
pip install pandas==2.2.0     # install a specific version
pip list                      # everything installed
pip show requests             # details about one package
pip uninstall requests        # remove it

# Share your project's exact dependencies:
pip freeze > requirements.txt     # save the list
pip install -r requirements.txt  # recreate it anywhere`
      },
      {
        type: "text",
        content: `
<p>After installing, you import it like any module: <code>import requests</code>. Famous packages worth knowing: <code>requests</code> (HTTP), <code>numpy</code> &amp; <code>pandas</code> (data), <code>flask</code> &amp; <code>django</code> (web), <code>beautifulsoup4</code> (scraping) — several of which you'll meet in the coming days.</p>
<div class="warning-box"><strong>Note:</strong> pip needs a real terminal, so there's no live editor today — but the concepts come back on Days 22–29.</div>
`
      },
      {
        type: "quiz",
        question: `What does <code>pip freeze > requirements.txt</code> do?`,
        options: [
          "Stops all packages from updating",
          "Writes your installed packages + versions to a file others can install from",
          "Compresses your packages to save space",
          "Uninstalls unused packages"
        ],
        correct: 1,
        explanation: "freeze prints exact package==version lines; saving them to requirements.txt lets anyone recreate your environment with pip install -r."
      },
      {
        type: "quiz",
        question: `What is PyPI?`,
        options: [
          "Python's built-in code editor",
          "A Python compiler",
          "The online index where pip downloads packages from",
          "A testing framework"
        ],
        correct: 2,
        explanation: "PyPI (pypi.org) is the community repository of Python packages — pip fetches from it by default."
      }
    ]
  },

  // ===== DAY 21: Classes & Objects =====
  {
    id: "classes",
    title: "Classes & Objects",
    badge: "Day 21",
    sections: [
      {
        type: "text",
        content: `
<h3>Blueprints for Data + Behavior</h3>
<p>A <strong>class</strong> bundles data (attributes) with functions that act on it (methods). <code>__init__</code> runs when you create an object; <code>self</code> refers to the specific object being worked on.</p>
`
      },
      {
        type: "editor",
        starterCode: `class Person:\n    def __init__(self, name, country="Unknown"):\n        self.name = name\n        self.country = country\n        self.skills = []\n\n    def add_skill(self, skill):\n        self.skills.append(skill)\n\n    def introduce(self):\n        return f"I'm {self.name} from {self.country}. Skills: {self.skills}"\n\np1 = Person("Asabeneh", "Finland")\np1.add_skill("Python")\np1.add_skill("Teaching")\nprint(p1.introduce())\n\np2 = Person("Ada")\nprint(p2.introduce())    # each object has its OWN data`,
        description: "Two Person objects, two separate skill lists — self keeps them apart."
      },
      {
        type: "editor",
        starterCode: `class Person:\n    def __init__(self, name):\n        self.name = name\n    def greet(self):\n        return f"Hi, I'm {self.name}"\n\n# Inheritance: Student IS a Person, plus extras\nclass Student(Person):\n    def __init__(self, name, school):\n        super().__init__(name)      # run Person's setup too\n        self.school = school\n\n    def greet(self):                 # override the parent method\n        return f"Hi, I'm {self.name} and I study at {self.school}"\n\nprint(Person("Grace").greet())\nprint(Student("Taeyeon", "NYU").greet())`,
        description: "super() calls the parent's version. The child can add to or replace parent behavior."
      },
      {
        type: "quiz",
        question: `Inside a method, what does <code>self</code> refer to?`,
        options: [
          "The class itself",
          "The specific object the method was called on",
          "The parent class",
          "A required keyword with no meaning"
        ],
        correct: 1,
        explanation: "self is the instance: when you call p1.introduce(), self IS p1 — that's how the method reaches p1's own data."
      },
      {
        type: "exercise",
        prompt: `Create a class <code>Rectangle</code> with <code>__init__(self, width, height)</code>, an <code>area()</code> method, and a <code>perimeter()</code> method.`,
        starterCode: `class Rectangle:\n    pass\n\n\nr = Rectangle(4, 5)\nprint(r.area())       # 20\nprint(r.perimeter())  # 18`,
        testCode: `
try:
    __r = Rectangle(4, 5)
    assert __r.area() == 20, f"area() gave {__r.area()}"
    assert __r.perimeter() == 18, f"perimeter() gave {__r.perimeter()}"
    __r2 = Rectangle(3, 3)
    assert __r2.area() == 9 and __r2.perimeter() == 12
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 22: Web Scraping =====
  {
    id: "scraping",
    title: "Web Scraping",
    badge: "Day 22",
    sections: [
      {
        type: "text",
        content: `
<h3>Extracting Data from Websites</h3>
<p>Web scraping = download a page's HTML, then pull out the data you want. The classic toolkit: <code>requests</code> fetches the page, <code>BeautifulSoup</code> parses the HTML tree.</p>
`
      },
      {
        type: "code-block",
        code: `# The real-world recipe (run on your own machine):
import requests
from bs4 import BeautifulSoup

url = "https://books.toscrape.com"
response = requests.get(url)
soup = BeautifulSoup(response.text, "html.parser")

print(soup.title.text)                 # the page title
for h3 in soup.find_all("h3")[:5]:     # first five book titles
    print(h3.a["title"])`
      },
      {
        type: "text",
        content: `
<div class="warning-box"><strong>Scrape responsibly:</strong> check a site's <code>robots.txt</code> and terms, don't hammer servers with rapid requests, and prefer an official API when one exists.</div>
<p>The browser sandbox can't fetch external sites, so today's hands-on practice uses the same <em>parsing</em> skills on an HTML string — which is 80% of the actual scraping work anyway:</p>
`
      },
      {
        type: "editor",
        starterCode: `import re\n\nhtml = '<html><body><h1>Top Books</h1><a href="/python">Python 101</a> <a href="/js">JS Basics</a></body></html>'\n\n# Pull out every link target with a regex capture group ( )\nlinks = re.findall(r'href="([^"]+)"', html)\nprint(links)\n\n# Pull the text between <a> and </a>\ntitles = re.findall(r'<a[^>]*>([^<]+)</a>', html)\nprint(titles)\n\n# Find where the h1 starts using string methods\nstart = html.find("<h1>") + len("<h1>")\nend = html.find("</h1>")\nprint(html[start:end])`,
        description: "find + slicing and regex capture groups — the manual version of what BeautifulSoup automates."
      },
      {
        type: "quiz",
        question: `In the requests + BeautifulSoup workflow, what is BeautifulSoup's job?`,
        options: [
          "Downloading the web page",
          "Parsing the HTML so you can navigate and extract elements",
          "Hosting the website",
          "Converting HTML to Python code"
        ],
        correct: 1,
        explanation: "requests downloads the raw HTML; BeautifulSoup parses it into a searchable tree (find_all, .text, attributes)."
      },
      {
        type: "exercise",
        prompt: `Extract the text between <code>&lt;title&gt;</code> and <code>&lt;/title&gt;</code> from the HTML string and store it in <code>title</code>. Use <code>.find()</code> + slicing (or a regex if you prefer).`,
        starterCode: `html = "<html><head><title>Python Books</title></head><body>...</body></html>"\n\ntitle = \n\nprint(title)`,
        testCode: `
try:
    assert title == "Python Books", f'Expected "Python Books", got "{title}"'
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 23: Virtual Environments =====
  {
    id: "venv",
    title: "Virtual Environments",
    badge: "Day 23",
    sections: [
      {
        type: "text",
        content: `
<h3>One Project, One Environment</h3>
<p>Different projects need different (sometimes conflicting) package versions. A <strong>virtual environment</strong> is a private, isolated Python setup per project — its own <code>pip</code>, its own packages, no interference.</p>
`
      },
      {
        type: "code-block",
        code: `# Create one (in your project folder):
python -m venv venv

# Activate it:
source venv/bin/activate        # macOS / Linux
venv\\Scripts\\activate           # Windows

# Your prompt changes to show (venv). Now installs are LOCAL:
(venv) pip install flask
(venv) pip freeze > requirements.txt

# Leave the environment:
deactivate`
      },
      {
        type: "text",
        content: `
<p>The standard workflow for every new project: <strong>create venv → activate → pip install → freeze to requirements.txt</strong>. Teammates then run <code>pip install -r requirements.txt</code> inside their own venv and get identical setups.</p>
<div class="info-box"><strong>Rule of thumb:</strong> never install project packages into your system Python. If you see <code>(venv)</code> in your prompt, you're doing it right.</div>
`
      },
      {
        type: "quiz",
        question: `What changes after you <em>activate</em> a virtual environment?`,
        options: [
          "Python runs faster",
          "python and pip now point to the project's isolated environment",
          "Your code is automatically backed up",
          "All system packages are deleted"
        ],
        correct: 1,
        explanation: "Activation rewires your shell so python/pip use the venv's private copies — installs land there instead of system-wide."
      }
    ]
  },

  // ===== DAY 24: Statistics =====
  {
    id: "stats",
    title: "Statistics",
    badge: "Day 24",
    sections: [
      {
        type: "text",
        content: `
<h3>Describing Data</h3>
<p>Python's built-in <code>statistics</code> module covers the essentials: <strong>mean</strong> (average), <strong>median</strong> (middle value), <strong>mode</strong> (most common), and <strong>standard deviation</strong> (spread).</p>
`
      },
      {
        type: "editor",
        starterCode: `import statistics\n\nages = [26, 32, 24, 32, 28, 30, 32, 27]\n\nprint("mean:  ", statistics.mean(ages))\nprint("median:", statistics.median(ages))\nprint("mode:  ", statistics.mode(ages))\nprint("stdev: ", round(statistics.stdev(ages), 2))\nprint("min/max:", min(ages), max(ages))\nprint("range: ", max(ages) - min(ages))`,
        description: "Median with an even count = average of the two middle values."
      },
      {
        type: "code-block",
        code: `# For serious number crunching there's NumPy (pip install numpy):
import numpy as np

data = np.array([26, 32, 24, 32, 28, 30, 32, 27])
print(data.mean(), data.std())
print(data * 2)          # vectorized math — no loop needed!
print(data[data > 28])   # filter with a condition`
      },
      {
        type: "quiz",
        question: `What is <code>statistics.median([1, 3, 5, 7])</code>?`,
        options: ["3", "4.0", "5", "3.5"],
        correct: 1,
        explanation: "Even number of values -> average the middle two: (3 + 5) / 2 = 4.0."
      },
      {
        type: "exercise",
        prompt: `Use the <code>statistics</code> module to compute <code>mean_score</code> and <code>median_score</code> for the list of scores.`,
        starterCode: `import statistics\n\nscores = [72, 85, 90, 60, 85, 77]\n\nmean_score = \nmedian_score = \n\nprint(mean_score, median_score)`,
        testCode: `
try:
    import statistics as __st
    assert mean_score == __st.mean(scores), f"mean_score wrong: {mean_score}"
    assert median_score == __st.median(scores), f"median_score wrong: {median_score}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 25: Pandas =====
  {
    id: "pandas",
    title: "Pandas",
    badge: "Day 25",
    sections: [
      {
        type: "text",
        content: `
<h3>Spreadsheets in Code</h3>
<p><strong>pandas</strong> is THE data-analysis library. Its core object is the <code>DataFrame</code> — a 2-D table with labeled rows and columns, like a spreadsheet you drive with Python.</p>
`
      },
      {
        type: "code-block",
        code: `# pip install pandas, then:
import pandas as pd

df = pd.DataFrame({
    "name":  ["Ana", "Ben", "Cara", "Dan"],
    "score": [88, 62, 75, 90],
})

df.head()                  # first rows
df.describe()              # instant statistics
df["score"].mean()         # 78.75
df[df["score"] >= 70]      # filter rows like a condition
df = pd.read_csv("data.csv")   # real data usually starts here`
      },
      {
        type: "text",
        content: `
<p>Pandas is too heavy to load in this in-browser course, but its <em>mental model</em> — a dict of columns — you can practice right now in pure Python:</p>
`
      },
      {
        type: "editor",
        starterCode: `# A 'DataFrame' as a dict of columns:\ndata = {\n    "name":  ["Ana", "Ben", "Cara", "Dan"],\n    "score": [88, 62, 75, 90],\n}\n\n# Column average (df['score'].mean())\navg = sum(data["score"]) / len(data["score"])\nprint("average:", avg)\n\n# Row filter (df[df['score'] >= 70])\nfor i in range(len(data["name"])):\n    if data["score"][i] >= 70:\n        print(data["name"][i], data["score"][i])`,
        description: "Every pandas one-liner has a pure-Python equivalent — pandas just does it faster with less code."
      },
      {
        type: "quiz",
        question: `What is a pandas <code>DataFrame</code>?`,
        options: [
          "A 2-D labeled table of rows and columns",
          "A single column of values",
          "A type of chart",
          "A database server"
        ],
        correct: 0,
        explanation: "DataFrame = the table (2-D). A single labeled column is a Series."
      },
      {
        type: "exercise",
        prompt: `From the <code>data</code> table, compute <code>avg_score</code> (mean of the score column) and <code>passing</code> — a list of the <strong>names</strong> whose score is at least 70, in order.`,
        starterCode: `data = {\n    "name":  ["Ana", "Ben", "Cara", "Dan"],\n    "score": [88, 62, 75, 90],\n}\n\navg_score = \npassing = \n\nprint(avg_score)\nprint(passing)`,
        testCode: `
try:
    assert avg_score == 78.75, f"avg_score should be 78.75, got {avg_score}"
    assert passing == ["Ana", "Cara", "Dan"], f"passing wrong: {passing}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 26: Python for the Web (Flask) =====
  {
    id: "flask",
    title: "Python for the Web (Flask)",
    badge: "Day 26",
    sections: [
      {
        type: "text",
        content: `
<h3>From Script to Website</h3>
<p>A <strong>web framework</strong> receives browser requests and returns responses. <strong>Flask</strong> is the friendliest Python one: each URL <em>route</em> maps to a plain function whose return value becomes the web page.</p>
`
      },
      {
        type: "code-block",
        code: `# pip install flask   ->  save as app.py  ->  python app.py
from flask import Flask

app = Flask(__name__)

@app.route("/")                 # visiting / runs this function
def home():
    return "<h1>Welcome to 30 Days of Python!</h1>"

@app.route("/about")
def about():
    return "<p>I am learning Flask.</p>"

@app.route("/user/<name>")      # dynamic URL piece
def user(name):
    return f"<h1>Hello, {name}!</h1>"

if __name__ == "__main__":
    app.run(debug=True)         # http://localhost:5000`
      },
      {
        type: "text",
        content: `
<p>That decorator syntax — <code>@app.route("/")</code> — is a higher-order function from Day 14 in the wild: it takes your function and registers it to handle a URL. Real apps add HTML <em>templates</em>, forms, and databases on top of exactly this skeleton.</p>
`
      },
      {
        type: "quiz",
        question: `What does <code>@app.route("/about")</code> do?`,
        options: [
          "Creates a file called about.html",
          "Registers the function below it to handle requests to /about",
          "Redirects users away from /about",
          "Imports the about module"
        ],
        correct: 1,
        explanation: "The route decorator wires a URL path to a Python function — request comes in, function runs, return value goes back to the browser."
      }
    ]
  },

  // ===== DAY 27: Python & MongoDB =====
  {
    id: "mongodb",
    title: "Python & MongoDB",
    badge: "Day 27",
    sections: [
      {
        type: "text",
        content: `
<h3>A Database That Speaks Dict</h3>
<p><strong>MongoDB</strong> is a NoSQL database that stores <em>documents</em> — which look exactly like Python dictionaries. Where SQL databases use tables/rows, Mongo uses <em>collections/documents</em>. The <code>pymongo</code> package connects Python to it.</p>
`
      },
      {
        type: "code-block",
        code: `# pip install pymongo
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["thirty_days"]           # database
students = db["students"]           # collection (like a table)

# Create — insert a plain dict!
students.insert_one({"name": "Taeyeon", "country": "USA", "age": 18})

# Read
for s in students.find({"country": "USA"}):
    print(s["name"], s["age"])

# Update & Delete
students.update_one({"name": "Taeyeon"}, {"$set": {"age": 19}})
students.delete_one({"name": "Taeyeon"})`
      },
      {
        type: "quiz",
        question: `A MongoDB <em>document</em> is most similar to which Python type?`,
        options: ["A list", "A tuple", "A dictionary", "A set"],
        correct: 2,
        explanation: "Documents are key-value structures — you literally insert and receive Python dicts through pymongo."
      }
    ]
  },

  // ===== DAY 28: APIs & JSON =====
  {
    id: "api",
    title: "APIs & JSON",
    badge: "Day 28",
    sections: [
      {
        type: "text",
        content: `
<h3>How Programs Talk to Each Other</h3>
<p>An <strong>API</strong> (Application Programming Interface) lets one program request data or actions from another over HTTP. The verbs:</p>
<ul>
  <li><code>GET</code> — read data &nbsp;·&nbsp; <code>POST</code> — create &nbsp;·&nbsp; <code>PUT/PATCH</code> — update &nbsp;·&nbsp; <code>DELETE</code> — remove</li>
</ul>
<p>Status codes tell you how it went: <code>200</code> OK, <code>201</code> created, <code>404</code> not found, <code>500</code> server error. And the data almost always travels as <strong>JSON</strong> — which you already met on Day 19.</p>
`
      },
      {
        type: "editor",
        starterCode: `import json\n\n# A typical API response body (a JSON string):\nresponse_text = '{"status": 200, "results": [{"name": "Ada", "id": 1}, {"name": "Grace", "id": 2}]}'\n\n# Parse it exactly like real client code does:\ndata = json.loads(response_text)\nprint("status:", data["status"])\nfor user in data["results"]:\n    print(f'  user #{user["id"]}: {user["name"]}')\n\n# And build a request body to SEND:\nnew_user = {"name": "Taeyeon", "role": "student"}\nprint(json.dumps(new_user, indent=2))`,
        description: "loads = parse incoming JSON; dumps = serialize outgoing JSON. That's 90% of API client work."
      },
      {
        type: "code-block",
        code: `# On your machine, the requests package makes real API calls:
import requests

r = requests.get("https://api.github.com/users/asabeneh")
print(r.status_code)        # 200
profile = r.json()          # parsed JSON -> dict, in one step
print(profile["name"], profile["public_repos"])`
      },
      {
        type: "quiz",
        question: `An API returns status code <code>404</code>. What does that mean?`,
        options: [
          "Success",
          "The resource wasn't found",
          "The server crashed",
          "You must log in first"
        ],
        correct: 1,
        explanation: "4xx codes are client-side issues; 404 specifically = the thing you asked for doesn't exist. (500s are server errors, 200s are success.)"
      },
      {
        type: "exercise",
        prompt: `Parse <code>profile_json</code> with <code>json.loads</code> into <code>profile</code>, then update it: increase <code>"age"</code> by 1 and add <code>"country"</code> set to <code>"Finland"</code>.`,
        starterCode: `import json\n\nprofile_json = '{"name": "Asabeneh", "age": 250}'\n\nprofile = \n\n# modify profile here\n\n\nprint(profile)`,
        testCode: `
try:
    assert profile == {"name": "Asabeneh", "age": 251, "country": "Finland"}, f"Got: {profile}"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 29: Building an API =====
  {
    id: "building-api",
    title: "Building an API",
    badge: "Day 29",
    sections: [
      {
        type: "text",
        content: `
<h3>Now You're the Server</h3>
<p>Yesterday you consumed APIs; today you design one. A <strong>REST API</strong> maps URLs + HTTP methods onto resources, and answers in JSON:</p>
<ul>
  <li><code>GET /students</code> — list all &nbsp;·&nbsp; <code>GET /students/1</code> — one student</li>
  <li><code>POST /students</code> — create &nbsp;·&nbsp; <code>PUT /students/1</code> — update &nbsp;·&nbsp; <code>DELETE /students/1</code> — remove</li>
</ul>
`
      },
      {
        type: "code-block",
        code: `# Flask turns those routes into a working API:
from flask import Flask, jsonify, request

app = Flask(__name__)
students = [{"id": 1, "name": "Ada"}]

@app.route("/students", methods=["GET"])
def list_students():
    return jsonify({"status": 200, "data": students})

@app.route("/students", methods=["POST"])
def add_student():
    new = request.get_json()          # the JSON body sent by the client
    students.append(new)
    return jsonify({"status": 201, "data": new}), 201

@app.route("/students/<int:sid>", methods=["DELETE"])
def remove_student(sid):
    global students
    students = [s for s in students if s["id"] != sid]
    return jsonify({"status": 200, "data": students})`
      },
      {
        type: "quiz",
        question: `A client wants to <strong>create</strong> a new record through a REST API. Which HTTP method should it use?`,
        options: ["GET", "DELETE", "PATCH", "POST"],
        correct: 3,
        explanation: "POST creates. GET reads, PUT/PATCH update, DELETE removes — that's the REST convention."
      },
      {
        type: "exercise",
        prompt: `APIs wrap results in a consistent envelope. Write <code>api_response(data, status=200)</code> that returns the dict <code>{"status": status, "data": data}</code> — with <code>status</code> defaulting to 200.`,
        starterCode: `def api_response(data, status=200):\n    pass\n\nprint(api_response({"name": "Ada"}))\nprint(api_response(None, 404))`,
        testCode: `
try:
    assert api_response({"name": "Ada"}) == {"status": 200, "data": {"name": "Ada"}}
    assert api_response(None, 404) == {"status": 404, "data": None}
    assert api_response([1, 2], 201) == {"status": 201, "data": [1, 2]}
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      }
    ]
  },

  // ===== DAY 30: Capstone =====
  {
    id: "capstone",
    title: "Capstone & Next Steps",
    badge: "Day 30",
    sections: [
      {
        type: "text",
        content: `
<h3>You Made It — Day 30!</h3>
<p>Look how far you've come: variables → collections → loops &amp; functions → comprehensions and higher-order functions → errors, files, regex → classes → data and the web. The two capstone exercises below pull multiple days together. No hints this time — you have everything you need.</p>
`
      },
      {
        type: "exercise",
        prompt: `<strong>Capstone 1 (Days 4, 8, 10):</strong> Write <code>word_frequency(text)</code> that returns a dict mapping each word to how many times it appears.`,
        starterCode: `def word_frequency(text):\n    pass\n\nprint(word_frequency("the cat and the dog and the bird"))`,
        testCode: `
try:
    assert word_frequency("the cat and the dog and the bird") == {"the": 3, "and": 2, "cat": 1, "dog": 1, "bird": 1}
    assert word_frequency("hello") == {"hello": 1}
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      },
      {
        type: "exercise",
        prompt: `<strong>Capstone 2 (Days 9, 21):</strong> Build a <code>BankAccount</code> class: <code>__init__(self, balance=0)</code>, <code>deposit(amount)</code> adds to the balance, <code>withdraw(amount)</code> subtracts it — but if <code>amount</code> is more than the balance, the balance must not change.`,
        starterCode: `class BankAccount:\n    pass\n\n\nacct = BankAccount(100)\nacct.deposit(50)\nacct.withdraw(30)\nprint(acct.balance)    # 120\nacct.withdraw(1000)    # rejected — not enough funds\nprint(acct.balance)    # still 120`,
        testCode: `
try:
    __a = BankAccount(100)
    __a.deposit(50)
    __a.withdraw(30)
    assert __a.balance == 120, f"Expected 120, got {__a.balance}"
    __a.withdraw(1000)
    assert __a.balance == 120, "Overdraft should be rejected — balance must not change"
    __b = BankAccount()
    assert __b.balance == 0, "Default balance should be 0"
    __result = "PASS"
except Exception as e:
    __result = f"FAIL: {e}"
`
      },
      {
        type: "text",
        content: `
<h3>Where to Go from Here</h3>
<ul>
  <li><strong>Build something real</strong> — a CLI to-do app, a Flask site, a data analysis of something you care about. Projects cement everything.</li>
  <li><strong>Practice problems</strong> — sites like LeetCode (easy tier) or Exercism keep your skills sharp.</li>
  <li><strong>Read the original</strong> — Asabeneh's <em>30 Days of Python</em> on GitHub has extra exercises for every single day.</li>
  <li><strong>Go deeper</strong> — pick one lane: data (NumPy/pandas), web (Flask/Django), or automation (scripts + APIs).</li>
</ul>
<p>Congratulations — you're a Python programmer now. 🐍</p>
`
      }
    ]
  }
);
