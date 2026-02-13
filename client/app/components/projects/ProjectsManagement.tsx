import GlassCard from "../ui/GlassCard";
import ProjectItem from "./ProjectItem";
import { Escrow, UserRole } from "../../types";

interface ProjectsManagementProps {
  projects: Escrow[];
  userRole: UserRole;
  address: string;
  loading: boolean;
  onMilestoneSubmit: (id: string) => void;
  onMilestoneApprove: (id: string) => void;
  onCreateNew: () => void;
}

export default function ProjectsManagement({
  projects,
  userRole,
  address,
  loading,
  onMilestoneSubmit,
  onMilestoneApprove,
  onCreateNew,
}: ProjectsManagementProps) {
  return (
    <GlassCard>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Projects</h2>
        {userRole === "client" && (
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:opacity-90 transition-opacity"
          >
            + New Project
          </button>
        )}
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <ProjectItem
            key={project.id}
            project={project}
            userRole={userRole}
            address={address}
            onMilestoneSubmit={onMilestoneSubmit}
            onMilestoneApprove={onMilestoneApprove}
            loading={loading}
          />
        ))}

        {projects.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-lg mb-2">No projects yet</p>
            <p className="text-sm">
              Get started by {userRole === "client" ? "creating a project" : "applying for available work"}
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}