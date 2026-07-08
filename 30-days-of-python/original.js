// ===== "Read the original" companion reader =====
// Loads Asabeneh Yetayeh's original 30 Days of Python text for the current
// day, live from his GitHub repository (via the jsDelivr CDN), and renders
// it inside the app. Nothing is copied into or stored on this site — the
// content is fetched from his repo by YOUR browser each time, exactly like
// a feed reader. Full credit: https://github.com/Asabeneh/30-Days-Of-Python

(function () {
  const REPO = "Asabeneh/30-Days-Of-Python";
  const CDN_BASE = `https://cdn.jsdelivr.net/gh/${REPO}@master/`;
  const BLOB_BASE = `https://github.com/${REPO}/blob/master/`;

  // Day 1 lives in the repo's root readme; days 2-30 in their own folders.
  const ORIGINAL_PATHS = [
    "readme.md",
    "02_Day_Variables_builtin_functions/02_variables_builtin_functions.md",
    "03_Day_Operators/03_operators.md",
    "04_Day_Strings/04_strings.md",
    "05_Day_Lists/05_lists.md",
    "06_Day_Tuples/06_tuples.md",
    "07_Day_Sets/07_sets.md",
    "08_Day_Dictionaries/08_dictionaries.md",
    "09_Day_Conditionals/09_conditionals.md",
    "10_Day_Loops/10_loops.md",
    "11_Day_Functions/11_functions.md",
    "12_Day_Modules/12_modules.md",
    "13_Day_List_comprehension/13_list_comprehension.md",
    "14_Day_Higher_order_functions/14_higher_order_functions.md",
    "15_Day_Python_type_errors/15_python_type_errors.md",
    "16_Day_Python_date_time/16_python_datetime.md",
    "17_Day_Exception_handling/17_exception_handling.md",
    "18_Day_Regular_expressions/18_regular_expressions.md",
    "19_Day_File_handling/19_file_handling.md",
    "20_Day_Python_package_manager/20_python_package_manager.md",
    "21_Day_Classes_and_objects/21_classes_and_objects.md",
    "22_Day_Web_scraping/22_web_scraping.md",
    "23_Day_Virtual_environment/23_virtual_environment.md",
    "24_Day_Statistics/24_statistics.md",
    "25_Day_Pandas/25_pandas.md",
    "26_Day_Python_web/26_python_web.md",
    "27_Day_Python_with_mongodb/27_python_with_mongodb.md",
    "28_Day_API/28_API.md",
    "29_Day_Building_API/29_building_API.md",
    "30_Day_Conclusions/30_conclusions.md"
  ];

  const cache = {};

  function dirOf(path) {
    const i = path.lastIndexOf("/");
    return i === -1 ? "" : path.slice(0, i + 1);
  }

  // Resolve a relative link/image path against the md file's folder.
  function resolveRel(rel, baseDir) {
    try {
      const u = new URL(rel, "https://resolve.local/" + baseDir);
      return decodeURIComponent(u.pathname.replace(/^\//, ""));
    } catch {
      return rel;
    }
  }

  function fixUrls(container, mdPath) {
    const baseDir = dirOf(mdPath);
    container.querySelectorAll("img").forEach(img => {
      const src = img.getAttribute("src") || "";
      if (src && !/^https?:|^data:/.test(src)) {
        img.setAttribute("src", CDN_BASE + resolveRel(src, baseDir));
      }
      img.loading = "lazy";
    });
    container.querySelectorAll("a").forEach(a => {
      const href = a.getAttribute("href") || "";
      if (!href || href.startsWith("#")) return;
      if (!/^https?:|^mailto:/.test(href)) {
        a.setAttribute("href", BLOB_BASE + resolveRel(href, baseDir));
      }
      a.target = "_blank";
      a.rel = "noopener";
    });
  }

  async function loadOriginal(dayIndex, contentEl, btn) {
    const path = ORIGINAL_PATHS[dayIndex];
    if (!path) return;

    btn.disabled = true;
    btn.textContent = "Loading from Asabeneh's repo...";

    try {
      if (!cache[path]) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 15000);
        const res = await fetch(CDN_BASE + path, { signal: ctrl.signal });
        clearTimeout(timer);
        if (!res.ok) throw new Error("HTTP " + res.status);
        cache[path] = await res.text();
      }
      const html = DOMPurify.sanitize(marked.parse(cache[path]));
      contentEl.innerHTML = html;
      fixUrls(contentEl, path);
      contentEl.style.display = "";
      btn.style.display = "none";
    } catch (e) {
      btn.disabled = false;
      btn.textContent = "Couldn't load — check your internet and try again";
    }
  }

  // Called by app.js at the end of showLesson()
  window.renderOriginalPanel = function (dayIndex) {
    const body = document.getElementById("lessonBody");
    if (!body || !ORIGINAL_PATHS[dayIndex]) return;

    const panel = document.createElement("div");
    panel.className = "orig-panel";
    panel.innerHTML = `
      <div class="orig-head">
        <h3>📖 The Original Text — Day ${dayIndex + 1}</h3>
        <p>Read this day from <strong>Asabeneh Yetayeh's</strong>
        <a href="https://github.com/Asabeneh/30-Days-Of-Python" target="_blank" rel="noopener">30 Days of Python</a>,
        the course this app is inspired by — loaded live from his GitHub repository.
        If you find it valuable, go star his repo!</p>
      </div>
      <button class="orig-load-btn">Load the original Day ${dayIndex + 1} text</button>
      <div class="orig-content" style="display:none"></div>
    `;

    const btn = panel.querySelector(".orig-load-btn");
    const contentEl = panel.querySelector(".orig-content");
    btn.addEventListener("click", () => loadOriginal(dayIndex, contentEl, btn));

    body.appendChild(panel);
  };
})();
