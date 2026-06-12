import type { Metadata } from "next";
import EoiForm from "./EoiForm";

export const metadata: Metadata = {
  title: "ECS Ecosystem Participant — expression of interest",
};

export default function EcsInterestPage() {
  return (
    <>
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="tag mb-4">ECS Ecosystem Participants</p>
          <h1 className="display text-4xl sm:text-5xl leading-tight max-w-3xl">
            Expression of interest
          </h1>
          <div className="accent-line mt-6" />
          <p className="mt-8 text-lg text-muted max-w-2xl leading-relaxed">
            ECS Ecosystem Participants are required for running Verifiable
            Services on Verana. Their selection is governed by the ECS-EGF;
            recruitment opens as soon as the Council delivers the framework
            (target Q4 2026). Join the non-binding waitlist so the pipeline is
            ready when it does.
          </p>
        </div>
      </section>
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <EoiForm />
        </div>
      </section>
    </>
  );
}
