"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet } from "@provablehq/aleo-wallet-adaptor-react";
import Background3D from "./components/layout/Background3D";
import Header from "./components/layout/Header";
import NotificationToast from "./components/layout/NotificationToast";
import WelcomeScreen from "./components/welcome/WelcomeScreen";
import RoleSelection from "./components/role-selection/RoleSelection";
import FreelancerRegistrationModal from "./components/role-selection/FreelancerRegistrationModal";
import Dashboard from "./components/dashboard/Dashboard";
import ProjectsManagement from "./components/projects/ProjectsManagement";
import CreateProject from "./components/create/CreateProject";
import FindWork from "./components/create/FindWork";
import Profile from "./components/profile/Profile";
import { createSupabaseClient } from "./lib/supabase";
import { UserRole, Escrow, UserStats } from "./types";
import {extractEscrowIdFromTxDetails,fetchTransactionDetails} from './lib/aleo'

// import MilestoneSubmission from "./components/MilestoneSubmission";
import * as THREE from "three";
import BrowseFreelancers from "./components/create/BrowseFreelancers";
// type UserRole = "client" | "freelancer" | null;
// type EscrowStatus = "active" | "completed" | "disputed";
type Skill = string;


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
    "dashboard" | "projects" | "create" | "profile" | "freelancers"
  >("dashboard");
  const [userStats, setUserStats] = useState<UserStats>({
    totalProjects: 0,
    completedProjects: 0,
    totalEarned: 0,
    rating: 0,
    skills: [],
  });
  const [projects, setProjects] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerSkills, setRegisterSkills] = useState<Skill[]>([]);
  const [showSkillsInput, setShowSkillsInput] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [selectedFreelancer, setSelectedFreelancer] = useState<string>("");
  // const [withdrawAmount, setWithdrawAmount] = useState("");

  // 3D Background Effect
  useEffect(() => {
    console.log(address, 'add')
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
    if (!address) return;

    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("address", address)
        .single();

      console.log(data)
      if (error) throw error;
      if (!data) return;

      const effectiveRole = userRole || data.role;

      const escrowVal = parseFloat(data.escrow_balance ?? 0);
      const earnedVal = parseFloat(data.earned_balance ?? 0);

      const newStats = {
        totalProjects: effectiveRole === "client"
          ? (data.completed_projects_as_client || 0)
          : (data.completed_projects_as_freelancer || 0),

        completedProjects: effectiveRole === "client"
          ? (data.completed_projects_as_client || 0)
          : (data.completed_projects_as_freelancer || 0),

        totalEarned: effectiveRole === "client" ? escrowVal : earnedVal,

        rating: parseFloat(
          (effectiveRole === "client" ? data.client_rating : data.freelancer_rating) || 0
        ),
        skills: data.skills || [],
      };

      setUserStats(newStats);

    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

  const registerAsClient = async () => {
    if (!executeTransaction || !address) return;

    setLoadingAction('register-client');

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
        program: "freelancing_platform_v2.aleo",
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
      setLoadingAction(null);
    }
  };


  const skillToField = (str: any) => {
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
      console.log(skillInput)
      const tx = await executeTransaction({
        program: "freelancing_platform_v2.aleo",
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
      const records = await requestRecords?.("freelancing_platform_v2.aleo", false);
      console.log(records)
      const clientRecordObj = records?.find((r: any) => {
        const isOwner = r.owner === address || r.sender === address;
        const isClientRecord = r.recordName === "Client";
        // const isClientFunction = r.functionName === "register_client";

        return isOwner && isClientRecord && !r.spent;
      }) as any;

      console.log(clientRecordObj, 'clientRecordObj')
      if (!clientRecordObj) {
        showNotification("Client record not found. Please register as client first.");
        setLoading(false);
        return;
      }

      const ciphertext = (clientRecordObj as any)?.recordCiphertext;
      const decryptedRecord = await decrypt?.(ciphertext);
      const ALEO_UNIT = 1_000_000;
      const microcreditsAmount = BigInt(depositAmount) * BigInt(ALEO_UNIT);
      console.log(microcreditsAmount)

      const tx = await executeTransaction({
        program: "freelancing_platform_v2.aleo",
        function: "deposit_funds",
        inputs: [
          decryptedRecord,
          `${microcreditsAmount}u64`,
        ],
        fee: 200000,
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

  const stringToField = (str: string) => {
    const truncated = str.slice(0, 31);

    const hex = Buffer.from(truncated, 'utf8').toString('hex');

    return BigInt("0x" + hex).toString() + "field";
  };

  const createEscrow = async (payee: string, amount: number, description: string) => {
      const freelancerAddress = payee || selectedFreelancer;
      let finalTxId = "";
      let escrowIdField = "";

      if (!freelancerAddress) {
        showNotification("Please select a freelancer first");
        return;
  }
    if (!executeTransaction || !address) return;
    setLoading(true);

    const saveEscrowToDb = async (txId: string, escrowIdField:string) => {
      const milestone1 = Math.floor(amount / 2);
      const milestone2 = amount - milestone1;
      const supabase = createSupabaseClient();

      const { data: escrowData } = await supabase
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
          escrow_id_field: escrowIdField,

        })
        .select().single();

      if (escrowData) {
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
          }),
          supabase.rpc("decrement_balance", {
            user_address: address,
            amount: amount,
          })
        ]);
      }
        setSelectedFreelancer("");
      loadProjects();
      loadUserStats();
    };

    try {
      const records = await requestRecords?.("freelancing_platform_v2.aleo", false);
      console.log(records)
      const clientRecordObj = records?.find((r: any) => {
        const isOwner = r.owner === address || r.sender === address || r.owner?.includes(address);
        const isClientRecord = r.recordName === "Client";
        return isOwner && isClientRecord && !r.spent;
      });

      console.log(clientRecordObj, 'clientRecordObj')
      if (!clientRecordObj) {
        throw new Error("Client record not found. Please ensure you are registered.");
      }

      // Use recordCiphertext for decryption
      const ciphertext = (clientRecordObj as any)?.recordCiphertext;
      const decryptedRecord = await decrypt?.(ciphertext);

      const milestone1 = Math.floor(amount / 2);
      const milestone2 = amount - milestone1;
      const milestoneInput = `[${milestone1}u64,${milestone2}u64]`;
      console.log(description)

      const tx = await executeTransaction({
        program: "freelancing_platform_v2.aleo",
        function: "create_escrow",
        inputs: [
          payee,
          `${amount}u64`,
          milestoneInput,
          stringToField(description),
          String(decryptedRecord || ciphertext)
        ],
        fee: 200000,
        privateFee: false,
      });

     const tempTxId = typeof tx === "string" ? tx : tx?.transactionId;
    console.log("Temp Transaction ID:", tempTxId);

    if (tempTxId) {
      finalTxId = await pollTransaction(tempTxId);
      console.log("Final transaction ID:", finalTxId);

      const txDetails = await fetchTransactionDetails(finalTxId);
      console.log("Transaction details:", txDetails);

      escrowIdField = extractEscrowIdFromTxDetails(txDetails);
      console.log("Extracted escrow_id:", escrowIdField);

      await saveEscrowToDb(finalTxId, escrowIdField);

      showNotification("Escrow created successfully!");
      setShowRegisterModal(false);
      }
    } catch (error: any) {
    const errorString = error?.message || String(error);
    
    if (errorString.includes("Accepted")) {
      if (finalTxId && escrowIdField) {
        await saveEscrowToDb(finalTxId, escrowIdField);
        showNotification("Escrow creation submitted!");
      } else {
        showNotification("Escrow creation submitted! It will be confirmed shortly.");
      }
    } else {
      console.error("Create escrow error:", error);
      showNotification(`Error: ${errorString}`);
    }
  } finally {
    setLoading(false);
  }
};

  const submitMilestone = async (escrowId: string) => {
    if (!executeTransaction) return;
    setLoading(true);

    const updateMilestoneInDb = async (tempTxId: string, escrowDetails: any) => {
      const supabase = createSupabaseClient();
      await supabase.from("escrows").update({ current_milestone_submitted: true }).eq("id", escrowId);

      await supabase.from("milestone_submissions").insert({
        escrow_id: escrowId,
        escrow_id_field: escrowDetails.escrow_id_field,
        milestone_number: 0,
        submitter_address: address,
        description: `Milestone submission for escrow ${escrowId}`,
        status: "submitted",
        aleo_transaction_id: tempTxId,
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
      console.log(escrow)
      const tx = await executeTransaction({
        program: "freelancing_platform_v2.aleo",
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

      if (isCompleted) {
    // Increment freelancer's completed projects
    await supabase.rpc("increment_freelancer_completed_projects", {
      freelancer_address: escrow.freelancer_address
    });
    
    // Increment client's completed projects
    await supabase.rpc("increment_client_completed_projects", {
      client_address: escrow.client_address
    });
    
    console.log(`Project ${escrow.id} completed! Both parties credited.`);
  }

    showNotification("Funds released!");
    loadProjects();
    loadUserStats();
  };

  try {
    const supabase = createSupabaseClient();
    
    const { data: escrow } = await supabase.from("escrows").select("*").eq("id", escrowId).single();
    if (!escrow) throw new Error("Escrow not found");

    console.log("Escrow from DB:", escrow);
    console.log("Current milestone:", escrow.milestone);

    let transactionQuery;
    
    if (escrow.milestone === 0) {
      // First milestone - need the create_escrow record
      transactionQuery = await supabase
        .from("transactions")
        .select("transaction_id")
        .eq("escrow_id", escrowId)
        .eq("function_name", "create_escrow")
        .single();
    } else {
      // Second milestone - need the first approve_and_release record
      transactionQuery = await supabase
        .from("transactions")
        .select("transaction_id")
        .eq("escrow_id", escrowId)
        .eq("function_name", "approve_and_release")
        .order("created_at", { ascending: true })
        .limit(1)
        .single();
    }

    if (!transactionQuery.data) {
      throw new Error(`Transaction record not found for milestone ${escrow.milestone}`);
    }

    const transaction = transactionQuery.data;
    console.log(`Using transaction ID for milestone ${escrow.milestone}:`, transaction.transaction_id);

    // Get records from Aleo
    const records = await requestRecords?.("freelancing_platform_v2.aleo", false);
    console.log("All records:", records);

    // Find the specific Escrow record that matches the transaction ID
    const escrowRecord = records?.find((r: any) => {
      // Check if it's an Escrow record and not spent
      const isEscrowRecord = r.recordName === "Escrow";
      const isNotSpent = r.spent === false;
      
      if (!isEscrowRecord || !isNotSpent) return false;

      console.log(`Checking record: ${r.functionName}, spent: ${r.spent}, transactionId: '${r.transactionId}'`);

      // Match by transaction ID 
      const txIdA = r.transactionId?.toString().trim().toLowerCase();
      const txIdB = transaction.transaction_id?.toString().trim().toLowerCase();
      const matchesTransactionId = txIdA === txIdB;

      if (matchesTransactionId) {
        console.log("Found matching record by transaction ID!");
        return true;
      }

      return false;
    });

    if (!escrowRecord) {
      console.error("Available records:", records?.map((r: any) => ({ 
        recordName: r.recordName,
        functionName: r.functionName, 
        spent: r.spent,
        transactionId: r.transactionId
      })));
      
      throw new Error(`Escrow record not found for transaction ${transaction.transaction_id}`);
    }

    console.log("Found matching escrow record:", escrowRecord);

    // Get the record ciphertext
    const ciphertext = escrowRecord.recordCiphertext;
    
    if (!ciphertext) {
      throw new Error("No ciphertext found in escrow record");
    }

    // Decrypt the escrow record
    const decryptedEscrow = await decrypt?.(ciphertext);
    console.log("Decrypted escrow:", decryptedEscrow);

    // Use the decrypted record or fallback to ciphertext
    const escrowInput = decryptedEscrow || ciphertext;

    // Execute transaction with ONLY 2 inputs (as per contract)
    const tx = await executeTransaction({
      program: "freelancing_platform_v2.aleo",
      function: "approve_and_release",
      inputs: [
        `${escrow.escrow_id_field}field`,  // escrow_id from explorer
        escrowInput                          // escrow record
      ],
      fee: 150000,
      privateFee: false,
    });

    console.log("Transaction response:", tx);

    const txId = typeof tx === "string" ? tx : tx?.transactionId;
    
    if (txId) {
      await pollTransaction(txId);
      await finalizeApprovalInDb(escrow);
      
      // After successful approval, store the new approve_and_release transaction
      // for the next milestone
      if (escrow.milestone === 0) {
        await supabase.from("transactions").insert({
          transaction_id: txId,
          function_name: "approve_and_release",
          caller_address: address,
          related_addresses: [escrow.freelancer_address],
          status: "accepted",
          inputs: JSON.stringify({ escrow_id: escrow.escrow_id_field }),
          escrow_id: escrowId,
        });
      }
      
      showNotification("Milestone approved and payment released!");
    }

  } catch (error: any) {
    const errorString = error?.message || String(error);
    console.error("Approve milestone error:", error);
    
    if (errorString.includes("Accepted")) {
      const { data: escrow } = await createSupabaseClient().from("escrows").select("*").eq("id", escrowId).single();
      if (escrow) {
        await finalizeApprovalInDb(escrow);
        showNotification("Milestone approval submitted!");
      }
    } else {
      showNotification(`Error: ${errorString}`);
    }
  } finally {
    setLoading(false);
  }
};

const pollTransaction = async (tempTxId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const status = await transactionStatus?.(tempTxId);
        
        if (!status) return;

        console.log(`Polling transaction ${tempTxId}:`, status);
        if (status.status === "Accepted" && status.transactionId) {
          console.log(status.transactionId, 'final tx id in poll')
          clearInterval(interval);
          resolve(status.transactionId); // Returns the final tx ID 
        } else if (status.status !== "pending") {
          clearInterval(interval);
          reject(new Error(`Transaction ${status.status}`));
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 2000);
  });
};


  const withdrawFunds = async (amount: string) => {
    if (!executeTransaction || !address) {
      showNotification("Wallet not connected");
      return;
    }

    console.log(amount)
    // Check if amount is entered
    if (!amount || parseFloat(amount) <= 0) {
      showNotification("Please enter a valid amount to withdraw");
      return;
    }

    const numAmount  = parseFloat(amount);
    const currentBalance = userStats.totalEarned;

    // Check if amount exceeds balance
    if (numAmount  > currentBalance) {
      showNotification(`Insufficient balance. You have ${currentBalance.toFixed(2)} ALEO available`);
      return;
    }

    // Check minimum withdrawal 
    const MIN_WITHDRAWAL = 0.01; // 0.01 ALEO minimum
    if (numAmount  < MIN_WITHDRAWAL) {
      showNotification(`Minimum withdrawal amount is ${MIN_WITHDRAWAL} ALEO`);
      return;
    }

    setLoading(true);
    setLoadingAction('withdraw');

    const updateSupabaseBalance = async (amount: string) => {
      const supabase = createSupabaseClient();

      // verify current balance hasn't changed
      const { data: currentUser } = await supabase
        .from("users")
        .select("escrow_balance")
        .eq("address", address)
        .single();

      if (currentUser && parseFloat(currentUser.escrow_balance) < numAmount) {
        throw new Error("Balance changed. Please try again.");
      }

      // Proceed with decrement
      const { error } = await supabase.rpc("decrement_balance", {
        user_address: address,
        amount: parseFloat(amount),
      });

      if (error) throw error;

 
      loadUserStats();
      showNotification(`✅ Successfully withdrew ${amount} ALEO!`);
    };

    try {
      // Find the client record
      const records = await requestRecords?.("freelancing_platform_v2.aleo", false);

      const clientRecordObj = records?.find((r: any) => {
        const isOwner = r.owner === address || r.sender === address || r.owner?.includes(address);
        const isClientRecord = r.recordName === "Client";
        return isOwner && isClientRecord && !r.spent;
      });

      if (!clientRecordObj) {
        showNotification("❌ Client record not found. Please ensure you are registered as a client.");
        setLoading(false);
        setLoadingAction(null);
        return;
      }

      // Decrypt the client record
      const ciphertext = (clientRecordObj as any)?.recordCiphertext;
      const decryptedRecord = await decrypt?.(ciphertext);

      // Convert ALEO amount to microcredits (1 ALEO = 1,000,000 microcredits)
      const ALEO_UNIT = 1_000_000;
      const microcreditsAmount = BigInt(numAmount) * BigInt(ALEO_UNIT);

      // Execute the withdraw transaction
      const tx = await executeTransaction({
        program: "freelancing_platform_v2.aleo",
        function: "withdraw_funds",
        inputs: [
          decryptedRecord || ciphertext,
          `${microcreditsAmount}u64`,
        ],
        fee: 200000,
        privateFee: false,
      });

      const txId = typeof tx === "string" ? tx : tx?.transactionId;

      if (txId) {
        await pollTransaction(txId);
        await updateSupabaseBalance(amount);
      }

    } catch (error: any) {
      const errorString = error?.message || String(error);

      if (errorString.includes("Insufficient") || errorString.includes("insufficient")) {
        showNotification(`❌ Insufficient balance in escrow contract. Please refresh and try again.`);
      }
      else if (errorString.includes("Transaction Accepted") || errorString.includes("Accepted")) {
        console.log("Withdraw accepted via catch block");

        // Optimistically update the database
        const supabase = createSupabaseClient();
        try {
          await supabase.rpc("decrement_balance", {
            user_address: address,
            amount: parseFloat(amount),
          });
          loadUserStats();
          showNotification(`✅ Withdrawal of ${amount} ALEO submitted! Transaction pending...`);
        } catch (dbError) {
          console.error("Error updating balance after accepted transaction:", dbError);
          showNotification(`⚠️ Transaction accepted but balance update pending. It will sync shortly.`);
        }
      } else {
        console.error("Withdraw error:", error);
        showNotification(`❌ Error: ${errorString.substring(0, 100)}...`);
      }
    } finally {
      setLoading(false);
      setLoadingAction(null);
    }
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
      <Background3D />

      <div className="relative z-10">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} userRole={userRole} connected={connected} />

        <main className="container mx-auto px-6 py-8">
          {!connected ? (
            <WelcomeScreen />
          ) : !userRole ? (
            <RoleSelection
              onRegisterClient={registerAsClient}
              onOpenFreelancerModal={() => setShowRegisterModal(true)}
              loading={loading}
              loadingAction={loadingAction}
            />
          ) : (
            <>
              {activeTab === "dashboard" && (
                <Dashboard
                  userStats={userStats}
                  projects={projects}
                  userRole={userRole}
                  address={address || ""}
                  depositAmount={depositAmount}
                  setDepositAmount={setDepositAmount}
                  onDepositFunds={handleDepositFunds}
                  onMilestoneSubmit={submitMilestone}
                  onMilestoneApprove={approveMilestone}
                  onViewAllProjects={() => setActiveTab("projects")}
                  onEditProfile={() => setActiveTab("profile")}
                  loading={loading}
                />
              )}

              {activeTab === "projects" && (
                <ProjectsManagement
                  projects={projects}
                  userRole={userRole}
                  address={address || ""}
                  loading={loading}
                  onMilestoneSubmit={submitMilestone}
                  onMilestoneApprove={approveMilestone}
                  onCreateNew={() => setActiveTab("create")}
                />
              )}

              {activeTab === "create" &&
                (userRole === "client" ? (
                  <CreateProject 
                  onSubmit={createEscrow}
                  loading={loading}
                  userStats={userStats}
                   initialFreelancer={selectedFreelancer}
                  />
                ) : (
                  <FindWork />
                ))}

              {activeTab === "profile" && (
                <Profile
                  address={address || ""}
                  userRole={userRole}
                  userStats={userStats}
                  onAddSkill={addSkill}
                  onRemoveSkill={removeSkill}
                  showSkillsInput={showSkillsInput}
                  setShowSkillsInput={setShowSkillsInput}
                  onCreateProject={() => setActiveTab("create")}
                  onWithdrawFunds={withdrawFunds}
                  // withdrawAmount={withdrawAmount}
                  onAddFunds={() => {
                    setActiveTab("dashboard");
                    setDepositAmount("100");
                  }}
                  onBrowseProjects={() => setActiveTab("create")}
                   loading={loading}
                />
              )}

              {activeTab === "freelancers" && userRole === "client" && (
                <BrowseFreelancers
                  onHire={(address) => {
                    setSelectedFreelancer(address);
                    setActiveTab("create");
                  }}
                  loading={loading}
                />
              )}

            {/* // If a freelancer somehow accesses this tab, show a message */}
              {activeTab === "freelancers" && userRole === "freelancer" && (
                <div className="text-center py-12">
                  <p className="text-gray-400">This section is for clients only</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <FreelancerRegistrationModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        skills={registerSkills}
        onAddSkill={addSkill}
        onRemoveSkill={removeSkill}
        onRegister={registerAsFreelancer}
        loading={loading}
      />

      {notification && <NotificationToast message={notification} onClose={() => setNotification("")} />}
    </div>
  );
}
