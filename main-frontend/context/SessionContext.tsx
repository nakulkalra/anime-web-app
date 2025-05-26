"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: number;
  email: string;
  iat: number;
  exp: number;
}

interface Session {
  message: string;
  user: User;
}

interface SessionContextType {
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSession = async () => {
        try {
            const response = await axios.get<Session>("/api/check-session", {
              withCredentials: true, // Include cookies with the request
            });
            setSession(response.data);
          } catch (error) {
            // console.error("Error fetching session:", error);
            setSession(null);
          } finally {
            setLoading(false);
          }
        };

    fetchSession();
  }, []);

  return (
    <SessionContext.Provider value={{ session, setSession, loading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
