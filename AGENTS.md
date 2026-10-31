<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules

- All ATS analysis and resume rewriting runs client-side in `src/utils/atsAlgorithm.ts` (pure functions, unit-tested) — the product promises no login, no backend and no paid APIs.
- Exports live in `src/utils/exportHelpers.ts`; DOCX uses the `docx` library loaded via dynamic import so Word gets a real Office Open XML file without bloating the initial bundle.
- PDF export uses `window.print()`; every non-resume section carries `print:hidden` so only the A4 sheet prints — keep that on any new section.
- Drafts persist only in `localStorage` (read in `useEffect` to avoid hydration mismatch).
