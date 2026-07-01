## 2024-05-18 - Extract Streamdown components to stabilize identity
**Learning:** In Virtuoso+Streamdown list rendering, defining the `components` map inline inside the render function causes massive DOM remount overhead because component identities constantly change on scroll.
**Action:** Always define component mappings (like custom renderers) outside the render function to maintain stable component identities and avoid massive DOM remount overhead.
