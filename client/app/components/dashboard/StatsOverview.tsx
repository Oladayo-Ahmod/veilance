import StatsCard from "../ui/StatsCard";
import { UserStats } from "../../types";

interface StatsOverviewProps {
  userStats: UserStats;
  activeProjects: number;
}

export default function StatsOverview({ userStats, activeProjects }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatsCard title="Total Balance" value={`${userStats.totalEarned.toFixed(2)} ALEO`} icon="💰" trend="+12%" />
      <StatsCard title="Active Projects" value={activeProjects.toString()} icon="📊" trend="+3" />
      <StatsCard title="Completed" value={userStats.completedProjects.toString()} icon="✅" trend="+5" />
      <StatsCard title="Rating" value={userStats.rating.toFixed(1)} icon="⭐" trend="+0.2" />
    </div>
  );
}