"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";
import WalletConnect from "./components/WalletConnect";
import GlassCard from "./components/GlassCard";
import StatsCard from "./components/StatsCard";
import ProjectCard from "./components/ProjectCard";
import SkillsCloud from "./components/SkillsCloud";
import * as THREE from 'three';
import { createSupabaseClient } from "./lib/supabase";
import { aleoClient } from "./lib/aleo";

type UserRole = 'client' | 'freelancer' | null;
type EscrowStatus = 'active' | 'completed' | 'disputed';

interface Escrow {
  id: string;
  client: string;
  freelancer: string;
  amount: number;
  milestones: number;
  currentMilestone: number;
  description: string;
  status: EscrowStatus;
  createdAt: string;
}

export default function Home() {
  const { connected, address, executeTransaction, requestRecords, transactionStatus } = useWallet();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'escrow' | 'profile'>('dashboard');
  const [balance, setBalance] = useState(0);
  const [projects, setProjects] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  
  // 3D Background Effect
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      alpha: true,
      antialias: true 
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x667eea,
      transparent: true,
      opacity: 0.6
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);
      particlesMesh.rotation.x += 0.0005;
      particlesMesh.rotation.y += 0.0005;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Initialize user
  useEffect(() => {
    if (connected && address) {
      checkUserRegistration();
      loadProjects();
    }
  }, [connected, address]);

  const checkUserRegistration = async () => {
    try {
      const records = await requestRecords?.("freelancing_platform.aleo", false);
      // Logic to check if user is registered as client or freelancer
      // This would involve checking records and supabase data
    } catch (error) {
      console.error("Error checking registration:", error);
    }
  };

  const loadProjects = async () => {
    if (!address) return;
    
    const supabase = createSupabaseClient();
    const { data } = await supabase
      .from('escrows')
      .select('*')
      .or(`client.eq.${address},freelancer.eq.${address}`)
      .order('created_at', { ascending: false });
    
    setProjects(data || []);
  };

  const registerAsClient = async () => {
    if (!executeTransaction) return;
    
    setLoading(true);
    try {
      const tx = await executeTransaction({
        program: "freelancing_platform.aleo",
        function: "register_client",
        inputs: [],
        fee: 100000,
        privateFee: false,
      });

      if (tx?.transactionId) {
        await pollTransaction(tx.transactionId);
        setUserRole('client');
        showNotification("Successfully registered as client!");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      showNotification(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const registerAsFreelancer = async (skills: string[]) => {
    if (!executeTransaction) return;
    
    setLoading(true);
    try {
      // Convert skills to field array format
      const skillFields = skills.map(skill => `"${skill}"field`).join(',');
      
      const tx = await executeTransaction({
        program: "freelancing_platform.aleo",
        function: "register_freelancer",
        inputs: [`[${skillFields}]`],
        fee: 100000,
        privateFee: false,
      });

      if (tx?.transactionId) {
        await pollTransaction(tx.transactionId);
        setUserRole('freelancer');
        
        // Store in Supabase
        const supabase = createSupabaseClient();
        await supabase.from('freelancers').upsert({
          address: address,
          skills: skills,
          rating: 5,
          completed_projects: 0
        });
        
        showNotification("Successfully registered as freelancer!");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      showNotification(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createEscrow = async (payee: string, amount: number, milestones: number, description: string) => {
    if (!executeTransaction || !address) return;
    
    setLoading(true);
    try {
      // First check client balance
      const clientRecords = await requestRecords?.("freelancing_platform.aleo", false);
      const clientRecord = clientRecords?.find((r: any) => 
        r.includes('owner') && r.includes(address)
      );
      
      if (!clientRecord) {
        showNotification("Client record not found");
        return;
      }

      const milestoneAmounts = `[${amount/2}u64, ${amount/2}u64]`; // Even split for 2 milestones
      
      const tx = await executeTransaction({
        program: "freelancing_platform.aleo",
        function: "create_escrow",
        inputs: [
          payee,
          `${amount}u64`,
          milestoneAmounts,
          `"${description}"field`,
          clientRecord
        ],
        fee: 200000,
        privateFee: false,
      });

      if (tx?.transactionId) {
        await pollTransaction(tx.transactionId);
        
        // Store in Supabase
        const supabase = createSupabaseClient();
        await supabase.from('escrows').insert({
          client: address,
          freelancer: payee,
          amount: amount,
          milestones: milestones,
          description: description,
          status: 'active'
        });
        
        showNotification("Escrow created successfully!");
        loadProjects();
      }
    } catch (error: any) {
      console.error("Create escrow error:", error);
      showNotification(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const submitMilestone = async (escrowId: string) => {
    if (!executeTransaction) return;
    
    setLoading(true);
    try {
      const tx = await executeTransaction({
        program: "freelancing_platform.aleo",
        function: "submit_milestone",
        inputs: [`${escrowId}field`],
        fee: 100000,
        privateFee: false,
      });

      if (tx?.transactionId) {
        await pollTransaction(tx.transactionId);
        showNotification("Milestone submitted for review!");
      }
    } catch (error: any) {
      console.error("Submit milestone error:", error);
      showNotification(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const approveMilestone = async (escrowId: string, escrowRecord: string, freelancerRecord: string) => {
    if (!executeTransaction) return;
    
    setLoading(true);
    try {
      const tx = await executeTransaction({
        program: "freelancing_platform.aleo",
        function: "approve_and_release",
        inputs: [
          `${escrowId}field`,
          escrowRecord,
          freelancerRecord
        ],
        fee: 150000,
        privateFee: false,
      });

      if (tx?.transactionId) {
        await pollTransaction(tx.transactionId);
        showNotification("Milestone approved and funds released!");
        loadProjects();
      }
    } catch (error: any) {
      console.error("Approve milestone error:", error);
      showNotification(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const pollTransaction = async (txId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const status = await transactionStatus?.(txId);
          if (!status) return;
          
          if (status.status !== 'pending') {
            clearInterval(interval);
            if (status.status === 'accepted') {
              resolve();
            } else {
              reject(new Error(`Transaction ${status.status}`));
            }
          }
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, 2000);
    });
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 5000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 3D Background */}
      <canvas 
        ref={canvasRef} 
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
      />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
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
                <nav className="hidden md:flex space-x-6">
                  {['dashboard', 'projects', 'escrow', 'profile'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`capitalize px-3 py-2 rounded-lg transition-all ${
                        activeTab === tab 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                          : 'hover:bg-white/5'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
                <WalletConnect />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="container mx-auto px-6 py-8">
          {!connected ? (
            <div className="text-center py-20">
              <h2 className="text-4xl font-bold mb-4">Welcome to Veilance</h2>
              <p className="text-xl text-gray-300 mb-8">
                Private, secure freelancing on the Aleo blockchain
              </p>
              <div className="max-w-md mx-auto">
                <WalletConnect />
              </div>
            </div>
          ) : !userRole ? (
            <GlassCard className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Role</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    <span className="text-2xl">👔</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Client</h3>
                  <p className="text-gray-300 mb-4">Hire freelancers securely with private escrow</p>
                  <button
                    onClick={registerAsClient}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? 'Registering...' : 'Register as Client'}
                  </button>
                </div>
                
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                    <span className="text-2xl">💻</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Freelancer</h3>
                  <p className="text-gray-300 mb-4">Offer your skills with guaranteed payments</p>
                  <button
                    onClick={() => registerAsFreelancer(['web3', 'frontend', 'smart-contracts'])}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? 'Registering...' : 'Register as Freelancer'}
                  </button>
                </div>
              </div>
            </GlassCard>
          ) : (
            <>
              {/* Dashboard */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatsCard 
                      title="Total Balance"
                      value={`${balance} ALEO`}
                      icon="💰"
                      trend="+12%"
                    />
                    <StatsCard 
                      title="Active Projects"
                      value={projects.filter(p => p.status === 'active').length.toString()}
                      icon="📊"
                      trend="+3"
                    />
                    <StatsCard 
                      title="Completion Rate"
                      value="98%"
                      icon="🎯"
                      trend="+2%"
                    />
                  </div>
                  
                  <div className="grid lg:grid-cols-3 gap-8">
                    <GlassCard className="lg:col-span-2">
                      <h3 className="text-xl font-bold mb-4">Recent Projects</h3>
                      <div className="space-y-4">
                        {projects.slice(0, 3).map((project) => (
                          <ProjectCard key={project.id} project={project} />
                        ))}
                      </div>
                    </GlassCard>
                    
                    <GlassCard>
                      <h3 className="text-xl font-bold mb-4">Top Skills</h3>
                      <SkillsCloud />
                    </GlassCard>
                  </div>
                </div>
              )}
              
              {/* Projects Management */}
              {activeTab === 'projects' && (
                <GlassCard>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Project Management</h2>
                    {userRole === 'client' && (
                      <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                        + New Escrow
                      </button>
                    )}
                  </div>
                  {/* Project list and management UI */}
                </GlassCard>
              )}
              
              {/* Create Escrow */}
              {activeTab === 'escrow' && userRole === 'client' && (
                <GlassCard className="max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold mb-6">Create New Escrow</h2>
                  {/* Escrow creation form */}
                </GlassCard>
              )}
              
              {/* Profile */}
              {activeTab === 'profile' && (
                <GlassCard>
                  <h2 className="text-2xl font-bold mb-6">Your Profile</h2>
                  {/* Profile management UI */}
                </GlassCard>
              )}
            </>
          )}
        </main>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom">
          <div className="glassmorphism px-6 py-4 rounded-lg shadow-lg border border-green-500/20">
            <p className="flex items-center space-x-2">
              <span>✅</span>
              <span>{notification}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}