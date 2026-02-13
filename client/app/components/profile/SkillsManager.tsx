interface SkillsManagerProps {
  skills: string[];
  showInput: boolean;
  setShowInput: (show: boolean) => void;
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
}

export default function SkillsManager({ skills, showInput, setShowInput, onAddSkill, onRemoveSkill }: SkillsManagerProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Your Skills</h3>
        <button onClick={() => setShowInput(!showInput)} className="text-sm text-purple-400 hover:text-purple-300">
          + Add Skill
        </button>
      </div>

      {showInput && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Add a skill (e.g., React, Solidity)"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg mb-2 focus:outline-none focus:border-purple-500"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                onAddSkill((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = "";
              }
            }}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <div key={index} className="flex items-center px-3 py-1 bg-white/10 rounded-full">
            <span>{skill}</span>
            <button onClick={() => onRemoveSkill(skill)} className="ml-2 text-gray-400 hover:text-white">
              ×
            </button>
          </div>
        ))}
        {skills.length === 0 && <p className="text-gray-400">No skills added yet</p>}
      </div>
    </div>
  );
}