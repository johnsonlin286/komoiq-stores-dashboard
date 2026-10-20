// Crosswalk between Layar A's "tugas hari ini" and Layar B's per-store
// product rows, so a confirmation made on /store-admin can be reflected as
// resolved stock on /store-managment. This only works because
// generate-layar-a-data.mjs draws its tasks from the same HOME_STORE_ID's
// flagged products in layar-b.json — every task's sku/levelId is guaranteed
// to exist there.
import layarA from "@/data/layar-a.json";
import type { LevelId } from "@/types/inventory";

// Must match HOME_STORE_ID in scripts/generate-layar-a-data.mjs.
export const HOME_STORE_ID = "pondok-indah";

type TaskRef = { sku: string; levelId: LevelId };

const taskRefById = new Map<string, TaskRef>(
  layarA.tasks.map((task) => [task.id, { sku: task.sku, levelId: task.levelId as LevelId }]),
);

export function getTaskRef(taskId: string): TaskRef | undefined {
  return taskRefById.get(taskId);
}
