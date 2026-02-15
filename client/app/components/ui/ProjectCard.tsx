import { useState } from "react";

interface ProjectCardProps {
  project: {
    id: string;
    description: string;
    amount: number;
    status: string;
    milestones: number;
    currentMilestone: number;
    milestoneSubmitted: boolean;
  };
  userRole: 'client' | 'freelancer';
  userAddress: string;
  onMilestoneSubmit: (escrowId: string) => void;
  onMilestoneApprove: (escrowId: string) => void;
  loading?: boolean;
}

export default function ProjectCard({ 
  project, 
  userRole, 
  userAddress,
  onMilestoneSubmit,
  onMilestoneApprove,
  loading: globalLoading 
}: ProjectCardProps) {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);

  const statusColors = {
    active: 'bg-green-500/20 text-green-400',
    completed: 'bg-blue-500/20 text-blue-400',
    disputed: 'bg-red-500/20 text-red-400'
  };

  const progress = (project.currentMilestone / project.milestones) * 100;

  const handleSubmit = async () => {
    setSubmitLoading(true);
    try {
      await onMilestoneSubmit(project.id);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleApprove = async () => {
    setApproveLoading(true);
    try {
      await onMilestoneApprove(project.id);
    } finally {
      setApproveLoading(false);
    }
  };

  const isLoading = submitLoading || approveLoading || globalLoading;

  return (
    <div className="glassmorphism-dark rounded-xl p-6 hover:bg-white/5 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold mb-2">{project.description}</h4>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span className="px-3 py-1 bg-white/10 rounded-full">
              {project.amount} ALEO
            </span>
            <span>•</span>
            <span className={`px-3 py-1 rounded-full ${statusColors[project.status as keyof typeof statusColors]}`}>
              {project.status}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400 mb-1">Progress</div>
          <div className="flex items-center">
            <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden mr-2">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-bold">{project.currentMilestone}/{project.milestones}</span>
          </div>
        </div>
      </div>
      
      {/* Milestone Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Milestones</span>
          <span>{project.currentMilestone} of {project.milestones} completed</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: project.milestones }).map((_, index) => (
            <div 
              key={index}
              className={`h-2 rounded-full ${
                index < project.currentMilestone 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Action Buttons */}
      {project.status === 'active' && (
        <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
          {userRole === 'freelancer' && 
           project.currentMilestone < project.milestones && 
           !project.milestoneSubmitted && (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold 
                transition-all flex items-center space-x-2
                ${isLoading 
                  ? 'bg-blue-600/50 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90'
                }
              `}
            >
              {submitLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Milestone {project.currentMilestone + 1}</span>
              )}
            </button>
          )}
          
          {userRole === 'freelancer' && project.milestoneSubmitted && (
            <div className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm flex items-center space-x-2">
              <span>⏳</span>
              <span>Waiting for client approval</span>
            </div>
          )}
          
          {userRole === 'client' && project.milestoneSubmitted && (
            <button
              onClick={handleApprove}
              disabled={isLoading}
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold 
                transition-all flex items-center space-x-2
                ${isLoading 
                  ? 'bg-green-600/50 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90'
                }
              `}
            >
              {approveLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Processing...</span>
                </>
              ) : (
                <span>Approve & Release Payment</span>
              )}
            </button>
          )}
          
          {userRole === 'client' && !project.milestoneSubmitted && (
            <div className="px-4 py-2 bg-white/10 rounded-lg text-sm flex items-center space-x-2">
              <span>⏳</span>
              <span>Waiting for freelancer submission</span>
            </div>
          )}
        </div>
      )}

      {/* Completed Status */}
      {project.status === 'completed' && (
        <div className="flex justify-end pt-4 border-t border-white/10">
          <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm flex items-center space-x-2">
            <span>✅</span>
            <span>Project Completed</span>
          </div>
        </div>
      )}

      {/* Disputed Status */}
      {project.status === 'disputed' && (
        <div className="flex justify-end pt-4 border-t border-white/10">
          <div className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm flex items-center space-x-2">
            <span>⚠️</span>
            <span>Dispute Resolution</span>
          </div>
        </div>
      )}
    </div>
  );
}