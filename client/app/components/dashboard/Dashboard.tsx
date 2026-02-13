import StatsCard from "../ui/StatsCard";
import GlassCard from "../ui/GlassCard";
import RecentProjects from "./RecentProjects";
import SkillsSection from "./SkillsSection";
import DepositFunds from "./DepositFunds";
import StatsOverview from "./StatsOverview";
import { Escrow, UserStats, UserRole } from "../../types";

interface DashboardProps {
  userStats: UserStats;
  projects: Escrow[];
  userRole: UserRole;
  address: string;
  depositAmount: string;
  setDepositAmount: (amount: string) => void;
  onDepositFunds: () => void;
  onMilestoneSubmit: (id: string) => void;
  onMilestoneApprove: (id: string) => void;
  onViewAllProjects: () => void;
  onEditProfile: () => void;
  loading: boolean;
}

export default function Dashboard({
  userStats,
  projects,
  userRole,
  address,
  depositAmount,
  setDepositAmount,
  onDepositFunds,
  onMilestoneSubmit,
  onMilestoneApprove,
  onViewAllProjects,
  onEditProfile,
  loading,
}: DashboardProps) {
  const activeProjects = projects.filter((p) => p.status === "active").length;

  return (
    <div className="space-y-8">
      <StatsOverview userStats={userStats} activeProjects={activeProjects} />

      <div className="grid lg:grid-cols-3 gap-8">
        <GlassCard className="lg:col-span-2">
          <RecentProjects
            projects={projects.slice(0, 3)}
            userRole={userRole}
            address={address}
            onMilestoneSubmit={onMilestoneSubmit}
            onMilestoneApprove={onMilestoneApprove}
            onViewAll={onViewAllProjects}
          />
        </GlassCard>

        <div className="space-y-6">
          <SkillsSection skills={userStats.skills} userRole={userRole} onEditProfile={onEditProfile} />
          {userRole === "client" && (
            <DepositFunds
              depositAmount={depositAmount}
              setDepositAmount={setDepositAmount}
              onDeposit={onDepositFunds}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}