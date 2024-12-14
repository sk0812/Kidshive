"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

type ExtendedUser = {
  id: string;
  email?: string;
  role?: string;
  name?: string;
  phoneNumber?: string;
};

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserData(session);
        } else {
          setUser(null);
          setLoading(false);
        }

        // Set up auth state change listener
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            await fetchUserData(session);
          } else {
            setUser(null);
            setLoading(false);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing auth:", error);
        setUser(null);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const fetchUserData = async (session: Session) => {
    try {
      const response = await fetch("/api/users/me", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const userData = await response.json();

      setUser({
        id: session.user.id,
        email: session.user.email,
        role: userData.role,
        name: userData.name,
        phoneNumber: userData.phoneNumber,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
