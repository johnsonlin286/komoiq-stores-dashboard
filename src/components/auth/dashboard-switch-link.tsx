import Link from "next/link";
import { superAdminRole, type CurrentUser } from "@/types/dashboard";

type DashboardSwitchLinkProps = {
  user: CurrentUser;
  href: string;
  label: string;
};

// Only the demo super-admin account (see establishDemoSession) can see this
// — it lets one demo login hop between /store-admin and /store-managment
// without logging out, since Firebase-issued accounts only ever carry one
// role.
export function DashboardSwitchLink({ user, href, label }: DashboardSwitchLinkProps) {
  if (user.role !== superAdminRole) return null;

  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center rounded-xl border border-white/20 bg-white/10 px-3 text-xs font-medium text-panel transition hover:bg-white/20"
    >
      {label}
    </Link>
  );
}
