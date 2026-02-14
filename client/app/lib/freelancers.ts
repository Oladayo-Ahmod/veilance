import { createSupabaseClient } from "./supabase";
import { Freelancer } from "../types";

export async function fetchFreelancers(): Promise<Freelancer[]> {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from("users")
    .select(`
      address,
      freelancer_rating,
      completed_projects_as_freelancer,
      earned_balance,
      skills
    `)
    .eq("role", "freelancer")
    .order("freelancer_rating", { ascending: false });

  if (error) {
    console.error("Error fetching freelancers:", error);
    return [];
  }

  return data.map((user: any) => ({
    address: user.address,
    skills: user.skills || [],
    rating: parseFloat(user.freelancer_rating) || 0,
    completedProjects: user.completed_projects_as_freelancer || 0,
    earnedBalance: parseFloat(user.earned_balance) || 0,
  }));
}