interface FreelancerRegistrationProps {
  onOpenModal: () => void;
  loading: boolean;
}

export default function FreelancerRegistration({ onOpenModal, loading }: FreelancerRegistrationProps) {
  return (
    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/20">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
        <span className="text-2xl">💻</span>
      </div>
      <h3 className="text-xl font-bold mb-2">Freelancer</h3>
      <p className="text-gray-300 mb-4">Offer your skills with guaranteed payments</p>
      <button
        onClick={onOpenModal}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? "Registering..." : "Register as Freelancer"}
      </button>
    </div>
  );
}