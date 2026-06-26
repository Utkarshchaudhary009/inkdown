## 2025-02-17 - Prevent XSS in Markdown Links
**Vulnerability:** The MarkdownRenderer rendered `a` tags without sanitizing the `href` attribute, allowing unsafe protocols like `javascript:` to execute arbitrary code when clicked.
**Learning:** The unified/remark-parse processing doesn't automatically sanitize URLs in links.
**Prevention:** Implement a URL protocol validation function (`isSafeUrl`) and enforce it on all user-supplied or external markdown content during the custom component rendering phase.
