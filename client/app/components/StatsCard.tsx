interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  trend: string;
}

export default function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  return (
    <div className="glassmorphism rounded-xl p-6 hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        <span className="px-3 py-1 text-xs bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full">
          {trend}
        </span>
      </div>
      <h3 className="text-2xl font-bold mb-2">{value}</h3>
      <p className="text-gray-400">{title}</p>
    </div>
  );
}