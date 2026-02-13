import { useState, useEffect } from "react";
import GlassCard from "../ui/GlassCard";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: string) => void;
  maxAmount: number;
  loading?: boolean;
}

export default function WithdrawModal({ 
  isOpen, 
  onClose, 
  onWithdraw, 
  maxAmount, 
  loading 
}: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setError("");
    }
  }, [isOpen]);

  const handleWithdraw = () => {
    const numAmount = parseFloat(amount);
    
    // Validation
    if (!amount || numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    
    if (numAmount > maxAmount) {
      setError(`Insufficient balance. Max: ${maxAmount.toFixed(2)} ALEO`);
      return;
    }
    
    onWithdraw(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <GlassCard className="max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Withdraw Funds</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white text-xl"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Amount to Withdraw (ALEO)
            </label>
            
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                max={maxAmount}
                className={`w-full px-4 py-3 bg-white/5 border rounded-lg focus:outline-none text-lg ${
                  error 
                    ? "border-red-500/50 focus:border-red-500" 
                    : "border-white/10 focus:border-purple-500"
                }`}
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Balance and Max button */}
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-400">
                Available: {maxAmount.toFixed(2)} ALEO
              </span>
              <button
                onClick={() => {
                  setAmount(maxAmount.toString());
                  setError("");
                }}
                className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
                disabled={loading}
              >
                MAX
              </button>
            </div>

            {/* Error message */}
            {error && (
              <p className="mt-3 text-sm text-red-400 flex items-center bg-red-500/10 p-2 rounded">
                <span className="mr-2">⚠️</span>
                {error}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleWithdraw}
              disabled={loading || !amount || !!error}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                !loading && amount && !error
                  ? "bg-gradient-to-r from-orange-600 to-red-600 hover:opacity-90"
                  : "bg-gray-600/50 cursor-not-allowed opacity-50"
              }`}
            >
              {loading ? "Processing..." : "Withdraw"}
            </button>
          </div>

          {/* Warning for large withdrawals */}
          {parseFloat(amount) > maxAmount * 0.8 && parseFloat(amount) <= maxAmount && (
            <p className="text-xs text-yellow-400/70 text-center">
              ⚠️ You're withdrawing a large amount. Please verify.
            </p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}