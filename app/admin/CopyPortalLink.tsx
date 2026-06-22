"use client";

import { useState } from "react";
import styles from "./admin.module.css";

export default function CopyPortalLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API kullanılamıyorsa fallback
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      className={copied ? styles.btnLinkCopied : styles.btnLink}
      onClick={handleCopy}
      title={url}
    >
      {copied ? "Kopyalandı ✓" : "Link Kopyala"}
    </button>
  );
}
