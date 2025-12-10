// Demo Mode Utilities

export const isDemoMode = (): boolean => {
  return localStorage.getItem("demo_mode") === "true";
};

export const exitDemoMode = (): void => {
  localStorage.removeItem("demo_mode");
};

export const requireAuth = (action: string = "use this feature"): boolean => {
  if (isDemoMode()) {
    return false;
  }
  return true;
};

export const showDemoRestriction = (toast: any): void => {
  toast.error("Demo Mode - Please login to use this feature", {
    description: "You're in view-only demo mode. Sign up to unlock all features!",
    action: {
      label: "Sign Up",
      onClick: () => window.location.href = "/register",
    },
  });
};
