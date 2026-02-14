"use client";

import { useState, useEffect } from "react";
import FreelancerCard from "./FreelancerCard";
import FreelancerFilters from "./FreelancerFilters";

interface Freelancer {
  address: string;
  skills: string[];
  rating: number;
  completedProjects: number;
  earnedBalance: number;
}

interface FreelancerListingProps {
  freelancers: Freelancer[];
  onHire: (address: string) => void;
  loading?: boolean;
}

export default function FreelancerListing({ freelancers, onHire, loading }: FreelancerListingProps) {
  const [filteredFreelancers, setFilteredFreelancers] = useState<Freelancer[]>(freelancers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("rating");

  // Get all unique skills
  const allSkills = Array.from(new Set(freelancers.flatMap(f => f.skills))).sort();

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...freelancers];

    // Apply search (by address or skills)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f => 
        f.address.toLowerCase().includes(query) ||
        f.skills.some(s => s.toLowerCase().includes(query))
      );
    }

    // Apply skills filter (AND condition - must have all selected skills)
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(f => 
        selectedSkills.every(skill => f.skills.includes(skill))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "projects":
          return b.completedProjects - a.completedProjects;
        case "earned":
          return b.earnedBalance - a.earnedBalance;
        default:
          return 0;
      }
    });

    setFilteredFreelancers(filtered);
  }, [freelancers, searchQuery, selectedSkills, sortBy]);

  const handleSkillToggle = (skill: string) => {
    if (skill === 'clear') {
      setSelectedSkills([]);
      return;
    }
    
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        <p className="mt-4 text-gray-400">Loading freelancers...</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <FreelancerFilters
          skills={allSkills}
          selectedSkills={selectedSkills}
          onSkillToggle={handleSkillToggle}
          onSearch={setSearchQuery}
          onSortChange={setSortBy}
        />
      </div>

      {/* Freelancer Grid */}
      <div className="lg:col-span-3">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Available Freelancers</h2>
          <p className="text-gray-400">
            {filteredFreelancers.length} freelancer{filteredFreelancers.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {filteredFreelancers.length === 0 ? (
          <div className="glassmorphism-dark rounded-xl text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg mb-2">No freelancers found</p>
            <p className="text-sm text-gray-400">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFreelancers.map((freelancer) => (
              <FreelancerCard
                key={freelancer.address}
                freelancer={freelancer}
                onHire={onHire}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}