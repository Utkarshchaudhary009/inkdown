
## $(date +%Y-%m-%d) - Cached Intl.DateTimeFormat
**Learning:** `Intl.DateTimeFormat` instantiation is notoriously slow in V8/JavaScript. Instantiating it inside a component rendered in a list (like `RepoCard`) causes an unnecessary performance bottleneck (up to 200x slower per format).
**Action:** Always instantiate `Intl` objects outside the render cycle or module scope when formatting dates/numbers in repetitive functions or list components.
