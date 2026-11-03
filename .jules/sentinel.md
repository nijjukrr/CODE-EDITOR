## 2026-03-30 - Fix Command Injection in Code Execution Endpoint
**Vulnerability:** User code execution via `child_process.exec` in `server.js` was vulnerable to command injection and process hanging (DoS).
**Learning:** Shell-interpolated `exec` allows command chaining or shell metacharacters in code execution parameters.
**Prevention:** Always use `child_process.execFile` without shell invocation for executing scripts or binaries with parameters, use `os.tmpdir()` for temporary scripts, and set explicit execution timeouts (`timeout: 5000`).

## 2026-11-03 - Sandbox HTML Live Preview to Prevent Parent Origin Compromise
**Vulnerability:** The HTML output preview rendered untrusted collaborative user code inside an unsandboxed `iframe` with `srcDoc`.
**Learning:** `iframe` elements using `srcDoc` without a `sandbox` attribute inherit the parent window's origin, allowing untrusted collaborative scripts to access `parent.localStorage` (credentials/session tokens), read/write DOM, and perform arbitrary cross-site actions in the context of the authenticated user.
**Prevention:** Always include `sandbox="allow-scripts"` on untrusted client preview frames and avoid combining it with `allow-same-origin` or `allow-top-navigation`.
