import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ShortLinkPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const sub = await prisma.subscription.findUnique({
    where: { portalCode: code },
    select: { updateToken: true },
  });

  if (!sub) notFound();

  redirect(`/?token=${encodeURIComponent(sub.updateToken)}`);
}
