import GlassCard from "../components/GlassCard";
import ProfileInfo from "./ProfileInfo";
import QuickActions from "./QuickActions";
import { UserStats, UserRole } from "../../types";

interface ProfileProps {
  address: string | undefined;
  userRole: UserRole;
  userStats: UserStats;
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  showSkillsInput: boolean;
  setShowSkillsInput: (show: boolean) => void;
  onCreateProject: () => void;
  onAddFunds: () => void;
  onBrowseProjects: () => void;
}

export default function Profile({
  address,
  userRole,
  userStats,
  onAddSkill,
  onRemoveSkill,
  showSkillsInput,
  setShowSkillsInput,
  onCreateProject,
  onAddFunds,
  onBrowseProjects,
}: ProfileProps) {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <GlassCard className="lg:col-span-2">
        <ProfileInfo
          address={address}
          userRole={userRole}
          userStats={userStats}
          onAddSkill={onAddSkill}
          onRemoveSkill={onRemoveSkill}
          showSkillsInput={showSkillsInput}
          setShowSkillsInput={setShowSkillsInput}
        />
      </GlassCard>

      <GlassCard>
        <QuickActions
          userRole={userRole}
          onCreateProject={onCreateProject}
          onAddFunds={onAddFunds}
          onBrowseProjects={onBrowseProjects}
          onUpdateSkills={() => setShowSkillsInput(true)}
        />
      </GlassCard>
    </div>
  );
}