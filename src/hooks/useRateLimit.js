import { useState, useEffect } from 'react';

const useRateLimit = (maxAttempts = 5, windowMs = 60 * 1000) => {
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (attempts >= maxAttempts) {
      setIsLocked(true);
      const timer = setTimeout(() => {
        setAttempts(0);
        setIsLocked(false);
      }, windowMs);
      return () => clearTimeout(timer);
    }
  }, [attempts, maxAttempts, windowMs]);

  const incrementAttempt = () => setAttempts((prev) => prev + 1);

  return { isLocked, incrementAttempt };
};

export default useRateLimit;