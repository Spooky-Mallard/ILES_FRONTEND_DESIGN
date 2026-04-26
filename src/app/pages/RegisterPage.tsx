import { useState } from "react";
import { NavLink } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  GraduationCap, Eye, EyeOff, Lock, User, Mail, Phone, Building2, BookOpen,
  AlertCircle, CheckCircle2, ArrowLeft, ChevronRight, ClipboardCheck, LayoutDashboard,
  Moon, Sun,
} from "lucide-react";
import { LoadingSpinner } from "../components/LoadingSpinner";

const ROLES = [
  { value: "student", label: "Student Intern", icon: GraduationCap, desc: "Submit weekly logs, track your internship", color: "#1a365d" },
  { value: "workplace_supervisor", label: "Workplace Supervisor", icon: ClipboardCheck, desc: "Review logs from your assigned interns", color: "#276749" },
  { value: "academic_supervisor", label: "Academic Supervisor", icon: BookOpen, desc: "Evaluate and grade students academically", color: "#c05621" },
  { value: "internship_admin", label: "Internship Administrator", icon: LayoutDashboard, desc: "Manage placements, users & system data", color: "#6b46c1" },
];

export function RegisterPage() {
  const { isDark, toggleDark } = useAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [form, setForm] = useState({ username: "", email: "", firstName: "", lastName: "", password: "", confirmPassword: "", phone: "", university: "Makerere University", course: "", department: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const selectedRole = ROLES.find((r) => r.value === role);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8 || pwd.length > 16) return "Password must be 8–16 characters.";
    if (!/[A-Z]/.test(pwd)) return "Password needs at least one uppercase letter.";
    if (!/[a-z]/.test(pwd)) return "Password needs at least one lowercase letter.";
    if (!/[0-9]/.test(pwd)) return "Password needs at least one number.";
    if (!/[!@#$%^&*]/.test(pwd)) return "Password needs at least one special character (!@#$%^&*).";
    return null;
  };

  const handleNext = () => {
    if (step === 1 && !role) { setError("Please select your role."); return; }
    setError(""); setStep((s) => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwdError = validatePassword(form.password);
    if (pwdError) { setError(pwdError); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    setError(""); setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false); setDone(true);
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-800 dark:text-white focus:outline-none transition-all";

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: "#f0fff4" }}>
            <CheckCircle2 size={32} style={{ color: "#276749" }} />
          </div>
          <h2 className="text-gray-900 dark:text-white mb-2" style={{ fontSize: "1.2rem", fontWeight: 700 }}>Account Created!</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-6" style={{ lineHeight: 1.7 }}>
            Your account as <strong>{selectedRole?.label}</strong> has been created. You can now sign in to access your dashboard.
          </p>
          <NavLink to="/login" className="flex items-center justify-center gap-2 w-full py-3 text-sm text-white rounded-xl hover:opacity-90 transition-all" style={{ backgroundColor: "#1a365d" }}>
            Sign In Now
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900">
      {/* Left Panel */}
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
          <h2 className="text-white mb-4" style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1.3 }}>Create your account</h2>
          <p className="text-white/60 text-sm mb-10" style={{ lineHeight: 1.7 }}>
            Join ILES to start tracking, reviewing, or managing internships with a role-based dashboard tailored for you.
          </p>
          <div className="space-y-4">
            {[{ n: 1, label: "Choose your role" }, { n: 2, label: "Basic information" }, { n: 3, label: "Academic details" }].map((s) => (
              <div key={s.n} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0" style={{ backgroundColor: step > s.n ? "#276749" : step === s.n ? "white" : "rgba(255,255,255,0.1)", color: step === s.n ? "#1a365d" : "white", fontWeight: 600 }}>
                  {step > s.n ? <CheckCircle2 size={14} /> : s.n}
                </div>
                <span className="text-sm" style={{ color: step >= s.n ? "white" : "rgba(255,255,255,0.4)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-white/30 text-xs">Makerere University · CS · 2025–2026</div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-between mb-8">
            <NavLink to="/login" className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors">
              <ArrowLeft size={14} /> Already have an account? Sign in
            </NavLink>
            <button onClick={toggleDark} className="p-2 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-100 mb-4">
              <AlertCircle size={14} className="text-red-500" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <h1 className="text-gray-900 dark:text-white mb-1" style={{ fontSize: "1.3rem", fontWeight: 700 }}>What's your role?</h1>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">Your role determines your dashboard and features.</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {ROLES.map((r) => (
                  <button key={r.value} onClick={() => { setRole(r.value); setError(""); }} className={`p-4 rounded-xl border-2 text-left transition-all ${role === r.value ? "border-[#1a365d] bg-blue-50 dark:bg-slate-800" : "border-gray-200 dark:border-slate-700 hover:border-gray-300 bg-white dark:bg-slate-800"}`}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: r.color + "15" }}>
                      <r.icon size={18} style={{ color: r.color }} />
                    </div>
                    <p className="text-gray-800 dark:text-white mb-1" style={{ fontSize: "0.82rem", fontWeight: 600 }}>{r.label}</p>
                    <p className="text-gray-500 dark:text-slate-400" style={{ fontSize: "0.72rem" }}>{r.desc}</p>
                    {role === r.value && <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: "#1a365d" }}><CheckCircle2 size={12} /> Selected</div>}
                  </button>
                ))}
              </div>
              <button onClick={handleNext} className="w-full py-3 text-sm text-white rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all" style={{ backgroundColor: "#1a365d" }}>
                Continue <ChevronRight size={15} />
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); const err = validatePassword(form.password); if (err) { setError(err); return; } if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; } setError(""); setStep(3); }}>
              <h1 className="text-gray-900 dark:text-white mb-1" style={{ fontSize: "1.3rem", fontWeight: 700 }}>Basic Information</h1>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">Your credentials and personal details.</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="block text-sm text-gray-700 dark:text-slate-300 mb-1.5" style={{ fontWeight: 500 }}>First Name</label><input type="text" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="John" className={inputClass} required /></div>
                <div><label className="block text-sm text-gray-700 dark:text-slate-300 mb-1.5" style={{ fontWeight: 500 }}>Last Name</label><input type="text" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Doe" className={inputClass} required /></div>
              </div>
              <div className="mb-3">
                <label className="block text-sm text-gray-700 dark:text-slate-300 mb-1.5" style={{ fontWeight: 500 }}>Username</label>
                <div className="relative"><User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={form.username} onChange={(e) => update("username", e.target.value)} placeholder="john.doe" className={inputClass + " pl-9"} required /></div>
              </div>
              <div className="mb-3">
                <label className="block text-sm text-gray-700 dark:text-slate-300 mb-1.5" style={{ fontWeight: 500 }}>Email Address</label>
                <div className="relative"><Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="j.doe@student.mak.ac.ug" className={inputClass + " pl-9"} required /></div>
              </div>
              <div className="mb-3">
                <label className="block text-sm text-gray-700 dark:text-slate-300 mb-1.5" style={{ fontWeight: 500 }}>Phone</label>
                <div className="relative"><Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+256 700 000000" className={inputClass + " pl-9"} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-1">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-slate-300 mb-1.5" style={{ fontWeight: 500 }}>Password</label>
                  <div className="relative"><Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type={showPass ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••" className={inputClass + " pl-9 pr-9"} required />
                    <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPass ? <EyeOff size={14} /> : <Eye size={14} />}</button></div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-slate-300 mb-1.5" style={{ fontWeight: 500 }}>Confirm Password</label>
                  <div className="relative"><Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type={showPass ? "text" : "password"} value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="••••••••" className={inputClass + " pl-9"} required /></div>
                </div>
              </div>
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-5">8–16 chars · Uppercase · Lowercase · Number · Special char (!@#$%^&*)</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 text-sm text-gray-700 dark:text-slate-300 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">Back</button>
                <button type="submit" className="flex-1 py-3 text-sm text-white rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2" style={{ backgroundColor: "#1a365d" }}>Continue <ChevronRight size={15} /></button>
              </div>
            </form>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <h1 className="text-gray-900 dark:text-white mb-1" style={{ fontSize: "1.3rem", fontWeight: 700 }}>Academic Details</h1>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">Help us set up your ILES profile.</p>
              <div className="mb-3">
                <label className="block text-sm text-gray-700 dark:text-slate-300 mb-1.5" style={{ fontWeight: 500 }}>University / Institution</label>
                <div className="relative"><Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={form.university} onChange={(e) => update("university", e.target.value)} placeholder="Makerere University" className={inputClass + " pl-9"} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-slate-300 mb-1.5" style={{ fontWeight: 500 }}>Course / Program</label>
                  <div className="relative"><BookOpen size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={form.course} onChange={(e) => update("course", e.target.value)} placeholder="BS Computer Science" className={inputClass + " pl-9"} /></div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 dark:text-slate-300 mb-1.5" style={{ fontWeight: 500 }}>Department</label>
                  <div className="relative"><Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={form.department} onChange={(e) => update("department", e.target.value)} placeholder="DECS" className={inputClass + " pl-9"} /></div>
                </div>
              </div>
              {selectedRole && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5" style={{ backgroundColor: selectedRole.color + "10", border: `1px solid ${selectedRole.color}30` }}>
                  <selectedRole.icon size={16} style={{ color: selectedRole.color }} />
                  <div>
                    <p className="text-gray-800 dark:text-white" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Registering as: {selectedRole.label}</p>
                    <p className="text-gray-500 dark:text-slate-400" style={{ fontSize: "0.7rem" }}>{selectedRole.desc}</p>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">By registering, you agree to use ILES for legitimate academic internship purposes only.</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 text-sm text-gray-700 dark:text-slate-300 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">Back</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 text-sm text-white rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60" style={{ backgroundColor: "#1a365d" }}>
                  {loading ? <><LoadingSpinner size={16} color="white" /><span>Creating...</span></> : "Create Account"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
