import { NextRequest, NextResponse } from "next/server";
import { currentUser, isAdmin, isManagerOf } from "@/app/lib/authz";
import { db } from "@/app/lib/db";
import { getFile } from "@/app/lib/storage";
import { userAccessIds } from "@/app/lib/agreement-signing";

/**
 * Stream a signed Membership Agreement PDF. With `?s=<signatoryId>`, the named
 * signatory's copy; otherwise the requesting user's own signed copy for this
 * member. Access: a Council admin, a manager of the member, or the signatory.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> },
) {
  const { memberId } = await params;
  const user = await currentUser();
  if (!user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const signatoryId = req.nextUrl.searchParams.get("s");
  const admin = await isAdmin(user.email);
  const manager = await isManagerOf(user.id, memberId);
  const myAccessIds = await userAccessIds(user.email);

  const sig = signatoryId
    ? await db.agreementSignatory.findFirst({
        where: { id: signatoryId, memberId, agreementPdfPath: { not: null } },
        select: { agreementPdfPath: true, agreementVersion: true, memberAccessId: true },
      })
    : await db.agreementSignatory.findFirst({
        where: {
          memberId,
          agreementPdfPath: { not: null },
          memberAccessId: { in: [...myAccessIds] },
        },
        orderBy: { signedAt: "desc" },
        select: { agreementPdfPath: true, agreementVersion: true, memberAccessId: true },
      });

  if (!sig?.agreementPdfPath) return new NextResponse("Not found", { status: 404 });

  const allowed = admin || manager || myAccessIds.has(sig.memberAccessId);
  if (!allowed) return new NextResponse("Forbidden", { status: 403 });

  let bytes: Buffer;
  try {
    bytes = await getFile(sig.agreementPdfPath);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const filename = `verana-membership-agreement-${sig.agreementVersion}.pdf`;
  return new NextResponse(bytes as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
