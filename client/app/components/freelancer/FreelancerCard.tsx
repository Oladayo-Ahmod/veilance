interface FreelancerCardProps {
  freelancer: {
    address: string;
    skills: string[];
    rating: number;
    completedProjects: number;
    earnedBalance: number;
  };
  onHire: (address: string) => void;
}

export default function FreelancerCard({ freelancer, onHire }: FreelancerCardProps) {
  return (
    <div className="glassmorphism-dark rounded-xl p-6 hover:border-purple-500/50 transition-all">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-xl">💻</span>
            </div>
            <div>
              <h3 className="font-mono text-sm">
                {freelancer.address.slice(0, 8)}...{freelancer.address.slice(-6)}
              </h3>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-yellow-400">⭐</span>
                <span>{freelancer.rating.toFixed(1)}</span>
                <span className="text-gray-400">•</span>
                <span>{freelancer.completedProjects} projects</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {freelancer.skills.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-white/10 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10">
            <span className="text-sm text-gray-400">Total Earned</span>
            <p className="font-bold text-green-400">{freelancer.earnedBalance.toFixed(2)} ALEO</p>
          </div>
        </div>

        <button
          onClick={() => onHire(freelancer.address)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          Hire Directly
        </button>
      </div>
    </div>
  );
}