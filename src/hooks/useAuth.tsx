import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  updateProfile: (name: string, email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for demo session first
    const demoSessionStr = localStorage.getItem("demo_session");
    if (demoSessionStr) {
      try {
        const demoSession = JSON.parse(demoSessionStr);
        setSession(demoSession);
        setUser(demoSession.user);
        setIsLoading(false);
        return;
      } catch (error) {
        localStorage.removeItem("demo_session");
      }
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    // Clear demo mode when signing up
    localStorage.removeItem("demo_mode");
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name }
      }
    });
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    // Clear demo mode when logging in
    localStorage.removeItem("demo_mode");

    // Demo login support
    if (email === "demo@vidpilot.com" && password === "demo123456") {
      const demoUser = {
        id: "demo-user-id",
        email: "demo@vidpilot.com",
        user_metadata: { name: "Demo User" },
        app_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as User;
      
      const demoSession = {
        access_token: "demo-token",
        refresh_token: "demo-refresh",
        expires_in: 3600,
        token_type: "bearer",
        user: demoUser,
      } as Session;
      
      setUser(demoUser);
      setSession(demoSession);
      localStorage.setItem("demo_session", JSON.stringify(demoSession));
      
      return { error: null };
    }

    // Real Supabase login
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    // Clear demo session
    localStorage.removeItem("demo_session");
    
    // Clear Supabase session
    await supabase.auth.signOut();
    
    // Clear state
    setUser(null);
    setSession(null);
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updateProfile = async (name: string, email: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        email: email,
        data: { name }
      });
      
      if (!error && user) {
        setUser({
          ...user,
          email: email,
          user_metadata: { ...user.user_metadata, name }
        });
      }
      
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signUp, signIn, signOut, updatePassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
