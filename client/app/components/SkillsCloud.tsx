import { useEffect, useState } from 'react';

const skills = [
  'Solidity', 'React', 'TypeScript', 'Zero-Knowledge', 'Aleo',
  'Smart Contracts', 'Web3', 'Frontend', 'Backend', 'Security',
  'Cryptography', 'DeFi', 'NFT', 'DAO', 'Layer 2'
];

export default function SkillsCloud() {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {skills.map((skill, index) => (
        <div
          key={skill}
          className={`
            px-4 py-2 rounded-full cursor-pointer transition-all duration-300
            ${hoveredSkill === skill 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 scale-110' 
              : 'bg-white/10 hover:bg-white/20'
            }
          `}
          style={{
            animationDelay: `${index * 100}ms`
          }}
          onMouseEnter={() => setHoveredSkill(skill)}
          onMouseLeave={() => setHoveredSkill(null)}
        >
          <span className="text-sm font-medium">{skill}</span>
        </div>
      ))}
    </div>
  );
}