import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { sendEmail, escapeHtml } from "@/app/lib/email";
import { emailLayout } from "@/app/lib/email-layout";

const SITE_URL = process.env.AUTH_URL ?? "https://veranacouncil.org";

export type ExecutionDetails = {
  to: string;
  memberName: string;
  /** The seat the candidacy targets, e.g. "Legal — EMEA". */
  seat: string;
  signerName: string;
  signedAt: Date;
  agreementVersion: string;
  /** The version file that was signed, e.g. "candidate-agreement-v1.md". */
  agreementSource: string;
  /** sha384 of the template version that was signed. */
  versionHash: string | null;
  /** sha384 of the exact signed PDF. */
  documentHash: string | null;
  /** The signed agreement PDF to attach (already rendered by the caller). */
  agreementPdf?: Buffer;
};

/** A one-page "Certificate of Execution" capturing who signed what, when. */
export async function buildExecutionCertificate(d: ExecutionDetails): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 790;
  const line = (text: string, size = 11, f = font) => {
    page.drawText(text, { x: 50, y, size, font: f, color: rgb(0.1, 0.1, 0.1) });
    y -= size + 8;
  };

  line("Verana Council — Candidate Agreement", 16, bold);
  line("Certificate of Execution", 13, bold);
  y -= 10;
  line(`Candidate: ${d.memberName}`);
  line(`Seat: ${d.seat}`);
  line(`Signed by: ${d.signerName}`);
  line(`Date: ${d.signedAt.toISOString()}`);
  line(`Agreement version: ${d.agreementVersion}`);
  line(`Source: ${d.agreementSource}`, 9);
  if (d.versionHash) line(`Template hash (sha384): ${d.versionHash}`, 8);
  if (d.documentHash) line(`Signed document hash (sha384): ${d.documentHash}`, 8);
  y -= 10;
  line(
    d.agreementPdf
      ? "The signed Candidate Agreement is attached to this email."
      : "The signed Candidate Agreement is available from your account at veranacouncil.org.",
    10,
  );

  return Buffer.from(await pdf.save());
}

/** Email the signer a confirmation + the execution certificate PDF. */
export async function sendExecutedAgreementEmail(d: ExecutionDetails): Promise<void> {
  const certificate = await buildExecutionCertificate(d);
  const attachments = [
    { filename: `verana-council-candidate-certificate-${d.agreementVersion}.pdf`, content: certificate },
  ];
  if (d.agreementPdf) {
    attachments.unshift({
      filename: `verana-council-candidate-agreement-${d.agreementVersion}.pdf`,
      content: d.agreementPdf,
    });
  } else {
    // Should not happen (the caller renders before emailing) — loud, so a
    // candidate receiving only the certificate is visible in the logs.
    console.error(
      `[executed-agreement] sending without the signed-agreement PDF (member ${d.memberName})`,
    );
  }
  const html = emailLayout({
    heading: "Your Council candidacy is open",
    bodyHtml: `
    <p style="margin:0 0 12px;">This confirms that <strong>${escapeHtml(d.signerName)}</strong> signed the
    Candidate Agreement (version ${escapeHtml(d.agreementVersion)}) for
    <strong>${escapeHtml(d.memberName)}</strong>, for the seat
    <strong>${escapeHtml(d.seat)}</strong>, on
    ${d.signedAt.toISOString().slice(0, 10)}.</p>
    <p style="margin:0 0 12px;">The candidacy now enters vetting; once complete it joins
    the seat&rsquo;s queue and an admission ballot is opened (one ballot per
    candidate, ⅔ of seated members, async window). You can follow the status
    from your account.</p>
    <p style="margin:0;">${
      d.agreementPdf
        ? "Your signed agreement and a certificate of execution are attached. You can also download the agreement any time from your account."
        : "A certificate of execution is attached. Your signed agreement is available any time from your account."
    }</p>`,
    button: { label: "Go to your account", href: `${SITE_URL}/account` },
  });
  await sendEmail({
    to: d.to,
    subject: "Your Verana Council candidacy — executed Candidate Agreement",
    html,
    attachments,
  });
}
