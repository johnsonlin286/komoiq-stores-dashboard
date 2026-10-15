import type { Metadata } from "next";
import { Suspense } from "react";
import { TaskBoard } from "@/components/inventory/task-board";
import board from "@/data/layar-a.json";
import { getCurrentUser } from "@/server/auth";
import type { Confirmation, StoreTask } from "@/types/inventory";

export const metadata: Metadata = {
  title: "Tugas hari ini",
};

export const instant = false;

export default function StoreAdminPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted">Menyiapkan tugas hari ini…</p>}>
      <MorningTasks />
    </Suspense>
  );
}

async function MorningTasks() {
  const user = await getCurrentUser();

  return (
    <TaskBoard
      storeName={board.storeName}
      wasteValue={board.wasteThisMonth.value}
      wasteDetail={board.wasteThisMonth.detail}
      tasks={board.tasks as StoreTask[]}
      confirmations={board.confirmations as Confirmation[]}
      user={user}
    />
  );
}
