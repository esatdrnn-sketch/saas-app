"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface Props {
  token: string;
  phone: string;
}

export default function CardForm({ token, phone }: Props) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [holderName, setHolderName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function formatCardNumber(value: string) {
    return value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  }

  function formatExpiry(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/update-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          cardNumber: cardNumber.replace(/\s/g, ""),
          expiry,
          cvc,
          holderName,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "İstek başarısız oldu.");
      }

      setStatus("success");
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Bir hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyin."
      );
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.successBox}>
        <div className={styles.successIcon}>✓</div>
        <h2 className={styles.successTitle}>Kart başarıyla güncellendi</h2>
        <p className={styles.successText}>
          Aboneliğiniz yeniden aktif edilecek. SMS bildirimi{" "}
          <strong>{phone}</strong> numarasına gönderilecek.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>Kart Numarası</label>
        <input
          className={styles.input}
          type="text"
          inputMode="numeric"
          placeholder="0000 0000 0000 0000"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Kart Üzerindeki İsim</label>
        <input
          className={styles.input}
          type="text"
          placeholder="AD SOYAD"
          value={holderName}
          onChange={(e) => setHolderName(e.target.value.toUpperCase())}
          required
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Son Kullanma</label>
          <input
            className={styles.input}
            type="text"
            inputMode="numeric"
            placeholder="AA/YY"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>CVC</label>
          <input
            className={styles.input}
            type="text"
            inputMode="numeric"
            placeholder="•••"
            maxLength={4}
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
            required
          />
        </div>
      </div>

      {status === "error" && (
        <p className={styles.errorMsg}>
          {errorMessage ||
            "Bir hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyin."}
        </p>
      )}

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={status === "loading"}
      >
        {status === "loading" ? "İşleniyor..." : "Kartı Güncelle"}
      </button>
    </form>
  );
}
