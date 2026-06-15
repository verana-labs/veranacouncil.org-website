import Link from "next/link";
import type { WorkingGroupCard } from "@/app/lib/council-bodies";
import PersonAvatars from "@/app/components/PersonAvatars";
import LocalTime from "@/app/components/LocalTime";

// The working-group tile design for the /council-bodies board. Every tile
// links to the group's page; what you can do there (join, meeting link)
// depends on your memberships.
export default function WorkingGroupCards({
  groups,
}: {
  groups: WorkingGroupCard[];
}) {
  if (groups.length === 0) {
    return <p className="text-sm text-muted">No council bodies yet.</p>;
  }

  return (
    <div className="space-y-4">
      {groups.map((wg) => {
        // Every council body is open to any Council Member or Observer.
        const requires = "Council Member or Observer";
        return (
          <Link
            key={wg.id}
            href={`/council-bodies/${wg.slug}`}
            className="wg-tile block hover:no-underline"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="display text-lg text-ink">{wg.name}</p>
              <span className="flex items-center gap-2 flex-shrink-0">
                {wg.joined && <span className="badge badge-indigo">Joined</span>}
                <span className="badge">{requires}</span>
              </span>
            </div>
            {wg.description && (
              <p className="text-sm text-muted mt-1">{wg.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm text-muted">
              {wg.leads.length > 0 && (
                <span className="flex items-center gap-2">
                  <PersonAvatars people={wg.leads} size={24} max={5} />
                  Led by {wg.leads.map((l) => l.name).join(", ")}
                </span>
              )}
              {wg.participantCount > 0 && (
                <span>
                  {wg.participantCount} participant
                  {wg.participantCount === 1 ? "" : "s"}
                </span>
              )}
              {wg.nextMeeting && (
                <span>
                  Next meeting: <LocalTime iso={wg.nextMeeting} />
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
