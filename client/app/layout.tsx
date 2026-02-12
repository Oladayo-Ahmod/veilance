"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { AleoWalletProvider } from "@provablehq/aleo-wallet-adaptor-react";
import { WalletModalProvider } from "@provablehq/aleo-wallet-adaptor-react-ui";
import { LeoWalletAdapter } from "@provablehq/aleo-wallet-adaptor-leo";
import "@provablehq/aleo-wallet-adaptor-react-ui/dist/styles.css";
import { ShieldWalletAdapter } from "@provablehq/aleo-wallet-adaptor-shield";
import { Network } from '@provablehq/aleo-types';
import { DecryptPermission } from '@provablehq/aleo-wallet-adaptor-core';
import { useMemo } from "react";

const inter = Inter({ subsets: ["latin"] });
const programName = "freelancing_platform_v1.aleo";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const wallets = useMemo(() => {
    return [new LeoWalletAdapter(), new ShieldWalletAdapter()];
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        <AleoWalletProvider
          wallets={wallets}
          network={Network.TESTNET}
          autoConnect={false}
          decryptPermission={DecryptPermission.UponRequest}
          programs={[programName]}
          onError={(error) => console.error(error)}
        >
          <WalletModalProvider>
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
              {children}
            </div>
          </WalletModalProvider>
        </AleoWalletProvider>
      </body>
    </html>
  );
}