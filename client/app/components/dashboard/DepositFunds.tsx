import GlassCard from "../ui/GlassCard";

interface DepositFundsProps {
  depositAmount: string;
  setDepositAmount: (amount: string) => void;
  onDeposit: () => void;
  loading: boolean;
}

export default function DepositFunds({ depositAmount, setDepositAmount, onDeposit, loading }: DepositFundsProps) {
  return (
    <GlassCard>
      <h3 className="text-xl font-bold mb-4">Deposit Funds</h3>
      <div className="space-y-4">
        <input
          type="number"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          placeholder="Amount in ALEO"
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={onDeposit}
          disabled={loading || !depositAmount}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Processing..." : "Deposit Funds"}
        </button>
      </div>
    </GlassCard>
  );
}