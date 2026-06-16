import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { currentUser, isAdmin } from "@/app/lib/authz";
import { PageHero, Section } from "@/app/components/PageHero";
import AddObserverForm from "./AddObserverForm";

export const metadata: Metadata = { title: "Add observer · Admin" };

export default async function NewObserverPage() {
  const user = await currentUser();
  if (!user || !(await isAdmin(user.email))) notFound();

  return (
    <>
      <PageHero
        back={{ href: "/admin/members", label: "Members" }}
        title="Add a Public-Sector Observer"
        lead="Observers are admitted by a steward/Board decision, not self-service. This creates the organization, invites its contact as manager, and accepts it on the (non-voting) observer track."
      />
      <Section bordered={false}>
        <AddObserverForm />
      </Section>
    </>
  );
}
