import { db } from "@/app/lib/db";

/**
 * The seated, active Founding Member orgs this user may cast admission votes
 * for: the org's designated voting representative — or any manager while the
 * org has not designated one.
 */
export async function votableMemberIds(userId: string, email: string) {
  const links = await db.userMember.findMany({
    where: {
      userId,
      member: { membership: { track: "founding_member", status: "active" } },
    },
    include: { member: { include: { access: { where: { status: "active" } } } } },
  });
  const lower = email.toLowerCase();
  return links
    .filter((l) => {
      const reps = l.member.access.filter((a) => a.votingRep);
      if (reps.length > 0) return reps.some((a) => a.email.toLowerCase() === lower);
      return l.role === "manager";
    })
    .map((l) => l.memberId);
}
