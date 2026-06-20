"use client";

import { useState } from "react";
import styles from "./page.module.css";

type CancelReason = "too_expensive" | "technical" | "temporary" | "alternative";
type Step = "survey" | "offer" | "confirm" | "result";
type ResultAction = "accept_discount" | "accept_pause" | "cancel";

const REASONS: { id: CancelReason; label: string }[] = [
  { id: "too_expensive", label: "Çok pahalı" },
  { id: "technical", label: "Teknik sorunlar yaşıyorum" },
  { id: "temporary", label: "Geçici olarak ihtiyacım yok" },
  { id: "alternative", label: "Başka bir alternatif buldum" },
];

const STEP_LABELS: Record<Step, string> = {
  survey: "Anket",
  offer: "Teklif",
  confirm: "Onay",
  result: "Sonuç",
};

interface Props {
  token: string;
  tenantName: string;
}

export default function CancelFlow({ token, tenantName }: Props) {
  const [step, setStep] = useState<Step>("survey");
  const [reason, setReason] = useState<CancelReason | null>(null);
  const [resultAction, setResultAction] = useState<ResultAction | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const stepNumber =
    step === "survey" ? 1 : step === "result" ? 3 : 2;

  function handleSurveyContinue() {
    if (!reason) return;

    if (reason === "too_expensive" || reason === "temporary") {
      setStep("offer");
      return;
    }

    setStep("confirm");
  }

  async function submitAction(action: ResultAction) {
    if (!reason) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action, reason }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "İstek başarısız oldu.");
      }

      setResultAction(action);
      setStep("result");
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  }

  if (step === "result" && resultAction) {
    return (
      <div className={styles.successBox}>
        {resultAction === "cancel" ? (
          <>
            <div className={styles.cancelIcon}>✕</div>
            <h2 className={styles.successTitle}>Aboneliğiniz iptal edildi</h2>
            <p className={styles.successText}>
              <strong>{tenantName}</strong> aboneliğiniz sonlandırıldı. İstediğiniz
              zaman tekrar abone olabilirsiniz.
            </p>
          </>
        ) : resultAction === "accept_discount" ? (
          <>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>İndiriminiz uygulandı</h2>
            <p className={styles.successText}>
              Sonraki 2 ay boyunca aboneliğiniz <strong>%50 indirimli</strong>{" "}
              devam edecek. Teşekkür ederiz!
            </p>
          </>
        ) : (
          <>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>Aboneliğiniz donduruldu</h2>
            <p className={styles.successText}>
              Aboneliğiniz <strong>1 ay</strong> askıya alındı. Hazır
              olduğunuzda otomatik olarak devam edecek.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <p className={styles.progressLabel}>
        Adım {stepNumber} / 3 · {STEP_LABELS[step]}
      </p>
      <div className={styles.progress} aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`${styles.progressStep} ${
              n <= stepNumber ? styles.progressStepActive : ""
            }`}
          />
        ))}
      </div>

      <div className={styles.body}>
        {step === "survey" && (
          <>
            <div className={styles.options}>
              {REASONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.option} ${
                    reason === item.id ? styles.optionSelected : ""
                  }`}
                  onClick={() => setReason(item.id)}
                >
                  <span className={styles.optionRadio}>
                    {reason === item.id && (
                      <span className={styles.optionRadioDot} />
                    )}
                  </span>
                  <span className={styles.optionLabel}>{item.label}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={!reason}
              onClick={handleSurveyContinue}
            >
              Devam Et
            </button>
          </>
        )}

        {step === "offer" && reason === "too_expensive" && (
          <>
            <div className={styles.offerBox}>
              <span className={styles.offerTag}>Size özel teklif</span>
              <h2 className={styles.offerTitle}>Sonraki 2 ay %50 indirim</h2>
              <p className={styles.offerDesc}>
                Aboneliğinizi koruyun; ödemeleriniz 2 ay boyunca yarı fiyatına
                düşsün.
              </p>
            </div>
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={loading}
              onClick={() => submitAction("accept_discount")}
            >
              {loading ? "İşleniyor..." : "Teklifi Kabul Et"}
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              disabled={loading}
              onClick={() => setStep("confirm")}
            >
              Yine de iptal et
            </button>
          </>
        )}

        {step === "offer" && reason === "temporary" && (
          <>
            <div className={styles.offerBox}>
              <span className={styles.offerTag}>Alternatif öneri</span>
              <h2 className={styles.offerTitle}>1 ay dondurun (Pause)</h2>
              <p className={styles.offerDesc}>
                İptal etmek yerine aboneliğinizi 1 ay askıya alın. Hazır
                olduğunuzda kaldığınız yerden devam edin.
              </p>
            </div>
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={loading}
              onClick={() => submitAction("accept_pause")}
            >
              {loading ? "İşleniyor..." : "Aboneliği Dondur"}
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              disabled={loading}
              onClick={() => setStep("confirm")}
            >
              Yine de iptal et
            </button>
          </>
        )}

        {step === "confirm" && (
          <>
            <div className={styles.confirmBox}>
              <p className={styles.confirmText}>
                <strong>{tenantName}</strong> aboneliğiniz iptal edilecek ve
                premium özelliklere erişiminiz sona erecek. Bu işlem geri
                alınamaz.
              </p>
            </div>
            <button
              type="button"
              className={styles.dangerBtn}
              disabled={loading}
              onClick={() => submitAction("cancel")}
            >
              {loading ? "İşleniyor..." : "Aboneliğimi İptal Et"}
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              disabled={loading}
              onClick={() =>
                setStep(
                  reason === "too_expensive" || reason === "temporary"
                    ? "offer"
                    : "survey"
                )
              }
            >
              Geri dön
            </button>
          </>
        )}

        {errorMessage && <p className={styles.errorMsg}>{errorMessage}</p>}
      </div>
    </>
  );
}
