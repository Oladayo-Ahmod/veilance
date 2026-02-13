import GlassCard from "../ui/GlassCard";

export default function FindWork() {
  return (
    <GlassCard>
      <h2 className="text-2xl font-bold mb-6">Available Projects</h2>
      <div className="text-center py-12 text-gray-400">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-lg mb-2">No available projects at the moment</p>
        <p className="text-sm">Check back later or update your skills to get matched with projects</p>
      </div>
    </GlassCard>
  );
}