"use client"
import GlassCard from "../ui/GlassCard";
import ProfileInfo from "./ProfileInfo";
import QuickActions from "./QuickActions";
import WithdrawModal from "./WithdrawModal";
import { UserStats, UserRole } from "../../types";
import { useState } from "react";

interface ProfileProps {
  address: string | undefined;
  userRole: UserRole;
  userStats: UserStats;
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  showSkillsInput: boolean;
  setShowSkillsInput: (show: boolean) => void;
   onWithdrawFunds: (amount : string) => void;  
     withdrawAmount?: string; 
  onCreateProject: () => void;
  onAddFunds: () => void;
  onBrowseProjects: () => void;
  loading?: boolean;
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
    onWithdrawFunds, 
    withdrawAmount, 
  onBrowseProjects,
  loading
}: ProfileProps) {

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const handleWithdrawClick = () => {
    if (userStats.totalEarned <= 0) {
      // Show notification if balance is zero
      alert("You have no funds to withdraw");
      return;
    }
    setShowWithdrawModal(true);
  };
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
           onWithdrawFunds={handleWithdrawClick} 
          userRole={userRole}
          onCreateProject={onCreateProject}
          onAddFunds={onAddFunds}
          onBrowseProjects={onBrowseProjects}
          onUpdateSkills={() => setShowSkillsInput(true)}
        />
      </GlassCard>

       <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onWithdraw={onWithdrawFunds}
        maxAmount={userStats.totalEarned}
        loading={loading}
      />
    </div>
  );
}