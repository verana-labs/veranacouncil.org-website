import crypto from "node:crypto";
import { db } from "@/app/lib/db";
import { putFile } from "@/app/lib/storage";
import { AgreementContext } from "@/app/lib/agreement-template";
import { renderAgreementPdf } from "@/app/lib/agreement-pdf";

/** Storage key for one signatory's personalised signed agreement PDF. */
export function agreementKey(signatoryId: string): string {
  return `agreements/${signatoryId}.pdf`;
}

/**
 * Render the personalised agreement PDF for one signatory, write it to the
 * storage volume, and record its path + sha384 (SRI form) on the
 * AgreementSignatory row. Returns the bytes and hash so the caller can attach
 * the PDF without re-rendering.
 *
 * Persistence (volume + DB) is best-effort: a broken storage mount must not cost
 * the signer their copy — the rendered bytes are still returned. `persisted:
 * false` means the /account download will 404 until the copy is re-persisted.
 */
export async function persistSignedAgreement(opts: {
  signatoryId: string;
  ctx: AgreementContext;
  template: string;
}): Promise<{ pdf: Buffer; hash: string; key: string; persisted: boolean }> {
  const pdf = await renderAgreementPdf(opts.ctx, opts.template);
  const hash = "sha384-" + crypto.createHash("sha384").update(pdf).digest("base64");
  const key = agreementKey(opts.signatoryId);
  let persisted = true;
  try {
    await putFile(key, pdf);
    await db.agreementSignatory.update({
      where: { id: opts.signatoryId },
      data: { agreementPdfPath: key, agreementHash: hash },
    });
  } catch (e) {
    persisted = false;
    console.error(
      `[signed-agreement] persist failed for signatory ${opts.signatoryId} — the /account download will 404 until re-persisted`,
      e,
    );
  }
  return { pdf, hash, key, persisted };
}
