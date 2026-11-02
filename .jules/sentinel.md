## 2026-03-30 - Fix Command Injection in Code Execution Endpoint
**Vulnerability:** User code execution via `child_process.exec` in `server.js` was vulnerable to command injection and process hanging (DoS).
**Learning:** Shell-interpolated `exec` allows command chaining or shell metacharacters in code execution parameters.
**Prevention:** Always use `child_process.execFile` without shell invocation for executing scripts or binaries with parameters, use `os.tmpdir()` for temporary scripts, and set explicit execution timeouts (`timeout: 5000`).

## 2026-03-30 - Sandbox HTML/JS Code Execution Preview Iframe
**Vulnerability:** In collaborative code editors rendering user HTML (`srcDoc={codeRef.current}`), an unsandboxed `iframe` runs arbitrary JavaScript within the same origin as the application, allowing access to `window.parent`, localStorage credentials, and DOM-based attacks against collaborating users.
**Learning:** `srcDoc` iframes inherit the parent page's origin by default unless explicitly restricted using the `sandbox` attribute. Adding `sandbox="allow-scripts"` (without `allow-same-origin`) allows script execution within an isolated opaque origin, completely cutting off access to the parent application's storage, session, and DOM.
**Prevention:** Always add restrictive `sandbox` attributes (e.g. `sandbox="allow-scripts"`) on iframes evaluating user-controlled HTML / JS, and never combine `allow-scripts` with `allow-same-origin` unless the content is completely trusted.
