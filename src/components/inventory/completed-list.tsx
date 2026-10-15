import { reasonLabel, type Confirmation, type StoreTask } from "@/types/inventory";

export function CompletedList({
  rows,
}: {
  rows: { task: StoreTask; confirmation: Confirmation }[];
}) {
  if (rows.length === 0) {
    return (
      <p className="px-4 py-8 text-sm text-muted md:px-5">Belum ada tugas yang dikonfirmasi.</p>
    );
  }

  return (
    <ul>
      {rows.map(({ task, confirmation }) => {
        const status = confirmation.done
          ? "Sudah dikerjakan"
          : `Tidak dikerjakan · ${reasonLabel(confirmation.reason ?? "lainnya", confirmation.note)}`;

        return (
          <li
            key={confirmation.taskId}
            className="grid gap-2 border-b border-line px-4 py-3.5 last:border-0 sm:grid-cols-[4.25rem_1fr_auto] sm:items-center md:px-5"
          >
            <time className="text-sm font-semibold tabular-nums text-muted" dateTime={confirmation.at}>
              {formatClock(confirmation.at)}
            </time>
            <div className="min-w-0">
              <p className="font-medium">{task.productName}</p>
              <p className="text-sm text-muted">{task.actionLabel}</p>
            </div>
            <p
              className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                confirmation.done
                  ? "bg-done-soft text-done"
                  : "bg-skipped-soft text-skipped"
              }`}
            >
              {status}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

function formatClock(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}
