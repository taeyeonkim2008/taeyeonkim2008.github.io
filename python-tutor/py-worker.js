// Runs Python in a background thread so user code — including infinite
// loops — can never freeze the page. The main thread enforces a watchdog
// timeout and terminates/respawns this worker if a run takes too long.

importScripts("https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js");

const ready = loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/" })
  .then(py => {
    self.pyodide = py;
    self.postMessage({ type: "ready" });
    return py;
  });

self.onmessage = async (e) => {
  const { id, code, stdin, isolate } = e.data;
  const py = await ready;
  try {
    py.globals.set("__code", code);
    py.globals.set("__stdin_json", JSON.stringify(stdin ?? null));
    py.globals.set("__isolate", !!isolate);
    py.runPython(`
import sys, io, json, traceback
__out = io.StringIO()
__old_stdout = sys.stdout
sys.stdout = __out
__stdin = json.loads(__stdin_json)
def __input(prompt=""):
    if __stdin is None:
        raise RuntimeError("input() isn't supported in this editor — assign the value to a variable instead")
    try:
        return __stdin.pop(0)
    except IndexError:
        return ""
__err = None
__res = None
try:
    if __isolate:
        __ns = {"input": __input}
        exec(__code, __ns)
        __res = __ns.get("__result")
    else:
        globals()["input"] = __input
        exec(__code, globals())
        __res = globals().get("__result")
except BaseException as __e:
    __lines = traceback.format_exception(type(__e), __e, __e.__traceback__)
    __err = "".join(
        l for l in __lines
        if "<exec>" not in l and "pyodide" not in l and "_pyodide" not in l
    ).strip()
finally:
    sys.stdout = __old_stdout
__captured = __out.getvalue()
`);
    const output = String(py.globals.get("__captured") ?? "");
    const errVal = py.globals.get("__err");
    const resVal = py.globals.get("__res");
    self.postMessage({
      id,
      type: "done",
      output,
      error: errVal == null ? null : String(errVal),
      result: resVal == null ? null : String(resVal)
    });
  } catch (err) {
    self.postMessage({ id, type: "done", output: "", error: err.message || String(err), result: null });
  }
};
