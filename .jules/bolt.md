## 2024-06-11 - [Avoid inline components in lists/virtualized lists]
**Learning:** Defining inline components inside list rendering (Virtuoso + Streamdown) destroys component identity, causing massive DOM remount overhead instead of updates.
**Action:** Always define component mappings or inline renderers outside of the render function or wrap them in `useMemo`, and use `React.memo` for custom renderer components to maintain stable identities and avoid unmounting/remounting DOM elements on every render.
