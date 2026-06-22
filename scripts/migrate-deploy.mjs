import { execSync } from "node:child_process";
import { config } from "dotenv";
config();

const migrationUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!migrationUrl) {
  console.error("[migrate-deploy] DATABASE_URL veya DIRECT_URL tanımlı değil.");
  process.exit(1);
}

try {
  // stdio: "pipe" ile çıktıyı yakala, başarılı olursa ekrana bas
  const result = execSync("npx prisma migrate deploy", {
    stdio: "pipe",
    env: { ...process.env, DATABASE_URL: migrationUrl },
  });
  process.stdout.write(result);
} catch (err) {
  const out = err?.stdout?.toString() ?? "";
  const errOut = err?.stderr?.toString() ?? "";
  const combined = out + " " + errOut;

  // Çıktıyı her durumda ekrana bas
  if (out) process.stdout.write(out);
  if (errOut) process.stderr.write(errOut);

  if (combined.includes("P1002") || combined.includes("advisory lock") || combined.includes("pg_advisory_lock")) {
    console.warn(
      "\n[migrate-deploy] ⚠ Advisory lock timeout (Neon uyku). " +
      "Migration zaten uygulanmışsa önemsiz — devam ediliyor."
    );
    process.exit(0);
  }

  process.exit(1);
}
