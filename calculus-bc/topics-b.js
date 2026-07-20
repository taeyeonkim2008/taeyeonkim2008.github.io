LESSONS.push(

  // ===== 10.1 Convergent & Divergent Series =====
  {
    id: "t10-1",
    title: "Convergent & Divergent Series",
    badge: "Topic 10.1",
    sections: [
      { type: "text", content: R`
<h3>Adding Infinitely Many Numbers</h3>
<p>An infinite series \(\sum a_n\) is defined by its <strong>partial sums</strong> \(S_n = a_1 + a_2 + \cdots + a_n\). The series <strong>converges</strong> to \(S\) if \(\lim_{n\to\infty} S_n = S\) exists (finite); otherwise it <strong>diverges</strong>.</p>
<p>Also remember the reverse direction: the individual terms can be recovered from partial sums by \(a_n = S_n - S_{n-1}\).</p>` },
      { type: "example",
        prompt: R`<p>A series has partial sums \(S_n = \dfrac{2n}{n+1}\). Does the series converge, and to what?</p>`,
        solution: R`<p>\(\displaystyle\lim_{n\to\infty}\frac{2n}{n+1} = 2\), so the series <strong>converges to 2</strong>.</p>
<p>Note the difference: the <em>partial sums</em> approach 2; the <em>terms</em> \(a_n = S_n - S_{n-1}\) approach 0.</p>` },
      { type: "quiz",
        question: R`A series \(\sum a_n\) converges when:`,
        options: [ R`\(\lim a_n = 0\)`, R`The sequence of partial sums has a finite limit`, R`Its terms are all positive`, R`Its terms are decreasing` ],
        correct: 1,
        explanation: R`Convergence of a series is defined entirely through partial sums. Terms going to 0 is necessary but famously NOT sufficient (the harmonic series is the counterexample).` },
      { type: "quiz",
        question: R`If \(S_n = \dfrac{2n}{n+1}\), the individual term \(a_2\) equals:`,
        options: [ R`\(\frac{4}{3}\)`, R`\(\frac{1}{3}\)`, R`\(2\)`, R`\(\frac{2}{3}\)` ],
        correct: 1,
        explanation: R`\(a_2 = S_2 - S_1 = \frac{4}{3} - 1 = \frac{1}{3}\).` },
      { type: "numeric",
        prompt: R`<p>A series has partial sums \(S_n = 3 - \dfrac{1}{n}\). What is the sum of the series?</p>`,
        answer: 3, tolerance: 0.001,
        solution: R`\(\lim_{n\to\infty}\left(3 - \frac{1}{n}\right) = 3\).` }
    ]
  },

  // ===== 10.2 Geometric Series =====
  {
    id: "t10-2",
    title: "Geometric Series",
    badge: "Topic 10.2",
    sections: [
      { type: "text", content: R`
<h3>The One Series You Can Always Sum</h3>
<p>A geometric series multiplies by the same ratio \(r\) each step. It's the workhorse of Unit 10 — the only common series whose exact sum you can always write down.</p>` },
      { type: "formula", title: "Geometric Series", latex: R`\sum_{n=0}^{\infty} a r^n = \frac{a}{1-r} \quad \text{when } |r| < 1; \qquad \text{diverges when } |r| \ge 1` },
      { type: "text", content: R`
<p>Here \(a\) is the <strong>first term</strong> — whatever the series actually starts with, regardless of the starting index. A quick sanity habit: identify \(a\) and \(r\), check \(|r| < 1\), then \(\frac{a}{1-r}\).</p>` },
      { type: "example",
        prompt: R`<p>Evaluate \(\displaystyle\sum_{n=0}^{\infty} 4\left(\frac{1}{3}\right)^n\).</p>`,
        solution: R`<p>First term \(a = 4\), ratio \(r = \frac{1}{3}\), and \(|r| < 1\) so it converges:</p>
<p>\(\dfrac{4}{1 - \frac{1}{3}} = \dfrac{4}{2/3} = \mathbf{6}\)</p>` },
      { type: "quiz",
        question: R`\(\displaystyle\sum_{n=1}^{\infty} \left(\frac{2}{5}\right)^n =\)`,
        options: [ R`\(\frac{5}{3}\)`, R`\(\frac{2}{3}\)`, R`\(\frac{2}{5}\)`, R`\(\frac{5}{2}\)` ],
        correct: 1,
        explanation: R`Starting at \(n=1\), the first term is \(a = \frac{2}{5}\): sum \(= \frac{2/5}{1 - 2/5} = \frac{2/5}{3/5} = \frac{2}{3}\). (Watch the starting index!)` },
      { type: "quiz",
        question: R`Which geometric series diverges?`,
        options: [ R`\(\sum (0.99)^n\)`, R`\(\sum (-0.5)^n\)`, R`\(\sum (1.01)^n\)`, R`\(\sum \left(\frac{1}{\pi}\right)^n\)` ],
        correct: 2,
        explanation: R`Divergence happens when \(|r| \ge 1\). Only \(1.01\) has magnitude \(\ge 1\) — no matter how close to 1 from below, \(0.99^n\) still converges.` },
      { type: "numeric",
        prompt: R`<p>Evaluate \(\displaystyle\sum_{n=0}^{\infty} 2\left(\frac{1}{4}\right)^n\). (3 decimals.)</p>`,
        answer: 2.667, tolerance: 0.01,
        solution: R`\(\frac{2}{1 - 1/4} = \frac{2}{3/4} = \frac{8}{3} \approx 2.667\).` }
    ]
  },

  // ===== 10.3 nth Term Test =====
  {
    id: "t10-3",
    title: "The nth Term Test",
    badge: "Topic 10.3",
    sections: [
      { type: "text", content: R`
<h3>The First Test You Always Run</h3>
<p>If the terms of a series don't even shrink to zero, the partial sums can't settle down:</p>` },
      { type: "formula", title: "nth Term Test for Divergence", latex: R`\text{If } \lim_{n\to\infty} a_n \ne 0 \text{ (or doesn't exist)}, \text{ then } \sum a_n \text{ diverges.}` },
      { type: "text", content: R`
<div class="warning-box"><strong>One-directional!</strong> If \(\lim a_n = 0\), the test says <em>nothing</em> — the series might converge (like \(\sum \frac{1}{n^2}\)) or diverge (like \(\sum \frac{1}{n}\)). The nth term test can only ever prove <em>divergence</em>.</div>` },
      { type: "quiz",
        question: R`\(\displaystyle\sum_{n=1}^{\infty} \frac{n}{2n+1}\):`,
        options: [ R`Converges by the nth term test`, R`Diverges because \(\lim a_n = \frac{1}{2} \ne 0\)`, R`Converges to \(\frac{1}{2}\)`, R`Needs the ratio test` ],
        correct: 1,
        explanation: R`\(\lim \frac{n}{2n+1} = \frac{1}{2} \ne 0\) — instant divergence. (The terms approaching \(\frac{1}{2}\) means you keep adding ≈\(\frac{1}{2}\) forever.)` },
      { type: "quiz",
        question: R`You compute \(\lim a_n = 0\) for some series. What can you conclude?`,
        options: [ R`The series converges`, R`The series diverges`, R`Nothing — the test is inconclusive`, R`The series converges absolutely` ],
        correct: 2,
        explanation: R`Terms shrinking to zero is necessary but not sufficient. The harmonic series has \(a_n \to 0\) yet diverges. You need another test.` },
      { type: "quiz",
        question: R`Which series is <strong>immediately</strong> killed by the nth term test?`,
        options: [ R`\(\sum \frac{1}{n}\)`, R`\(\sum \frac{1}{n^2}\)`, R`\(\sum \cos\left(\frac{1}{n}\right)\)`, R`\(\sum \frac{(-1)^n}{n}\)` ],
        correct: 2,
        explanation: R`\(\cos(1/n) \to \cos 0 = 1 \ne 0\) → diverges. The others all have terms → 0, so the nth term test is silent about them.` }
    ]
  },

  // ===== 10.4 Integral Test =====
  {
    id: "t10-4",
    title: "The Integral Test",
    badge: "Topic 10.4",
    sections: [
      { type: "text", content: R`
<h3>Series ↔ Improper Integral</h3>
<p>When the terms of a series come from a nice function, the series and the improper integral rise or fall together.</p>` },
      { type: "formula", title: "Integral Test", latex: R`\text{If } f \text{ is positive, continuous, decreasing on } [1,\infty) \text{ and } a_n = f(n),\ \text{then}\ \sum a_n \text{ and } \int_1^\infty f\,dx \text{ both converge or both diverge.}` },
      { type: "text", content: R`
<p>This is where Topic 6.13 pays off: you already know exactly when \(\int_1^\infty x^{-p}\,dx\) converges. <strong>Caution:</strong> when both converge, the series does <em>not</em> equal the integral — they merely share a fate.</p>` },
      { type: "example",
        prompt: R`<p>Use the integral test to decide whether \(\displaystyle\sum_{n=1}^\infty \frac{1}{n^3}\) converges.</p>`,
        solution: R`<p>\(f(x) = x^{-3}\) is positive, continuous, and decreasing on \([1,\infty)\). </p>
<p>\(\displaystyle\int_1^\infty x^{-3}dx = \lim_{b\to\infty}\left[\frac{-1}{2x^2}\right]_1^b = \frac{1}{2}\) — finite, so the <strong>series converges</strong> (though not to \(\frac{1}{2}\)).</p>` },
      { type: "quiz",
        question: R`The integral test requires \(f\) to be all of the following on \([1,\infty)\) EXCEPT:`,
        options: [ R`Positive`, R`Continuous`, R`Decreasing`, R`Differentiable` ],
        correct: 3,
        explanation: R`The three conditions are positive, continuous, decreasing. Differentiability is not required (though it's often used to verify "decreasing").` },
      { type: "quiz",
        question: R`If \(\int_1^\infty f(x)\,dx = 5\) with \(f\) positive/continuous/decreasing, then \(\sum_{n=1}^\infty f(n)\):`,
        options: [ R`Equals 5`, R`Converges, but not necessarily to 5`, R`Diverges`, R`Equals 5 + f(1)` ],
        correct: 1,
        explanation: R`The test transfers convergence, not the value. (Comparing rectangle sums to the area shows the sum lies between 5 and 5 + f(1).)` },
      { type: "numeric",
        prompt: R`<p>Compute the integral used to test \(\sum \frac{1}{n^3}\): \(\displaystyle\int_1^\infty \frac{dx}{x^3}\).</p>`,
        answer: 0.5, tolerance: 0.001,
        solution: R`\(\left[-\frac{1}{2x^2}\right]_1^\infty = 0 + \frac{1}{2} = 0.5\).` }
    ]
  },

  // ===== 10.5 Harmonic & p-Series =====
  {
    id: "t10-5",
    title: "Harmonic Series & p-Series",
    badge: "Topic 10.5",
    sections: [
      { type: "text", content: R`
<h3>The Benchmark Family</h3>
<p>These are the reference series you compare everything else against:</p>` },
      { type: "formula", title: "p-Series", latex: R`\sum_{n=1}^{\infty} \frac{1}{n^p} \quad \text{converges} \iff p > 1` },
      { type: "text", content: R`
<p>The boundary case \(p = 1\) is the <strong>harmonic series</strong> \(\sum \frac{1}{n}\) — the most famous divergent series in mathematics. Its terms go to zero, yet the partial sums creep past every finite bound (they grow like \(\ln n\)).</p>` },
      { type: "quiz",
        question: R`Which of these converges?`,
        options: [ R`\(\sum \frac{1}{n}\)`, R`\(\sum \frac{1}{\sqrt{n}}\)`, R`\(\sum \frac{1}{n^{3/2}}\)`, R`\(\sum \frac{1}{n^{0.99}}\)` ],
        correct: 2,
        explanation: R`Only \(p = \frac{3}{2} > 1\) converges. The others have \(p \le 1\): \(1\), \(\frac{1}{2}\), and \(0.99\).` },
      { type: "quiz",
        question: R`The harmonic series \(\sum \frac{1}{n}\) diverges even though:`,
        options: [ R`Its terms are increasing`, R`Its terms approach zero`, R`Its partial sums are bounded`, R`It is geometric with r = 1` ],
        correct: 1,
        explanation: R`This is THE example showing "terms → 0" doesn't imply convergence. The partial sums grow without bound, just very slowly.` },
      { type: "quiz",
        question: R`\(\displaystyle\sum_{n=1}^{\infty} \frac{5}{n^2}\):`,
        options: [ R`Diverges — the 5 makes it too big`, R`Converges — constant multiples don't affect convergence`, R`Converges to 5`, R`Cannot be determined` ],
        correct: 1,
        explanation: R`Multiplying a convergent series by a constant keeps it convergent (\(p = 2 > 1\)). Constants never change convergence behavior.` }
    ]
  },

  // ===== 10.6 Comparison Tests =====
  {
    id: "t10-6",
    title: "Comparison Tests",
    badge: "Topic 10.6",
    sections: [
      { type: "text", content: R`
<h3>Judging a Series by Its Neighbors</h3>
<p><strong>Direct comparison</strong> (for positive-term series): if \(0 \le a_n \le b_n\),</p>
<ul>
<li>\(\sum b_n\) converges \(\Rightarrow \sum a_n\) converges (smaller than convergent)</li>
<li>\(\sum a_n\) diverges \(\Rightarrow \sum b_n\) diverges (bigger than divergent)</li>
</ul>` },
      { type: "formula", title: "Limit Comparison Test", latex: R`\text{If } \lim_{n\to\infty}\frac{a_n}{b_n} = c \text{ with } 0 < c < \infty,\ \text{then } \sum a_n \text{ and } \sum b_n \text{ share the same behavior.}` },
      { type: "text", content: R`
<p><strong>Choosing the comparison:</strong> keep only the dominant terms. For \(\frac{n+3}{n^3 - 2}\), the skeleton is \(\frac{n}{n^3} = \frac{1}{n^2}\) — compare with that p-series.</p>` },
      { type: "example",
        prompt: R`<p>Does \(\displaystyle\sum_{n=1}^{\infty} \frac{1}{n^2 + 3}\) converge?</p>`,
        solution: R`<p>Direct comparison: \(\frac{1}{n^2+3} < \frac{1}{n^2}\) for all \(n\), and \(\sum\frac{1}{n^2}\) is a convergent p-series (\(p=2\)).</p>
<p>Smaller than convergent → <strong>converges</strong>.</p>` },
      { type: "quiz",
        question: R`To test \(\displaystyle\sum \frac{1}{2n + 5}\), the natural limit comparison is with:`,
        options: [ R`\(\sum \frac{1}{n^2}\)`, R`\(\sum \frac{1}{n}\)`, R`\(\sum \frac{1}{2^n}\)`, R`\(\sum \frac{1}{5n^2}\)` ],
        correct: 1,
        explanation: R`Dominant behavior: \(\frac{1}{2n+5} \sim \frac{1}{2n}\). Limit comparison with \(\frac{1}{n}\) gives \(c = \frac{1}{2}\), so it behaves like the harmonic series — diverges.` },
      { type: "quiz",
        question: R`Suppose \(0 \le a_n \le b_n\) and \(\sum a_n\) converges. What do we know about \(\sum b_n\)?`,
        options: [ R`It converges`, R`It diverges`, R`Nothing — the inequality points the wrong way`, R`It equals \(\sum a_n\)` ],
        correct: 2,
        explanation: R`A series bigger than a convergent one could go either way. Comparison only concludes from "smaller than convergent" or "bigger than divergent."` },
      { type: "quiz",
        question: R`\(\displaystyle\sum \frac{n}{n^3 + 1}\):`,
        options: [ R`Diverges by comparison with \(\frac{1}{n}\)`, R`Converges by limit comparison with \(\frac{1}{n^2}\)`, R`Diverges by the nth term test`, R`Converges to 1` ],
        correct: 1,
        explanation: R`Skeleton: \(\frac{n}{n^3} = \frac{1}{n^2}\). The limit of the ratio is 1, and \(\sum \frac{1}{n^2}\) converges, so this converges too.` }
    ]
  },

  // ===== 10.7 Alternating Series Test =====
  {
    id: "t10-7",
    title: "Alternating Series Test",
    badge: "Topic 10.7",
    sections: [
      { type: "text", content: R`
<h3>When Signs Flip, Life Gets Easier</h3>
<p>An alternating series \(\sum (-1)^{n+1} b_n\) (with \(b_n > 0\)) converges under just two conditions — much weaker than what positive series need:</p>` },
      { type: "formula", title: "Alternating Series Test", latex: R`\text{If } b_{n+1} \le b_n \text{ (decreasing) and } \lim_{n\to\infty} b_n = 0, \text{ then } \sum (-1)^{n+1} b_n \text{ converges.}` },
      { type: "example",
        prompt: R`<p>Show that the alternating harmonic series \(\displaystyle\sum_{n=1}^\infty \frac{(-1)^{n+1}}{n} = 1 - \frac{1}{2} + \frac{1}{3} - \cdots\) converges.</p>`,
        solution: R`<p>Here \(b_n = \frac{1}{n}\): it is decreasing, and \(\lim b_n = 0\). Both conditions hold → <strong>converges</strong> (in fact to \(\ln 2\)).</p>
<p>Remarkable: the plain harmonic series diverges, but alternating the signs rescues it.</p>` },
      { type: "quiz",
        question: R`The two conditions of the alternating series test on \(b_n\) are:`,
        options: [ R`\(b_n\) positive and bounded`, R`\(b_n\) decreasing and \(\lim b_n = 0\)`, R`\(\lim b_n = 0\) and \(\sum b_n\) converges`, R`\(b_n\) decreasing and positive` ],
        correct: 1,
        explanation: R`Decreasing (eventually) and limit zero. That's the whole test.` },
      { type: "quiz",
        question: R`\(\displaystyle\sum_{n=1}^\infty \frac{(-1)^n\, n}{n+1}\):`,
        options: [ R`Converges by the alternating series test`, R`Diverges — the terms don't approach 0`, R`Converges absolutely`, R`Converges to \(\ln 2\)` ],
        correct: 1,
        explanation: R`\(b_n = \frac{n}{n+1} \to 1 \ne 0\). The AST doesn't apply, and the nth term test kills it: the terms oscillate near \(\pm 1\) forever.` },
      { type: "quiz",
        question: R`Which series converges by the alternating series test?`,
        options: [ R`\(\sum \frac{(-1)^n n}{2n+1}\)`, R`\(\sum \frac{(-1)^n}{\sqrt{n}}\)`, R`\(\sum (-1)^n\)`, R`\(\sum \frac{(-1)^n \cdot 2^n}{n}\)` ],
        correct: 1,
        explanation: R`\(b_n = \frac{1}{\sqrt{n}}\) is decreasing with limit 0 ✓. The others fail the "terms → 0" requirement.` }
    ]
  },

  // ===== 10.8 Ratio Test =====
  {
    id: "t10-8",
    title: "The Ratio Test",
    badge: "Topic 10.8",
    sections: [
      { type: "text", content: R`
<h3>The Heavy Machinery</h3>
<p>The ratio test measures how fast terms shrink by comparing consecutive terms. It's the go-to for factorials and exponentials, and the engine behind radius of convergence in 10.13.</p>` },
      { type: "formula", title: "Ratio Test", latex: R`L = \lim_{n\to\infty}\left|\frac{a_{n+1}}{a_n}\right| \qquad L < 1:\ \text{converges (absolutely)} \quad L > 1:\ \text{diverges} \quad L = 1:\ \text{inconclusive}` },
      { type: "text", content: R`
<div class="info-box"><strong>Factorial hygiene:</strong> \(\frac{(n+1)!}{n!} = n+1\) and \(\frac{n!}{(n+1)!} = \frac{1}{n+1}\). Most ratio-test errors are factorial algebra errors.</div>` },
      { type: "example",
        prompt: R`<p>Test \(\displaystyle\sum_{n=1}^\infty \frac{2^n}{n!}\) for convergence.</p>`,
        solution: R`<p>\(\left|\frac{a_{n+1}}{a_n}\right| = \frac{2^{n+1}}{(n+1)!}\cdot\frac{n!}{2^n} = \frac{2}{n+1} \to 0\)</p>
<p>\(L = 0 < 1\) → <strong>converges</strong>. Factorials crush exponentials.</p>` },
      { type: "quiz",
        question: R`For \(\displaystyle\sum \frac{n}{2^n}\), the ratio test gives \(L =\)`,
        options: [ R`\(2\)`, R`\(1\)`, R`\(\frac{1}{2}\)`, R`\(0\)` ],
        correct: 2,
        explanation: R`\(\frac{n+1}{2^{n+1}}\cdot\frac{2^n}{n} = \frac{n+1}{2n} \to \frac{1}{2} < 1\) → converges.` },
      { type: "quiz",
        question: R`The ratio test applied to \(\sum \frac{1}{n^2}\) gives \(L = 1\). This means:`,
        options: [ R`The series diverges`, R`The series converges`, R`The test tells you nothing — use another test`, R`The series converges conditionally` ],
        correct: 2,
        explanation: R`\(L = 1\) is the ratio test's blind spot — it happens for ALL p-series. (This one converges by the p-test, but the ratio test can't see it.)` },
      { type: "numeric",
        prompt: R`<p>Compute \(L = \lim\left|\frac{a_{n+1}}{a_n}\right|\) for \(\displaystyle\sum \frac{3^n}{n!}\).</p>`,
        answer: 0, tolerance: 0.001,
        solution: R`\(\frac{3^{n+1}}{(n+1)!}\cdot\frac{n!}{3^n} = \frac{3}{n+1} \to 0\).` }
    ]
  },

  // ===== 10.9 Absolute vs Conditional =====
  {
    id: "t10-9",
    title: "Absolute & Conditional Convergence",
    badge: "Topic 10.9",
    sections: [
      { type: "text", content: R`
<h3>Two Grades of Convergence</h3>
<ul>
<li><strong>Absolutely convergent:</strong> \(\sum |a_n|\) converges. (This automatically forces \(\sum a_n\) to converge.)</li>
<li><strong>Conditionally convergent:</strong> \(\sum a_n\) converges, but \(\sum |a_n|\) diverges — the convergence <em>depends on cancellation</em> between signs.</li>
</ul>
<p><strong>The procedure:</strong> first test \(\sum |a_n|\) (usually a p-series check). If it converges → absolute. If not, test the alternating series itself → possibly conditional.</p>` },
      { type: "example",
        prompt: R`<p>Classify \(\displaystyle\sum_{n=1}^\infty \frac{(-1)^{n+1}}{\sqrt{n}}\) as absolutely convergent, conditionally convergent, or divergent.</p>`,
        solution: R`<p><strong>Absolute check:</strong> \(\sum \frac{1}{\sqrt{n}}\) is a p-series with \(p = \frac{1}{2} \le 1\) → diverges. Not absolute.</p>
<p><strong>AST:</strong> \(b_n = \frac{1}{\sqrt{n}}\) decreasing, → 0 → the alternating series converges.</p>
<p>Verdict: <strong>conditionally convergent</strong>.</p>` },
      { type: "quiz",
        question: R`\(\displaystyle\sum \frac{(-1)^n}{n^2}\) is:`,
        options: [ R`Absolutely convergent`, R`Conditionally convergent`, R`Divergent`, R`Geometric` ],
        correct: 0,
        explanation: R`\(\sum\left|\frac{(-1)^n}{n^2}\right| = \sum\frac{1}{n^2}\) converges (\(p=2\)) — so the convergence doesn't even need the alternating signs.` },
      { type: "quiz",
        question: R`The alternating harmonic series \(\sum \frac{(-1)^{n+1}}{n}\) is the classic example of:`,
        options: [ R`Absolute convergence`, R`Conditional convergence`, R`Divergence`, R`A geometric series` ],
        correct: 1,
        explanation: R`It converges (AST) but \(\sum\frac{1}{n}\) diverges — convergence purely by cancellation. That's the definition of conditional.` },
      { type: "quiz",
        question: R`If \(\sum |a_n|\) converges, then \(\sum a_n\):`,
        options: [ R`Must converge`, R`Must diverge`, R`Might do either`, R`Converges only if alternating` ],
        correct: 0,
        explanation: R`Absolute convergence implies convergence — always. (The reverse is false: conditional series are the counterexamples.)` }
    ]
  },

  // ===== 10.10 Alternating Series Error Bound =====
  {
    id: "t10-10",
    title: "Alternating Series Error Bound",
    badge: "Topic 10.10",
    sections: [
      { type: "text", content: R`
<h3>The First Term You Skip</h3>
<p>For a convergent alternating series, the partial sums bracket the true sum, hopping over it back and forth. So the truncation error is beautifully simple to bound:</p>` },
      { type: "formula", title: "Alternating Series Error Bound", latex: R`\left|S - S_n\right| \le b_{n+1} \qquad \text{(the magnitude of the first omitted term)}` },
      { type: "text", content: R`
<p>Bonus fact: the true sum always lies <em>between</em> any two consecutive partial sums — so you also know the error's direction.</p>` },
      { type: "example",
        prompt: R`<p>Approximate \(\displaystyle\sum_{n=1}^\infty \frac{(-1)^{n+1}}{n^2}\) with 3 terms, and bound the error.</p>`,
        solution: R`<p>\(S_3 = 1 - \frac{1}{4} + \frac{1}{9} = \frac{31}{36} \approx 0.861\)</p>
<p>Error bound: \(|S - S_3| \le b_4 = \frac{1}{16} = 0.0625\). (True sum: \(\frac{\pi^2}{12} \approx 0.822\) — indeed within 0.0625.)</p>` },
      { type: "quiz",
        question: R`Using \(S_5\) to approximate a convergent alternating series, the error is at most:`,
        options: [ R`\(b_5\)`, R`\(b_6\)`, R`\(b_5 + b_6\)`, R`\(\frac{b_5}{2}\)` ],
        correct: 1,
        explanation: R`The error is bounded by the first term you left OUT — the \((n+1)\)th term, here \(b_6\).` },
      { type: "quiz",
        question: R`How many terms of \(\sum \frac{(-1)^{n+1}}{n}\) guarantee error \(< \frac{1}{100}\)?`,
        options: [ R`10`, R`99`, R`100`, R`101` ],
        correct: 2,
        explanation: R`Need \(b_{n+1} = \frac{1}{n+1} < \frac{1}{100}\), i.e. \(n + 1 > 100\), so \(n = 100\) terms suffice.` },
      { type: "numeric",
        prompt: R`<p>Approximating \(\displaystyle\sum_{n=1}^\infty \frac{(-1)^{n+1}}{n!}\) with 4 terms, bound the error. (5 decimals ok.)</p>`,
        answer: 0.00833, tolerance: 0.0005,
        solution: R`Error \(\le b_5 = \frac{1}{5!} = \frac{1}{120} \approx 0.00833\).` }
    ]
  },

  // ===== 10.11 Taylor Polynomials =====
  {
    id: "t10-11",
    title: "Taylor Polynomial Approximations",
    badge: "Topic 10.11",
    sections: [
      { type: "text", content: R`
<h3>The Best Polynomial Impersonator</h3>
<p>The degree-\(n\) Taylor polynomial of \(f\) centered at \(x = a\) matches \(f\)'s value and first \(n\) derivatives at \(a\):</p>` },
      { type: "formula", title: "Taylor Polynomial", latex: R`P_n(x) = \sum_{k=0}^{n} \frac{f^{(k)}(a)}{k!}(x-a)^k = f(a) + f'(a)(x-a) + \frac{f''(a)}{2!}(x-a)^2 + \cdots` },
      { type: "text", content: R`
<p>Centered at \(a = 0\) it's called a <strong>Maclaurin polynomial</strong>. The key skill: read off any coefficient — the coefficient of \((x-a)^k\) is \(\frac{f^{(k)}(a)}{k!}\), which also lets you go backwards from a known series to a derivative value.</p>` },
      { type: "example",
        prompt: R`<p>Build \(P_2(x)\) for \(f(x) = e^x\) at \(a = 0\), and use it to estimate \(e^{0.1}\).</p>`,
        solution: R`<p>All derivatives of \(e^x\) equal 1 at 0: \(P_2(x) = 1 + x + \frac{x^2}{2}\).</p>
<p>\(P_2(0.1) = 1 + 0.1 + 0.005 = \mathbf{1.105}\) (true value 1.10517 — already 4-decimal accurate).</p>` },
      { type: "quiz",
        question: R`The third-degree Maclaurin polynomial for \(\sin x\) is:`,
        options: [ R`\(x - \frac{x^3}{6}\)`, R`\(x + \frac{x^3}{6}\)`, R`\(1 - \frac{x^2}{2}\)`, R`\(x - \frac{x^3}{3}\)` ],
        correct: 0,
        explanation: R`\(\sin\) derivatives at 0 cycle \(0, 1, 0, -1\): \(P_3 = x - \frac{x^3}{3!} = x - \frac{x^3}{6}\).` },
      { type: "quiz",
        question: R`If \(f(x) = 3 + 5(x-2) - 4(x-2)^2 + \cdots\) is a Taylor series at \(a = 2\), then \(f''(2) =\)`,
        options: [ R`\(-4\)`, R`\(-8\)`, R`\(-2\)`, R`\(4\)` ],
        correct: 1,
        explanation: R`The coefficient of \((x-2)^2\) is \(\frac{f''(2)}{2!} = -4\), so \(f''(2) = -8\). Don't forget the factorial!` },
      { type: "numeric",
        prompt: R`<p>Using \(P_2(x) = 1 + x + \frac{x^2}{2}\) for \(e^x\), estimate \(e^{0.2}\).</p>`,
        answer: 1.22, tolerance: 0.001,
        solution: R`\(1 + 0.2 + \frac{0.04}{2} = 1.22\).` }
    ]
  },

  // ===== 10.12 Lagrange Error Bound =====
  {
    id: "t10-12",
    title: "Lagrange Error Bound",
    badge: "Topic 10.12",
    sections: [
      { type: "text", content: R`
<h3>How Wrong Can the Polynomial Be?</h3>
<p>The Lagrange error bound caps the difference between \(f(x)\) and its Taylor polynomial \(P_n(x)\), using the <em>next</em> derivative:</p>` },
      { type: "formula", title: "Lagrange Error Bound", latex: R`\left|f(x) - P_n(x)\right| \le \frac{M\,|x-a|^{n+1}}{(n+1)!}, \qquad M \ge \max\left|f^{(n+1)}\right| \text{ between } a \text{ and } x` },
      { type: "text", content: R`
<p>Recipe: (1) identify \(n\), \(a\), \(x\); (2) find \(M\), a bound on the \((n{+}1)\)th derivative on the interval — for \(\sin\) or \(\cos\), \(M = 1\) always works; (3) plug in. The structure is "the first omitted term, with the worst-case derivative."</p>` },
      { type: "example",
        prompt: R`<p>Bound the error when \(P_3(x) = x - \frac{x^3}{6}\) approximates \(\sin x\) on \(|x| \le 0.5\).</p>`,
        solution: R`<p>\(n = 3\), \(a = 0\), and \(|f^{(4)}| = |\sin x| \le 1\), so take \(M = 1\):</p>
<p>\(|R_3| \le \dfrac{1 \cdot (0.5)^4}{4!} = \dfrac{0.0625}{24} \approx \mathbf{0.0026}\)</p>` },
      { type: "quiz",
        question: R`In the Lagrange bound for \(P_n\), \(M\) must bound which derivative?`,
        options: [ R`\(f^{(n)}\)`, R`\(f^{(n+1)}\)`, R`\(f'\)`, R`\(f^{(n-1)}\)` ],
        correct: 1,
        explanation: R`Always the NEXT derivative — order \(n+1\) — on the interval between the center and the evaluation point.` },
      { type: "quiz",
        question: R`Why is \(M = 1\) always a valid choice when bounding errors for \(\sin x\) or \(\cos x\)?`,
        options: [ R`Their derivatives are all zero`, R`Every derivative is \(\pm\sin\) or \(\pm\cos\), which never exceed 1 in magnitude`, R`They are polynomials`, R`Their Taylor series terminate` ],
        correct: 1,
        explanation: R`Differentiating sine/cosine just cycles through \(\pm\sin, \pm\cos\) — all bounded by 1 everywhere. That's why sin/cos are the exam's favorite Lagrange targets.` },
      { type: "numeric",
        prompt: R`<p>\(f(x) = e^x\), \(P_2\) at \(a=0\), estimating at \(x = 1\), using \(M = 3\). Compute the Lagrange error bound.</p>`,
        answer: 0.5, tolerance: 0.001,
        solution: R`\(\frac{3 \cdot |1|^3}{3!} = \frac{3}{6} = 0.5\). (Actual error: \(e - 2.5 \approx 0.218\) — safely under the bound.)` }
    ]
  },

  // ===== 10.13 Radius & Interval of Convergence =====
  {
    id: "t10-13",
    title: "Radius & Interval of Convergence",
    badge: "Topic 10.13",
    sections: [
      { type: "text", content: R`
<h3>Where a Power Series Lives</h3>
<p>A power series \(\sum c_n (x-a)^n\) converges on an interval centered at \(a\) with <strong>radius</strong> \(R\): absolutely inside \(|x - a| < R\), diverges outside, and the two <strong>endpoints must be checked individually</strong> by plugging them in.</p>
<p><strong>Procedure:</strong> apply the ratio test to the series with \(x\) left in, set \(L < 1\), and solve for \(|x - a|\).</p>` },
      { type: "example",
        prompt: R`<p>Find the interval of convergence of \(\displaystyle\sum_{n=1}^\infty \frac{(x-2)^n}{n\,3^n}\).</p>`,
        solution: R`<p>Ratio test: \(\left|\frac{(x-2)^{n+1}}{(n+1)3^{n+1}}\cdot\frac{n\,3^n}{(x-2)^n}\right| = \frac{|x-2|}{3}\cdot\frac{n}{n+1} \to \frac{|x-2|}{3}\)</p>
<p>Converges when \(|x-2| < 3\): radius \(R = 3\), open interval \((-1, 5)\).</p>
<p><strong>Endpoints:</strong> \(x = 5\): \(\sum\frac{1}{n}\) diverges. \(x = -1\): \(\sum\frac{(-1)^n}{n}\) converges (AST).</p>
<p>Interval: \(\mathbf{[-1, 5)}\).</p>` },
      { type: "quiz",
        question: R`The radius of convergence of \(\displaystyle\sum n!\,x^n\) is:`,
        options: [ R`\(\infty\)`, R`\(1\)`, R`\(0\)`, R`\(e\)` ],
        correct: 2,
        explanation: R`Ratio: \((n+1)|x| \to \infty\) for any \(x \ne 0\). The series converges only at its center — \(R = 0\).` },
      { type: "quiz",
        question: R`The radius of convergence of \(\displaystyle\sum \frac{x^n}{n!}\) is:`,
        options: [ R`\(0\)`, R`\(1\)`, R`\(e\)`, R`\(\infty\)` ],
        correct: 3,
        explanation: R`Ratio: \(\frac{|x|}{n+1} \to 0 < 1\) for every \(x\) — converges everywhere. (It's the series for \(e^x\).)` },
      { type: "numeric",
        prompt: R`<p>Find the radius of convergence of \(\displaystyle\sum_{n=0}^\infty \frac{x^n}{5^n}\).</p>`,
        answer: 5, tolerance: 0.001,
        solution: R`Geometric with ratio \(\frac{x}{5}\): converges when \(\left|\frac{x}{5}\right| < 1\), i.e. \(|x| < 5\). \(R = 5\).` }
    ]
  },

  // ===== 10.14 Taylor & Maclaurin Series =====
  {
    id: "t10-14",
    title: "Taylor & Maclaurin Series",
    badge: "Topic 10.14",
    sections: [
      { type: "text", content: R`
<h3>The Four Series to Memorize</h3>
<p>These four Maclaurin series are required knowledge — everything else on the exam is built from them:</p>` },
      { type: "formula", title: "Memorize These", latex: R`e^x = \sum_{n=0}^{\infty}\frac{x^n}{n!} \qquad \sin x = \sum_{n=0}^{\infty}\frac{(-1)^n x^{2n+1}}{(2n+1)!} \qquad \cos x = \sum_{n=0}^{\infty}\frac{(-1)^n x^{2n}}{(2n)!} \qquad \frac{1}{1-x} = \sum_{n=0}^{\infty}x^n\ (|x|<1)` },
      { type: "text", content: R`
<p>Memory hooks: \(\sin\) is odd → odd powers; \(\cos\) is even → even powers; both alternate. \(e^x\), \(\sin\), \(\cos\) converge for all \(x\); the geometric one only on \((-1,1)\).</p>
<p><strong>Substitution builds new series for free:</strong> replace \(x\) with \(-x\), \(x^2\), \(2x\)… in a known series.</p>` },
      { type: "example",
        prompt: R`<p>Find the Maclaurin series for \(e^{x^2}\).</p>`,
        solution: R`<p>Substitute \(x^2\) into the exponential series:</p>
<p>\(e^{x^2} = \displaystyle\sum_{n=0}^{\infty}\frac{(x^2)^n}{n!} = \sum_{n=0}^{\infty}\frac{x^{2n}}{n!} = 1 + x^2 + \frac{x^4}{2!} + \cdots\)</p>
<p>No derivatives needed — substitution does everything.</p>` },
      { type: "quiz",
        question: R`Which is the Maclaurin series for \(\cos x\)?`,
        options: [ R`\(\sum \frac{x^n}{n!}\)`, R`\(\sum \frac{(-1)^n x^{2n}}{(2n)!}\)`, R`\(\sum \frac{(-1)^n x^{2n+1}}{(2n+1)!}\)`, R`\(\sum x^{2n}\)` ],
        correct: 1,
        explanation: R`Cosine: even powers, alternating signs, even factorials: \(1 - \frac{x^2}{2!} + \frac{x^4}{4!} - \cdots\)` },
      { type: "quiz",
        question: R`The Maclaurin series for \(\dfrac{1}{1+x}\) is:`,
        options: [ R`\(\sum x^n\)`, R`\(\sum (-1)^n x^n\)`, R`\(\sum \frac{(-1)^n x^n}{n!}\)`, R`\(\sum (-1)^n x^{2n}\)` ],
        correct: 1,
        explanation: R`Substitute \(-x\) into \(\frac{1}{1-x} = \sum x^n\): \(\sum (-x)^n = \sum (-1)^n x^n = 1 - x + x^2 - \cdots\)` },
      { type: "numeric",
        prompt: R`<p>What is the coefficient of \(x^3\) in the Maclaurin series for \(e^x\)? (4 decimals.)</p>`,
        answer: 0.1667, tolerance: 0.001,
        solution: R`The \(x^3\) term is \(\frac{x^3}{3!}\), so the coefficient is \(\frac{1}{6} \approx 0.1667\).` }
    ]
  },

  // ===== 10.15 Functions as Power Series =====
  {
    id: "t10-15",
    title: "Representing Functions as Power Series",
    badge: "Topic 10.15",
    sections: [
      { type: "text", content: R`
<h3>Building New Series From Old</h3>
<p>Inside its interval of convergence, a power series behaves like a polynomial: you may <strong>substitute</strong>, <strong>multiply</strong>, <strong>differentiate</strong>, and <strong>integrate term-by-term</strong> — and differentiation/integration keep the same radius \(R\) (endpoints can change).</p>` },
      { type: "example",
        prompt: R`<p>Derive a power series for \(\arctan x\).</p>`,
        solution: R`<p>Start geometric, substitute \(-x^2\): \(\dfrac{1}{1+x^2} = \sum (-1)^n x^{2n} = 1 - x^2 + x^4 - \cdots\)</p>
<p>Integrate term-by-term (constant is 0 since \(\arctan 0 = 0\)):</p>
<p>\(\arctan x = \displaystyle\sum_{n=0}^{\infty} \frac{(-1)^n x^{2n+1}}{2n+1} = x - \frac{x^3}{3} + \frac{x^5}{5} - \cdots\)</p>` },
      { type: "quiz",
        question: R`The power series for \(\dfrac{1}{1-3x}\), and its radius of convergence, are:`,
        options: [ R`\(\sum 3^n x^n,\ R = \frac{1}{3}\)`, R`\(\sum 3x^n,\ R = 1\)`, R`\(\sum 3^n x^n,\ R = 3\)`, R`\(\sum \frac{x^n}{3^n},\ R = 3\)` ],
        correct: 0,
        explanation: R`Substitute \(3x\) into the geometric series: \(\sum (3x)^n = \sum 3^n x^n\), valid when \(|3x| < 1\), i.e. \(R = \frac{1}{3}\).` },
      { type: "quiz",
        question: R`Differentiating a power series term-by-term inside its interval of convergence:`,
        options: [ R`Changes the radius of convergence`, R`Keeps the same radius (endpoints may change)`, R`Is not allowed`, R`Doubles the radius` ],
        correct: 1,
        explanation: R`Differentiation and integration preserve \(R\). Only the behavior at the two endpoints can flip.` },
      { type: "numeric",
        prompt: R`<p>In the power series for \(\dfrac{1}{1-2x}\), what is the coefficient of \(x^2\)?</p>`,
        answer: 4, tolerance: 0.001,
        solution: R`\(\frac{1}{1-2x} = \sum (2x)^n = \sum 2^n x^n\); the \(x^2\) coefficient is \(2^2 = 4\).` },
      { type: "text", content: R`
<h3>🎓 That's Every BC Topic</h3>
<p>You've covered all 30 BC-only topics: the advanced integration techniques, Euler's method and logistic models, arc length, the full parametric/polar/vector unit, and the complete series unit. Review path for the exam: redo every free-response box cold, and drill 10.13's endpoint checks and 10.12's error bounds — the two places points leak most.</p>` }
    ]
  }
);
