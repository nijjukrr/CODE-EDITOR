## 2026-03-30 - Fix Command Injection in Code Execution Endpoint
**Vulnerability:** User code execution via `child_process.exec` in `server.js` was vulnerable to command injection and process hanging (DoS).
**Learning:** Shell-interpolated `exec` allows command chaining or shell metacharacters in code execution parameters.
**Prevention:** Always use `child_process.execFile` without shell invocation for executing scripts or binaries with parameters, use `os.tmpdir()` for temporary scripts, and set explicit execution timeouts (`timeout: 5000`).

## 2026-03-31 - Sandbox Isolation for In-App Code Previews
**Vulnerability:** Unsandboxed `<iframe>` rendering untrusted user HTML via `srcDoc` allowed arbitrary JavaScript execution in the same origin as the parent application, exposing DOM access, session data, and localStorage.
**Learning:** By default, `srcDoc` inherits the parent document's origin. Without restrictive iframe sandboxing, client-side code previews function as stored or reflected XSS vectors in collaborative sessions.
**Prevention:** Always enforce `sandbox="allow-scripts"` (strictly omitting `allow-same-origin`) when rendering user-generated HTML in iframes so scripts run in a restricted opaque origin without access to parent DOM, cookies, or storage.
