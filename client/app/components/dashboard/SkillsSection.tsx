import GlassCard from "../components/GlassCard";
import SkillsCloud from "../components/SkillsCloud";

interface SkillsSectionProps {
  skills: string[];
  userRole: "client" | "freelancer" | null;
  onEditProfile: () => void;
}

export default function SkillsSection({ skills, userRole, onEditProfile }: SkillsSectionProps) {
  return (
    <GlassCard>
      <h3 className="text-xl font-bold mb-4">Your Skills</h3>
      <SkillsCloud skills={skills} />
      {userRole === "freelancer" && skills.length === 0 && (
        <button onClick={onEditProfile} className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
          Add Skills
        </button>
      )}
    </GlassCard>
  );
}