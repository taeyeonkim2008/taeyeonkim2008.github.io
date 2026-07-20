const R = String.raw;

const LESSONS = [

  // ===== 6.11 Integration by Parts =====
  {
    id: "t6-11",
    title: "Integration by Parts",
    badge: "Topic 6.11",
    sections: [
      { type: "text", content: R`
<h3>Undoing the Product Rule</h3>
<p>Integration by parts is the product rule run backwards. When an integrand is a <em>product</em> of two different kinds of functions — like \(x e^x\) or \(x\cos x\) — split it into a part to differentiate (\(u\)) and a part to integrate (\(dv\)).</p>` },
      { type: "formula", title: "Integration by Parts", latex: R`\int u\,dv = uv - \int v\,du` },
      { type: "text", content: R`
<p><strong>Choosing \(u\):</strong> use <strong>LIATE</strong> — <strong>L</strong>ogs, <strong>I</strong>nverse trig, <strong>A</strong>lgebraic, <strong>T</strong>rig, <strong>E</strong>xponential. Whatever appears first on this list becomes \(u\); the rest is \(dv\). The goal: \(\int v\,du\) should be <em>easier</em> than what you started with.</p>` },
      { type: "example",
        prompt: R`<p>Evaluate \(\displaystyle\int x e^x\,dx\). Try it before revealing the solution.</p>`,
        solution: R`<p>Let \(u = x\) (algebraic) and \(dv = e^x dx\). Then \(du = dx\) and \(v = e^x\).</p>
<p>\(\displaystyle\int x e^x dx = x e^x - \int e^x dx = x e^x - e^x + C = (x-1)e^x + C\)</p>
<p><strong>Check by differentiating:</strong> \(\frac{d}{dx}[(x-1)e^x] = e^x + (x-1)e^x = x e^x\) ✓</p>` },
      { type: "quiz",
        question: R`What is \(\displaystyle\int x\cos x\,dx\)?`,
        options: [ R`\(x\sin x + \cos x + C\)`, R`\(x\sin x - \cos x + C\)`, R`\(-x\sin x + \cos x + C\)`, R`\(\frac{x^2}{2}\sin x + C\)` ],
        correct: 0,
        explanation: R`With \(u = x\), \(dv = \cos x\,dx\): \(du = dx\), \(v = \sin x\). So the integral is \(x\sin x - \int \sin x\,dx = x\sin x + \cos x + C\).` },
      { type: "quiz",
        question: R`For \(\displaystyle\int x^2 \ln x\,dx\), the best choice of \(u\) is:`,
        options: [ R`\(u = x^2\)`, R`\(u = \ln x\)`, R`\(u = x^2 \ln x\)`, R`\(u = dx\)` ],
        correct: 1,
        explanation: R`LIATE puts Logs first: \(u = \ln x\) differentiates to \(\frac{1}{x}\), which cancels beautifully against the power of \(x\) in \(dv = x^2 dx\).` },
      { type: "numeric",
        prompt: R`<p>Evaluate the definite integral \(\displaystyle\int_0^1 x e^x\,dx\). (Decimal or exact.)</p>`,
        answer: 1, tolerance: 0.01,
        solution: R`From the example, the antiderivative is \((x-1)e^x\). Evaluating: \((1-1)e^1 - (0-1)e^0 = 0 - (-1) = 1\).` }
    ]
  },

  // ===== 6.12 Partial Fractions =====
  {
    id: "t6-12",
    title: "Linear Partial Fractions",
    badge: "Topic 6.12",
    sections: [
      { type: "text", content: R`
<h3>Splitting Rational Functions</h3>
<p>A rational function with a factorable denominator can be split into simple pieces that each integrate to a logarithm. BC only requires <strong>distinct linear factors</strong>:</p>` },
      { type: "formula", title: "Partial Fraction Setup", latex: R`\frac{px+q}{(x-a)(x-b)} = \frac{A}{x-a} + \frac{B}{x-b}` },
      { type: "text", content: R`
<p><strong>The cover-up shortcut:</strong> to find \(A\), plug \(x = a\) into the original fraction with the factor \((x-a)\) covered up. Same for \(B\) with \(x = b\). Then each piece integrates: \(\int \frac{A}{x-a}dx = A\ln|x-a| + C\).</p>` },
      { type: "example",
        prompt: R`<p>Evaluate \(\displaystyle\int \frac{x+7}{(x-1)(x+3)}\,dx\).</p>`,
        solution: R`<p>Set \(\frac{x+7}{(x-1)(x+3)} = \frac{A}{x-1} + \frac{B}{x+3}\).</p>
<p>Cover-up at \(x=1\): \(A = \frac{1+7}{1+3} = 2\). Cover-up at \(x=-3\): \(B = \frac{-3+7}{-3-1} = -1\).</p>
<p>\(\displaystyle\int \left(\frac{2}{x-1} - \frac{1}{x+3}\right) dx = 2\ln|x-1| - \ln|x+3| + C\)</p>` },
      { type: "quiz",
        question: R`Decompose \(\dfrac{3x+5}{(x-1)(x+3)}\).`,
        options: [ R`\(\frac{2}{x-1} + \frac{1}{x+3}\)`, R`\(\frac{1}{x-1} + \frac{2}{x+3}\)`, R`\(\frac{2}{x-1} - \frac{1}{x+3}\)`, R`\(\frac{3}{x-1} + \frac{5}{x+3}\)` ],
        correct: 0,
        explanation: R`Cover-up: at \(x=1\), \(A = \frac{3+5}{4} = 2\); at \(x=-3\), \(B = \frac{-9+5}{-4} = 1\). Check at \(x=0\): \(\frac{5}{-3} = -2 + \frac{1}{3}\) ✓` },
      { type: "quiz",
        question: R`\(\displaystyle\int \frac{dx}{x(x+2)} = \)`,
        options: [ R`\(\frac{1}{2}\ln\left|\frac{x}{x+2}\right| + C\)`, R`\(\ln|x(x+2)| + C\)`, R`\(\frac{1}{2}\ln|x(x+2)| + C\)`, R`\(\ln\left|\frac{x+2}{x}\right| + C\)` ],
        correct: 0,
        explanation: R`\(\frac{1}{x(x+2)} = \frac{1/2}{x} - \frac{1/2}{x+2}\), which integrates to \(\frac{1}{2}(\ln|x| - \ln|x+2|) = \frac{1}{2}\ln\left|\frac{x}{x+2}\right| + C\).` },
      { type: "numeric",
        prompt: R`<p>If \(\dfrac{x+10}{(x-2)(x+4)} = \dfrac{A}{x-2} + \dfrac{B}{x+4}\), find \(A\).</p>`,
        answer: 2, tolerance: 0.001,
        solution: R`Cover-up at \(x = 2\): \(A = \frac{2+10}{2+4} = \frac{12}{6} = 2\). (And \(B = \frac{6}{-6} = -1\).)` }
    ]
  },

  // ===== 6.13 Improper Integrals =====
  {
    id: "t6-13",
    title: "Improper Integrals",
    badge: "Topic 6.13",
    sections: [
      { type: "text", content: R`
<h3>Integrals That Push to Infinity</h3>
<p>An integral is <strong>improper</strong> if a limit of integration is infinite, or the integrand blows up somewhere in the interval. Either way, the fix is the same: replace the bad endpoint with a variable and take a <strong>limit</strong>. If the limit is finite, the integral <strong>converges</strong>; otherwise it <strong>diverges</strong>.</p>` },
      { type: "formula", title: "Definition", latex: R`\int_a^{\infty} f(x)\,dx = \lim_{b\to\infty}\int_a^{b} f(x)\,dx` },
      { type: "text", content: R`
<div class="info-box"><strong>The p-test for integrals:</strong> \(\int_1^\infty \frac{dx}{x^p}\) converges exactly when \(p > 1\). This single fact powers half of Unit 10's convergence tests.</div>` },
      { type: "example",
        prompt: R`<p>Evaluate \(\displaystyle\int_1^{\infty} \frac{dx}{x^2}\) or show it diverges.</p>`,
        solution: R`<p>\(\displaystyle\lim_{b\to\infty}\int_1^{b} x^{-2}dx = \lim_{b\to\infty}\left[-\frac{1}{x}\right]_1^{b} = \lim_{b\to\infty}\left(-\frac{1}{b} + 1\right) = \mathbf{1}\)</p>
<p>The area under \(1/x^2\) from 1 to infinity is exactly 1 — an infinitely long region with finite area.</p>` },
      { type: "quiz",
        question: R`Which of these integrals converges?`,
        options: [ R`\(\int_1^\infty \frac{dx}{x}\)`, R`\(\int_1^\infty \frac{dx}{\sqrt{x}}\)`, R`\(\int_1^\infty \frac{dx}{x^2}\)`, R`All three diverge` ],
        correct: 2,
        explanation: R`By the p-test: \(p=1\) (harmonic) diverges, \(p=\frac{1}{2}\) diverges, \(p=2>1\) converges.` },
      { type: "quiz",
        question: R`\(\displaystyle\int_0^1 \frac{dx}{\sqrt{x}}\) — improper because the integrand is unbounded at 0 — equals:`,
        options: [ R`It diverges`, R`\(2\)`, R`\(1\)`, R`\(\frac{1}{2}\)` ],
        correct: 1,
        explanation: R`\(\lim_{a\to 0^+}\left[2\sqrt{x}\right]_a^1 = 2 - 0 = 2\). Near zero, \(p = \frac{1}{2} < 1\) is the convergent case — the rule flips at finite endpoints.` },
      { type: "numeric",
        prompt: R`<p>Evaluate \(\displaystyle\int_1^{\infty} \frac{3}{x^4}\,dx\).</p>`,
        answer: 1, tolerance: 0.01,
        solution: R`\(3\displaystyle\lim_{b\to\infty}\left[\frac{x^{-3}}{-3}\right]_1^b = 3\left(0 + \frac{1}{3}\right) = 1\).` }
    ]
  },

  // ===== 7.5 Euler's Method =====
  {
    id: "t7-5",
    title: "Euler's Method",
    badge: "Topic 7.5",
    sections: [
      { type: "text", content: R`
<h3>Following Tangent Lines</h3>
<p>When a differential equation can't be solved exactly, <strong>Euler's method</strong> approximates the solution numerically: from the current point, step along the tangent line, then recompute the slope and repeat.</p>` },
      { type: "formula", title: "Euler Step", latex: R`y_{n+1} = y_n + h\cdot f(x_n, y_n), \qquad x_{n+1} = x_n + h` },
      { type: "text", content: R`
<p>Here \(h\) is the step size and \(f(x,y) = \frac{dy}{dx}\). Organize your work in a table: current \(x\), current \(y\), slope at that point, then the new \(y\). Smaller \(h\) → better accuracy → more steps.</p>` },
      { type: "example",
        prompt: R`<p>Let \(\frac{dy}{dx} = x + y\) with \(y(0) = 1\). Use Euler's method with \(h = 0.5\) to approximate \(y(1)\).</p>`,
        solution: R`<p><strong>Step 1:</strong> at \((0, 1)\), slope \(= 0 + 1 = 1\). New \(y = 1 + 0.5(1) = 1.5\) at \(x = 0.5\).</p>
<p><strong>Step 2:</strong> at \((0.5, 1.5)\), slope \(= 0.5 + 1.5 = 2\). New \(y = 1.5 + 0.5(2) = 2.5\).</p>
<p>So \(y(1) \approx \mathbf{2.5}\). (The exact solution gives \(y(1) = 2e - 2 \approx 3.44\) — Euler undershoots here.)</p>` },
      { type: "quiz",
        question: R`\(\frac{dy}{dx} = 2x\), \(y(1) = 3\), one step with \(h = 0.1\). Then \(y(1.1) \approx\)`,
        options: [ R`\(3.1\)`, R`\(3.2\)`, R`\(3.02\)`, R`\(3.21\)` ],
        correct: 1,
        explanation: R`Slope at \((1,3)\) is \(2(1) = 2\). So \(y \approx 3 + 0.1 \times 2 = 3.2\).` },
      { type: "quiz",
        question: R`If the true solution curve is <strong>concave up</strong>, Euler's method will generally:`,
        options: [ R`Overestimate the solution`, R`Underestimate the solution`, R`Be exact`, R`Alternate over and under` ],
        correct: 1,
        explanation: R`Tangent lines sit <em>below</em> a concave-up curve, so stepping along tangents lags below the true solution — an underestimate.` },
      { type: "numeric",
        prompt: R`<p>\(\frac{dy}{dx} = y\), \(y(0) = 1\). Approximate \(y(1)\) using <strong>two steps</strong> (\(h = 0.5\)).</p>`,
        answer: 2.25, tolerance: 0.001,
        solution: R`Step 1: slope \(=1\), \(y = 1 + 0.5(1) = 1.5\). Step 2: slope \(=1.5\), \(y = 1.5 + 0.5(1.5) = 2.25\). (True value: \(e \approx 2.718\).)` }
    ]
  },

  // ===== 7.9 Logistic Models =====
  {
    id: "t7-9",
    title: "Logistic Models",
    badge: "Topic 7.9",
    sections: [
      { type: "text", content: R`
<h3>Growth With a Ceiling</h3>
<p>Real populations can't grow exponentially forever. The <strong>logistic model</strong> adds a brake: growth slows as the population \(y\) approaches the <strong>carrying capacity</strong> \(L\).</p>` },
      { type: "formula", title: "Logistic Differential Equation", latex: R`\frac{dy}{dt} = k\,y\left(1 - \frac{y}{L}\right)` },
      { type: "text", content: R`
<p>Everything the AP exam asks lives in this equation — usually <em>without</em> solving it:</p>
<ul>
<li>\(\lim_{t\to\infty} y = L\) for any starting value \(0 < y_0 < L\)</li>
<li>Growth is <strong>fastest at \(y = \frac{L}{2}\)</strong> (the S-curve's inflection point)</li>
<li>\(\frac{dy}{dt} \approx ky\) (plain exponential) when \(y\) is small</li>
</ul>` },
      { type: "example",
        prompt: R`<p>A population follows \(\frac{dP}{dt} = 0.4P\left(1 - \frac{P}{200}\right)\), \(P(0)=20\). Find the carrying capacity and the population at which growth is fastest.</p>`,
        solution: R`<p>Matching the standard form: \(L = \mathbf{200}\) (the population approaches 200 as \(t \to \infty\)).</p>
<p>Fastest growth at \(P = \frac{L}{2} = \mathbf{100}\).</p>` },
      { type: "quiz",
        question: R`For \(\frac{dP}{dt} = 3P - \frac{P^2}{50}\), the carrying capacity is:`,
        options: [ R`\(50\)`, R`\(3\)`, R`\(150\)`, R`\(100\)` ],
        correct: 2,
        explanation: R`Factor: \(3P - \frac{P^2}{50} = 3P\left(1 - \frac{P}{150}\right)\). So \(L = 150\). (You can also set \(\frac{dP}{dt}=0\): \(P(3 - P/50) = 0 \Rightarrow P = 150\).)` },
      { type: "quiz",
        question: R`A logistic population grows fastest when the population equals:`,
        options: [ R`The carrying capacity \(L\)`, R`\(\frac{L}{2}\)`, R`\(\frac{L}{4}\)`, R`Its initial value` ],
        correct: 1,
        explanation: R`\(\frac{dP}{dt} = kP(1-P/L)\) is a downward parabola in \(P\), maximized at the vertex \(P = L/2\).` },
      { type: "numeric",
        prompt: R`<p>If \(\frac{dP}{dt} = 0.2P\left(1 - \frac{P}{500}\right)\) with \(P(0) = 40\), find \(\lim_{t\to\infty} P(t)\).</p>`,
        answer: 500, tolerance: 0.5,
        solution: R`Any logistic population starting between 0 and \(L\) approaches the carrying capacity: \(\lim P = 500\).` }
    ]
  },

  // ===== 8.13 Arc Length =====
  {
    id: "t8-13",
    title: "Arc Length of a Curve",
    badge: "Topic 8.13",
    sections: [
      { type: "text", content: R`
<h3>Measuring Along the Curve</h3>
<p>Chop the curve into tiny pieces; each piece is nearly a straight segment of length \(\sqrt{(dx)^2 + (dy)^2}\). Summing them gives the arc length integral:</p>` },
      { type: "formula", title: "Arc Length (y = f(x))", latex: R`L = \int_a^b \sqrt{1 + \left(f'(x)\right)^2}\,dx` },
      { type: "text", content: R`
<div class="info-box"><strong>On the exam</strong>, most arc-length problems only ask you to <strong>set up</strong> the integral (or evaluate it on the calculator section) — the integrand rarely simplifies by hand. The classic hand-computable ones hide a perfect square under the root.</div>` },
      { type: "example",
        prompt: R`<p>Find the length of \(y = \frac{1}{3}(x^2+2)^{3/2}\) from \(x = 0\) to \(x = 1\).</p>`,
        solution: R`<p>\(y' = x\sqrt{x^2+2}\), so \((y')^2 = x^4 + 2x^2\) and \(1 + (y')^2 = x^4 + 2x^2 + 1 = (x^2+1)^2\) — a perfect square!</p>
<p>\(L = \displaystyle\int_0^1 (x^2 + 1)\,dx = \frac{1}{3} + 1 = \frac{4}{3}\)</p>` },
      { type: "quiz",
        question: R`The length of \(y = \sin x\) from \(0\) to \(\pi\) is given by:`,
        options: [ R`\(\int_0^\pi \sqrt{1+\cos^2 x}\,dx\)`, R`\(\int_0^\pi \sqrt{1+\sin^2 x}\,dx\)`, R`\(\int_0^\pi (1+\cos x)\,dx\)`, R`\(\int_0^\pi \sqrt{1-\cos^2 x}\,dx\)` ],
        correct: 0,
        explanation: R`\(f'(x) = \cos x\), so the integrand is \(\sqrt{1 + (f')^2} = \sqrt{1+\cos^2 x}\).` },
      { type: "quiz",
        question: R`Which integral gives the arc length of \(y = x^2\) on \([0, 1]\)?`,
        options: [ R`\(\int_0^1 \sqrt{1+x^4}\,dx\)`, R`\(\int_0^1 \sqrt{1+2x}\,dx\)`, R`\(\int_0^1 \sqrt{1+4x^2}\,dx\)`, R`\(\int_0^1 (1+4x^2)\,dx\)` ],
        correct: 2,
        explanation: R`\(y' = 2x\), so \((y')^2 = 4x^2\) and \(L = \int_0^1\sqrt{1+4x^2}\,dx\). (Squaring the derivative — not the function — is the classic trap.)` },
      { type: "numeric",
        prompt: R`<p>Using the worked example's method, the length of \(y = \frac{1}{3}(x^2+2)^{3/2}\) on \([0,1]\) is:</p>`,
        answer: 1.333, tolerance: 0.01,
        solution: R`\(\int_0^1 (x^2+1)dx = \frac{4}{3} \approx 1.333\).` }
    ]
  },

  // ===== 9.1 Parametric Derivatives =====
  {
    id: "t9-1",
    title: "Differentiating Parametric Equations",
    badge: "Topic 9.1",
    sections: [
      { type: "text", content: R`
<h3>Curves With a Clock</h3>
<p>A parametric curve gives \(x\) and \(y\) separately as functions of a parameter \(t\): the curve is traced out over time. The slope of the curve still means \(\frac{dy}{dx}\), computed by the chain rule:</p>` },
      { type: "formula", title: "Parametric First Derivative", latex: R`\frac{dy}{dx} = \frac{dy/dt}{dx/dt}, \qquad \frac{dx}{dt} \ne 0` },
      { type: "text", content: R`
<ul>
<li><strong>Horizontal tangent:</strong> \(\frac{dy}{dt} = 0\) (and \(\frac{dx}{dt} \ne 0\))</li>
<li><strong>Vertical tangent:</strong> \(\frac{dx}{dt} = 0\) (and \(\frac{dy}{dt} \ne 0\))</li>
</ul>` },
      { type: "example",
        prompt: R`<p>For \(x = t^2\), \(y = t^3\), find \(\frac{dy}{dx}\) and evaluate it at \(t = 2\).</p>`,
        solution: R`<p>\(\frac{dy}{dx} = \frac{3t^2}{2t} = \frac{3t}{2}\) (for \(t \ne 0\)).</p>
<p>At \(t = 2\): slope \(= \mathbf{3}\).</p>` },
      { type: "quiz",
        question: R`For \(x = \cos t\), \(y = \sin t\), the slope \(\frac{dy}{dx}\) at \(t = \frac{\pi}{6}\) is:`,
        options: [ R`\(\sqrt{3}\)`, R`\(-\sqrt{3}\)`, R`\(-\frac{1}{\sqrt{3}}\)`, R`\(\frac{1}{\sqrt{3}}\)` ],
        correct: 1,
        explanation: R`\(\frac{dy}{dx} = \frac{\cos t}{-\sin t}\). At \(\frac{\pi}{6}\): \(\frac{\sqrt{3}/2}{-1/2} = -\sqrt{3}\).` },
      { type: "quiz",
        question: R`A parametric curve has a <strong>vertical</strong> tangent where:`,
        options: [ R`\(\frac{dy}{dt} = 0\)`, R`\(\frac{dx}{dt} = 0\) and \(\frac{dy}{dt} \ne 0\)`, R`\(\frac{dy}{dx} = 0\)`, R`\(t = 0\)` ],
        correct: 1,
        explanation: R`The tangent is vertical when the denominator \(dx/dt\) vanishes while the numerator doesn't — the curve moves purely vertically at that instant.` },
      { type: "numeric",
        prompt: R`<p>For \(x = t^2 + 1\), \(y = t^4\), find \(\frac{dy}{dx}\) at \(t = 1\).</p>`,
        answer: 2, tolerance: 0.001,
        solution: R`\(\frac{dy}{dx} = \frac{4t^3}{2t} = 2t^2\). At \(t=1\): \(2\).` }
    ]
  },

  // ===== 9.2 Second Derivatives of Parametrics =====
  {
    id: "t9-2",
    title: "Second Derivatives (Parametric)",
    badge: "Topic 9.2",
    sections: [
      { type: "text", content: R`
<h3>Differentiate the Slope — With Respect to t</h3>
<p>The second derivative \(\frac{d^2y}{dx^2}\) is the derivative of \(\frac{dy}{dx}\) <em>with respect to x</em>. But \(\frac{dy}{dx}\) is a function of \(t\), so you must divide by \(\frac{dx}{dt}\) again:</p>` },
      { type: "formula", title: "Parametric Second Derivative", latex: R`\frac{d^2y}{dx^2} = \frac{\dfrac{d}{dt}\!\left(\dfrac{dy}{dx}\right)}{\dfrac{dx}{dt}}` },
      { type: "text", content: R`
<div class="warning-box"><strong>Classic trap:</strong> \(\frac{d^2y}{dx^2}\) is <em>NOT</em> \(\frac{d^2y/dt^2}{d^2x/dt^2}\). You differentiate the slope function and divide by \(dx/dt\) once more.</div>` },
      { type: "example",
        prompt: R`<p>For \(x = t^2\), \(y = t^3\), find \(\frac{d^2y}{dx^2}\) at \(t = 1\).</p>`,
        solution: R`<p>From 9.1, \(\frac{dy}{dx} = \frac{3t}{2}\). Then \(\frac{d}{dt}\left(\frac{3t}{2}\right) = \frac{3}{2}\).</p>
<p>\(\frac{d^2y}{dx^2} = \frac{3/2}{2t} = \frac{3}{4t}\). At \(t = 1\): \(\mathbf{\frac{3}{4}}\). Positive → the curve is concave up there.</p>` },
      { type: "quiz",
        question: R`Which formula correctly computes \(\frac{d^2y}{dx^2}\) for a parametric curve?`,
        options: [ R`\(\dfrac{d^2y/dt^2}{d^2x/dt^2}\)`, R`\(\dfrac{d}{dt}\left(\dfrac{dy}{dx}\right)\)`, R`\(\dfrac{\frac{d}{dt}(dy/dx)}{dx/dt}\)`, R`\(\dfrac{dy/dt}{dx/dt}\)` ],
        correct: 2,
        explanation: R`Differentiate the slope with respect to \(t\), then divide by \(dx/dt\) to convert the rate back to "per unit x."` },
      { type: "numeric",
        prompt: R`<p>For \(x = 2t\), \(y = t^3\), find \(\frac{d^2y}{dx^2}\) at \(t = 2\).</p>`,
        answer: 3, tolerance: 0.01,
        solution: R`\(\frac{dy}{dx} = \frac{3t^2}{2}\); \(\frac{d}{dt} = 3t\); divide by \(\frac{dx}{dt} = 2\): \(\frac{3t}{2}\). At \(t=2\): \(3\).` }
    ]
  },

  // ===== 9.3 Parametric Arc Length =====
  {
    id: "t9-3",
    title: "Arc Length (Parametric)",
    badge: "Topic 9.3",
    sections: [
      { type: "text", content: R`
<h3>Speed, Integrated</h3>
<p>For a parametric curve, the tiny piece of length is \(\sqrt{(dx/dt)^2 + (dy/dt)^2}\,dt\) — which is exactly the <strong>speed</strong> times \(dt\). Arc length is speed integrated over time:</p>` },
      { type: "formula", title: "Parametric Arc Length", latex: R`L = \int_{a}^{b} \sqrt{\left(\frac{dx}{dt}\right)^2 + \left(\frac{dy}{dt}\right)^2}\,dt` },
      { type: "example",
        prompt: R`<p>Find the length of the curve \(x = 3t^2\), \(y = 2t^3\) for \(0 \le t \le 1\).</p>`,
        solution: R`<p>\(x' = 6t\), \(y' = 6t^2\): integrand \(= \sqrt{36t^2 + 36t^4} = 6t\sqrt{1+t^2}\) (since \(t \ge 0\)).</p>
<p>Substitute \(u = 1+t^2\): \(L = \left[2(1+t^2)^{3/2}\right]_0^1 = 2(2\sqrt{2} - 1) = 4\sqrt{2} - 2 \approx 3.657\)</p>` },
      { type: "quiz",
        question: R`The arc length of \(x = \cos t\), \(y = \sin t\) for \(0 \le t \le 2\pi\) is:`,
        options: [ R`\(\pi\)`, R`\(2\pi\)`, R`\(4\pi\)`, R`\(2\)` ],
        correct: 1,
        explanation: R`The integrand is \(\sqrt{\sin^2 t + \cos^2 t} = 1\), so \(L = \int_0^{2\pi} 1\,dt = 2\pi\) — the circumference of the unit circle, as expected.` },
      { type: "quiz",
        question: R`Which integral gives the length of \(x = e^t\), \(y = t^2\) on \([0, 2]\)?`,
        options: [ R`\(\int_0^2 \sqrt{e^t + 2t}\,dt\)`, R`\(\int_0^2 \sqrt{e^{2t} + 4t^2}\,dt\)`, R`\(\int_0^2 (e^t + 2t)\,dt\)`, R`\(\int_0^2 \sqrt{1 + e^{2t}}\,dt\)` ],
        correct: 1,
        explanation: R`Square each derivative: \((e^t)^2 = e^{2t}\) and \((2t)^2 = 4t^2\); add under one square root.` },
      { type: "numeric",
        prompt: R`<p>Find the length of \(x = t\), \(y = \frac{2}{3}t^{3/2}\) for \(0 \le t \le 3\). (Hint: the integrand simplifies to \(\sqrt{1+t}\).)</p>`,
        answer: 4.667, tolerance: 0.01,
        solution: R`\(L = \int_0^3 \sqrt{1+t}\,dt = \left[\frac{2}{3}(1+t)^{3/2}\right]_0^3 = \frac{2}{3}(8-1) = \frac{14}{3} \approx 4.667\).` }
    ]
  },

  // ===== 9.4 Vector-Valued Functions =====
  {
    id: "t9-4",
    title: "Vector-Valued Functions",
    badge: "Topic 9.4",
    sections: [
      { type: "text", content: R`
<h3>Position as a Vector</h3>
<p>A vector-valued function packages a parametric curve into one object: \(\vec{r}(t) = \langle x(t),\, y(t)\rangle\). Differentiation is component-by-component — and the derivatives have physical names:</p>
<ul>
<li>\(\vec{r}(t)\) — position</li>
<li>\(\vec{r}\,'(t) = \vec{v}(t) = \langle x'(t), y'(t)\rangle\) — velocity</li>
<li>\(\vec{r}\,''(t) = \vec{a}(t)\) — acceleration</li>
<li>\(|\vec{v}(t)| = \sqrt{x'(t)^2 + y'(t)^2}\) — <strong>speed</strong> (a scalar!)</li>
</ul>` },
      { type: "example",
        prompt: R`<p>For \(\vec{r}(t) = \langle t^2,\ \ln t\rangle\), find \(\vec{v}(t)\) and evaluate at \(t = 1\).</p>`,
        solution: R`<p>Differentiate each component: \(\vec{v}(t) = \langle 2t,\ \frac{1}{t}\rangle\).</p>
<p>At \(t=1\): \(\vec{v}(1) = \langle 2,\ 1\rangle\), with speed \(\sqrt{4+1} = \sqrt{5}\).</p>` },
      { type: "quiz",
        question: R`If \(\vec{r}(t) = \langle \cos t,\ t^2 \rangle\), then \(\vec{r}\,'(t) =\)`,
        options: [ R`\(\langle \sin t,\ 2t\rangle\)`, R`\(\langle -\sin t,\ 2t\rangle\)`, R`\(\langle -\sin t,\ t^3/3\rangle\)`, R`\(\langle \cos t,\ 2\rangle\)` ],
        correct: 1,
        explanation: R`Differentiate componentwise: \(\frac{d}{dt}\cos t = -\sin t\) and \(\frac{d}{dt}t^2 = 2t\).` },
      { type: "quiz",
        question: R`A particle has velocity \(\vec{v} = \langle 3, -4 \rangle\) at some instant. Its speed is:`,
        options: [ R`\(-1\)`, R`\(7\)`, R`\(5\)`, R`\(\sqrt{7}\)` ],
        correct: 2,
        explanation: R`Speed is the magnitude: \(\sqrt{3^2 + (-4)^2} = \sqrt{25} = 5\). Speed is never negative.` },
      { type: "numeric",
        prompt: R`<p>For \(\vec{r}(t) = \langle t^3,\ 6t \rangle\), find the <strong>speed</strong> at \(t = 1\). (3 decimals.)</p>`,
        answer: 6.708, tolerance: 0.01,
        solution: R`\(\vec{v} = \langle 3t^2, 6\rangle\); at \(t=1\): \(\sqrt{9 + 36} = \sqrt{45} \approx 6.708\).` }
    ]
  },

  // ===== 9.5 Integrating Vector-Valued Functions =====
  {
    id: "t9-5",
    title: "Integrating Vector Functions",
    badge: "Topic 9.5",
    sections: [
      { type: "text", content: R`
<h3>Componentwise, With a Vector Constant</h3>
<p>Integration also works component-by-component. The constant of integration is a <strong>vector</strong> \(\vec{C}\), pinned down by an initial condition — usually an initial position.</p>` },
      { type: "formula", title: "Recovering Position from Velocity", latex: R`\vec{r}(t) = \vec{r}(t_0) + \int_{t_0}^{t} \vec{v}(u)\,du` },
      { type: "example",
        prompt: R`<p>A particle has \(\vec{v}(t) = \langle 2t,\ 3t^2\rangle\) and starts at \(\vec{r}(0) = \langle 1,\ 2\rangle\). Find \(\vec{r}(t)\).</p>`,
        solution: R`<p>Integrate each component: \(\vec{r}(t) = \langle t^2 + C_1,\ t^3 + C_2\rangle\).</p>
<p>Apply \(\vec{r}(0) = \langle 1, 2\rangle\): \(C_1 = 1\), \(C_2 = 2\). So \(\vec{r}(t) = \langle t^2 + 1,\ t^3 + 2\rangle\).</p>` },
      { type: "quiz",
        question: R`\(\displaystyle\int_0^{\pi} \langle \cos t,\ 1 \rangle\,dt =\)`,
        options: [ R`\(\langle 0,\ \pi\rangle\)`, R`\(\langle 1,\ \pi\rangle\)`, R`\(\langle 0,\ 1\rangle\)`, R`\(\langle 2,\ \pi\rangle\)` ],
        correct: 0,
        explanation: R`First component: \(\sin\pi - \sin 0 = 0\). Second: \(\pi - 0 = \pi\).` },
      { type: "quiz",
        question: R`To find a particle's position at \(t = 5\) given \(\vec{v}(t)\) and \(\vec{r}(0)\), compute:`,
        options: [ R`\(\vec{v}(5) \cdot 5\)`, R`\(\vec{r}(0) + \int_0^5 \vec{v}(t)\,dt\)`, R`\(\int_0^5 |\vec{v}(t)|\,dt\)`, R`\(\vec{v}\,'(5)\)` ],
        correct: 1,
        explanation: R`Position = initial position + accumulated displacement. (Choice C — integrating speed — gives total <em>distance</em>, not position.)` },
      { type: "numeric",
        prompt: R`<p>Using the worked example (\(\vec{r}(t) = \langle t^2+1,\ t^3+2\rangle\)), find the <strong>x-coordinate</strong> of the particle at \(t = 2\).</p>`,
        answer: 5, tolerance: 0.001,
        solution: R`\(x(2) = 2^2 + 1 = 5\).` }
    ]
  },

  // ===== 9.6 Motion Problems =====
  {
    id: "t9-6",
    title: "Planar Motion Problems",
    badge: "Topic 9.6",
    sections: [
      { type: "text", content: R`
<h3>The Full Motion Toolkit</h3>
<p>Every planar motion question is a combination of these conversions:</p>
<ul>
<li><strong>Velocity → position:</strong> integrate components (+ initial condition)</li>
<li><strong>Position → velocity → acceleration:</strong> differentiate components</li>
<li><strong>Speed:</strong> \(|\vec{v}(t)| = \sqrt{x'(t)^2 + y'(t)^2}\)</li>
<li><strong>Total distance traveled</strong> on \([a,b]\): \(\int_a^b |\vec{v}(t)|\,dt\) — the arc length of the path</li>
<li><strong>Displacement:</strong> \(\int_a^b \vec{v}(t)\,dt\) — a vector; usually shorter than the distance</li>
</ul>` },
      { type: "example",
        prompt: R`<p>A particle moves with \(\vec{v}(t) = \langle 2t,\ 3t^2 \rangle\). Find its displacement and its total distance traveled from \(t=0\) to \(t=1\). (Set up the distance integral; evaluate the displacement exactly.)</p>`,
        solution: R`<p><strong>Displacement:</strong> \(\int_0^1 \langle 2t, 3t^2\rangle dt = \langle 1,\ 1\rangle\) — the particle ends 1 right and 1 up from its start.</p>
<p><strong>Distance:</strong> \(\int_0^1 \sqrt{4t^2 + 9t^4}\,dt = \int_0^1 t\sqrt{4+9t^2}\,dt = \left[\frac{1}{27}(4+9t^2)^{3/2}\right]_0^1 = \frac{13^{3/2}-8}{27} \approx 1.440\) — longer than \(|\langle 1,1\rangle| = \sqrt{2} \approx 1.414\), since the path curves.</p>` },
      { type: "quiz",
        question: R`A particle is <strong>at rest</strong> at time \(t\) when:`,
        options: [ R`\(x'(t) = 0\) or \(y'(t) = 0\)`, R`\(x'(t) = 0\) and \(y'(t) = 0\)`, R`\(\vec{a}(t) = \vec{0}\)`, R`Its position is \(\langle 0, 0\rangle\)` ],
        correct: 1,
        explanation: R`Rest means zero velocity vector — BOTH components must vanish simultaneously. One component being zero just means motion is purely vertical or horizontal at that instant.` },
      { type: "quiz",
        question: R`Total distance traveled from \(t=a\) to \(t=b\) equals:`,
        options: [ R`\(\left|\int_a^b \vec{v}(t)\,dt\right|\)`, R`\(\int_a^b |\vec{v}(t)|\,dt\)`, R`\(|\vec{r}(b) - \vec{r}(a)|\)`, R`\(\int_a^b \vec{a}(t)\,dt\)` ],
        correct: 1,
        explanation: R`Integrate the <em>speed</em>. Choices A and C both give the magnitude of displacement — the straight-line separation, which ignores the path's wiggles.` },
      { type: "numeric",
        prompt: R`<p>A particle has \(\vec{v}(t) = \langle 3,\ 4t \rangle\). How far does it move in the <strong>x-direction</strong> from \(t = 0\) to \(t = 2\)?</p>`,
        answer: 6, tolerance: 0.001,
        solution: R`\(\Delta x = \int_0^2 3\,dt = 6\).` }
    ]
  },

  // ===== 9.7 Polar Coordinates =====
  {
    id: "t9-7",
    title: "Polar Coordinates & Derivatives",
    badge: "Topic 9.7",
    sections: [
      { type: "text", content: R`
<h3>Distance and Angle Instead of x and y</h3>
<p>A polar point \((r, \theta)\) sits at distance \(r\) from the origin, at angle \(\theta\) from the positive x-axis. The conversion dictionary:</p>` },
      { type: "formula", title: "Polar ↔ Rectangular", latex: R`x = r\cos\theta \qquad y = r\sin\theta \qquad r^2 = x^2 + y^2 \qquad \tan\theta = \frac{y}{x}` },
      { type: "text", content: R`
<p>A polar curve \(r = f(\theta)\) is secretly parametric with parameter \(\theta\): \(x = f(\theta)\cos\theta\), \(y = f(\theta)\sin\theta\). So its slope is the parametric derivative:</p>
<p style="text-align:center">\(\dfrac{dy}{dx} = \dfrac{dy/d\theta}{dx/d\theta}\)</p>
<p>— differentiate \(y = r\sin\theta\) and \(x = r\cos\theta\) with the product rule (both \(r\) and the trig depend on \(\theta\)).</p>` },
      { type: "example",
        prompt: R`<p>Convert the polar point \(\left(2, \frac{\pi}{3}\right)\) to rectangular coordinates.</p>`,
        solution: R`<p>\(x = 2\cos\frac{\pi}{3} = 2 \cdot \frac{1}{2} = 1\)</p>
<p>\(y = 2\sin\frac{\pi}{3} = 2 \cdot \frac{\sqrt{3}}{2} = \sqrt{3}\)</p>
<p>Rectangular: \((1, \sqrt{3})\).</p>` },
      { type: "quiz",
        question: R`The polar curve \(r = 4\sin\theta\) is, in rectangular form:`,
        options: [ R`A line through the origin`, R`The circle \(x^2 + (y-2)^2 = 4\)`, R`The circle \((x-2)^2 + y^2 = 4\)`, R`A parabola` ],
        correct: 1,
        explanation: R`Multiply both sides by \(r\): \(r^2 = 4r\sin\theta \Rightarrow x^2 + y^2 = 4y \Rightarrow x^2 + (y-2)^2 = 4\) — a circle of radius 2 centered at \((0,2)\).` },
      { type: "quiz",
        question: R`For a polar curve \(r = f(\theta)\), the slope \(\frac{dy}{dx}\) equals:`,
        options: [ R`\(\dfrac{dr}{d\theta}\)`, R`\(\dfrac{dy/d\theta}{dx/d\theta}\) with \(x = r\cos\theta,\ y = r\sin\theta\)`, R`\(f'(\theta)\)`, R`\(\dfrac{r\,d\theta}{dr}\)` ],
        correct: 1,
        explanation: R`Treat the polar curve as parametric in \(\theta\). Note \(\frac{dr}{d\theta}\) alone is NOT the slope — it's how fast the radius grows, not the tangent direction.` },
      { type: "numeric",
        prompt: R`<p>For the spiral \(r = \theta\), find the <strong>y-coordinate</strong> of the point at \(\theta = \frac{\pi}{2}\). (3 decimals.)</p>`,
        answer: 1.571, tolerance: 0.01,
        solution: R`\(y = r\sin\theta = \frac{\pi}{2}\sin\frac{\pi}{2} = \frac{\pi}{2} \approx 1.571\).` }
    ]
  },

  // ===== 9.8 Polar Area =====
  {
    id: "t9-8",
    title: "Area of a Polar Region",
    badge: "Topic 9.8",
    sections: [
      { type: "text", content: R`
<h3>Sweeping Out Pie Slices</h3>
<p>Rectangular area uses thin rectangles; polar area uses thin <strong>circular sectors</strong>. A sector with angle \(d\theta\) and radius \(r\) has area \(\frac{1}{2}r^2\,d\theta\), so:</p>` },
      { type: "formula", title: "Polar Area", latex: R`A = \frac{1}{2}\int_{\alpha}^{\beta} r^2\,d\theta` },
      { type: "text", content: R`
<div class="warning-box"><strong>The hard part is the limits.</strong> Find where the curve starts and finishes tracing the region — often where \(r = 0\). The circle \(r = 2\cos\theta\), for instance, is traced completely on \(-\frac{\pi}{2} \le \theta \le \frac{\pi}{2}\); integrating to \(2\pi\) would count it twice.</div>` },
      { type: "example",
        prompt: R`<p>Find the area enclosed by the circle \(r = 2\cos\theta\).</p>`,
        solution: R`<p>The full circle is traced for \(-\frac{\pi}{2} \le \theta \le \frac{\pi}{2}\).</p>
<p>\(A = \frac{1}{2}\displaystyle\int_{-\pi/2}^{\pi/2} 4\cos^2\theta\,d\theta = \int_{-\pi/2}^{\pi/2} (1 + \cos 2\theta)\,d\theta = \pi\)</p>
<p>Sanity check: this is a circle of radius 1, so area \(\pi\) ✓</p>` },
      { type: "quiz",
        question: R`The area swept by \(r = f(\theta)\) from \(\theta = \alpha\) to \(\beta\) is:`,
        options: [ R`\(\int_\alpha^\beta r\,d\theta\)`, R`\(\frac{1}{2}\int_\alpha^\beta r^2\,d\theta\)`, R`\(\int_\alpha^\beta r^2\,d\theta\)`, R`\(\frac{1}{2}\int_\alpha^\beta r\,d\theta\)` ],
        correct: 1,
        explanation: R`Each infinitesimal pie slice contributes \(\frac{1}{2}r^2 d\theta\) — from the sector-area formula \(\frac{1}{2}r^2\Delta\theta\).` },
      { type: "quiz",
        question: R`To find the area of ONE petal of the rose \(r = \sin(2\theta)\), you should integrate over:`,
        options: [ R`\(0 \le \theta \le 2\pi\)`, R`\(0 \le \theta \le \pi\)`, R`\(0 \le \theta \le \frac{\pi}{2}\)`, R`\(0 \le \theta \le \frac{\pi}{4}\)` ],
        correct: 2,
        explanation: R`A petal runs between consecutive zeros of \(r\): \(\sin 2\theta = 0\) at \(\theta = 0\) and \(\theta = \frac{\pi}{2}\). That full half-quadrant sweep traces one complete petal.` },
      { type: "numeric",
        prompt: R`<p>Using the polar area formula with \(r = 3\) constant over \(0 \le \theta \le 2\pi\), compute the area. (3 decimals.)</p>`,
        answer: 28.274, tolerance: 0.05,
        solution: R`\(\frac{1}{2}\int_0^{2\pi} 9\,d\theta = 9\pi \approx 28.274\) — the familiar \(\pi r^2\) for a circle of radius 3.` }
    ]
  },

  // ===== 9.9 Area Between Polar Curves =====
  {
    id: "t9-9",
    title: "Area Between Two Polar Curves",
    badge: "Topic 9.9",
    sections: [
      { type: "text", content: R`
<h3>Outer Minus Inner — Squared</h3>
<p>For a region between an outer curve \(R(\theta)\) and an inner curve \(r(\theta)\), subtract the sector areas:</p>` },
      { type: "formula", title: "Area Between Polar Curves", latex: R`A = \frac{1}{2}\int_{\alpha}^{\beta}\left(R^2 - r^2\right)d\theta` },
      { type: "text", content: R`
<div class="warning-box"><strong>Trap:</strong> it's \(R^2 - r^2\), <em>never</em> \((R - r)^2\). And before anything else, <strong>find the intersection angles</strong> by setting the curves equal — they're usually your limits of integration.</div>` },
      { type: "example",
        prompt: R`<p>Find the area inside the circle \(r = 2\) and outside the circle \(r = 1\).</p>`,
        solution: R`<p>The region is a full annulus, so \(\theta\) runs \(0\) to \(2\pi\) with \(R = 2\), \(r = 1\):</p>
<p>\(A = \frac{1}{2}\displaystyle\int_0^{2\pi}(4 - 1)\,d\theta = \frac{3}{2}(2\pi) = 3\pi \approx 9.425\)</p>
<p>Check: \(\pi(2)^2 - \pi(1)^2 = 3\pi\) ✓</p>` },
      { type: "quiz",
        question: R`The area between outer curve \(R(\theta)\) and inner curve \(r(\theta)\) on \([\alpha, \beta]\) is:`,
        options: [ R`\(\frac{1}{2}\int_\alpha^\beta (R - r)^2\,d\theta\)`, R`\(\frac{1}{2}\int_\alpha^\beta (R^2 - r^2)\,d\theta\)`, R`\(\int_\alpha^\beta (R - r)\,d\theta\)`, R`\(\frac{1}{2}\int_\alpha^\beta (R^2 + r^2)\,d\theta\)` ],
        correct: 1,
        explanation: R`Subtract the two sector-area integrals: \(\frac{1}{2}\int R^2 - \frac{1}{2}\int r^2\). Expanding \((R-r)^2\) would introduce a bogus cross-term.` },
      { type: "quiz",
        question: R`Before integrating the area shared by \(r = 1 + \cos\theta\) and \(r = 3\cos\theta\), your FIRST step should be:`,
        options: [ R`Convert both to rectangular form`, R`Differentiate both curves`, R`Set them equal to find intersection angles`, R`Square both curves` ],
        correct: 2,
        explanation: R`\(1 + \cos\theta = 3\cos\theta \Rightarrow \cos\theta = \frac{1}{2} \Rightarrow \theta = \pm\frac{\pi}{3}\). Intersections define where the "outer" curve switches — and they're your integration limits.` },
      { type: "numeric",
        prompt: R`<p>Compute the area inside \(r = 2\) and outside \(r = 1\) (from the worked example). (3 decimals.)</p>`,
        answer: 9.425, tolerance: 0.02,
        solution: R`\(3\pi \approx 9.425\).` }
    ]
  }
];
