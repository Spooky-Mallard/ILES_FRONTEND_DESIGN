import { NavLink } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Star,
  Building2,
  Shield,
  ArrowRight,
  Moon,
  Sun,
  ChevronRight,
  Clock,
  Users,
  CheckCircle2,
} from "lucide-react";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Register & Get Placed",
    desc: "Students register, select their role, and an admin links them to an internship placement at a partner company.",
    color: "#1a365d",
  },
  {
    step: "02",
    title: "Submit Weekly Logs",
    desc: "Each week, students log their activities, learnings, and challenges. Logs move from Draft → Pending → Reviewed → Approved.",
    color: "#276749",
  },
  {
    step: "03",
    title: "Supervisor Review",
    desc: "Workplace supervisors review and approve logs. Academic supervisors evaluate interns on weighted performance criteria.",
    color: "#c05621",
  },
  {
    step: "04",
    title: "Final Evaluation",
    desc: "At the end of the internship, students receive a final weighted score covering technical skills, communication, and initiative.",
    color: "#6b46c1",
  },
];

const FEATURES = [
  { icon: BookOpen, title: "Weekly Logbook", desc: "Structured weekly activity logs with Draft → Pending → Approved workflow.", color: "#1a365d" },
  { icon: ClipboardCheck, title: "Supervisor Review", desc: "Approve, request revision, or reject logs with comments and feedback.", color: "#276749" },
  { icon: Star, title: "Weighted Evaluation", desc: "Score interns on Punctuality, Technical Skills, Initiative — computed automatically.", color: "#b7791f" },
  { icon: Building2, title: "Placement Tracking", desc: "Link students to companies and supervisors with clear start/end dates.", color: "#c05621" },
  { icon: Shield, title: "Role-Based Access", desc: "Student, Workplace Supervisor, Academic Supervisor, Admin — each sees only their data.", color: "#2b6cb0" },
  { icon: Users, title: "Admin Analytics", desc: "System-wide insights: placement rates, completion trends, log statistics.", color: "#6b46c1" },
];

const STATS = [
  { value: "100+", label: "Students Enrolled", icon: GraduationCap },
  { value: "87%", label: "Placement Rate", icon: Building2 },
  { value: "12 wks", label: "Average Duration", icon: Clock },
  { value: "4 Roles", label: "User Types", icon: Users },
];

export function HomePage() {
  const { isDark, toggleDark, user } = useAuth();

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-gray-100 dark:border-slate-800 px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#1a365d" }}>
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <span className="text-gray-900 dark:text-white" style={{ fontWeight: 700, fontSize: "0.95rem" }}>ILES</span>
            <span className="text-gray-400 text-xs ml-2 hidden sm:inline">Internship Logging & Evaluation System</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-all"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <NavLink
              to={
                user.role === "student" ? "/student/dashboard"
                  : user.role === "workplace_supervisor" ? "/supervisor/workplace"
                  : user.role === "academic_supervisor" ? "/supervisor/academic"
                  : "/admin"
              }
              className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-all"
              style={{ backgroundColor: "#1a365d" }}
            >
              Go to Dashboard
            </NavLink>
          ) : (
            <>
              <NavLink to="/login" className="px-4 py-2 text-sm text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700 transition-all">
                Sign In
              </NavLink>
              <NavLink to="/register" className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-all" style={{ backgroundColor: "#1a365d" }}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden flex flex-col items-center text-center px-8 py-24" style={{ background: "linear-gradient(135deg, #1a365d 0%, #2b6cb0 60%, #1a365d 100%)" }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute rounded-full opacity-10" style={{ backgroundColor: "white", width: `${100 + i * 80}px`, height: `${100 + i * 80}px`, top: `${5 + i * 15}%`, left: `${-10 + i * 22}%` }} />
          ))}
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-white mb-6" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Makerere University · Computer Science · Academic Year 2025–2026
          </span>
          <h1 className="text-white mb-5" style={{ fontSize: "2.6rem", fontWeight: 700, lineHeight: 1.2 }}>
            Track Every Step of
            <br />
            <span style={{ color: "#90cdf4" }}>Your Internship Journey</span>
          </h1>
          <p className="mb-10 max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.75)", fontSize: "1rem", lineHeight: 1.8 }}>
            ILES helps CS students at Makerere University log weekly activities, get feedback from supervisors, and build a verifiable record of their internship experience.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <NavLink to="/register" className="flex items-center gap-2 px-6 py-3 text-sm rounded-xl text-[#1a365d] bg-white hover:bg-gray-100 transition-all" style={{ fontWeight: 600 }}>
              Get Started <ArrowRight size={15} />
            </NavLink>
            <NavLink to="/login" className="flex items-center gap-2 px-6 py-3 text-sm rounded-xl text-white border border-white/30 hover:bg-white/10 transition-all">
              Sign In <ChevronRight size={14} />
            </NavLink>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="py-10 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <s.icon size={16} style={{ color: "#1a365d" }} />
                <span className="dark:text-white" style={{ fontSize: "1.7rem", fontWeight: 700, color: "#1a365d" }}>{s.value}</span>
              </div>
              <p className="text-gray-500 dark:text-slate-400 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <section className="py-20 px-8 bg-gray-50 dark:bg-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-gray-900 dark:text-white mb-2" style={{ fontSize: "1.6rem", fontWeight: 700 }}>
            How ILES Works
          </h2>
          <p className="text-center text-gray-500 dark:text-slate-400 text-sm mb-12">
            Four simple steps from placement to final evaluation
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-full w-full h-px border-t border-dashed border-gray-300 dark:border-slate-600 z-0" style={{ width: "calc(100% - 2rem)" }} />
                )}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5 relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-mono text-white" style={{ backgroundColor: step.color }}>
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-gray-900 dark:text-white mb-2" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                    {step.title}
                  </h3>
                  <p className="text-gray-500 dark:text-slate-400" style={{ fontSize: "0.8rem", lineHeight: 1.6 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-8 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-gray-900 dark:text-white mb-2" style={{ fontSize: "1.6rem", fontWeight: 700 }}>
            Built for the Full Internship Lifecycle
          </h2>
          <p className="text-center text-gray-500 dark:text-slate-400 text-sm mb-12">
            Everything the team needs — from day one to the final grade
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-5 rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-200 dark:hover:border-slate-600 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: f.color + "15" }}>
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <h4 className="text-gray-800 dark:text-white mb-1.5" style={{ fontSize: "0.9rem", fontWeight: 600 }}>{f.title}</h4>
                <p className="text-gray-500 dark:text-slate-400" style={{ fontSize: "0.8rem", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-8" style={{ background: "linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-white mb-3" style={{ fontSize: "1.6rem", fontWeight: 700 }}>
            Ready to start your internship journey?
          </h2>
          <p className="text-white/70 text-sm mb-8" style={{ lineHeight: 1.7 }}>
            Register today to submit your first logbook entry and connect with your supervisors.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <NavLink to="/register" className="flex items-center gap-2 px-6 py-3 text-sm text-[#1a365d] bg-white rounded-xl hover:bg-gray-100 transition-all" style={{ fontWeight: 600 }}>
              Create Account <ArrowRight size={15} />
            </NavLink>
            <NavLink to="/login" className="flex items-center gap-2 px-6 py-3 text-sm text-white border border-white/30 rounded-xl hover:bg-white/10 transition-all">
              Already have an account? Sign in
            </NavLink>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-8 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: "#1a365d" }}>
            <GraduationCap size={13} className="text-white" />
          </div>
          <span className="text-xs text-gray-500 dark:text-slate-400">
            ILES · Makerere University · Computer Science · 2025–2026
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-slate-500">
          <NavLink to="/login" className="hover:text-gray-600 dark:hover:text-slate-300 transition-colors">Sign In</NavLink>
          <NavLink to="/register" className="hover:text-gray-600 dark:hover:text-slate-300 transition-colors">Register</NavLink>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={10} style={{ color: "#276749" }} /> Built with React + Django
          </span>
        </div>
      </footer>
    </div>
  );
}
