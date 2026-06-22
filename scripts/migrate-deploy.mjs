import { execSync } from "node:child_process";
import { config } from "dotenv";
config();

/**
 * Prisma 7'de directUrl kaldırıldı. Neon'da migrate deploy için
 * pooler olmayan DIRECT_URL kullanılır; yoksa DATABASE_URL'e düşer.
 */
const migrationUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!migrationUrl) {
  console.error(
    "[migrate-deploy] DATABASE_URL veya DIRECT_URL tanımlı değil."
  );
  process.exit(1);
}

execSync("npx prisma migrate deploy", {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: migrationUrl,
  },
});
