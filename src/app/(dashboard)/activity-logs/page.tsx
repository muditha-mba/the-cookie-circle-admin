import { ActivityLogList } from "@/components/activity-logs/ActivityLogList";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function ActivityLogsPage() {
  return (
    <DashboardPageShell
      title="Activity Log"
      description="Super-admin audit trail of admin actions, logins, and exports with client device context."
    >
      <ActivityLogList />
    </DashboardPageShell>
  );
}
