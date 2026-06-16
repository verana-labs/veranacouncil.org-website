import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/app/lib/db";
import { currentUser, isAdmin } from "@/app/lib/authz";
import { PageHero, Section } from "@/app/components/PageHero";
import { toggleListed } from "./actions";

export const metadata: Metadata = { title: "Members · Admin" };

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await currentUser();
  if (!user || !(await isAdmin(user.email))) notFound();

  const { q } = await searchParams;
  const members = await db.member.findMany({
    where: q
      ? {
          OR: [
            { legalName: { contains: q, mode: "insensitive" } },
            { primaryEmail: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      membership: true,
      // Signing progress on the agreement (across designated signatories).
      agreementSignatories: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <PageHero back={{ href: "/admin", label: "Admin" }} title="Members" />
      <Section bordered={false}>
        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search name or email"
            className="field w-64"
          />
          <button type="submit" className="btn">
            Search
          </button>
        </form>

        {members.length === 0 ? (
          <p className="text-muted mt-6">No members found.</p>
        ) : (
          <div className="overflow-x-auto mt-6">
          <table className="w-full border-collapse text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-muted">
                <th className="p-2">Name</th>
                <th className="p-2">Type</th>
                <th className="p-2">Membership</th>
                <th className="p-2">Email</th>
                <th className="p-2">Signed Agreement</th>
                <th className="p-2">Directory</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const ms = m.membership;
                const sigTotal = m.agreementSignatories.length;
                const sigSigned = m.agreementSignatories.filter(
                  (s) => s.status === "signed",
                ).length;
                return (
                  <tr key={m.id} className="border-t border-rule">
                    <td className="p-2">
                      <Link href={`/admin/members/${m.id}`} className="hover:underline">
                        {m.legalName}
                      </Link>
                    </td>
                    <td className="p-2 text-muted">{m.type}</td>
                    <td className="p-2 text-muted">
                      {ms ? `${ms.track} · ${ms.status}` : "candidate"}
                    </td>
                    <td className="p-2 text-muted">{m.primaryEmail}</td>
                    <td className="p-2">
                      {sigTotal > 0 ? (
                        <Link
                          href={`/admin/members/${m.id}`}
                          className={
                            sigSigned === sigTotal
                              ? "text-green-700 hover:underline"
                              : "text-indigo hover:underline"
                          }
                        >
                          {sigSigned}/{sigTotal} signed
                        </Link>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      {ms ? (
                        <form action={toggleListed} className="flex items-center gap-2">
                          <input type="hidden" name="membershipId" value={ms.id} />
                          <span className={`badge ${ms.listed ? "badge-indigo" : ""}`}>
                            {ms.listed ? "Listed" : "Not listed"}
                          </span>
                          <button
                            type="submit"
                            className="text-indigo hover:underline"
                            title={
                              ms.listed
                                ? "Remove from the public /members page"
                                : "Show on the public /members page"
                            }
                          >
                            {ms.listed ? "Unlist" : "List"}
                          </button>
                        </form>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </Section>
    </>
  );
}
