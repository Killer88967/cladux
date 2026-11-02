import { cn } from "@cladux/utils";
import {
  CreateProject,
  NotificationSettings,
  RevenueStats,
  TeamMembers,
  VisitorsChart,
} from "./cards-a";
import {
  BrandColor,
  FileExplorer,
  Launch,
  Onboarding,
  Review,
  Schedule,
  TaskList,
} from "./cards-b";

/**
 * A wall of real Cladux components, used on the home page and as the preview on
 * the themes page. Columns flow like masonry and collapse on small screens.
 */
export function Showcase({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "columns-1 gap-4 *:mb-4 *:break-inside-avoid md:columns-2 xl:columns-3",
        className,
      )}
    >
      <RevenueStats />
      <CreateProject />
      <TaskList />
      <VisitorsChart />
      <Onboarding />
      <TeamMembers />
      <BrandColor />
      <Schedule />
      <FileExplorer />
      <Launch />
      <Review />
      <NotificationSettings />
    </div>
  );
}
