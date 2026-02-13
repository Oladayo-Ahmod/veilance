import ProjectCard from "../components/ProjectCard";
import { Escrow, UserRole } from "../../types";

interface RecentProjectsProps {
  projects: Escrow[];
  userRole: UserRole;
  address: string;
  onMilestoneSubmit: (id: string) => void;
  onMilestoneApprove: (id: string) => void;
  onViewAll: () => void;
}

export default function RecentProjects({
  projects,
  userRole,
  address,
  onMilestoneSubmit,
  onMilestoneApprove,
  onViewAll,
}: RecentProjectsProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Recent Projects</h3>
        <button onClick={onViewAll} className="text-sm text-purple-400 hover:text-purple-300">
          View All →
        </button>
      </div>
      <div className="space-y-4">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            userRole={userRole}
            userAddress={address}
            onMilestoneSubmit={onMilestoneSubmit}
            onMilestoneApprove={onMilestoneApprove}
          />
        ))}
        {projects.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No projects yet. {userRole === "client" ? "Create your first project!" : "Start applying for projects!"}
          </div>
        )}
      </div>
    </>
  );
}