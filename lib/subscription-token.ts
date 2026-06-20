import { randomBytes } from "crypto";

/** Sihirli link (update-card) için benzersiz token üretir. */
export function generateUpdateToken(): string {
  return randomBytes(32).toString("hex");
}
