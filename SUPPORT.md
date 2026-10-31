# Support & issues

Thanks for taking the time to report a bug or suggest an improvement. This page describes how we triage issues in the GitBoba tracker.

## What happens after you open an issue

1. **Within 72 hours** — we aim to assign someone to look at your report.
2. **Labels** — we add status labels so you can see where things stand without asking for an update.
3. **Comments** — we reply when we need more info, when we have a fix in progress, or when something ships.

Labels reflect **status**, not a guaranteed release date. App Store review can delay when a fix reaches everyone; see the note at the top of [README](README.md).

## Status labels

| Label | Meaning |
|--------|---------|
| **investigating** | We're looking into the report and will follow up soon. |
| **in-progress** | We're actively working on a fix. |
| **upcoming-release** | The fix is in a build that will go out in the next release (may still be in App Review). |
| **v2** | Tracked for **Full Gitea Support** and paid **Supporter** features — not necessarily the next bugfix release. |
| **awaiting-author** | A fix may be ready for you to try. **No reply in about 4 days** — we assume the problem is fixed and close the issue. |

## When we think something is fixed

We may comment when a fix is in a build or on the store and invite you to try it when you can. A quick “still broken” or “works, thanks” is helpful, but **no reply after a few days means we treat it as resolved** and close the issue. If the bug comes back later, comment on the closed thread (we can reopen) or open a new report.

## Area labels

| Label | Meaning |
|--------|---------|
| **markdown** | Markdown rendering — formatting, code blocks, Mermaid, tables, links, previews. [Open a Markdown rendering report →](https://github.com/MiguelAPerez/gitboba/issues/new?template=markdown_rendering.yml) · [All open Markdown issues →](https://github.com/MiguelAPerez/gitboba/issues?q=is%3Aopen+is%3Aissue+label%3Amarkdown) |

We add **markdown** to feature requests and bugs when the topic is Markdown, not only reports filed through the dedicated template.

## What to include in a good report

- GitBoba version (Settings → About)
- iOS / iPadOS version and device
- Gitea or Forgejo version (or **Demo mode**)
- Steps to reproduce, expected vs actual behavior
- Screenshots or screen recordings if they help

## Which template to use

| Template | Use for |
|----------|---------|
| [**Markdown rendering**](https://github.com/MiguelAPerez/gitboba/issues/new?template=markdown_rendering.yml) | Something renders wrong or not at all (including Mermaid). Includes fields for source snippet and where it appears. |
| [**Bug report**](https://github.com/MiguelAPerez/gitboba/issues/new?template=bug_report.yml) | Crashes, broken navigation, sync, Actions, and other non-Markdown bugs. |
| [**Feature request**](https://github.com/MiguelAPerez/gitboba/issues/new?template=feature_request.yml) | New capability or improvement (we add **markdown** if it is Markdown-related). |

Choose **Issues → New issue** on GitHub to see the full list (translation, new language, etc.).

## Email vs issues

- **Issues** — bugs, feature requests, and anything you're comfortable discussing in public.
- **[contact@miguelaperez.dev](mailto:contact@miguelaperez.dev)** — sensitive topics (security, private server details you don't want in the tracker), or if you can't use the issue tracker.
