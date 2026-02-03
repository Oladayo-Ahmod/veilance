"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";
import WalletConnect from "./components/WalletConnect";
import GlassCard from "./components/GlassCard";
import StatsCard from "./components/StatsCard";
import ProjectCard from "./components/ProjectCard";
import SkillsCloud from "./components/SkillsCloud";
import EscrowForm from "./components/EscrowForm";
// import MilestoneSubmission from "./components/MilestoneSubmission";
import * as THREE from "three";
import { createSupabaseClient } from "./lib/supabase";
// import { Field } from "@aleohq/sdk";

type UserRole = "client" | "freelancer" | null;
type EscrowStatus = "active" | "completed" | "disputed";
type Skill = string;

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
  milestoneAmounts: number[];
  remainingAmount: number;
  milestoneSubmitted: boolean;
}

interface UserStats {
  totalProjects: number;
  completedProjects: number;
  totalEarned: number;
  rating: number;
  skills: Skill[];
}

export default function Home() {
  const {
    connected,
    address,
    executeTransaction,
    requestRecords,
    transactionStatus,
    decrypt,
  } = useWallet();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [userRole, setUserRole] = useState<UserRole>(null);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "projects" | "create" | "profile"
  >("dashboard");
  const [userStats, setUserStats] = useState<UserStats>({
    totalProjects: 0,
    completedProjects: 0,
    totalEarned: 0,
    rating: 5.0,
    skills: [],
  });
  const [projects, setProjects] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerSkills, setRegisterSkills] = useState<Skill[]>([]);
  const [showSkillsInput, setShowSkillsInput] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");

  // 3D Background Effect
  useEffect(() => {
    // console.log(supabaseAnonKey,supabaseUrl)
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3),
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x667eea,
      transparent: true,
      opacity: 0.6,
    });

    const particlesMesh = new THREE.Points(
      particlesGeometry,
      particlesMaterial,
    );
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

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  // Initialize user
  useEffect(() => {
    if (connected && address) {
      checkUserRegistration();
      loadProjects();
      loadUserStats();
    }
  }, [connected, address]);

  const checkUserRegistration = async () => {
    try {
      const supabase = createSupabaseClient();
      const { data } = await supabase
        .from("users")
        .select("role, skills")
        .eq("address", address)
        .single();

      if (data) {
        setUserRole(data.role);
        if (data.skills) {
          setUserStats((prev) => ({ ...prev, skills: data.skills }));
        }
      }
    } catch (error) {
      console.error("Error checking registration:", error);
    }
  };

  const loadProjects = async () => {
    if (!address) return;

    const supabase = createSupabaseClient();
    const { data } = await supabase
      .from("escrows")
      .select("*")
      .or(`client_address.eq.${address},freelancer_address.eq.${address}`)
      .order("created_at", { ascending: false });

    if (data) {
      const formattedProjects = data.map((escrow) => ({
        id: escrow.id,
        client: escrow.client_address,
        freelancer: escrow.freelancer_address,
        amount: parseFloat(escrow.total_amount),
        milestones: escrow.total_milestones,
        currentMilestone: escrow.milestone,
        description: escrow.description,
        status: escrow.status,
        createdAt: escrow.created_at,
        milestoneAmounts: escrow.milestone_amounts.map((a: string) =>
          parseFloat(a),
        ),
        remainingAmount: parseFloat(escrow.remaining_amount),
        milestoneSubmitted: escrow.current_milestone_submitted,
      }));
      setProjects(formattedProjects);
    }
  };

  const loadUserStats = async () => {
    if (!address || !userRole) return;

    try {
      const supabase = createSupabaseClient();
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("address", address)
        .single();

      if (data) {
        setUserStats({
          totalProjects:
            userRole === "client"
              ? data.completed_projects_as_client
              : data.completed_projects_as_freelancer,
          completedProjects:
            userRole === "client"
              ? data.completed_projects_as_client
              : data.completed_projects_as_freelancer,
          totalEarned: parseFloat(data.earned_balance || "0"),
          rating: parseFloat(
            userRole === "client" ? data.client_rating : data.freelancer_rating,
          ),
          skills: data.skills || [],
        });
      }
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

const registerAsClient = async () => {
  if (!executeTransaction || !address) return;

  setLoading(true);

  const saveClientToDb = async () => {
    const supabase = createSupabaseClient();
    const { error } = await supabase.from("users").upsert({
      address: address,
      role: "client",
      client_rating: 0,
      completed_projects_as_client: 0,
      escrow_balance: 0,
    });

    if (error) throw error;

    setUserRole("client");
  };

  try {
    const tx = await executeTransaction({
      program: "freelancing_platform.aleo",
      function: "register_client",
      inputs: [],
      fee: 100000,
      privateFee: false,
    });

    const txId = typeof tx === "string" ? tx : tx?.transactionId;

    if (txId) {
      await pollTransaction(txId);
      await saveClientToDb();
      
      showNotification("Successfully registered as client!");
      setShowRegisterModal(false);
    }

  } catch (error: any) {
    const errorString = error?.message || String(error);

    if (errorString.includes("Transaction Accepted") || errorString.includes("Accepted")) {
      
      await saveClientToDb();
      
      showNotification("Client registration submitted successfully!");
      setShowRegisterModal(false);
    } else {
      console.error("Client Registration error:", error);
      showNotification(`Error: ${errorString}`);
    }
  } finally {
    setLoading(false);
  }
};


const skillToField = (str:any) => {
  if (!str || str.trim() === "") return "0field";

  const bytes = new TextEncoder().encode(str);

  let bigIntValue = BigInt(0);
  for (let i = 0; i < bytes.length; i++) {
    bigIntValue |= BigInt(bytes[i]) << (BigInt(i) * BigInt(8));
  }

  return `${bigIntValue.toString()}field`;
};

 const registerAsFreelancer = async () => {
  if (!executeTransaction || !address) return;

  setLoading(true);

  const saveToDatabase = async (skills: string[]) => {
    const supabase = createSupabaseClient();
    
    // Update main user record
    await supabase.from("users").upsert({
      address: address,
      role: "freelancer",
      freelancer_rating: 5.0,
      completed_projects_as_freelancer: 0,
      earned_balance: 0,
      skills: skills,
    });

    // Update individual skills
    for (const skill of skills) {
      await supabase.from("freelancer_skills").upsert({
        freelancer_address: address,
        skill: skill,
        proficiency_level: "intermediate",
      });
    }

    setUserRole("freelancer");
    setUserStats((prev) => ({ ...prev, skills }));
  };

  try {
    const skillsToUse = registerSkills.slice(0, 5);
    const skillFields = skillsToUse.map((skill) => skillToField(skill));

    while (skillFields.length < 5) {
      skillFields.push("0field");
    }

    const skillInput = `[${skillFields.join(",")}]`;

    const tx = await executeTransaction({
      program: "freelancing_platform.aleo",
      function: "register_freelancer",
      inputs: [skillInput],
      fee: 100000,
      privateFee: false,
    });

    const txId = typeof tx === "string" ? tx : tx?.transactionId;

    if (txId) {
      console.log("Transaction Broadcasted:", txId);
      await pollTransaction(txId);
      await saveToDatabase(skillsToUse);
      
      showNotification("Successfully registered as freelancer!");
      setShowRegisterModal(false);
    }

  } catch (error: any) {
    const errorString = error?.message || String(error);

    if (errorString.includes("Transaction Accepted") || errorString.includes("Accepted")) {
      console.log("Transaction accepted via catch block");
      
      await saveToDatabase(registerSkills.slice(0, 5));
      
      showNotification("Registration submitted successfully!");
      setShowRegisterModal(false);
    } else {
      console.error("Actual Registration Error:", error);
      showNotification(`Error: ${errorString}`);
    }
  } finally {
    setLoading(false);
  }
};

const handleDepositFunds = async () => {
  if (!executeTransaction || !address || !depositAmount) return;
  setLoading(true);

  const updateSupabaseBalance = async (amount: string) => {
    const supabase = createSupabaseClient();
    const { error } = await supabase.rpc("increment_balance", {
      user_address: address,
      amount: parseFloat(amount),
    });
    if (error) throw error;
    
    setDepositAmount("");
    loadUserStats();
  };

  try {
    const records = await requestRecords?.("freelancing_platform.aleo", false);
    
    const clientRecord = records?.find(
      (r: any) =>
        typeof r === "string" && r.includes("owner") && r.includes(address)
    );

    if (!clientRecord) {
      showNotification("Client record not found. Please register as client first.");
      setLoading(false);
      return;
    }

    const decryptedRecord = await decrypt?.(clientRecord as string);

    const tx = await executeTransaction({
      program: "freelancing_platform.aleo",
      function: "deposit_funds",
      inputs: [
        String(decryptedRecord || clientRecord),
        `${depositAmount}u64`,
      ],
      fee: 100000,
      privateFee: false,
    });

    const txId = typeof tx === "string" ? tx : tx?.transactionId;

    if (txId) {
      await pollTransaction(txId);
      await updateSupabaseBalance(depositAmount);
      showNotification(`Successfully deposited ${depositAmount} ALEO!`);
    }

  } catch (error: any) {
    const errorString = error?.message || String(error);

    if (errorString.includes("Transaction Accepted") || errorString.includes("Accepted")) {
      console.log("Deposit accepted via catch block");
      
      await updateSupabaseBalance(depositAmount);
      showNotification(`Deposit of ${depositAmount} ALEO submitted!`);
    } else {
      console.error("Deposit error:", error);
      showNotification(`Error: ${errorString}`);
    }
  } finally {
    setLoading(false);
  }
};

const createEscrow = async (payee: string, amount: number, description: string) => {
  if (!executeTransaction || !address) return;
  setLoading(true);

  const saveEscrowToDb = async (txId: string) => {
    const milestone1 = Math.floor(amount / 2);
    const milestone2 = amount - milestone1;
    const supabase = createSupabaseClient();

    const { data: escrowData, error: escrowErr } = await supabase
      .from("escrows")
      .insert({
        client_address: address,
        freelancer_address: payee,
        total_amount: amount,
        remaining_amount: amount,
        milestone_amounts: [milestone1, milestone2],
        description: description,
        status: "active",
        aleo_status: 0,
      })
      .select().single();

    if (escrowData) {
      // Log transaction and send notification
      await Promise.all([
        supabase.from("transactions").insert({
          transaction_id: txId,
          function_name: "create_escrow",
          caller_address: address,
          related_addresses: [payee],
          status: "accepted",
          inputs: JSON.stringify({ payee, amount, description }),
          escrow_id: escrowData.id,
        }),
        supabase.from("notifications").insert({
          user_address: payee,
          type: "escrow_created",
          title: "New Escrow Created",
          message: `You have been assigned to a new project: ${description}`,
          related_escrow_id: escrowData.id,
        })
      ]);
    }
    loadProjects();
    loadUserStats();
  };

  try {
    const records = await requestRecords?.("freelancing_platform.aleo", false);
    const clientRecord = records?.find((r: any) => typeof r === "string" && r.includes(address));
    if (!clientRecord) throw new Error("Client record not found");

    const decryptedRecord = await decrypt?.(clientRecord as string);
    const milestone1 = Math.floor(amount / 2);
    const milestone2 = amount - milestone1;

    const tx = await executeTransaction({
      program: "freelancing_platform.aleo",
      function: "create_escrow",
      inputs: [payee, `${amount}u64`, `[${milestone1}u64, ${milestone2}u64]`, `"${description}"field`, String(decryptedRecord || clientRecord)],
      fee: 200000,
      privateFee: false,
    });

    const txId = typeof tx === "string" ? tx : tx?.transactionId;
    if (txId) {
      await pollTransaction(txId);
      await saveEscrowToDb(txId);
      showNotification("Escrow created successfully!");
    }
  } catch (error: any) {
    const errorString = error?.message || String(error);
    if (errorString.includes("Accepted")) {
      await saveEscrowToDb("accepted_tx"); // Fallback ID if string parsing fails
      showNotification("Escrow creation submitted!");
    } else {
      showNotification(`Error: ${errorString}`);
    }
  } finally {
    setLoading(false);
  }
};

const submitMilestone = async (escrowId: string) => {
  if (!executeTransaction) return;
  setLoading(true);

  const updateMilestoneInDb = async (txId: string, escrowDetails: any) => {
    const supabase = createSupabaseClient();
    await supabase.from("escrows").update({ current_milestone_submitted: true }).eq("id", escrowId);
    
    await supabase.from("milestone_submissions").insert({
      escrow_id: escrowId,
      escrow_id_field: escrowDetails.escrow_id_field,
      milestone_number: 0, 
      submitter_address: address,
      description: `Milestone submission for escrow ${escrowId}`,
      status: "submitted",
      aleo_transaction_id: txId,
      is_on_chain: true,
    });

    await supabase.from("notifications").insert({
      user_address: escrowDetails.client_address,
      type: "milestone_submitted",
      title: "Milestone Submitted",
      message: `A milestone has been submitted for project: ${escrowDetails.description}`,
      related_escrow_id: escrowId,
    });
    loadProjects();
  };

  try {
    const supabase = createSupabaseClient();
    const { data: escrow } = await supabase.from("escrows").select("*").eq("id", escrowId).single();
    if (!escrow) throw new Error("Escrow not found");

    const tx = await executeTransaction({
      program: "freelancing_platform.aleo",
      function: "submit_milestone",
      inputs: [`${escrow.escrow_id_field}field`],
      fee: 100000,
      privateFee: false,
    });

    const txId = typeof tx === "string" ? tx : tx?.transactionId;
    if (txId) {
      await pollTransaction(txId);
      await updateMilestoneInDb(txId, escrow);
      showNotification("Milestone submitted!");
    }
  } catch (error: any) {
    const errorString = error?.message || String(error);
    if (errorString.includes("Accepted")) {
       const { data: escrow } = await createSupabaseClient().from("escrows").select("*").eq("id", escrowId).single();
       if (escrow) await updateMilestoneInDb("accepted_tx", escrow);
       showNotification("Milestone submission broadcasted!");
    } else {
      showNotification(`Error: ${errorString}`);
    }
  } finally {
    setLoading(false);
  }
};
const approveMilestone = async (escrowId: string) => {
  if (!executeTransaction || !address) return;
  setLoading(true);

  const finalizeApprovalInDb = async (escrow: any) => {
    const supabase = createSupabaseClient();
    const nextMilestone = escrow.milestone + 1;
    const isCompleted = nextMilestone >= escrow.total_milestones;

    await supabase.from("escrows").update({
      milestone: nextMilestone,
      remaining_amount: escrow.remaining_amount - escrow.milestone_amounts[escrow.milestone],
      current_milestone_submitted: false,
      status: isCompleted ? "completed" : "active",
      aleo_status: isCompleted ? 1 : 0,
      completed_at: isCompleted ? new Date().toISOString() : null,
    }).eq("id", escrowId);

    await supabase.rpc("increment_earned_balance", {
      freelancer_address: escrow.freelancer_address,
      amount: escrow.milestone_amounts[escrow.milestone],
    });

    showNotification("Funds released!");
    loadProjects();
    loadUserStats();
  };

  try {
    const supabase = createSupabaseClient();
    const { data: escrow } = await supabase.from("escrows").select("*").eq("id", escrowId).single();
    if (!escrow) throw new Error("Escrow not found");

    const records = await requestRecords?.("freelancing_platform.aleo", false);
    const freelancerRecord = records?.find((r: any) => typeof r === "string" && r.includes(escrow.freelancer_address));
    if (!freelancerRecord) throw new Error("Freelancer record not found");

    const decEscrow = escrow.aleo_escrow_record ? await decrypt?.(escrow.aleo_escrow_record) : undefined;
    const decFreelancer = await decrypt?.(freelancerRecord as string);

    const tx = await executeTransaction({
      program: "freelancing_platform.aleo",
      function: "approve_and_release",
      inputs: [`${escrow.escrow_id_field}field`, decEscrow || escrow.aleo_escrow_record || "", decFreelancer || freelancerRecord],
      fee: 150000,
      privateFee: false,
    });

    if (tx) {
      await finalizeApprovalInDb(escrow);
    }
  } catch (error: any) {
    const errorString = error?.message || String(error);
    if (errorString.includes("Accepted")) {
      const { data: escrow } = await createSupabaseClient().from("escrows").select("*").eq("id", escrowId).single();
      if (escrow) await finalizeApprovalInDb(escrow);
    } else {
      showNotification(`Error: ${errorString}`);
    }
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

          if (status.status !== "pending") {
            clearInterval(interval);
            if (status.status === "accepted") {
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
    setTimeout(() => setNotification(""), 5000);
  };

  const addSkill = (skill: string) => {
    if (skill && !registerSkills.includes(skill)) {
      setRegisterSkills([...registerSkills, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    setRegisterSkills(registerSkills.filter((s) => s !== skill));
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
                {connected && userRole && (
                  <nav className="hidden md:flex space-x-2">
                    {["dashboard", "projects", "create", "profile"].map(
                      (tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab as any)}
                          className={`capitalize px-4 py-2 rounded-lg transition-all ${
                            activeTab === tab
                              ? "bg-gradient-to-r from-purple-600 to-blue-600"
                              : "hover:bg-white/5"
                          }`}
                        >
                          {tab === "create"
                            ? userRole === "client"
                              ? "Create Project"
                              : "Find Work"
                            : tab}
                        </button>
                      ),
                    )}
                  </nav>
                )}
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
              <h2 className="text-2xl font-bold mb-6 text-center">
                Choose Your Role
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                    <span className="text-2xl">👔</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Client</h3>
                  <p className="text-gray-300 mb-4">
                    Hire freelancers securely with private escrow
                  </p>
                  <button
                    onClick={registerAsClient}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? "Registering..." : "Register as Client"}
                  </button>
                </div>

                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/20">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                    <span className="text-2xl">💻</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Freelancer</h3>
                  <p className="text-gray-300 mb-4">
                    Offer your skills with guaranteed payments
                  </p>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? "Registering..." : "Register as Freelancer"}
                  </button>
                </div>
              </div>
            </GlassCard>
          ) : (
            <>
              {/* Dashboard */}
              {activeTab === "dashboard" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatsCard
                      title="Total Balance"
                      value={`${userRole === "client" ? "0" : userStats.totalEarned.toFixed(2)} ALEO`}
                      icon="💰"
                      trend="+12%"
                    />
                    <StatsCard
                      title="Active Projects"
                      value={projects
                        .filter((p) => p.status === "active")
                        .length.toString()}
                      icon="📊"
                      trend="+3"
                    />
                    <StatsCard
                      title="Completed"
                      value={userStats.completedProjects.toString()}
                      icon="✅"
                      trend="+5"
                    />
                    <StatsCard
                      title="Rating"
                      value={userStats.rating.toFixed(1)}
                      icon="⭐"
                      trend="+0.2"
                    />
                  </div>

                  <div className="grid lg:grid-cols-3 gap-8">
                    <GlassCard className="lg:col-span-2">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">Recent Projects</h3>
                        <button
                          onClick={() => setActiveTab("projects")}
                          className="text-sm text-purple-400 hover:text-purple-300"
                        >
                          View All →
                        </button>
                      </div>
                      <div className="space-y-4">
                        {projects.slice(0, 3).map((project) => (
                          <ProjectCard
                            key={project.id}
                            project={project}
                            userRole={userRole}
                            userAddress={address || ""}
                            onMilestoneSubmit={submitMilestone}
                            onMilestoneApprove={approveMilestone}
                          />
                        ))}
                        {projects.length === 0 && (
                          <div className="text-center py-8 text-gray-400">
                            No projects yet.{" "}
                            {userRole === "client"
                              ? "Create your first project!"
                              : "Start applying for projects!"}
                          </div>
                        )}
                      </div>
                    </GlassCard>

                    <div className="space-y-6">
                      <GlassCard>
                        <h3 className="text-xl font-bold mb-4">Your Skills</h3>
                        <SkillsCloud skills={userStats.skills} />
                        {userRole === "freelancer" &&
                          userStats.skills.length === 0 && (
                            <button
                              onClick={() => setActiveTab("profile")}
                              className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                            >
                              Add Skills
                            </button>
                          )}
                      </GlassCard>

                      {userRole === "client" && (
                        <GlassCard>
                          <h3 className="text-xl font-bold mb-4">
                            Deposit Funds
                          </h3>
                          <div className="space-y-4">
                            <input
                              type="number"
                              value={depositAmount}
                              onChange={(e) => setDepositAmount(e.target.value)}
                              placeholder="Amount in ALEO"
                              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500"
                            />
                            <button
                              onClick={handleDepositFunds}
                              disabled={loading || !depositAmount}
                              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                              {loading ? "Processing..." : "Deposit Funds"}
                            </button>
                          </div>
                        </GlassCard>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Projects Management */}
              {activeTab === "projects" && (
                <GlassCard>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Your Projects</h2>
                    {userRole === "client" && (
                      <button
                        onClick={() => setActiveTab("create")}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:opacity-90 transition-opacity"
                      >
                        + New Project
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="glassmorphism-dark rounded-xl p-6"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold mb-2">
                              {project.description}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span>Amount: {project.amount} ALEO</span>
                              <span>•</span>
                              <span>
                                Status:{" "}
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    project.status === "active"
                                      ? "bg-green-500/20 text-green-400"
                                      : project.status === "completed"
                                        ? "bg-blue-500/20 text-blue-400"
                                        : "bg-red-500/20 text-red-400"
                                  }`}
                                >
                                  {project.status}
                                </span>
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400">Milestone</p>
                            <p className="font-bold">
                              {project.currentMilestone}/{project.milestones}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-white/10">
                          <div className="text-sm">
                            <p className="text-gray-400">With:</p>
                            <p className="font-mono">
                              {userRole === "client"
                                ? project.freelancer
                                : project.client}
                            </p>
                          </div>

                          {project.status === "active" && (
                            <div className="space-x-2">
                              {userRole === "freelancer" &&
                                project.currentMilestone < project.milestones &&
                                !project.milestoneSubmitted && (
                                  <button
                                    onClick={() => submitMilestone(project.id)}
                                    disabled={loading}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                                  >
                                    Submit Milestone
                                  </button>
                                )}
                              {userRole === "client" &&
                                project.milestoneSubmitted && (
                                  <button
                                    onClick={() => approveMilestone(project.id)}
                                    disabled={loading}
                                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
                                  >
                                    Approve & Pay
                                  </button>
                                )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {projects.length === 0 && (
                      <div className="text-center py-12 text-gray-400">
                        <div className="text-5xl mb-4">📋</div>
                        <p className="text-lg mb-2">No projects yet</p>
                        <p className="text-sm">
                          Get started by{" "}
                          {userRole === "client"
                            ? "creating a project"
                            : "applying for available work"}
                        </p>
                      </div>
                    )}
                  </div>
                </GlassCard>
              )}

              {/* Create Escrow / Find Work */}
              {activeTab === "create" &&
                (userRole === "client" ? (
                  <EscrowForm
                    onSubmit={createEscrow}
                    loading={loading}
                    userStats={userStats}
                  />
                ) : (
                  <GlassCard>
                    <h2 className="text-2xl font-bold mb-6">
                      Available Projects
                    </h2>
                    <div className="text-center py-12 text-gray-400">
                      <div className="text-5xl mb-4">🔍</div>
                      <p className="text-lg mb-2">
                        No available projects at the moment
                      </p>
                      <p className="text-sm">
                        Check back later or update your skills to get matched
                        with projects
                      </p>
                    </div>
                  </GlassCard>
                ))}

              {/* Profile */}
              {activeTab === "profile" && (
                <div className="grid lg:grid-cols-3 gap-8">
                  <GlassCard className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-6">Your Profile</h2>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Wallet Address
                        </h3>
                        <p className="font-mono text-sm bg-white/5 p-3 rounded-lg">
                          {address}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Role</h3>
                        <div
                          className={`inline-flex items-center px-4 py-2 rounded-full ${
                            userRole === "client"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          <span className="mr-2">
                            {userRole === "client" ? "👔" : "💻"}
                          </span>
                          {userRole === "client" ? "Client" : "Freelancer"}
                        </div>
                      </div>

                      {userRole === "freelancer" && (
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                              Your Skills
                            </h3>
                            <button
                              onClick={() =>
                                setShowSkillsInput(!showSkillsInput)
                              }
                              className="text-sm text-purple-400 hover:text-purple-300"
                            >
                              + Add Skill
                            </button>
                          </div>

                          {showSkillsInput && (
                            <div className="mb-4">
                              <input
                                type="text"
                                placeholder="Add a skill (e.g., React, Solidity)"
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg mb-2 focus:outline-none focus:border-purple-500"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    addSkill(
                                      (e.target as HTMLInputElement).value,
                                    );
                                    (e.target as HTMLInputElement).value = "";
                                  }
                                }}
                              />
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                            {userStats.skills.map((skill, index) => (
                              <div
                                key={index}
                                className="flex items-center px-3 py-1 bg-white/10 rounded-full"
                              >
                                <span>{skill}</span>
                                <button
                                  onClick={() => removeSkill(skill)}
                                  className="ml-2 text-gray-400 hover:text-white"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            {userStats.skills.length === 0 && (
                              <p className="text-gray-400">
                                No skills added yet
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-lg">
                          <h4 className="text-sm text-gray-400 mb-1">
                            Total Projects
                          </h4>
                          <p className="text-2xl font-bold">
                            {userStats.totalProjects}
                          </p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                          <h4 className="text-sm text-gray-400 mb-1">
                            Success Rate
                          </h4>
                          <p className="text-2xl font-bold">98%</p>
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard>
                    <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      {userRole === "client" ? (
                        <>
                          <button
                            onClick={() => setActiveTab("create")}
                            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-left hover:opacity-90 transition-opacity"
                          >
                            <span className="font-semibold">
                              Create New Project
                            </span>
                            <p className="text-sm text-white/70 mt-1">
                              Start a new escrow with a freelancer
                            </p>
                          </button>
                          <button
                            onClick={() => setDepositAmount("100")}
                            className="w-full px-4 py-3 bg-white/10 rounded-lg text-left hover:bg-white/20 transition-colors"
                          >
                            <span className="font-semibold">Add Funds</span>
                            <p className="text-sm text-white/70 mt-1">
                              Deposit ALEO to your escrow balance
                            </p>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setActiveTab("create")}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg text-left hover:opacity-90 transition-opacity"
                          >
                            <span className="font-semibold">
                              Browse Projects
                            </span>
                            <p className="text-sm text-white/70 mt-1">
                              Find available work opportunities
                            </p>
                          </button>
                          <button
                            onClick={() => setShowSkillsInput(true)}
                            className="w-full px-4 py-3 bg-white/10 rounded-lg text-left hover:bg-white/20 transition-colors"
                          >
                            <span className="font-semibold">Update Skills</span>
                            <p className="text-sm text-white/70 mt-1">
                              Add new skills to your profile
                            </p>
                          </button>
                        </>
                      )}
                    </div>
                  </GlassCard>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <GlassCard className="max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Register as Freelancer</h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Skills (up to 5)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {registerSkills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-white/70 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add a skill (e.g., React, Solidity)"
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        addSkill((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector(
                        'input[type="text"]',
                      ) as HTMLInputElement;
                      if (input.value) {
                        addSkill(input.value);
                        input.value = "";
                      }
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-400">
                <p>
                  Popular skills: Web3, Frontend, Smart Contracts, Design,
                  Marketing
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={registerAsFreelancer}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Registering..." : "Complete Registration"}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

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
