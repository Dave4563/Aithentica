import { createContext, useEffect, useState } from "react";
import { getUser } from "../api/auth";

type AuthContextType = {
  user: any;
  setUser: (u: any) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setUser(await getUser());
      } catch {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
};
