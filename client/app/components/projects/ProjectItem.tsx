import { Escrow, UserRole } from "../../types";

interface ProjectItemProps {
  project: Escrow;
  userRole: UserRole;
  address: string;
  onMilestoneSubmit: (id: string) => void;
  onMilestoneApprove: (id: string) => void;
  loading: boolean;
}

export default function ProjectItem({
  project,
  userRole,
  address,
  onMilestoneSubmit,
  onMilestoneApprove,
  loading,
}: ProjectItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400";
      case "completed":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-red-500/20 text-red-400";
    }
  };

  return (
    <div className="glassmorphism-dark rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold mb-2">{project.description}</h4>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>Amount: {project.amount} ALEO</span>
            <span>•</span>
            <span>
              Status:{" "}
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Milestone</p>
          <p className="font-bold">
            {project.currentMilestone}/{project.milestones}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        <div className="text-sm">
          <p className="text-gray-400">With:</p>
          <p className="font-mono">{userRole === "client" ? project.freelancer : project.client}</p>
        </div>

        {project.status === "active" && (
          <div className="space-x-2">
            {userRole === "freelancer" && project.currentMilestone < project.milestones && !project.milestoneSubmitted && (
              <button
                onClick={() => onMilestoneSubmit(project.id)}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
              >
                Submit Milestone
              </button>
            )}
            {userRole === "client" && project.milestoneSubmitted && (
              <button
                onClick={() => onMilestoneApprove(project.id)}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
              >
                Approve & Pay
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}