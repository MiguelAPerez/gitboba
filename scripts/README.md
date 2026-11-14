# scripts/

Two languages, one convention.

| Language | Used for | Tests |
|---|---|---|
| **Node** (no dependencies) | Logic that runs in GitHub Actions, e.g. `awaiting-author.js` | `*.test.js` with `node:test` |
| **Python 3** (stdlib; Pillow only for image output) | Local tooling: dev server, screenshots, Lighthouse summary | `test_*.py` with `unittest` |
| **Bash** | Glue only: call tools, check prerequisites, no logic | none |

## Convention

- **Pure logic, thin shell.** Put decisions and calculations in plain functions that take data and return data. `main()` (or the workflow) does the I/O and calls them. Test the functions.
- **Tests sit beside the script**: `foo.py` → `test_foo.py`, `foo.js` → `foo.test.js`.
- **Python files use `snake_case`** so tests can import them.
- **Import heavy or optional dependencies inside `main()`** (e.g. Pillow), so tests run on a clean machine.
- **Shared Python helpers** live in `lib/` (`lib.repo` has `ROOT` and `app_repo()`).
- **No `|| true` in glue scripts.** If a step fails, the script should fail.

## Running the tests

```bash
scripts/test.sh
```

That runs `node --test 'scripts/**/*.test.js'` and `python3 -m unittest discover -s scripts -p 'test_*.py'`. CI (`.github/workflows/test.yml`) runs the same script. New test files are picked up automatically.

## Scripts

| Script | What it does |
|---|---|
| `awaiting-author.js` | Decision rules for the daily awaiting-author auto-close workflow. |
| `dev_server.py` | Local server with GitHub Pages-style extensionless URLs. |
| `lighthouse-mobile.sh` | Mobile Lighthouse run against the dev server; prints scores via `lighthouse_summary.py`. |
| `refresh-site-screenshots.sh` | Rebuilds site screenshots and the OG image (needs the GitBobaApp repo and Pillow). |
| `compose_site_screenshots.py` | Phone mockups from raw app screenshots. |
| `generate_og_share.py` | `images/og-share.png` from the composed home screenshot. |
