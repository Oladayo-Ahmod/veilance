import { useEffect } from "react";

interface NotificationToastProps {
  message: string;
  onClose: () => void;
}

export default function NotificationToast({ message, onClose }: NotificationToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom">
      <div className="glassmorphism px-6 py-4 rounded-lg shadow-lg border border-green-500/20">
        <p className="flex items-center space-x-2">
          <span>✅</span>
          <span>{message}</span>
        </p>
      </div>
    </div>
  );
}