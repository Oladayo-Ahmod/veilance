import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = '' }: GlassCardProps) {
  return (
    <div className={`
      glassmorphism 
      rounded-2xl 
      p-6 
      backdrop-blur-xl 
      border border-white/10 
      shadow-2xl
      ${className}
    `}>
      {children}
    </div>
  );
}