"use client";

import { useSyncExternalStore } from "react";
import {
  defaultSettings,
  readSettings,
  readSettingsAudit,
  subscribeSettings,
} from "@/lib/settings-store";
import type { Settings, SettingsAuditEntry } from "@/types/settings";

const emptyAudit: SettingsAuditEntry[] = [];

export function useSettings(): Settings {
  return useSyncExternalStore(subscribeSettings, readSettings, () => defaultSettings);
}

export function useSettingsAudit(): SettingsAuditEntry[] {
  return useSyncExternalStore(subscribeSettings, readSettingsAudit, () => emptyAudit);
}
