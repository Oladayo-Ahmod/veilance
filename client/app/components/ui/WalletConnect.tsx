"use client";

import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";
import { WalletMultiButton } from "@provablehq/aleo-wallet-adaptor-react-ui";

export default function WalletConnect() {
  const { connected, address } = useWallet();

  return (
    <div className="relative">
      <WalletMultiButton 
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          padding: '12px 24px',
          fontWeight: '600',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
        }}
      />
      {/* {connected && address && (
        <div className="absolute top-full mt-2 right-0 glassmorphism rounded-lg p-3 min-w-[200px] animate-in slide-in-from-top">
          <div className="text-xs text-gray-400 mb-1">Connected as</div>
          <div className="font-mono text-sm truncate">{address}</div>
          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="flex items-center text-xs text-green-400">
              <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
              Connected to Aleo Testnet
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}