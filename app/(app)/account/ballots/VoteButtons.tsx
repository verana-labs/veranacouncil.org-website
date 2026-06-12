"use client";

import { useState, useTransition } from "react";
import { castVote } from "./actions";

export default function VoteButtons({
  ballotId,
  memberIds,
}: {
  ballotId: string;
  /** Seated member orgs this user may still cast for (usually one). */
  memberIds: string[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function vote(choice: "accept" | "refuse") {
    if (
      !window.confirm(
        `Cast "${choice}" for your organization? Votes are final and the result is published on the public record.`,
      )
    )
      return;
    startTransition(async () => {
      try {
        for (const memberId of memberIds) await castVote(ballotId, memberId, choice);
        setError("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "The vote could not be cast.");
      }
    });
  }

  return (
    <div className="mt-3">
      <div className="flex gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => vote("accept")}
          className="btn btn-primary text-sm"
        >
          Accept
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => vote("refuse")}
          className="btn btn-secondary text-sm"
        >
          Refuse
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
