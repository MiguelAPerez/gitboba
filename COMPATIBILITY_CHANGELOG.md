# API Compatibility Changelog

Tracks changes to `api-compatibility-data.json` shown on the
[API Compatibility](https://gitboba.app/docs#api-compatibility) docs page.

New entries are prepended automatically by
`python3 scripts/build-api-compatibility.py` in GitBobaApp whenever the
generated matrix differs from the file already on disk.

---

## 2026-07-30 · GitBoba 1.13.0

**Summary:** 83 → 90 ops supported; 10 of 14 areas fully supported.

### Now supported

- **Search** / Users — was planned

### New on this page

- **User & Profile** / View User
- **User & Profile** / Followers
- **User & Profile** / Following
- **User & Profile** / Follow / Unfollow
- **Actions / CI** / Secrets
- **Actions / CI** / Variables

## 2026-07-28 · GitBoba 1.12.1

**Summary:** 73 → 83 ops supported; 8 → 10 of 14 areas fully supported.

### Now supported

- **Repositories** / Create — was planned
- **Releases** / Download — was planned

### New on this page

- **Repositories** / Delete
- **Repositories** / Branch Create
- **Repositories** / Branch Rename
- **Repositories** / Branch Delete
- **Actions / CI** / Dispatch
- **Releases** / Delete
- **Releases** / Asset Upload
- **Webhooks** / Test

### Group status

- **Repositories:** partial → supported
- **Releases:** partial → supported

## 2026-07-05 · GitBoba 1.9.1

**Summary:** 40 → 73 ops supported; 5 → 8 of 12 areas fully supported.

### Now supported

- **Issues** / Create — was planned
- **Issues** / Edit — was planned
- **Stars & Watching** / Starred List — was planned

### New on this page

- **Repositories** / File Create
- **Repositories** / File Edit
- **Repositories** / File Delete
- **Repositories** / Tags
- **Repositories** / Collaborators
- **Repositories** / Branch Protections
- **Repositories** / Settings
- **Pull Requests** / Dismiss Review
- **Pull Requests** / Resolve Comments
- **Pull Requests** / Multi-comment Review
- **Pull Requests** / Update Branch
- **Pull Requests** / Cancel Auto-merge
- **Pull Requests** / Draft
- **Pull Requests** / Subscribe
- **Issues** / Milestones
- **Issues** / Assignees
- **Issues** / Attachments
- **Issues** / Reactions
- **Issues** / Subscribe
- **Issues** / Pin
- **Issues** / Transfer
- **Issues** / Lock
- **Comments** / Edit
- **Comments** / Delete
- **Notifications** / Mark Unread
- **Notifications** / Filter
- **Stars & Watching** / Watched List
- **Packages** / List
- **Packages** / View
- **Packages** / Delete

### New on this page (planned)

- **Repositories** / Create

### Group status

- **Issues:** partial → supported
- **Stars & Watching:** partial → supported

## 2026-06-14

**Summary:** Initial matrix — 40 ops supported, 5 of 12 areas complete.

### New on this page

- **Repositories** / List
- **Repositories** / View
- **Repositories** / Branches
- **Repositories** / Commits
- **Repositories** / File Tree
- **Repositories** / Fork
- **Pull Requests** / List
- **Pull Requests** / View
- **Pull Requests** / Files Changed
- **Pull Requests** / Create
- **Pull Requests** / Merge
- **Pull Requests** / Close
- **Pull Requests** / Review
- **Issues** / List
- **Issues** / View
- **Issues** / Comment
- **Issues** / Labels
- **Notifications** / List
- **Notifications** / Mark Read
- **Notifications** / Unsubscribe
- **Actions / CI** / Workflow Runs
- **Actions / CI** / Job Logs
- **Actions / CI** / Re-run
- **Actions / CI** / Cancel
- **Organizations** / List
- **Organizations** / Repos
- **User & Profile** / Profile
- **User & Profile** / Repos
- **User & Profile** / Activity
- **Stars & Watching** / Star / Unstar
- **Stars & Watching** / Watch / Unwatch
- **Search** / Issues
- **Releases** / List
- **Releases** / Create
- **Releases** / Edit
- **Webhooks** / List
- **Webhooks** / Create
- **Webhooks** / Edit
- **Webhooks** / Delete
- **Admin** / Runners

### New on this page (planned)

- **Issues** / Create
- **Issues** / Edit
- **Organizations** / Members
- **Organizations** / Manage
- **Search** / Repos
- **Search** / Users
- **Search** / Code
- **Releases** / Download
- **Admin** / Users
- **Admin** / Orgs
