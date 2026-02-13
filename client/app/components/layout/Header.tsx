"use client";

import WalletConnect from "../ui/WalletConnect";

interface HeaderProps {
  activeTab: "dashboard" | "projects" | "create" | "profile";
  setActiveTab: (tab: "dashboard" | "projects" | "create" | "profile") => void;
  userRole: "client" | "freelancer" | null;
  connected: boolean;
}

export default function Header({ activeTab, setActiveTab, userRole, connected }: HeaderProps) {
  return (
    <header className="glassmorphism sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-xl font-bold">V</span>
            </div>
            <h1 className="text-2xl font-bold text-gradient">Veilance</h1>
            <span className="px-2 py-1 text-xs bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full border border-white/10">
              Aleo Private Freelancing
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {connected && userRole && (
              <nav className="hidden md:flex space-x-2">
                {["dashboard", "projects", "create", "profile"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`capitalize px-4 py-2 rounded-lg transition-all ${
                      activeTab === tab ? "bg-gradient-to-r from-purple-600 to-blue-600" : "hover:bg-white/5"
                    }`}
                  >
                    {tab === "create" ? (userRole === "client" ? "Create Project" : "Find Work") : tab}
                  </button>
                ))}
              </nav>
            )}
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  );
}