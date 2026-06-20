import { prisma } from "@/lib/prisma";
import CardForm from "./CardForm";
import styles from "./page.module.css";

interface Props {
  token?: string;
}

export default async function UpdateCardScreen({ token }: Props) {
  if (!token) {
    return <ErrorView message="Bağlantı geçersiz. Lütfen size gönderilen linki kullanın." />;
  }

  const subscription = await prisma.subscription.findUnique({
    where: { updateToken: token },
    include: { tenant: true },
  });

  if (!subscription) {
    return <ErrorView message="Bu bağlantı geçersiz veya süresi dolmuş." />;
  }

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.badge}>Ödeme Güncelleme</div>
          <h1 className={styles.title}>Kart bilgilerinizi güncelleyin</h1>
          <p className={styles.subtitle}>
            <strong>{subscription.tenant.name}</strong> aboneliğiniz için ödeme
            alınamadı. Hizmetinizin kesintisiz devam etmesi için lütfen yeni
            kart bilgilerinizi girin.
          </p>
        </div>
        <CardForm token={token} phone={subscription.customerPhone} />
      </div>
      <p className={styles.footer}>
        🔒 256-bit SSL ile şifrelenmiş güvenli bağlantı
      </p>
    </div>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.errorIcon}>✕</div>
        <h2 className={styles.title}>Bir sorun oluştu</h2>
        <p className={styles.subtitle}>{message}</p>
      </div>
    </div>
  );
}
