import { useSession } from "@/hooks/useSession";

export default function SessionTimer() {
  const { timeRemaining } = useSession();
  
  // Format the time remaining
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div id="session-timer" className="text-sm text-gray-500">
      Session: {formatTime(timeRemaining)}
    </div>
  );
}
