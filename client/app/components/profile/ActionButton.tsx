interface ActionButtonProps {
  title: string;
  description: string;
  onClick: () => void;
  gradient?: string;
  isSecondary?: boolean;
}

export default function ActionButton({ title, description, onClick, gradient, isSecondary }: ActionButtonProps) {
  const baseClasses = "w-full px-4 py-3 rounded-lg text-left hover:opacity-90 transition-opacity";
  const styleClasses = gradient
    ? `bg-gradient-to-r ${gradient}`
    : isSecondary
    ? "bg-white/10 hover:bg-white/20 transition-colors"
    : "";

  return (
    <button onClick={onClick} className={`${baseClasses} ${styleClasses}`}>
      <span className="font-semibold">{title}</span>
      <p className="text-sm text-white/70 mt-1">{description}</p>
    </button>
  );
}