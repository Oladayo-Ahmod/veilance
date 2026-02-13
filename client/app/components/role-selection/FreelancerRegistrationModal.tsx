import GlassCard from "../ui/GlassCard";

interface FreelancerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  onRegister: () => void;
  loading: boolean;
}

export default function FreelancerRegistrationModal({
  isOpen,
  onClose,
  skills,
  onAddSkill,
  onRemoveSkill,
  onRegister,
  loading,
}: FreelancerRegistrationModalProps) {
  if (!isOpen) return null;

  const handleAddSkill = (input: HTMLInputElement) => {
    if (input.value) {
      onAddSkill(input.value);
      input.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <GlassCard className="max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Register as Freelancer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Skills (up to 5)</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill, index) => (
                <div key={index} className="flex items-center px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full">
                  <span>{skill}</span>
                  <button onClick={() => onRemoveSkill(skill)} className="ml-2 text-white/70 hover:text-white">
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add a skill (e.g., React, Solidity)"
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddSkill(e.target as HTMLInputElement);
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                  handleAddSkill(input);
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-400">
            <p>Popular skills: Web3, Frontend, Smart Contracts, Design, Marketing</p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button onClick={onClose} className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              Cancel
            </button>
            <button
              onClick={onRegister}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Registering..." : "Complete Registration"}
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}