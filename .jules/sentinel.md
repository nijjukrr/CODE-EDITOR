## 2026-03-30 - Fix Command Injection in Code Execution Endpoint
**Vulnerability:** User code execution via `child_process.exec` in `server.js` was vulnerable to command injection and process hanging (DoS).
**Learning:** Shell-interpolated `exec` allows command chaining or shell metacharacters in code execution parameters.
**Prevention:** Always use `child_process.execFile` without shell invocation for executing scripts or binaries with parameters, use `os.tmpdir()` for temporary scripts, and set explicit execution timeouts (`timeout: 5000`).

## 2026-03-31 - Isolate HTML Preview Iframe to Prevent Same-Origin XSS
**Vulnerability:** Live preview of user-submitted HTML/JS via `<iframe srcDoc={...}>` lacked a `sandbox` attribute, executing untrusted scripts in the same origin context as the main editor application.
**Learning:** `srcDoc` without `sandbox` inherits the host window's origin, allowing untrusted code inside the iframe to access `window.parent`, localStorage, cookies, or hijack Socket.IO sessions.
**Prevention:** Always attach `sandbox="allow-scripts"` (without `allow-same-origin`) to preview `<iframe>` tags rendering untrusted code, forcing the iframe into a unique origin.
