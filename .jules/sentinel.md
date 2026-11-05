## 2026-03-30 - Fix Command Injection in Code Execution Endpoint
**Vulnerability:** User code execution via `child_process.exec` in `server.js` was vulnerable to command injection and process hanging (DoS).
**Learning:** Shell-interpolated `exec` allows command chaining or shell metacharacters in code execution parameters.
**Prevention:** Always use `child_process.execFile` without shell invocation for executing scripts or binaries with parameters, use `os.tmpdir()` for temporary scripts, and set explicit execution timeouts (`timeout: 5000`).

## 2026-04-01 - Sandbox Collaborative HTML Preview Iframe Against XSS
**Vulnerability:** The HTML preview in `EditorPage.js` rendered user code inside an unsandboxed `iframe` via `srcDoc`. In a collaborative real-time editor, peers or attackers could execute scripts that inherit parent window origin and access `window.parent`, parent DOM, cookies, and `localStorage`.
**Learning:** `srcDoc` iframes without a `sandbox` attribute inherit the parent application's origin, making them vulnerable to DOM-based XSS and session hijacking.
**Prevention:** Always sandbox untrusted HTML preview iframes with `sandbox="allow-scripts"` (omitting `allow-same-origin`) to restrict script execution to an isolated, opaque origin.
