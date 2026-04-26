import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";
import {
  GraduationCap, Eye, EyeOff, Lock, User, AlertCircle,
  ChevronRight, ClipboardCheck, LayoutDashboard, BookOpen, Moon, Sun, ArrowLeft,
} from "lucide-react";

const DEMO_USERS = [
  { role: "student", username: "maria.reyes", password: "student123", label: "Student (with placement)", icon: GraduationCap, color: "#1a365d" },
  { role: "student_new", username: "john.doe", password: "student123", label: "Student (no placement)", icon: GraduationCap, color: "#2b6cb0" },
  { role: "workplace_supervisor", username: "dr.santos", password: "supervisor123", label: "Workplace Supervisor", icon: ClipboardCheck, color: "#276749" },
  { role: "academic_supervisor", username: "prof.torres", password: "supervisor123", label: "Academic Supervisor", icon: BookOpen, color: "#c05621" },
  { role: "internship_admin", username: "admin", password: "admin123", label: "Internship Admin", icon: LayoutDashboard, color: "#6b46c1" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isDark, toggleDark, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await login(username, password);
    if (result.success) {
      // Navigate based on role from stored user
      // We need to re-read from context after login, but since login is async, we'll route based on username
      const found = DEMO_USERS.find((u) => u.username === username);
      if (found?.role === "workplace_supervisor") navigate("/supervisor/workplace");
      else if (found?.role === "academic_supervisor") navigate("/supervisor/academic");
      else if (found?.role === "internship_admin") navigate("/admin");
      else navigate("/student/dashboard");
    } else {
      setError(result.error || "Invalid credentials.");
    }
  };

  const fillDemo = (u: (typeof DEMO_USERS)[0]) => {
    setUsername(u.username);
    setPassword(u.password);
    setError("");
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex flex-col justify-between w-96 p-10 flex-shrink-0" style={{ backgroundColor: "#1a365d" }}>
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white" style={{ fontWeight: 700, fontSize: "0.95rem" }}>ILES</p>
              <p className="text-white/50" style={{ fontSize: "0.65rem" }}>Internship Logging & Evaluation System</p>
            </div>
          </div>
          <h2 className="text-white mb-4" style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1.3 }}>Welcome back</h2>
          <p className="text-white/60 text-sm mb-10" style={{ lineHeight: 1.7 }}>
            Sign in to access your dashboard. Students, supervisors, and admins each have a tailored view of the system.
          </p>
          <div className="space-y-3">
            {["Weekly logbook submission & tracking", "Supervisor review & revision flow", "Weighted evaluation scoring", "Admin analytics & placements"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-white/70">
                <ChevronRight size={13} className="text-white/30 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="text-white/30 text-xs">Makerere University · Computer Science · 2025–2026</div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <NavLink to="/" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors">
              <ArrowLeft size={14} /> Back to Home
            </NavLink>
            <button onClick={toggleDark} className="p-2 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          <h1 className="text-gray-900 dark:text-white mb-1" style={{ fontSize: "1.4rem", fontWeight: 700 }}>Sign in to ILES</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-8">
            Don't have an account?{" "}
            <NavLink to="/register" className="hover:underline" style={{ color: "#1a365d" }}>Register here</NavLink>
          </p>

          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 mb-5">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-slate-300 mb-1.5" style={{ fontWeight: 500 }}>Username</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your.username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-slate-300 mb-1.5" style={{ fontWeight: 500 }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 transition-all"
                  required
                />
                <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 text-sm text-white rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60"
              style={{ backgroundColor: "#1a365d" }}
            >
              {isLoading ? <LoadingSpinner size={18} color="white" /> : "Sign In"}
              {isLoading && <span>Signing in...</span>}
            </button>
          </form>

          {/* Demo Quick Login */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
              <span className="text-xs text-gray-400 dark:text-slate-500">Quick demo access</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
            </div>
            <div className="grid grid-cols-1 gap-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.role}
                  onClick={() => fillDemo(u)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: u.color + "15" }}>
                    <u.icon size={14} style={{ color: u.color }} />
                  </div>
                  <div>
                    <p className="text-gray-800 dark:text-white" style={{ fontSize: "0.75rem", fontWeight: 600 }}>{u.label}</p>
                    <p className="text-gray-400 dark:text-slate-500" style={{ fontSize: "0.65rem" }}>{u.username}</p>
                  </div>
                  <ChevronRight size={12} className="ml-auto text-gray-300 dark:text-slate-600" />
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-3">Click any row to fill credentials, then click Sign In</p>
          </div>
        </div>
      </div>
    </div>
  );
}
