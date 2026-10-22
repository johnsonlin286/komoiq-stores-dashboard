// Client-side store for Settings (Langkah 9) — same localStorage pattern as
// confirmation-store.ts. There's no backend to persist these to yet (the
// app still runs on sample JSON), so edits live in the browser that made
// them; this is a deliberate stand-in until Settings is wired to a real API.
import defaultSettingsJson from "@/data/settings.json";
import type { Settings, SettingsAuditEntry } from "@/types/settings";

const SETTINGS_KEY = "inventory-optimizer:settings";
const AUDIT_KEY = "inventory-optimizer:settings-audit";

export const defaultSettings: Settings = defaultSettingsJson as Settings;

// Looks up a "Best today" tier's discount percent by its price code, so a
// task only has to carry the code (see StoreTask.discount) and always
// reflects whatever percent Settings currently has for it.
export function findBestTodayPercent(settings: Settings, code: string): number | undefined {
  return settings.bestToday.find((tier) => tier.code === code)?.percent;
}

const listeners = new Set<() => void>();
let memory: Settings | undefined;
let auditMemory: SettingsAuditEntry[] | undefined;

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== SETTINGS_KEY && event.key !== AUDIT_KEY) return;
    memory = undefined;
    auditMemory = undefined;
    emit();
  });
}

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeSettings(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function readSettings(): Settings {
  if (memory === undefined) {
    memory = readStoredSettings() ?? defaultSettings;
  }
  return memory;
}

export function readSettingsAudit(): SettingsAuditEntry[] {
  if (auditMemory === undefined) {
    auditMemory = readStoredAudit() ?? [];
  }
  return auditMemory;
}

// `changes` describes every field that moved so the audit log stays
// accurate even when a save touches more than one field at once.
export function writeSettings(
  next: Settings,
  userName: string,
  changes: { field: string; oldValue: string; newValue: string }[],
) {
  memory = next;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  }

  if (changes.length > 0) {
    const at = new Date().toISOString();
    const entries: SettingsAuditEntry[] = changes.map((change, index) => ({
      id: `${at}-${index}`,
      at,
      userName,
      ...change,
    }));
    auditMemory = [...entries, ...readSettingsAudit()];
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(AUDIT_KEY, JSON.stringify(auditMemory));
    }
  }

  emit();
}

function readStoredSettings(): Settings | null {
  if (typeof localStorage === "undefined") return null;

  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "");
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Settings;
  } catch {
    return null;
  }
}

function readStoredAudit(): SettingsAuditEntry[] | null {
  if (typeof localStorage === "undefined") return null;

  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(AUDIT_KEY) ?? "");
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(isAuditEntry);
  } catch {
    return null;
  }
}

function isAuditEntry(value: unknown): value is SettingsAuditEntry {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<SettingsAuditEntry>;
  return typeof record.id === "string" && typeof record.field === "string";
}
