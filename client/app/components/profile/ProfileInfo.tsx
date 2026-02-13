import { UserStats, UserRole } from "../../types";
import SkillsManager from "./SkillsManager";
import StatsSummary from "./StatsSummary";

interface ProfileInfoProps {
  address: string | undefined;
  userRole: UserRole;
  userStats: UserStats;
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  showSkillsInput: boolean;
  setShowSkillsInput: (show: boolean) => void;
}

export default function ProfileInfo({
  address,
  userRole,
  userStats,
  onAddSkill,
  onRemoveSkill,
  showSkillsInput,
  setShowSkillsInput,
}: ProfileInfoProps) {
  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onAddSkill((e.target as HTMLInputElement).value);
      (e.target as HTMLInputElement).value = "";
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Your Profile</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Wallet Address</h3>
          <p className="font-mono text-sm bg-white/5 p-3 rounded-lg">{address}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Role</h3>
          <div
            className={`inline-flex items-center px-4 py-2 rounded-full ${
              userRole === "client" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
            }`}
          >
            <span className="mr-2">{userRole === "client" ? "👔" : "💻"}</span>
            {userRole === "client" ? "Client" : "Freelancer"}
          </div>
        </div>

        {userRole === "freelancer" && (
          <SkillsManager
            skills={userStats.skills}
            showInput={showSkillsInput}
            setShowInput={setShowSkillsInput}
            onAddSkill={onAddSkill}
            onRemoveSkill={onRemoveSkill}
          />
        )}

        <StatsSummary userStats={userStats} />
      </div>
    </>
  );
}