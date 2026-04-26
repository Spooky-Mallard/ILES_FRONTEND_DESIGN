import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle2, Clock, MessageSquare, Star, Search, Bell, Users, ClipboardList,
  AlertTriangle, Eye, ThumbsUp, X, RotateCcw, XCircle, LogOut, Home, BarChart2,
  ClipboardCheck, Moon, Sun, GraduationCap, ChevronRight, TrendingUp, BookOpen,
} from "lucide-react";

type Status = "pending" | "approved" | "revision_requested" | "rejected";
type Grade = "" | "A" | "B+" | "B" | "C+" | "C" | "F";

interface Student {
  id: number; name: string; initials: string; course: string; company: string;
  week: number; totalWeeks: number; hoursLogged: number; latestLog: string;
  latestLogDate: string; status: Status; grade: Grade; rating: number;
}

const STUDENTS: Student[] = [
  { id: 1, name: "Maria Reyes", initials: "MR", course: "BS Computer Science", company: "TechNova Solutions", week: 12, totalWeeks: 15, hoursLogged: 384, latestLog: "Worked on API integration and completed the client portal authentication module. Attended sprint review and updated documentation.", latestLogDate: "Apr 23, 2026", status: "pending", grade: "", rating: 0 },
  { id: 2, name: "Juan dela Cruz", initials: "JC", course: "BS Information Technology", company: "DataBridge Analytics", week: 11, totalWeeks: 15, hoursLogged: 352, latestLog: "Created data pipeline scripts using Python and Pandas. Presented interim findings to the data science team and received positive feedback.", latestLogDate: "Apr 22, 2026", status: "approved", grade: "A", rating: 5 },
  { id: 3, name: "Ana Santos", initials: "AS", course: "BS Information Systems", company: "CloudPeak Corp", week: 12, totalWeeks: 15, hoursLogged: 368, latestLog: "Deployed microservices to AWS EC2 and configured auto-scaling groups. Wrote integration tests for the new payment module.", latestLogDate: "Apr 23, 2026", status: "pending", grade: "", rating: 0 },
  { id: 4, name: "Carlos Mendez", initials: "CM", course: "BS Computer Engineering", company: "InnovatePH", week: 10, totalWeeks: 15, hoursLogged: 296, latestLog: "Had difficulty understanding the legacy codebase. Spent most of the day reviewing documentation. Need guidance on the architecture.", latestLogDate: "Apr 20, 2026", status: "revision_requested", grade: "C+", rating: 3 },
  { id: 5, name: "Sofia Lim", initials: "SL", course: "BS Computer Science", company: "MediaHub Creative", week: 12, totalWeeks: 15, hoursLogged: 390, latestLog: "Finished UI components for the mobile app redesign. Collaborated with the design team and completed usability testing sessions.", latestLogDate: "Apr 23, 2026", status: "approved", grade: "A", rating: 5 },
  { id: 6, name: "Ramon Bautista", initials: "RB", course: "BS Information Technology", company: "FinEdge Systems", week: 11, totalWeeks: 15, hoursLogged: 328, latestLog: "Implemented RESTful endpoints for the transaction history feature. Reviewed code with senior engineer and applied suggested improvements.", latestLogDate: "Apr 22, 2026", status: "pending", grade: "", rating: 0 },
];

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending: { label: "Pending Review", color: "#c05621", bg: "#fff7ed", icon: Clock },
  approved: { label: "Approved", color: "#276749", bg: "#f0fff4", icon: CheckCircle2 },
  revision_requested: { label: "Revision Requested", color: "#2b6cb0", bg: "#ebf4ff", icon: RotateCcw },
  rejected: { label: "Rejected", color: "#c53030", bg: "#fff5f5", icon: XCircle },
};

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} className="transition-transform hover:scale-110">
          <Star size={14} fill={(hover || value) >= s ? "#f6ad55" : "none"} color={(hover || value) >= s ? "#f6ad55" : "#cbd5e0"} />
        </button>
      ))}
    </div>
  );
}

const NAV_ITEMS = [
  { icon: Home, label: "Overview", id: "overview" },
  { icon: ClipboardCheck, label: "Review Queue", id: "reviews" },
  { icon: Users, label: "My Students", id: "students" },
  { icon: BarChart2, label: "Reports", id: "reports" },
];

export function WorkplaceSupervisorDashboard() {
  const { user, isDark, toggleDark, logout } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("reviews");
  const [students, setStudents] = useState<Student[]>(STUDENTS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [feedbackStudent, setFeedbackStudent] = useState<Student | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set());

  const bg = isDark ? "bg-slate-900" : "bg-gray-50";
  const cardBg = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-slate-400" : "text-gray-500";
  const sidebarBg = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200";

  const handleMarkReviewed = (id: number, grade: Grade, rating: number) => {
    setStudents((prev) => prev.map((s) => s.id === id ? { ...s, status: "approved" as Status, grade, rating } : s));
    setReviewedIds((prev) => new Set([...prev, id]));
  };
  const handleGradeChange = (id: number, grade: Grade) => setStudents((prev) => prev.map((s) => s.id === id ? { ...s, grade } : s));
  const handleRatingChange = (id: number, rating: number) => setStudents((prev) => prev.map((s) => s.id === id ? { ...s, rating } : s));

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(q) || s.company.toLowerCase().includes(q);
    const matchFilter = filter === "all" || s.status === filter;
    return matchSearch && matchFilter;
  });

  const pendingCount = students.filter((s) => s.status === "pending").length;
  const reviewedCount = students.filter((s) => s.status === "approved").length;
  const revisionCount = students.filter((s) => s.status === "revision_requested").length;

  const ReviewsContent = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-8 py-4 border-b flex-shrink-0" style={{ borderColor: isDark ? "#334155" : "#e2e8f0", backgroundColor: isDark ? "#1e293b" : "white" }}>
        <h1 className={`${textPrimary}`} style={{ fontSize: "1.05rem", fontWeight: 600 }}>Review & Grade Dashboard</h1>
        <p className={`${textSecondary} text-xs mt-0.5`}>Logbook reviews for Week 12 — {pendingCount} pending</p>
      </div>
      <div className="flex-1 overflow-auto px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Pending Reviews", value: pendingCount, icon: Clock, color: "#c05621", bg: "#fff7ed" },
            { label: "Reviewed This Week", value: reviewedCount, icon: CheckCircle2, color: "#276749", bg: "#f0fff4" },
            { label: "Needs Revision", value: revisionCount, icon: AlertTriangle, color: "#c53030", bg: "#fff5f5" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border px-5 py-4 flex items-center gap-4 ${cardBg}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}><s.icon size={20} style={{ color: s.color }} /></div>
              <div><p className={`${textSecondary}`} style={{ fontSize: "0.75rem" }}>{s.label}</p><p style={{ fontSize: "1.5rem", fontWeight: 700, color: s.color }}>{s.value}</p></div>
            </div>
          ))}
        </div>
        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student or company..." className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none ${isDark ? "border-slate-600 bg-slate-700 text-white" : "border-gray-200 bg-white"}`} />
          </div>
          <div className={`flex items-center gap-1 rounded-lg border p-1 ${isDark ? "border-slate-600 bg-slate-800" : "border-gray-200 bg-white"}`}>
            {(["all", "pending", "approved", "revision_requested"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-xs transition-all ${filter === f ? "text-white" : `${textSecondary} hover:bg-gray-50 dark:hover:bg-slate-700`}`} style={filter === f ? { backgroundColor: "#1a365d" } : {}}>
                {f === "all" ? "All" : f === "pending" ? "Pending" : f === "approved" ? "Approved" : "Needs Revision"}
              </button>
            ))}
          </div>
          <span className={`${textSecondary} text-sm flex items-center gap-1.5 ml-auto`}><Users size={14} />{filtered.length} students</span>
        </div>
        {/* Student Cards */}
        <div className="grid grid-cols-12 gap-4">
          {filtered.map((student) => {
            const statusCfg = STATUS_CONFIG[student.status];
            const isJustReviewed = reviewedIds.has(student.id);
            return (
              <div key={student.id} className={`col-span-4 rounded-xl border overflow-hidden flex flex-col transition-shadow hover:shadow-md ${cardBg}`}>
                <div className="px-4 py-3 flex items-center gap-3 border-b" style={{ borderColor: isDark ? "#334155" : "#f1f5f9", backgroundColor: isDark ? "#1e293b" : "#f7fafc" }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0" style={{ backgroundColor: "#1a365d" }}>{student.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`${textPrimary} truncate`} style={{ fontSize: "0.85rem", fontWeight: 600 }}>{student.name}</p>
                    <p className={`${textSecondary} truncate`} style={{ fontSize: "0.7rem" }}>{student.course}</p>
                  </div>
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full flex-shrink-0" style={{ backgroundColor: statusCfg.bg, color: statusCfg.color, fontSize: "0.65rem", fontWeight: 600 }}>
                    <statusCfg.icon size={10} />{statusCfg.label}
                  </span>
                </div>
                <div className="px-4 py-3 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "#ebf4ff", color: "#1a365d" }}>{student.company}</span>
                    <span className={`${textSecondary} text-xs`}>Wk {student.week}/{student.totalWeeks}</span>
                  </div>
                  <div className="h-1 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                    <div className="h-full rounded-full" style={{ width: `${(student.week / student.totalWeeks) * 100}%`, backgroundColor: "#1a365d" }} />
                  </div>
                  <div className="mb-3">
                    <p className="flex items-center gap-1 text-xs mb-1" style={{ color: isDark ? "#64748b" : "#6b7280", fontWeight: 600 }}>
                      <ClipboardList size={11} /> Latest Log · {student.latestLogDate} · <span style={{ color: "#1a365d" }}>{student.hoursLogged}h</span>
                    </p>
                    <p className={`${textSecondary} line-clamp-3`} style={{ fontSize: "0.75rem", lineHeight: 1.5 }}>{student.latestLog}</p>
                  </div>
                  {student.status !== "revision_requested" && (
                    <div className="mt-2 pt-3 border-t" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}>
                      <div className="flex items-center justify-between">
                        <div><p className={`${textSecondary} text-xs mb-1`}>Rating</p><StarRating value={student.rating} onChange={(v) => handleRatingChange(student.id, v)} /></div>
                        <div>
                          <p className={`${textSecondary} text-xs mb-1`}>Grade</p>
                          <select value={student.grade} onChange={(e) => handleGradeChange(student.id, e.target.value as Grade)} className="appearance-none pl-2 pr-6 py-1 text-xs rounded border focus:outline-none" style={{ borderColor: isDark ? "#475569" : "#e2e8f0", backgroundColor: isDark ? "#334155" : "#f9fafb", color: student.grade ? "#1a365d" : "#a0aec0" }}>
                            <option value="">Grade</option>
                            {["A", "B+", "B", "C+", "C", "F"].map((g) => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="px-4 py-3 border-t flex gap-2" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}>
                  <button onClick={() => { setFeedbackStudent(student); setFeedbackText(""); setFeedbackSent(false); }} className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg border transition-all ${isDark ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}><MessageSquare size={12} /> Feedback</button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg border-transparent transition-all hover:opacity-80" style={{ backgroundColor: "#ebf4ff", color: "#1a365d" }}><Eye size={12} /> View Log</button>
                  {student.status === "pending" && (
                    <button onClick={() => handleMarkReviewed(student.id, student.grade, student.rating)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-white rounded-lg transition-all hover:opacity-90" style={{ backgroundColor: "#276749" }}><ThumbsUp size={12} /> Approve</button>
                  )}
                  {student.status === "approved" && (
                    <div className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg" style={{ backgroundColor: "#f0fff4", color: "#276749" }}>
                      <CheckCircle2 size={12} />{isJustReviewed ? "Just Approved!" : "Approved"}
                    </div>
                  )}
                  {student.status === "revision_requested" && (
                    <div className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg" style={{ backgroundColor: "#ebf4ff", color: "#2b6cb0" }}><RotateCcw size={12} /> Revision Req.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const OverviewContent = () => (
    <div className="flex-1 overflow-auto px-8 py-6">
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Assigned Interns", value: students.length, icon: Users, color: "#1a365d" },
          { label: "Logs This Week", value: students.filter((s) => s.status !== "upcoming").length, icon: BookOpen, color: "#276749" },
          { label: "Avg. Hours/Student", value: Math.round(students.reduce((s, st) => s + st.hoursLogged, 0) / students.length), icon: TrendingUp, color: "#c05621" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border px-5 py-4 flex items-center gap-4 ${cardBg}`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + "15" }}><s.icon size={20} style={{ color: s.color }} /></div>
            <div><p className={`${textSecondary}`} style={{ fontSize: "0.75rem" }}>{s.label}</p><p style={{ fontSize: "1.5rem", fontWeight: 700, color: s.color }}>{s.value}</p></div>
          </div>
        ))}
      </div>
      <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
        <div className="px-5 py-4 border-b" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}>
          <h2 className={`${textPrimary}`} style={{ fontSize: "0.9rem", fontWeight: 600 }}>Student Overview</h2>
        </div>
        <div className="divide-y" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}>
          {students.map((s) => {
            const cfg = STATUS_CONFIG[s.status];
            return (
              <div key={s.id} className="px-5 py-3 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0" style={{ backgroundColor: "#1a365d" }}>{s.initials}</div>
                <div className="flex-1 min-w-0">
                  <p className={`${textPrimary} truncate`} style={{ fontSize: "0.82rem", fontWeight: 600 }}>{s.name}</p>
                  <p className={`${textSecondary} truncate`} style={{ fontSize: "0.7rem" }}>{s.company} · Wk {s.week}/{s.totalWeeks}</p>
                </div>
                <div className="h-1.5 w-20 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden mx-3">
                  <div className="h-full rounded-full" style={{ width: `${(s.week / s.totalWeeks) * 100}%`, backgroundColor: "#1a365d" }} />
                </div>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 600 }}><cfg.icon size={10} />{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex min-h-screen ${bg}`}>
      {/* Sidebar */}
      <aside className={`w-60 flex flex-col border-r flex-shrink-0 ${sidebarBg}`}>
        <div className="px-4 py-4 border-b" style={{ borderColor: isDark ? "#334155" : "#f1f5f9", backgroundColor: "#276749" }}>
          <div className="flex items-center gap-2"><ClipboardCheck size={18} className="text-white" /><span className="text-white" style={{ fontWeight: 700, fontSize: "0.9rem" }}>ILES</span></div>
          <p className="text-white/50 text-xs mt-0.5">Workplace Supervisor</p>
        </div>
        <div className="px-5 py-4 border-b" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: "#276749" }}>{user?.initials}</div>
            <div><p className={`${textPrimary} text-sm`} style={{ fontWeight: 600 }}>{user?.name}</p><p className={`${textSecondary} text-xs`}>Workplace Supervisor</p></div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#276749" }} />
            <span className={`${textSecondary} text-xs`}>{students.length} students assigned</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} onClick={() => setActiveNav(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${activeNav === item.id ? "text-white" : `${textSecondary} hover:bg-gray-50 dark:hover:bg-slate-700`}`} style={activeNav === item.id ? { backgroundColor: "#276749" } : {}}>
              <item.icon size={16} /><span>{item.label}</span>
              {activeNav === item.id && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
        </nav>
        <div className="px-3 pb-4 space-y-1 border-t mt-2" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}>
          <button onClick={toggleDark} className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${textSecondary} hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-all`}>{isDark ? <Sun size={15} /> : <Moon size={15} />}{isDark ? "Light Mode" : "Dark Mode"}</button>
          <button onClick={() => { logout(); navigate("/login"); }} className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${textSecondary} hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-all`}><LogOut size={15} /> Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-8 py-4 border-b flex-shrink-0" style={{ borderColor: isDark ? "#334155" : "#e2e8f0", backgroundColor: isDark ? "#1e293b" : "white" }}>
          <div><h1 className={`${textPrimary}`} style={{ fontSize: "1.05rem", fontWeight: 600 }}>Logbook Review Dashboard</h1><p className={`${textSecondary} text-xs mt-0.5`}>Week 12 · {pendingCount} logs awaiting review</p></div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all">
              <Bell size={18} />
              {pendingCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 rounded-full text-white flex items-center justify-center" style={{ backgroundColor: "#c05621", fontSize: "0.6rem" }}>{pendingCount}</span>}
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: "#276749" }}>{user?.initials}</div>
          </div>
        </header>
        <div className="flex-1 flex flex-col min-h-0 overflow-auto">
          {activeNav === "overview" ? <OverviewContent /> : activeNav === "reviews" ? <ReviewsContent /> : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BarChart2 size={40} className="mx-auto mb-4 text-gray-300 dark:text-slate-600" />
                <p className={`${textSecondary} text-sm`}>This section is coming soon.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Feedback Modal */}
      {feedbackStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-2"><MessageSquare size={17} style={{ color: "#276749" }} /><h3 className="dark:text-white" style={{ fontSize: "0.95rem", color: "#276749", fontWeight: 600 }}>Send Feedback · {feedbackStudent.name}</h3></div>
              <button onClick={() => setFeedbackStudent(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"><X size={16} className="text-gray-500 dark:text-slate-400" /></button>
            </div>
            <div className="px-6 py-4">
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">Re: Log entry from {feedbackStudent.latestLogDate}</p>
              <textarea rows={5} value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Write your feedback, suggestions, or comments..." className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm bg-gray-50 dark:bg-slate-700 dark:text-white focus:outline-none resize-none" />
              {feedbackSent && <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-100 mt-2"><CheckCircle2 size={14} style={{ color: "#276749" }} /><p className="text-sm" style={{ color: "#276749" }}>Feedback sent!</p></div>}
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => setFeedbackStudent(null)} className="px-4 py-2 text-sm text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">Cancel</button>
                <button onClick={() => { setFeedbackSent(true); setTimeout(() => setFeedbackStudent(null), 1500); }} disabled={feedbackSent} className="px-4 py-2 text-sm text-white rounded-lg flex items-center gap-1.5 transition-all hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: "#276749" }}>
                  {feedbackSent ? <CheckCircle2 size={13} /> : <MessageSquare size={13} />}{feedbackSent ? "Sent!" : "Send Feedback"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
