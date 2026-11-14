const test = require("node:test");
const assert = require("node:assert/strict");
const {
  LABEL_NAME,
  NOTICE_MARKER,
  parseGraceDays,
  releaseNotice,
  confirmedCloseComment,
  timeoutCloseComment,
  labeledAtFromTimeline,
  decide,
} = require("./awaiting-author.js");

const DAY = 24 * 60 * 60 * 1000;
const author = "reporter";
const labeledAt = Date.parse("2026-11-01T00:00:00Z");
const within = labeledAt + DAY;
const after = labeledAt + 4 * DAY;

function comment(login, body, id = 1) {
  return { id, user: { login }, body };
}

function notice(body = releaseNotice(4), id = 10) {
  return comment("github-actions[bot]", body, id);
}

function decideWith(overrides) {
  return decide({
    author,
    comments: [],
    reactions: [],
    labeledAt,
    now: within,
    graceDays: 4,
    ...overrides,
  });
}

test("parseGraceDays accepts the default and rejects invalid values", () => {
  assert.equal(parseGraceDays(undefined), 4);
  assert.equal(parseGraceDays("4"), 4);
  assert.equal(parseGraceDays("1"), 1);
  assert.equal(parseGraceDays("0"), null);
  assert.equal(parseGraceDays("-3"), null);
  assert.equal(parseGraceDays("nope"), null);
});

test("labeledAtFromTimeline uses the latest application of the label", () => {
  const timeline = [
    {
      event: "labeled",
      label: { name: LABEL_NAME },
      created_at: "2026-11-01T00:00:00Z",
    },
    {
      event: "unlabeled",
      label: { name: LABEL_NAME },
      created_at: "2026-11-02T00:00:00Z",
    },
    {
      event: "labeled",
      label: { name: "bug" },
      created_at: "2026-11-03T00:00:00Z",
    },
    {
      event: "labeled",
      label: { name: LABEL_NAME },
      created_at: "2026-11-04T00:00:00Z",
    },
  ];
  assert.equal(
    labeledAtFromTimeline(timeline),
    Date.parse("2026-11-04T00:00:00Z")
  );
  assert.equal(labeledAtFromTimeline([]), null);
});

test("posts the release notice once while waiting", () => {
  const actions = decideWith({});
  assert.deepEqual(actions, [{ type: "post-notice", body: releaseNotice(4) }]);
  assert.match(actions[0].body, /gitboba-awaiting-author-notice/);
  assert.match(actions[0].body, /react to this comment with 👍/);
  assert.match(actions[0].body, /4 days/);
});

test("updates an older notice in place instead of posting another", () => {
  const actions = decideWith({
    comments: [
      notice(
        `${NOTICE_MARKER}\nA release has been pushed, please try out and report back.\n`
      ),
    ],
  });
  assert.deepEqual(actions, [
    { type: "update-notice", commentId: 10, body: releaseNotice(4) },
  ]);
});

test("waits when the current notice is already posted", () => {
  assert.deepEqual(decideWith({ comments: [notice()] }), [{ type: "wait" }]);
});

test("a thumbs-up from the reporter closes even inside the grace period", () => {
  const actions = decideWith({
    comments: [notice()],
    reactions: [{ content: "+1", user: { login: author } }],
  });
  assert.deepEqual(actions, [{ type: "close", body: confirmedCloseComment() }]);
});

test("a thumbs-up on an older notice updates that comment and then closes", () => {
  const actions = decideWith({
    comments: [notice(`${NOTICE_MARKER}\nold wording`)],
    reactions: [{ content: "+1", user: { login: author } }],
  });
  assert.deepEqual(actions, [
    { type: "update-notice", commentId: 10, body: releaseNotice(4) },
    { type: "close", body: confirmedCloseComment() },
  ]);
});

test("a thumbs-up from someone else does not confirm the fix", () => {
  assert.deepEqual(
    decideWith({
      comments: [notice()],
      reactions: [{ content: "+1", user: { login: "maintainer" } }],
    }),
    [{ type: "wait" }]
  );
});

test("another reaction from the reporter does not confirm the fix", () => {
  assert.deepEqual(
    decideWith({
      comments: [notice()],
      reactions: [{ content: "heart", user: { login: author } }],
    }),
    [{ type: "wait" }]
  );
});

test("any other reply from the reporter clears the label and leaves the issue open", () => {
  const actions = decideWith({
    comments: [notice(), comment(author, "thank you it works", 11)],
  });
  assert.deepEqual(actions, [{ type: "remove-label" }]);
});

test("a reporter reply on an older notice still refreshes the notice, then clears the label", () => {
  const actions = decideWith({
    comments: [
      notice(`${NOTICE_MARKER}\nold wording`),
      comment(author, "still broken", 11),
    ],
  });
  assert.deepEqual(actions, [
    { type: "update-notice", commentId: 10, body: releaseNotice(4) },
    { type: "remove-label" },
  ]);
});

test("a reporter reply prevents posting a notice", () => {
  assert.deepEqual(
    decideWith({ comments: [comment(author, "still broken")] }),
    [{ type: "remove-label" }]
  );
});

test("a reply from someone else does not clear the label", () => {
  assert.deepEqual(
    decideWith({
      comments: [notice(), comment("maintainer", "checking", 11)],
    }),
    [{ type: "wait" }]
  );
});

test("silence after the grace period closes as assumed resolved", () => {
  const actions = decideWith({ now: after, comments: [notice()] });
  assert.deepEqual(actions, [
    { type: "close", body: timeoutCloseComment(4) },
  ]);
});

test("the grace deadline itself is enough to close", () => {
  const actions = decideWith({
    now: labeledAt + 4 * DAY,
    comments: [notice()],
  });
  assert.equal(actions[0].type, "close");
});

test("past the grace period an old notice is closed without rewriting it", () => {
  const actions = decideWith({
    now: after,
    comments: [notice(`${NOTICE_MARKER}\nold wording`)],
  });
  assert.deepEqual(actions, [
    { type: "close", body: timeoutCloseComment(4) },
  ]);
});

test("past the grace period with no notice still closes and does not post one", () => {
  assert.deepEqual(decideWith({ now: after, comments: [] }), [
    { type: "close", body: timeoutCloseComment(4) },
  ]);
});

test("a reporter reply after the grace period keeps the issue open", () => {
  assert.deepEqual(
    decideWith({
      now: after,
      comments: [notice(), comment(author, "still broken", 11)],
    }),
    [{ type: "remove-label" }]
  );
});

test("a reporter thumbs-up after the grace period closes as confirmed", () => {
  const actions = decideWith({
    now: after,
    comments: [notice()],
    reactions: [{ content: "+1", user: { login: author } }],
  });
  assert.deepEqual(actions, [{ type: "close", body: confirmedCloseComment() }]);
});
