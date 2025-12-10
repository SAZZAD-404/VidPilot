// Credit System for VidPilot
// Manages user credits and usage limits

export interface CreditInfo {
  total: number;
  used: number;
  remaining: number;
  plan: "free" | "pro" | "enterprise";
  resetDate: string;
}

const CREDIT_LIMITS = {
  free: 10,
  pro: -1, // Unlimited
  enterprise: -1, // Unlimited
};

const STORAGE_KEY = "vidpilot_credits";

// Get current month key for credit reset
const getCurrentMonthKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}`;
};

// Get reset date (first day of next month)
const getResetDate = (): string => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toLocaleDateString();
};

// Initialize credits for new month
const initializeCredits = (plan: "free" | "pro" | "enterprise" = "free"): CreditInfo => {
  return {
    total: CREDIT_LIMITS[plan],
    used: 0,
    remaining: CREDIT_LIMITS[plan],
    plan,
    resetDate: getResetDate(),
  };
};

// Get credit info from localStorage
export const getCredits = (userId?: string): CreditInfo => {
  try {
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      const credits = initializeCredits();
      localStorage.setItem(key, JSON.stringify({ ...credits, month: getCurrentMonthKey() }));
      return credits;
    }

    const data = JSON.parse(stored);
    const currentMonth = getCurrentMonthKey();

    // Reset credits if new month
    if (data.month !== currentMonth) {
      const credits = initializeCredits(data.plan || "free");
      localStorage.setItem(key, JSON.stringify({ ...credits, month: currentMonth }));
      return credits;
    }

    return {
      total: data.total,
      used: data.used,
      remaining: data.remaining,
      plan: data.plan || "free",
      resetDate: data.resetDate,
    };
  } catch (error) {
    console.error("Error getting credits:", error);
    return initializeCredits();
  }
};

// Use credits (deduct from balance)
export const useCredit = (amount: number = 1, userId?: string): boolean => {
  try {
    const credits = getCredits(userId);

    // Unlimited plans
    if (credits.plan === "pro" || credits.plan === "enterprise") {
      return true;
    }

    // Check if enough credits
    if (credits.remaining < amount) {
      return false;
    }

    // Deduct credits
    const newUsed = credits.used + amount;
    const newRemaining = credits.total - newUsed;

    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
    const updated = {
      ...credits,
      used: newUsed,
      remaining: newRemaining,
      month: getCurrentMonthKey(),
    };

    localStorage.setItem(key, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error("Error using credit:", error);
    return false;
  }
};

// Check if user has enough credits
export const hasCredits = (amount: number = 1, userId?: string): boolean => {
  const credits = getCredits(userId);
  
  // Unlimited plans
  if (credits.plan === "pro" || credits.plan === "enterprise") {
    return true;
  }

  return credits.remaining >= amount;
};

// Update user plan
export const updatePlan = (plan: "free" | "pro" | "enterprise", userId?: string): void => {
  try {
    const credits = getCredits(userId);
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
    
    const updated = {
      ...credits,
      plan,
      total: CREDIT_LIMITS[plan],
      remaining: plan === "free" ? CREDIT_LIMITS[plan] - credits.used : -1,
      month: getCurrentMonthKey(),
    };

    localStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.error("Error updating plan:", error);
  }
};

// Reset credits (for testing or admin)
export const resetCredits = (userId?: string): void => {
  try {
    const credits = getCredits(userId);
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
    
    const reset = initializeCredits(credits.plan);
    localStorage.setItem(key, JSON.stringify({ ...reset, month: getCurrentMonthKey() }));
  } catch (error) {
    console.error("Error resetting credits:", error);
  }
};

// Get credit percentage (for progress bars) - shows USED percentage
export const getCreditPercentage = (userId?: string): number => {
  const credits = getCredits(userId);
  
  if (credits.plan === "pro" || credits.plan === "enterprise") {
    return 100; // Always full for unlimited
  }

  if (credits.total === 0) return 0;
  return Math.round((credits.used / credits.total) * 100);
};

// Get credit color based on used percentage
export const getCreditColor = (userId?: string): string => {
  const percentage = getCreditPercentage(userId);
  
  // Since percentage now shows USED credits, reverse the logic
  if (percentage < 50) return "text-green-500";
  if (percentage < 80) return "text-yellow-500";
  return "text-red-500";
};

// Format credits for display
export const formatCredits = (credits: CreditInfo): string => {
  if (credits.plan === "pro" || credits.plan === "enterprise") {
    return "Unlimited";
  }
  return `${credits.remaining}/${credits.total}`;
};
