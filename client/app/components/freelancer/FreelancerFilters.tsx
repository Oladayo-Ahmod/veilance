import { useState } from "react";

interface FreelancerFiltersProps {
  skills: string[];
  selectedSkills: string[];
  onSkillToggle: (skill: string) => void;
  onSearch: (query: string) => void;
  onSortChange: (sort: string) => void;
}

export default function FreelancerFilters({
  skills,
  selectedSkills,
  onSkillToggle,
  onSearch,
  onSortChange,
}: FreelancerFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="glassmorphism-dark rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">Filter Freelancers</h3>
      
      {/* Search by address or skills */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by address or skill..."
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Sort options */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Sort By</label>
        <select
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
        >
          <option value="rating">Rating (Highest)</option>
          <option value="projects">Most Projects Completed</option>
          <option value="earned">Highest Earned</option>
        </select>
      </div>

      {/* Skills filter */}
      <div>
        <label className="block text-sm font-medium mb-2">Filter by Skills</label>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-white/5 rounded-lg">
          {skills.length > 0 ? (
            skills.map((skill) => (
              <button
                key={skill}
                onClick={() => onSkillToggle(skill)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedSkills.includes(skill)
                    ? "bg-gradient-to-r from-purple-600 to-blue-600"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {skill}
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-400 p-2">No skills available</p>
          )}
        </div>
        {selectedSkills.length > 0 && (
          <button
            onClick={() => onSkillToggle('clear')}
            className="mt-2 text-xs text-purple-400 hover:text-purple-300"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}