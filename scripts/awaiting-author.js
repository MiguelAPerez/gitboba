// Decision logic for the awaiting-author auto-close workflow.
// The workflow fetches GitHub data and performs the returned actions in order.

const LABEL_NAME = "awaiting-author";
const NOTICE_MARKER = "<!-- gitboba-awaiting-author-notice -->";
const THUMBS_UP_ASK = "react to this comment with 👍";

function parseGraceDays(value) {
  const graceDays = Number(value ?? "4");
  if (!Number.isFinite(graceDays) || graceDays < 1) return null;
  return graceDays;
}

function releaseNotice(days) {
  return [
    NOTICE_MARKER,
    "A release has been pushed, please try out and report back.",
    "",
    `If everything works, ${THUMBS_UP_ASK}.`,
    "",
    `This will auto-close in **${days} days** if we don't hear from you.`,
  ].join("\n");
}

function confirmedCloseComment() {
  return [
    "Closing as **resolved** — thanks for confirming with 👍.",
    "",
    "If you're still seeing the problem, comment here and we can reopen, or open a new issue anytime.",
  ].join("\n");
}

function timeoutCloseComment(days) {
  return [
    `Closing as **resolved**—we assume the fix worked after **${days} days** with no reply on this thread.`,
    "",
    "If you're still seeing the problem, comment here and we can reopen, or open a new issue anytime.",
  ].join("\n");
}

function labeledAtFromTimeline(timeline, labelName = LABEL_NAME) {
  const times = timeline
    .filter(
      (event) => event.event === "labeled" && event.label?.name === labelName
    )
    .map((event) => new Date(event.created_at).getTime());
  return times.length ? times[times.length - 1] : null;
}

function decide({ author, comments, reactions, labeledAt, now, graceDays }) {
  const graceMs = graceDays * 24 * 60 * 60 * 1000;
  const withinGrace = now - labeledAt < graceMs;
  const desiredNotice = releaseNotice(graceDays);
  const noticeComment = comments.find((comment) =>
    comment.body?.includes(NOTICE_MARKER)
  );
  const actions = [];

  if (
    noticeComment &&
    !noticeComment.body?.includes(THUMBS_UP_ASK) &&
    withinGrace
  ) {
    actions.push({
      type: "update-notice",
      commentId: noticeComment.id,
      body: desiredNotice,
    });
  }

  const authorConfirmed =
    noticeComment &&
    reactions.some(
      (reaction) =>
        reaction.content === "+1" && reaction.user?.login === author
    );
  if (authorConfirmed) {
    actions.push({ type: "close", body: confirmedCloseComment() });
    return actions;
  }

  const authorReplied = comments.some(
    (comment) => comment.user?.login === author
  );
  if (authorReplied) {
    actions.push({ type: "remove-label" });
    return actions;
  }

  if (!noticeComment && withinGrace) {
    return [{ type: "post-notice", body: desiredNotice }];
  }

  if (withinGrace) {
    return actions.length ? actions : [{ type: "wait" }];
  }

  return [{ type: "close", body: timeoutCloseComment(graceDays) }];
}

module.exports = {
  LABEL_NAME,
  NOTICE_MARKER,
  THUMBS_UP_ASK,
  parseGraceDays,
  releaseNotice,
  confirmedCloseComment,
  timeoutCloseComment,
  labeledAtFromTimeline,
  decide,
};
