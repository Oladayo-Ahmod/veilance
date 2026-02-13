import { UserStats } from "../../types";

interface StatsSummaryProps {
  userStats: UserStats;
}

export default function StatsSummary({ userStats }: StatsSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white/5 p-4 rounded-lg">
        <h4 className="text-sm text-gray-400 mb-1">Total Projects</h4>
        <p className="text-2xl font-bold">{userStats.totalProjects}</p>
      </div>
      <div className="bg-white/5 p-4 rounded-lg">
        <h4 className="text-sm text-gray-400 mb-1">Success Rate</h4>
        <p className="text-2xl font-bold">98%</p>
      </div>
    </div>
  );
}