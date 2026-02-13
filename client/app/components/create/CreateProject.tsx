import EscrowForm from "../ui/EscrowForm";
import { UserStats } from "../../types";

interface CreateProjectProps {
  onSubmit: (payee: string, amount: number, description: string) => void;
  loading: boolean;
  userStats: UserStats;
}

export default function CreateProject({ onSubmit, loading, userStats }: CreateProjectProps) {
  return <EscrowForm onSubmit={onSubmit} loading={loading} userStats={userStats} />;
}