import { prisma } from "@/lib/prisma";
import PortalClient from "./portal/PortalClient";
import type { OfferMap, BrandingConfig, SurveyMap, Testimonial } from "./portal/PortalClient";
import LandingPage from "./landing/LandingPage";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; autoOffer?: string; embed?: string }>;
}) {
  const { token, autoOffer, embed } = await searchParams;

  if (!token) {
    return <LandingPage />;
  }

  const subscription = await prisma.subscription.findUnique({
    where: { updateToken: token },
    include: {
      tenant: {
        include: {
          offers: true,
          surveyConfigs: true,
          testimonials: { orderBy: { displayOrder: "asc" }, take: 3 },
        },
      },
    },
  });

  if (!subscription) {
    return <ErrorPage message="Bu bağlantı geçersiz veya süresi dolmuş." />;
  }

  if (subscription.updateTokenExpiresAt && subscription.updateTokenExpiresAt < new Date()) {
    return <ErrorPage message="Bu bağlantının süresi dolmuştur. Lütfen destek ekibiyle iletişime geçin." />;
  }

  const { tenant } = subscription;

  const offerMap: OfferMap = {};
  for (const o of tenant.offers) {
    offerMap[o.reason] = { type: o.offerType as "DISCOUNT" | "PAUSE" | "DOWNGRADE", value: o.value ?? 0 };
  }

  const surveyMap: SurveyMap = {};
  for (const c of tenant.surveyConfigs) {
    surveyMap[c.reason] = { label: c.label, description: c.description };
  }

  const branding: BrandingConfig = {
    brandColor:  tenant.brandColor  ?? undefined,
    logoUrl:     tenant.logoUrl     ?? undefined,
    portalTitle: tenant.portalTitle ?? undefined,
  };

  const testimonials: Testimonial[] = tenant.testimonials.map((t) => ({
    id:           t.id,
    customerName: t.customerName,
    role:         t.role ?? undefined,
    quote:        t.quote,
  }));

  return (
    <PortalClient
      token={token}
      tenantName={subscription.tenant.name}
      subscriptionStatus={subscription.status}
      planName={subscription.planName ?? undefined}
      amount={subscription.amount ?? undefined}
      currency={subscription.currency}
      pauseUntil={subscription.pauseUntil?.toISOString() ?? undefined}
      offerMap={offerMap}
      surveyMap={surveyMap}
      branding={branding}
      testimonials={testimonials}
      autoOffer={autoOffer === "discount" || autoOffer === "pause" ? autoOffer : undefined}
      embed={embed === "1"}
    />
  );
}

function ErrorPage({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 p-8 max-w-md w-full">
        <div className="w-10 h-10 bg-red-100 flex items-center justify-center mb-4">
          <span className="text-red-600 text-lg font-bold">X</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Bir sorun olustu</h2>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}
