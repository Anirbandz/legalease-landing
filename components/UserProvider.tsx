"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";

interface UserContextType {
  user: any;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get current user on mount
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      
      // Ensure user record exists in our database
      if (data.user) {
        try {
          await fetch('/api/user/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: data.user.id,
              email: data.user.email,
              username: data.user.user_metadata?.username || '',
            }),
          });
        } catch (err) {
          console.error('Error ensuring user record exists:', err);
          // Continue anyway
        }
      }
    };
    getUser();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      // Ensure user record exists when auth state changes
      if (session?.user) {
        try {
          await fetch('/api/user/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: session.user.id,
              email: session.user.email,
              username: session.user.user_metadata?.username || '',
            }),
          });
        } catch (err) {
          console.error('Error ensuring user record exists:', err);
          // Continue anyway
        }
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
} 