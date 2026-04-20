import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export function useIdleTimeout(timeoutMs: number = 1800000) {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const stored = localStorage.getItem('admin_last_activity');
    if (stored) {
      const elapsed = Date.now() - parseInt(stored);
      return Math.max(0, timeoutMs - elapsed);
    }
    return timeoutMs;
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(async () => {
    try {
      localStorage.removeItem('admin_last_activity');
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error('Idle logout error:', error);
    }
  }, [navigate]);

  const checkInactivity = useCallback(() => {
    const lastActivity = localStorage.getItem('admin_last_activity');
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity);
      const remaining = Math.max(0, timeoutMs - elapsed);
      setTimeLeft(remaining);
      
      if (elapsed >= timeoutMs) {
        handleLogout();
      }
    } else {
      localStorage.setItem('admin_last_activity', Date.now().toString());
      setTimeLeft(timeoutMs);
    }
  }, [timeoutMs, handleLogout]);

  useEffect(() => {
    const resetTimer = () => {
      localStorage.setItem('admin_last_activity', Date.now().toString());
      setTimeLeft(timeoutMs);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'keydown'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    const stored = localStorage.getItem('admin_last_activity');
    if (!stored) resetTimer();
    
    timerRef.current = setInterval(checkInactivity, 1000); // Check every second for countdown

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [timeoutMs, checkInactivity]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return {
    timeLeft,
    minutes,
    seconds,
    isExpiringSoon: timeLeft < 300000 // 5 minutes warning
  };
}
