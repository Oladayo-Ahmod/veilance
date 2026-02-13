import { UserRole } from "../../types";
import ActionButton from "./ActionButton";

interface QuickActionsProps {
  userRole: UserRole;
  onCreateProject: () => void;
  onAddFunds: () => void;
  onBrowseProjects: () => void;
  onUpdateSkills: () => void;
  onWithdrawFunds: () => void;  
}

export default function QuickActions({
  userRole,
  onCreateProject,
  onAddFunds,
  onBrowseProjects,
  onUpdateSkills,
  onWithdrawFunds
}: QuickActionsProps) {
  return (
    <>
      <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {userRole === "client" ? (
          <>
            <ActionButton
              title="Create New Project"
              description="Start a new escrow with a freelancer"
              onClick={onCreateProject}
              gradient="from-purple-600 to-blue-600"
            />
            <ActionButton
              title="Add Funds"
              description="Deposit ALEO to your escrow balance"
              onClick={onAddFunds}
              isSecondary
            />
            <ActionButton
              title="Withdraw Funds"
              description="Withdraw ALEO from your balance"
              onClick={onWithdrawFunds}  // This will open the modal
              gradient="from-orange-600 to-red-600"
            />
          </>
        ) : (
          <>
            <ActionButton
              title="Browse Projects"
              description="Find available work opportunities"
              onClick={onBrowseProjects}
              gradient="from-blue-600 to-cyan-600"
            />
            <ActionButton 
              title="Update Skills" 
              description="Add new skills to your profile" 
              onClick={onUpdateSkills} 
              isSecondary 
            />
          </>
        )}
      </div>
    </>
  );
}