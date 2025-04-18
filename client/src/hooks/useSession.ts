import { useState, useEffect } from 'react';

// Session duration in seconds (24 hours)
const SESSION_DURATION = 24 * 60 * 60;

export function useSession() {
  const [timeRemaining, setTimeRemaining] = useState<number>(SESSION_DURATION);
  
  useEffect(() => {
    // Initialize session expiry time if not already set
    const sessionExpiryKey = 'robotlawyer-session-expiry';
    let sessionExpiry = localStorage.getItem(sessionExpiryKey);
    
    if (!sessionExpiry) {
      // Set session expiry time to 24 hours from now
      const expiryTime = Date.now() + SESSION_DURATION * 1000;
      localStorage.setItem(sessionExpiryKey, expiryTime.toString());
      sessionExpiry = expiryTime.toString();
    }
    
    const calculateTimeRemaining = () => {
      const expiryTime = parseInt(localStorage.getItem(sessionExpiryKey) || '0');
      const now = Date.now();
      const diffInSeconds = Math.max(0, Math.floor((expiryTime - now) / 1000));
      
      setTimeRemaining(diffInSeconds);
      
      // If session has expired, create a new one
      if (diffInSeconds <= 0) {
        const newExpiryTime = Date.now() + SESSION_DURATION * 1000;
        localStorage.setItem(sessionExpiryKey, newExpiryTime.toString());
      }
    };
    
    // Calculate initial time remaining
    calculateTimeRemaining();
    
    // Update time remaining every second
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  return { timeRemaining };
}
