import { createContext, useContext, useState } from "react";

export interface User {
  name: string;
  email: string;
}

interface UserContextValue {
  user: User | null;
  setUser: (u: User) => void;
}

const UserContext = createContext<UserContextValue>({ user: null, setUser: () => {} });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    const name = localStorage.getItem("userName");
    const email = localStorage.getItem("userEmail");
    return name && email ? { name, email } : null;
  });

  const setUser = (u: User) => {
    localStorage.setItem("userName", u.name);
    localStorage.setItem("userEmail", u.email);
    setUserState(u);
  };

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
