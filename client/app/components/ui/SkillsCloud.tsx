interface SkillsCloudProps {
  skills: string[];
}

export default function SkillsCloud({ skills }: SkillsCloudProps) {
  const colors = [
    'from-purple-600 to-pink-600',
    'from-blue-600 to-cyan-600',
    'from-green-600 to-emerald-600',
    'from-orange-600 to-red-600',
    'from-indigo-600 to-purple-600',
  ];

  if (skills.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-3xl mb-2">🎯</div>
        <p>No skills added yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {skills.map((skill, index) => (
        <div
          key={skill}
          className={`
            px-4 py-2 rounded-full cursor-pointer transition-all duration-300
            hover:scale-110 bg-gradient-to-r ${colors[index % colors.length]}
          `}
          style={{
            animationDelay: `${index * 100}ms`
          }}
        >
          <span className="text-sm font-medium">{skill}</span>
        </div>
      ))}
    </div>
  );
}