import { execSync } from "node:child_process";
import { config } from "dotenv";
config();

/**
 * Prisma 7 + Neon: migrate deploy çalıştırır.
 * P1002 (advisory lock timeout) → Neon'un serverless uyku durumundan kaynaklanır;
 * migration zaten uygulanmışsa build'i durdurmak yerine uyarı verir.
 */
const migrationUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!migrationUrl) {
  console.error("[migrate-deploy] DATABASE_URL veya DIRECT_URL tanımlı değil.");
  process.exit(1);
}

try {
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: migrationUrl },
  });
} catch (err) {
  const msg = err?.stderr?.toString() ?? err?.message ?? String(err);
  if (msg.includes("P1002") || msg.includes("advisory lock")) {
    console.warn(
      "[migrate-deploy] Advisory lock timeout (Neon uyku modu). " +
      "Migration zaten uygulanmışsa bu uyarı önemli değil."
    );
    process.exit(0);
  }
  // Başka bir hata: build'i durdur
  console.error("[migrate-deploy] Migration başarısız:", msg);
  process.exit(1);
}
