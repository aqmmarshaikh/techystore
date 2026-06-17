import { useState, useCallback } from "react";

interface RateLimitConfig {
  maxAttempts: number;
  timeWindowMs: number;
}

export function useRateLimit(config: RateLimitConfig = { maxAttempts: 5, timeWindowMs: 60000 }) {
  const [attempts, setAttempts] = useState<number[]>([]);

  const isRateLimited = useCallback(() => {
    const now = Date.now();
    // Filter attempts to only those within our time window
    const recentAttempts = attempts.filter((timestamp) => now - timestamp < config.timeWindowMs);
    
    if (recentAttempts.length >= config.maxAttempts) {
      return true;
    }
    
    // Add current attempt
    setAttempts([...recentAttempts, now]);
    return false;
  }, [attempts, config]);

  const resetRateLimit = useCallback(() => {
    setAttempts([]);
  }, []);

  return { isRateLimited, resetRateLimit, attemptsLeft: Math.max(0, config.maxAttempts - attempts.length) };
}
