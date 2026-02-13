interface ClientRegistrationProps {
  onRegister: () => void;
  loading: boolean;
  loadingAction: string | null;
}

export default function ClientRegistration({ onRegister, loading, loadingAction }: ClientRegistrationProps) {
  return (
    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
        <span className="text-2xl">👔</span>
      </div>
      <h3 className="text-xl font-bold mb-2">Client</h3>
      <p className="text-gray-300 mb-4">Hire freelancers securely with private escrow</p>
      <button
        onClick={onRegister}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loadingAction === "register-client" ? "Registering..." : "Register as Client"}
      </button>
    </div>
  );
}