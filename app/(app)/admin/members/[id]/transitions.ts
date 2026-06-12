// Admin-allowed membership status transitions (shared by the server action that
// enforces them and the card that offers them in its ⋮ menu).

export type MembershipStatus = "pending" | "active" | "suspended" | "ended";

export const MEMBERSHIP_TRANSITIONS: Record<MembershipStatus, MembershipStatus[]> = {
  pending: ["active", "ended"],
  active: ["suspended", "ended"],
  suspended: ["active", "ended"],
  ended: ["active"],
};

/** Action label for transitioning *to* a given status. */
export const MEMBERSHIP_STATUS_LABEL: Record<MembershipStatus, string> = {
  pending: "Mark pending",
  active: "Activate",
  suspended: "Suspend",
  ended: "End membership",
};
