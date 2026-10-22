"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { ChevronRightIcon } from "@/components/management/icons";
import { LanguageToggle } from "@/components/common/language-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { useSettings, useSettingsAudit } from "@/hooks/use-settings";
import { writeSettings } from "@/lib/settings-store";
import { freshSubcategories, type FreshSubcategory, type Settings } from "@/types/settings";
import type { CurrentUser } from "@/types/dashboard";

type Change = { field: string; oldValue: string; newValue: string };

export function SettingsPage({ user }: { user: CurrentUser }) {
  const t = useTranslations("Settings");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const settings = useSettings();

  function save(next: Settings, changes: Change[]) {
    writeSettings(next, user.name, changes);
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b-[3px] border-management-line bg-management text-panel">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-management-muted uppercase">
              {tCommon("brand")}
            </p>
            <p className="text-sm font-medium">{tCommon("productName")}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle currentLocale={locale} />
            <Link
              href="/store-managment"
              className="inline-flex h-9 items-center rounded-xl border border-white/20 bg-white/10 px-3 text-xs font-medium text-panel transition hover:bg-white/20"
            >
              {t("backToManagement")}
            </Link>
            <p className="hidden text-right sm:block">
              <span className="block text-sm font-medium">{user.name}</span>
              <span className="text-xs text-management-muted">{t("eyebrow")}</span>
            </p>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 md:px-6 md:py-8">
        <div>
          <p className="text-sm font-medium text-muted">{t("eyebrow")}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-[2.5rem] md:leading-tight">
            {t("heading")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">{t("subtitle")}</p>
        </div>

        <WarningsSection settings={settings} onSave={save} />
        <ShelfLifeSection settings={settings} onSave={save} />
        <BestTodaySection settings={settings} onSave={save} />
        <TasksSection settings={settings} onSave={save} />
        <TransferSection settings={settings} onSave={save} />
        <FeatureFlagsPlaceholder />
        <AuditLog />
      </main>
    </div>
  );
}

type SectionStatus = "active" | number;

function StatusBadge({ status }: { status: SectionStatus }) {
  const t = useTranslations("Settings");
  if (status === "active") {
    return (
      <span className="inline-flex items-center rounded-full bg-done-soft px-2.5 py-1 text-xs font-semibold text-done">
        {t("statusActive")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-muted">
      {t("statusPending", { step: status })}
    </span>
  );
}

function SettingsCard({
  title,
  subtitle,
  status,
  defaultOpen = false,
  children,
  onSubmit,
}: {
  title: string;
  subtitle?: string;
  status?: SectionStatus;
  defaultOpen?: boolean;
  children: React.ReactNode;
  onSubmit?: (event: React.FormEvent) => void;
}) {
  const body = <div className="grid gap-4 px-4 py-5 md:px-5">{children}</div>;

  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-3xl bg-panel shadow-[0_1px_2px_rgb(19_41_75/0.04),0_12px_32px_rgb(19_41_75/0.05)] ring-1 ring-line"
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 border-b border-line px-4 py-4 marker:content-none md:px-5">
        <span className="flex items-start gap-2">
          <ChevronRightIcon className="mt-1 size-4 shrink-0 text-muted transition-transform group-open:rotate-90" />
          <span>
            <span className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{title}</h2>
              {status !== undefined ? <StatusBadge status={status} /> : null}
            </span>
            {subtitle ? <p className="mt-0.5 text-sm text-muted">{subtitle}</p> : null}
          </span>
        </span>
      </summary>
      {onSubmit ? <form onSubmit={onSubmit}>{body}</form> : body}
    </details>
  );
}

function NumberField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-11 rounded-xl border border-line bg-background px-3 font-normal tabular-nums outline-none focus:border-management focus:ring-4 focus:ring-management/15"
      />
      {hint ? <span className="text-xs font-normal text-muted">{hint}</span> : null}
    </label>
  );
}

function WarningsSection({
  settings,
  onSave,
}: {
  settings: Settings;
  onSave: (next: Settings, changes: Change[]) => void;
}) {
  const t = useTranslations("Settings");
  const [freshDays, setFreshDays] = useState(settings.warnings.freshDays);
  const [otherDays, setOtherDays] = useState(settings.warnings.otherDays);
  const [slowMovingDays, setSlowMovingDays] = useState(settings.warnings.slowMovingDays);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const changes: Change[] = [];
    freshDays.forEach((value, index) => {
      if (value !== settings.warnings.freshDays[index]) {
        changes.push({
          field: `warnings.freshDays[${index}]`,
          oldValue: String(settings.warnings.freshDays[index]),
          newValue: String(value),
        });
      }
    });
    otherDays.forEach((value, index) => {
      if (value !== settings.warnings.otherDays[index]) {
        changes.push({
          field: `warnings.otherDays[${index}]`,
          oldValue: String(settings.warnings.otherDays[index]),
          newValue: String(value),
        });
      }
    });
    if (slowMovingDays !== settings.warnings.slowMovingDays) {
      changes.push({
        field: "warnings.slowMovingDays",
        oldValue: String(settings.warnings.slowMovingDays),
        newValue: String(slowMovingDays),
      });
    }

    onSave({ ...settings, warnings: { freshDays, otherDays, slowMovingDays } }, changes);
  }

  return (
    <SettingsCard
      title={t("warningsTitle")}
      subtitle={t("warningsSubtitle")}
      status="active"
      defaultOpen
      onSubmit={handleSubmit}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {freshDays.map((value, index) => (
          <NumberField
            key={`fresh-${index}`}
            label={t("freshDayLabel", { level: index + 1 })}
            value={value}
            onChange={(next) =>
              setFreshDays((prev) => prev.map((item, i) => (i === index ? next : item)))
            }
          />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        {otherDays.map((value, index) => (
          <NumberField
            key={`other-${index}`}
            label={t("nonFreshDayLabel", { level: index + 1 })}
            value={value}
            onChange={(next) =>
              setOtherDays((prev) => prev.map((item, i) => (i === index ? next : item)))
            }
          />
        ))}
      </div>
      <NumberField
        label={t("slowMovingDaysLabel")}
        value={slowMovingDays}
        onChange={setSlowMovingDays}
        hint={t("slowMovingDaysHint")}
      />
      <SaveButton />
    </SettingsCard>
  );
}

function ShelfLifeSection({
  settings,
  onSave,
}: {
  settings: Settings;
  onSave: (next: Settings, changes: Change[]) => void;
}) {
  const t = useTranslations("Settings");
  const [shelfLifeDays, setShelfLifeDays] = useState(settings.shelfLifeDays);

  const subcategoryLabel: Record<FreshSubcategory, string> = {
    sayur: t("shelfLifeSayur"),
    buah: t("shelfLifeBuah"),
    daging: t("shelfLifeDaging"),
    keju: t("shelfLifeKeju"),
    roti: t("shelfLifeRoti"),
  };

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const changes: Change[] = [];
    for (const subcategory of freshSubcategories) {
      if (shelfLifeDays[subcategory] !== settings.shelfLifeDays[subcategory]) {
        changes.push({
          field: `shelfLifeDays.${subcategory}`,
          oldValue: String(settings.shelfLifeDays[subcategory]),
          newValue: String(shelfLifeDays[subcategory]),
        });
      }
    }
    onSave({ ...settings, shelfLifeDays }, changes);
  }

  return (
    <SettingsCard title={t("shelfLifeTitle")} subtitle={t("shelfLifeSubtitle")} status={8} onSubmit={handleSubmit}>
      <p className="rounded-xl bg-background px-3 py-2.5 text-sm text-muted">{t("shelfLifeNotConnected")}</p>
      <div className="grid gap-2">
        {freshSubcategories.map((subcategory) => (
          <div
            key={subcategory}
            className="flex items-center justify-between gap-3 rounded-xl border border-line px-3 py-2"
          >
            <span className="text-sm font-medium">{subcategoryLabel[subcategory]}</span>
            <span className="flex items-center gap-2">
              <input
                type="number"
                value={shelfLifeDays[subcategory]}
                onChange={(event) =>
                  setShelfLifeDays((prev) => ({ ...prev, [subcategory]: Number(event.target.value) }))
                }
                className="h-10 w-20 rounded-xl border border-line bg-background px-3 text-right font-normal tabular-nums outline-none focus:border-management focus:ring-4 focus:ring-management/15"
              />
              <span className="text-sm text-muted">{t("shelfLifeDaysUnit")}</span>
            </span>
          </div>
        ))}
      </div>
      <SaveButton />
    </SettingsCard>
  );
}

function BestTodaySection({
  settings,
  onSave,
}: {
  settings: Settings;
  onSave: (next: Settings, changes: Change[]) => void;
}) {
  const t = useTranslations("Settings");
  const [tiers, setTiers] = useState(settings.bestToday);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const changes: Change[] = [];
    if (JSON.stringify(tiers) !== JSON.stringify(settings.bestToday)) {
      changes.push({
        field: "bestToday",
        oldValue: settings.bestToday.map((tier) => `${tier.code} (${tier.percent}%)`).join(", "),
        newValue: tiers.map((tier) => `${tier.code} (${tier.percent}%)`).join(", "),
      });
    }
    onSave({ ...settings, bestToday: tiers }, changes);
  }

  return (
    <SettingsCard title={t("bestTodayTitle")} subtitle={t("bestTodaySubtitle")} status="active" onSubmit={handleSubmit}>
      <div className="grid gap-3">
        {tiers.map((tier, index) => (
          <div key={index} className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1.5 text-sm font-medium">
              {t("bestTodayCode")}
              <input
                value={tier.code}
                onChange={(event) =>
                  setTiers((prev) =>
                    prev.map((item, i) => (i === index ? { ...item, code: event.target.value } : item)),
                  )
                }
                className="h-11 w-32 rounded-xl border border-line bg-background px-3 font-normal outline-none focus:border-management focus:ring-4 focus:ring-management/15"
              />
            </label>
            <NumberField
              label={t("bestTodayPercent")}
              value={tier.percent}
              onChange={(next) =>
                setTiers((prev) =>
                  prev.map((item, i) => (i === index ? { ...item, percent: next } : item)),
                )
              }
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setTiers((prev) => prev.filter((_, i) => i !== index))}
            >
              {t("removeTier")}
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="justify-self-start"
          onClick={() => setTiers((prev) => [...prev, { code: "", percent: 0 }])}
        >
          {t("addTier")}
        </Button>
      </div>
      <SaveButton />
    </SettingsCard>
  );
}

function TasksSection({
  settings,
  onSave,
}: {
  settings: Settings;
  onSave: (next: Settings, changes: Change[]) => void;
}) {
  const t = useTranslations("Settings");
  const [maxPerDay, setMaxPerDay] = useState(settings.tasks.maxPerDay);
  const [checklistItemCount, setChecklistItemCount] = useState(settings.tasks.checklistItemCount);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const changes: Change[] = [];
    if (maxPerDay !== settings.tasks.maxPerDay) {
      changes.push({
        field: "tasks.maxPerDay",
        oldValue: String(settings.tasks.maxPerDay),
        newValue: String(maxPerDay),
      });
    }
    if (checklistItemCount !== settings.tasks.checklistItemCount) {
      changes.push({
        field: "tasks.checklistItemCount",
        oldValue: String(settings.tasks.checklistItemCount),
        newValue: String(checklistItemCount),
      });
    }
    onSave({ ...settings, tasks: { maxPerDay, checklistItemCount } }, changes);
  }

  return (
    <SettingsCard title={t("tasksTitle")} subtitle={t("tasksSubtitle")} onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField
          label={t("maxPerDayLabel")}
          value={maxPerDay}
          onChange={setMaxPerDay}
          hint={t("maxPerDayHint")}
        />
        <NumberField
          label={t("checklistItemCountLabel")}
          value={checklistItemCount}
          onChange={setChecklistItemCount}
          hint={t("checklistItemCountHint")}
        />
      </div>
      <SaveButton />
    </SettingsCard>
  );
}

function TransferSection({
  settings,
  onSave,
}: {
  settings: Settings;
  onSave: (next: Settings, changes: Change[]) => void;
}) {
  const t = useTranslations("Settings");
  const [quickHopKm, setQuickHopKm] = useState(settings.transfer.quickHopKm);
  const [vanRunKm, setVanRunKm] = useState(settings.transfer.vanRunKm);
  const [minValueMultiplier, setMinValueMultiplier] = useState(settings.transfer.minValueMultiplier);
  const [maintainMinDisplayAtSender, setMaintainMinDisplayAtSender] = useState(
    settings.transfer.maintainMinDisplayAtSender,
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next = { quickHopKm, vanRunKm, minValueMultiplier, maintainMinDisplayAtSender };
    const changes: Change[] = [];
    for (const key of Object.keys(next) as (keyof typeof next)[]) {
      if (next[key] !== settings.transfer[key]) {
        changes.push({
          field: `transfer.${key}`,
          oldValue: String(settings.transfer[key]),
          newValue: String(next[key]),
        });
      }
    }
    onSave({ ...settings, transfer: next }, changes);
  }

  return (
    <SettingsCard title={t("transferTitle")} subtitle={t("transferSubtitle")} onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField
          label={t("quickHopKmLabel")}
          value={quickHopKm}
          onChange={setQuickHopKm}
          hint={t("quickHopKmHint")}
        />
        <NumberField
          label={t("vanRunKmLabel")}
          value={vanRunKm}
          onChange={setVanRunKm}
          hint={t("vanRunKmHint")}
        />
        <NumberField
          label={t("minValueMultiplierLabel")}
          value={minValueMultiplier}
          onChange={setMinValueMultiplier}
          hint={t("minValueMultiplierHint")}
        />
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={maintainMinDisplayAtSender}
          onChange={(event) => setMaintainMinDisplayAtSender(event.target.checked)}
          className="size-4 accent-management"
        />
        {t("maintainMinDisplayLabel")}
      </label>
      <SaveButton />
    </SettingsCard>
  );
}

function FeatureFlagsPlaceholder() {
  const t = useTranslations("Settings");
  return (
    <SettingsCard title={t("featureFlagsTitle")} subtitle={t("featureFlagsSubtitle")} status={10}>
      <p className="text-sm text-muted">{t("featureFlagsPlaceholder")}</p>
    </SettingsCard>
  );
}

function AuditLog() {
  const t = useTranslations("Settings");
  const locale = useLocale();
  const audit = useSettingsAudit();

  return (
    <SettingsCard title={t("auditLogTitle")}>
      {audit.length === 0 ? (
        <p className="text-sm text-muted">{t("auditLogEmpty")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold tracking-wide text-muted uppercase">
                <th className="py-2 pr-4">{t("auditWhen")}</th>
                <th className="py-2 pr-4">{t("auditWho")}</th>
                <th className="py-2 pr-4">{t("auditField")}</th>
                <th className="py-2 pr-4">{t("auditOldValue")}</th>
                <th className="py-2 pr-4">{t("auditNewValue")}</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((entry) => (
                <tr key={entry.id} className="border-b border-line last:border-0">
                  <td className="py-2 pr-4 whitespace-nowrap tabular-nums text-muted">
                    {new Date(entry.at).toLocaleString(locale === "id" ? "id-ID" : "en-US")}
                  </td>
                  <td className="py-2 pr-4">{entry.userName}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{entry.field}</td>
                  <td className="py-2 pr-4 text-muted">{entry.oldValue}</td>
                  <td className="py-2 pr-4 font-medium">{entry.newValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SettingsCard>
  );
}

function SaveButton() {
  const t = useTranslations("Settings");
  return (
    <Button type="submit" className="justify-self-start">
      {t("save")}
    </Button>
  );
}
