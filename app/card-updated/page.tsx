import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CardUpdatedPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; status?: string }>;
}) {
  const { token, status } = await searchParams;

  const isFailed = status === "failure" || status === "error";

  let portalUrl = "/";
  if (token) {
    const sub = await prisma.subscription.findUnique({
      where: { updateToken: token },
      select: { updateToken: true },
    }).catch(() => null);
    if (sub) portalUrl = `/?token=${sub.updateToken}`;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 p-10 max-w-md w-full text-center shadow-sm">
        {isFailed ? (
          <>
            <div className="mx-auto mb-6 w-16 h-16 bg-red-100 flex items-center justify-center">
              <span className="text-red-600 text-3xl font-bold">✕</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-3">
              Kart güncellenemedi
            </h1>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Kart bilgileriniz güncellenirken bir sorun oluştu. Lütfen tekrar
              deneyin veya farklı bir kart kullanın.
            </p>
            <Link
              href={portalUrl}
              className="inline-block bg-indigo-600 text-white px-6 py-3 text-sm font-bold hover:bg-indigo-700 transition-colors"
            >
              ← Tekrar Dene
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto mb-6 w-16 h-16 bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-3xl font-bold">✓</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-3">
              Kartınız güncellendi
            </h1>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Ödeme bilgileriniz başarıyla kaydedildi. Aboneliğiniz aktif
              olmaya devam edecek.
            </p>
            <Link
              href={portalUrl}
              className="inline-block border border-slate-200 text-slate-600 px-6 py-3 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Abonelik Portalına Dön
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
