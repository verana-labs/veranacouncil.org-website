import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/app/lib/db";
import { currentUser, isAdmin } from "@/app/lib/authz";
import { personName } from "@/app/lib/council-bodies";
import { PageHero, Section } from "@/app/components/PageHero";
import WorkingGroupsAdmin from "./WorkingGroupsAdmin";

export const metadata: Metadata = { title: "Council Bodies · Admin" };

export default async function AdminWorkingGroupsPage() {
  const user = await currentUser();
  if (!user || !(await isAdmin(user.email))) notFound();

  const groups = await db.workingGroup.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      leads: {
        include: { user: { select: { id: true, displayName: true, name: true, email: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return (
    <>
      <PageHero
        back={{ href: "/admin", label: "Admin" }}
        title="Council Bodies"
        lead={
          <>
            Council bodies are open to any Council Member or Observer; they
            access them by signing in.
          </>
        }
      />
      <Section bordered={false}>
        <WorkingGroupsAdmin
          groups={groups.map((g) => ({
            id: g.id,
            slug: g.slug,
            name: g.name,
            description: g.description,
            requiredClass: g.requiredClass,
            link: g.link,
            showOnHome: g.showOnHome,
            state: g.state,
            priority: g.priority,
            disabledAt: g.disabledAt?.toISOString() ?? null,
            leads: g.leads.map((l) => ({
              userId: l.user.id,
              name: personName(l.user),
              email: l.user.email ?? "",
              image: l.user.image,
            })),
          }))}
        />
      </Section>
    </>
  );
}
