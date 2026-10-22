import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { TaskBoard } from "@/components/inventory/task-board";
import board from "@/data/layar-a.json";
import { getCurrentUser } from "@/server/auth";
import type { Confirmation, StoreTask } from "@/types/inventory";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Common");
  return { title: t("taskBoardTitle") };
}

export const instant = false;

export default async function StoreAdminPage() {
  const t = await getTranslations("Common");

  return (
    <Suspense fallback={<p className="p-8 text-sm text-muted">{t("preparingTasks")}</p>}>
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
