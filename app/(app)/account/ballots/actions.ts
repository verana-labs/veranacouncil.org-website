"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/app/lib/db";
import { currentUser } from "@/app/lib/authz";
import { settleBallot } from "@/app/lib/ballots";
import { votableMemberIds } from "@/app/lib/voting";

export async function castVote(
  ballotId: string,
  memberId: string,
  choice: "accept" | "refuse",
) {
  const user = await currentUser();
  if (!user?.id || !user.email) throw new Error("Forbidden");

  const allowed = await votableMemberIds(user.id, user.email);
  if (!allowed.includes(memberId)) {
    throw new Error("You are not the voting representative of a seated member.");
  }

  const ballot = await db.ballot.findUnique({
    where: { id: ballotId },
    include: { candidacy: true },
  });
  if (!ballot || ballot.status !== "open" || ballot.closesAt <= new Date()) {
    throw new Error("This ballot is not open.");
  }
  if (ballot.candidacy.memberId === memberId) {
    throw new Error("A candidate cannot vote on its own admission.");
  }

  await db.ballotVote.upsert({
    where: { ballotId_memberId: { ballotId, memberId } },
    update: {}, // votes are final — no change once cast
    create: { ballotId, memberId, userId: user.id, choice },
  });

  // Early settlement when the ⅔ threshold is reached or unreachable.
  await settleBallot(ballotId);

  revalidatePath("/account/ballots");
}
