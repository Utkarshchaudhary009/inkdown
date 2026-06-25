## 2025-02-28 - XSS in Markdown Renderer
**Vulnerability:** Found an XSS vulnerability in the Markdown renderer where a user could use a `javascript:` or `data:` URI in a Markdown link (e.g., `[click me](javascript:alert(1))`).
**Learning:** The default `<Streamdown>` component maps `a` tags without sanitizing the `href` attribute, thus passing through potentially dangerous URIs unchanged.
**Prevention:** Override the `a` tag component renderer to intercept and sanitize `href` attributes, specifically rejecting `javascript:`, `vbscript:`, and `data:` schemes.
