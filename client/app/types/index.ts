export type UserRole = "client" | "freelancer" | null;
export type EscrowStatus = "active" | "completed" | "disputed";

export interface Escrow {
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

export interface UserStats {
  totalProjects: number;
  completedProjects: number;
  totalEarned: number;
  rating: number;
  skills: string[];
}