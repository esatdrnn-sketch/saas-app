import { prisma } from "@/lib/prisma";
import CancelFlow from "./CancelFlow";
import styles from "./page.module.css";

export default async function CancelSubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <ErrorView message="Bağlantı geçersiz. Lütfen size gönderilen linki kullanın." />
    );
  }

  const subscription = await prisma.subscription.findUnique({
    where: { updateToken: token },
    include: { tenant: true },
  });

  if (!subscription) {
    return (
      <ErrorView message="Bu bağlantı geçersiz veya süresi dolmuş." />
    );
  }

  if (subscription.status === "CANCELLED") {
    return (
      <ErrorView message="Bu abonelik zaten iptal edilmiş." />
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.badge}>Abonelik Yönetimi</div>
          <h1 className={styles.title}>Aboneliğinizi iptal ediyorsunuz</h1>
          <p className={styles.subtitle}>
            <strong>{subscription.tenant.name}</strong> aboneliğiniz için birkaç
            kısa soru yanıtlayın. Size daha iyi bir seçenek sunabilmemiz için
            geri bildiriminiz önemli.
          </p>
        </div>
        <CancelFlow token={token} tenantName={subscription.tenant.name} />
      </div>
      <p className={styles.footer}>
        Güvenli bağlantı · Abonelik bilgileriniz korunmaktadır
      </p>
    </div>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.errorIcon}>✕</div>
        <div className={styles.header} style={{ borderBottom: "none" }}>
          <h2 className={styles.title}>Bir sorun oluştu</h2>
          <p className={styles.subtitle}>{message}</p>
        </div>
      </div>
    </div>
  );
}
