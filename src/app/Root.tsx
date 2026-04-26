import { Outlet } from "react-router";
import { useAuth } from "./context/AuthContext";

export function Root() {
  const { isDark } = useAuth();

  return (
    <div className={isDark ? "dark" : ""} style={{ minHeight: "100vh" }}>
      <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-200">
        <Outlet />
      </div>
    </div>
  );
}
