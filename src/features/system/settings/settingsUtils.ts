import type { Setting } from "../api/types";

const SECRET_MASK = "********";

/** True when a setting is treated as a secret (never exposed as plaintext). */
export function isSecretSetting(setting: Pick<Setting, "type" | "is_encrypted">): boolean {
  return setting.is_encrypted || setting.type === "password";
}

/**
 * Editable string value for a setting. Secrets always resolve to an empty
 * string so the masked `********` value from the API is never placed into an
 * editable input (and never sent back as a new value).
 */
export function formatFieldValue(setting: Setting): string {
  if (isSecretSetting(setting)) return "";
  return setting.value ?? "";
}

/**
 * Human-readable display value for a setting (used on read-only surfaces.
 * Secrets remain masked; booleans become Ya/Tidak.
 */
export function displaySettingValue(setting: Setting): string {
  if (isSecretSetting(setting)) return SECRET_MASK;
  if (setting.value === null || setting.value === "") return "-";
  if (setting.type === "boolean") {
    return setting.value === "1" || setting.value === "true" ? "Ya" : "Tidak";
  }
  return setting.value;
}
