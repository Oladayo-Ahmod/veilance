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
}

export default function ProjectCard({ 
  project, 
  userRole, 
  userAddress,
  onMilestoneSubmit,
  onMilestoneApprove 
}: ProjectCardProps) {
  const statusColors = {
    active: 'bg-green-500/20 text-green-400',
    completed: 'bg-blue-500/20 text-blue-400',
    disputed: 'bg-red-500/20 text-red-400'
  };

  const progress = (project.currentMilestone / project.milestones) * 100;

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
              onClick={() => onMilestoneSubmit(project.id)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Submit Milestone {project.currentMilestone + 1}
            </button>
          )}
          
          {userRole === 'freelancer' && project.milestoneSubmitted && (
            <div className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
              ⏳ Waiting for client approval
            </div>
          )}
          
          {userRole === 'client' && project.milestoneSubmitted && (
            <button
              onClick={() => onMilestoneApprove(project.id)}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Approve & Release Payment
            </button>
          )}
          
          {userRole === 'client' && !project.milestoneSubmitted && (
            <div className="px-4 py-2 bg-white/10 rounded-lg text-sm">
              Waiting for freelancer submission
            </div>
          )}
        </div>
      )}
    </div>
  );
}