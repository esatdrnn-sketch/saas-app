import { prisma } from "@/lib/prisma";
import PortalClient from "./portal/PortalClient";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <ErrorPage message="Bağlantı geçersiz. Lütfen size gönderilen linki kullanın." />;
  }

  const subscription = await prisma.subscription.findUnique({
    where: { updateToken: token },
    include: { tenant: true },
  });

  if (!subscription) {
    return <ErrorPage message="Bu bağlantı geçersiz veya süresi dolmuş." />;
  }

  return (
    <PortalClient
      token={token}
      tenantName={subscription.tenant.name}
      subscriptionStatus={subscription.status}
    />
  );
}

function ErrorPage({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 p-8 max-w-md w-full">
        <div className="w-10 h-10 bg-red-100 flex items-center justify-center mb-4">
          <span className="text-red-600 text-lg font-bold">✕</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Bir sorun oluştu</h2>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}
