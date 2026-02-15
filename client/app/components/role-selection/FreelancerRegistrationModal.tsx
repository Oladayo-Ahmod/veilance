import GlassCard from "../ui/GlassCard";
import { useState } from "react";

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
  const [skillInput, setSkillInput] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAddSkill = () => {
    const trimmedSkill = skillInput.trim();
    
    // Validation checks
    if (!trimmedSkill) {
      setError("Please enter a skill");
      return;
    }

    if (skills.length >= 5) {
      setError("Maximum 5 skills allowed");
      return;
    }

    if (skills.includes(trimmedSkill)) {
      setError("Skill already added");
      return;
    }

    if (trimmedSkill.length > 30) {
      setError("Skill name too long (max 30 characters)");
      return;
    }

    // Add skill
    onAddSkill(trimmedSkill);
    setSkillInput("");
    setError("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddSkill();
    }
  };

  const handleClose = () => {
    setSkillInput("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <GlassCard className="max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Register as Freelancer</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Skills <span className="text-gray-400">({skills.length}/5)</span>
            </label>
            
            {/* Skills display */}
            <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
              {skills.map((skill, index) => (
                <div key={index} className="flex items-center px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full">
                  <span>{skill}</span>
                  <button 
                    onClick={() => onRemoveSkill(skill)} 
                    className="ml-2 text-white/70 hover:text-white"
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              ))}
              {skills.length === 0 && (
                <p className="text-sm text-gray-500">No skills added yet</p>
              )}
            </div>

            {/* Skill input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => {
                  setSkillInput(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                placeholder="Add a skill (e.g., React, Solidity)"
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
                disabled={skills.length >= 5 || loading}
              />
              <button
                onClick={handleAddSkill}
                disabled={skills.length >= 5 || !skillInput.trim() || loading}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  skills.length >= 5 || !skillInput.trim() || loading
                    ? "bg-white/5 cursor-not-allowed opacity-50"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                Add
              </button>
            </div>

            {/* Error message */}
            {error && (
              <p className="mt-2 text-sm text-red-400 flex items-center">
                <span className="mr-1">⚠️</span>
                {error}
              </p>
            )}

            {/* Max skills warning */}
            {skills.length >= 5 && (
              <p className="mt-2 text-sm text-yellow-400/70 flex items-center">
                <span className="mr-1">⚠️</span>
                Maximum skills limit reached (5/5)
              </p>
            )}
          </div>

          <div className="text-sm text-gray-400">
            <p>Popular skills: Web3, Frontend, Smart Contracts, Design, Marketing</p>
          </div>

          {/* Validation summary */}
          <div className="text-xs text-gray-500">
            <p>Requirements:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li className={skills.length > 0 ? "text-green-400" : ""}>
                ✓ At least 1 skill required
              </li>
              <li className={skills.length <= 5 ? "text-green-400" : "text-red-400"}>
                {skills.length <= 5 ? "✓" : "✗"} Maximum 5 skills allowed
              </li>
              <li className={skills.every(s => s.length <= 30) ? "text-green-400" : ""}>
                ✓ Each skill max 30 characters
              </li>
            </ul>
          </div>

          <div className="flex space-x-3 pt-4">
            <button 
              onClick={handleClose} 
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={onRegister}
              disabled={loading || skills.length === 0 || skills.length > 5}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                loading || skills.length === 0 || skills.length > 5
                  ? "bg-gray-600/50 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:opacity-90"
              }`}
            >
              {loading ? "Registering..." : "Complete Registration"}
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}