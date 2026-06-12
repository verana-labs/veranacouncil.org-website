import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/app/lib/db";
import { currentUser, isAdmin } from "@/app/lib/authz";
import { PageHero, Section } from "@/app/components/PageHero";

export const metadata: Metadata = { title: "ECS interest · Admin" };

export default async function AdminEcsInterestPage() {
  const user = await currentUser();
  if (!user || !(await isAdmin(user.email))) notFound();

  const entries = await db.ecsInterest.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return (
    <>
      <PageHero back={{ href: "/admin", label: "Admin" }} title="ECS expressions of interest" />
      <Section bordered={false}>
        <p className="text-sm text-muted max-w-2xl">
          The non-binding waitlist for ECS Ecosystem Participant recruitment,
          which opens once the Council delivers the ECS-EGF.
        </p>
        {entries.length === 0 ? (
          <p className="text-muted mt-6">No expressions of interest yet.</p>
        ) : (
          <div className="overflow-x-auto mt-6">
            <table className="w-full border-collapse text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-muted">
                  <th className="p-2">Date</th>
                  <th className="p-2">Organization</th>
                  <th className="p-2">Sector</th>
                  <th className="p-2">Intended role</th>
                  <th className="p-2">Contact</th>
                  <th className="p-2">Message</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-t border-rule align-top">
                    <td className="p-2 font-mono text-muted whitespace-nowrap">
                      {e.createdAt.toISOString().slice(0, 10)}
                    </td>
                    <td className="p-2">{e.orgName}</td>
                    <td className="p-2 text-muted">{e.sector}</td>
                    <td className="p-2 text-muted">{e.intendedRole}</td>
                    <td className="p-2">
                      {e.contactName}
                      <span className="block text-muted text-xs">{e.contactEmail}</span>
                    </td>
                    <td className="p-2 text-muted max-w-[24rem]">
                      {e.message ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </>
  );
}
