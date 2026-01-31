interface ProjectCardProps {
  project: {
    id: string;
    description: string;
    amount: number;
    status: string;
    milestones: number;
    currentMilestone: number;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const statusColors = {
    active: 'bg-green-500/20 text-green-400',
    completed: 'bg-blue-500/20 text-blue-400',
    disputed: 'bg-red-500/20 text-red-400'
  };

  return (
    <div className="glassmorphism-dark rounded-xl p-4 hover:bg-white/5 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold truncate">{project.description}</h4>
        <span className={`px-3 py-1 text-xs rounded-full ${statusColors[project.status as keyof typeof statusColors]}`}>
          {project.status}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-400">Amount</p>
          <p className="font-bold">{project.amount} ALEO</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Milestones</p>
          <p className="font-bold">{project.currentMilestone}/{project.milestones}</p>
        </div>
      </div>
    </div>
  );
}