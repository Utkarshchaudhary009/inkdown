## 2024-05-15 - [XSS via Markdown Links]
**Vulnerability:** Markdown links and images allowed dangerous protocols (e.g. `javascript:`, `vbscript:`, `data:` in anchor tags) because the `MarkdownRenderer` component blindly passed user-supplied `href` and `src` attributes straight into React elements.
**Learning:** Even when using markdown parsers, custom node renderers need explicit protocol sanitization for URLs, especially in reader applications handling third-party repository data.
**Prevention:** Always wrap dynamic `href` and `src` props with a URL sanitizer that defaults to a safe string like `#` if the parsed protocol is in a disallowed list. Allow `data:` URIs conditionally (e.g., only for images).
