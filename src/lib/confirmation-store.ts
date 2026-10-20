// Shared client-side store for Layar A confirmations. Uses localStorage
// (not sessionStorage) so a confirmation made on /store-admin is also
// visible to /store-managment — this is the simple simulation that links
// the two dashboards; real data flow back to BigQuery is still backend work.
import type { Confirmation } from "@/types/inventory";

const STORAGE_KEY = "inventory-optimizer:confirmations";

const listeners = new Set<() => void>();
let memory: Confirmation[] | undefined;

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    memory = undefined;
    emit();
  });
}

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeConfirmations(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function readConfirmations(fallback: Confirmation[] = []): Confirmation[] {
  if (memory === undefined) {
    memory = readStored() ?? fallback;
  }
  return memory;
}

export function writeConfirmations(next: Confirmation[]) {
  memory = next;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  emit();
}

function readStored(): Confirmation[] | null {
  if (typeof localStorage === "undefined") return null;

  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "");
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(isConfirmation);
  } catch {
    return null;
  }
}

function isConfirmation(value: unknown): value is Confirmation {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<Confirmation>;
  return typeof record.taskId === "string" && typeof record.done === "boolean";
}
