import { createContext, useContext, useState, type ReactNode } from "react";

export type UserRole = "student" | "workplace_supervisor" | "academic_supervisor" | "internship_admin";

export interface User {
  username: string;
  role: UserRole;
  name: string;
  initials: string;
  email: string;
  hasPlacement: boolean;
}

interface AuthContextValue {
  user: User | null;
  isDark: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  toggleDark: () => void;
  setHasPlacement: () => void;
}

const DEMO_USERS: (User & { password: string })[] = [
  {
    username: "maria.reyes",
    password: "student123",
    role: "student",
    name: "Maria Reyes",
    initials: "MR",
    email: "m.reyes@student.edu",
    hasPlacement: true,
  },
  {
    username: "john.doe",
    password: "student123",
    role: "student",
    name: "John Doe",
    initials: "JD",
    email: "j.doe@student.edu",
    hasPlacement: false, // No placement yet!
  },
  {
    username: "dr.santos",
    password: "supervisor123",
    role: "workplace_supervisor",
    name: "Dr. Elena Santos",
    initials: "ES",
    email: "e.santos@faculty.edu",
    hasPlacement: false,
  },
  {
    username: "prof.torres",
    password: "supervisor123",
    role: "academic_supervisor",
    name: "Prof. Miguel Torres",
    initials: "MT",
    email: "m.torres@faculty.edu",
    hasPlacement: false,
  },
  {
    username: "admin",
    password: "admin123",
    role: "internship_admin",
    name: "Admin User",
    initials: "AU",
    email: "admin@iles.edu",
    hasPlacement: false,
  },
];

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    const found = DEMO_USERS.find((u) => u.username === username && u.password === password);
    setIsLoading(false);
    if (found) {
      const { password: _p, ...userData } = found;
      setUser(userData);
      return { success: true };
    }
    return { success: false, error: "Invalid credentials. Try one of the demo accounts below." };
  };

  const logout = () => setUser(null);

  const toggleDark = () => setIsDark((d) => !d);

  const setHasPlacement = () => {
    if (user) setUser({ ...user, hasPlacement: true });
  };

  return (
    <AuthContext.Provider value={{ user, isDark, isLoading, login, logout, toggleDark, setHasPlacement }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
