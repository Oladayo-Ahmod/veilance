"use client";

import WalletConnect from "../ui/WalletConnect";

type TabType = "dashboard" | "projects" | "create" | "profile" | "freelancers";

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userRole: "client" | "freelancer" | null;
  connected: boolean;
}

export default function Header({ activeTab, setActiveTab, userRole, connected }: HeaderProps) {
  // Define tabs based on user role
  const getTabs = () => {
    const baseTabs = ["dashboard", "projects", "profile"];
    
    if (userRole === "client") {
      // Clients see "freelancers" and "create project"
      return [...baseTabs, "freelancers", "create"];
    } else if (userRole === "freelancer") {
      // Freelancers see "find work" 
      return [...baseTabs, "create"];
    }
    
    return baseTabs;
  };

  const getTabLabel = (tab: string) => {
    if (tab === "create") {
      return userRole === "client" ? "Create Project" : "Find Work";
    }
    if (tab === "freelancers") {
      return "Find Freelancers";
    }
    return tab;
  };

  const tabs = getTabs();

  return (
    <header className="glassmorphism sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-xl font-bold">V</span>
            </div>
            <h1 className="text-2xl font-bold text-gradient">Veilance</h1>
            <span className="px-2 py-1 text-xs bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full border border-white/10">
              Aleo Private Freelancing
            </span>
          </div>

          {/* Navigation and Wallet */}
          <div className="flex items-center space-x-4">
            {connected && userRole && (
              <nav className="hidden md:flex space-x-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as TabType)}
                    className={`capitalize px-4 py-2 rounded-lg transition-all ${
                      activeTab === tab 
                        ? "bg-gradient-to-r from-purple-600 to-blue-600" 
                        : "hover:bg-white/5"
                    }`}
                  >
                    {getTabLabel(tab)}
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