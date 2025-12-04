import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, supabaseAvailable } from "../supabaseClient";
import type { User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseAvailable) {
      setError("Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      setLoading(false);
      return;
    }

    const init = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setError(error.message);
      } else {
        setUser(data.session?.user ?? null);
      }
      setLoading(false);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
      } else {
        setUser(session?.user ?? null);
      }
    });

    init();

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    if (!supabaseAvailable || !supabase) {
      setError("Missing Supabase configuration.");
      return;
    }
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
  };

  const signIn = async (email: string, password: string) => {
    if (!supabaseAvailable || !supabase) {
      setError("Missing Supabase configuration.");
      return;
    }
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
  };

  const signOut = async () => {
    if (!supabaseAvailable || !supabase) {
      setError("Missing Supabase configuration.");
      return;
    }
    setError(null);
    const { error } = await supabase.auth.signOut();
    if (error) setError(error.message);
  };

  const clearError = () => setError(null);

  const value: AuthContextValue = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
