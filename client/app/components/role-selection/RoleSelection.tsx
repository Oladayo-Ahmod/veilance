import GlassCard from "../ui/GlassCard";
import ClientRegistration from "./ClientRegistration";
import FreelancerRegistration from "./FreelancerRegistration";

interface RoleSelectionProps {
  onRegisterClient: () => void;
  onOpenFreelancerModal: () => void;
  loading: boolean;
  loadingAction: string | null;
}

export default function RoleSelection({ onRegisterClient, onOpenFreelancerModal, loading, loadingAction }: RoleSelectionProps) {
  return (
    <GlassCard className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Role</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <ClientRegistration onRegister={onRegisterClient} loading={loading} loadingAction={loadingAction} />
        <FreelancerRegistration onOpenModal={onOpenFreelancerModal} loading={loading} />
      </div>
    </GlassCard>
  );
}