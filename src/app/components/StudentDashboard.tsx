import { useState } from "react";
import type { ReactNode, FormEvent } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";
import {
  Home, BookOpen, User, FileText, BarChart2, Calendar, LogOut, Bell, ChevronRight,
  Clock, CheckCircle2, AlertCircle, Star, TrendingUp, Send, PlusCircle, Paperclip,
  Activity, Plus, Edit3, Trash2, Eye, X, MessageSquare, Building2, Moon, Sun,
  Upload, Download, Phone, Mail, MapPin, GraduationCap, Target, Award,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

type NavId = "overview" | "logs" | "profile" | "documents" | "progress" | "schedule" | "placement";

const NAV_ITEMS = [
  { icon: Home, label: "Overview", id: "overview" as NavId },
  { icon: BookOpen, label: "Daily Logs", id: "logs" as NavId },
  { icon: User, label: "My Profile", id: "profile" as NavId },
  { icon: FileText, label: "Documents", id: "documents" as NavId },
  { icon: BarChart2, label: "Progress", id: "progress" as NavId },
  { icon: Calendar, label: "Schedule", id: "schedule" as NavId },
];

// ── Logbook types & data ──
type LogStatus = "draft" | "pending" | "submitted" | "reviewed" | "approved";
interface LogEntry {
  id: number; weekNumber: number; startDate: string; endDate: string;
  activities: string; status: LogStatus; submittedAt: string | null;
  createdAt: string; reviewAction?: "approved" | "revision_requested" | "rejected";
  reviewComment?: string; reviewedBy?: string; hours: number;
}
const STATUS_CFG: Record<LogStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  draft: { label: "Draft", color: "#718096", bg: "#f7fafc", icon: FileText },
  pending: { label: "Pending", color: "#c05621", bg: "#fff7ed", icon: Clock },
  submitted: { label: "Submitted", color: "#2b6cb0", bg: "#ebf4ff", icon: Send },
  reviewed: { label: "Reviewed", color: "#276749", bg: "#f0fff4", icon: CheckCircle2 },
  approved: { label: "Approved", color: "#276749", bg: "#f0fff4", icon: CheckCircle2 },
};
const SAMPLE_LOGS: LogEntry[] = [
  { id: 1, weekNumber: 12, startDate: "2026-04-20", endDate: "2026-04-24", activities: "Worked on API integration for the client portal authentication module. Attended sprint review and updated technical documentation.", status: "pending", submittedAt: "2026-04-23T09:15:00", createdAt: "2026-04-23", hours: 40 },
  { id: 2, weekNumber: 11, startDate: "2026-04-13", endDate: "2026-04-17", activities: "Implemented RESTful endpoints for the transaction history feature. Reviewed code with senior engineer and applied improvements.", status: "reviewed", submittedAt: "2026-04-17T10:30:00", createdAt: "2026-04-17", reviewAction: "approved", reviewComment: "Excellent work on the transaction module. Clean code and good documentation.", reviewedBy: "Dr. Elena Santos", hours: 40 },
  { id: 3, weekNumber: 10, startDate: "2026-04-06", endDate: "2026-04-10", activities: "Database schema design and stakeholder interview preparation. Created ERD diagrams for the new reporting module.", status: "approved", submittedAt: "2026-04-10T08:45:00", createdAt: "2026-04-10", reviewAction: "approved", reviewComment: "Well-structured log. Keep up the good work!", reviewedBy: "Dr. Elena Santos", hours: 40 },
  { id: 4, weekNumber: 9, startDate: "2026-03-30", endDate: "2026-04-03", activities: "Had difficulty with legacy code. Spent most of the day reviewing documentation.", status: "reviewed", submittedAt: "2026-04-03T14:00:00", createdAt: "2026-04-03", reviewAction: "revision_requested", reviewComment: "Please be more specific about what you attempted and what blocked you.", reviewedBy: "Dr. Elena Santos", hours: 30 },
  { id: 5, weekNumber: 8, startDate: "2026-03-23", endDate: "2026-03-27", activities: "", status: "draft", submittedAt: null, createdAt: "2026-03-27", hours: 0 },
];

const WEEKLY_HOURS = [
  { week: "Wk 8", hours: 0 }, { week: "Wk 9", hours: 30 }, { week: "Wk 10", hours: 40 },
  { week: "Wk 11", hours: 40 }, { week: "Wk 12", hours: 32 },
];
const STATUS_PIE = [
  { name: "Approved", value: 2, color: "#276749" }, { name: "Reviewed", value: 1, color: "#2b6cb0" },
  { name: "Pending", value: 1, color: "#c05621" }, { name: "Draft", value: 1, color: "#718096" },
];
const DOCS = [
  { id: 1, name: "Internship Acceptance Letter", type: "PDF", size: "245 KB", date: "Mar 1, 2026", status: "verified" },
  { id: 2, name: "University Endorsement Letter", type: "PDF", size: "180 KB", date: "Feb 28, 2026", status: "verified" },
  { id: 3, name: "Company NDA", type: "PDF", size: "320 KB", date: "Mar 5, 2026", status: "verified" },
  { id: 4, name: "Week 10 Evaluation Form", type: "PDF", size: "98 KB", date: "Apr 12, 2026", status: "pending" },
];
const SCHEDULE_WEEKS = Array.from({ length: 15 }, (_, i) => ({
  week: i + 1,
  startDate: new Date(2026, 0, 6 + i * 7).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  status: i < 9 ? "approved" : i === 9 ? "revision_requested" : i === 10 ? "pending" : i === 11 ? "draft" : "upcoming",
}));

function PlacementSetup({ onComplete }: { onComplete: () => void }) {
  const { isDark } = useAuth();
  const [form, setForm] = useState({ company: "", position: "", supervisor: "", address: "", startDate: "2026-01-06", endDate: "2026-04-10", description: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const up = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const inputClass = `w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${isDark ? "border-slate-600 bg-slate-800 text-white" : "border-gray-200 bg-white text-gray-800"}`;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false); setDone(true);
    setTimeout(onComplete, 1500);
  };

  if (done) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <CheckCircle2 size={48} className="mx-auto mb-4" style={{ color: "#276749" }} />
        <h2 className="dark:text-white mb-2" style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1a365d" }}>Placement Registered!</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className={`flex-1 flex items-center justify-center p-8 ${isDark ? "bg-slate-900" : "bg-gray-50"}`}>
      <div className={`w-full max-w-2xl rounded-2xl border p-8 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#1a365d15" }}>
            <Building2 size={22} style={{ color: "#1a365d" }} />
          </div>
          <div>
            <h1 className="dark:text-white" style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1a365d" }}>Set Up Your Internship Placement</h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm">You need a placement to start logging your work.</p>
          </div>
        </div>
        <div className="h-px bg-gray-100 dark:bg-slate-700 my-6" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm mb-1.5 dark:text-slate-300" style={{ fontWeight: 500, color: "#374151" }}>Company Name *</label><div className="relative"><Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={form.company} onChange={(e) => up("company", e.target.value)} placeholder="TechNova Solutions" className={inputClass + " pl-9"} required /></div></div>
            <div><label className="block text-sm mb-1.5 dark:text-slate-300" style={{ fontWeight: 500, color: "#374151" }}>Position / Role *</label><input type="text" value={form.position} onChange={(e) => up("position", e.target.value)} placeholder="Software Engineering Intern" className={inputClass} required /></div>
          </div>
          <div><label className="block text-sm mb-1.5 dark:text-slate-300" style={{ fontWeight: 500, color: "#374151" }}>Workplace Supervisor Name *</label><div className="relative"><User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={form.supervisor} onChange={(e) => up("supervisor", e.target.value)} placeholder="Dr. Jane Smith" className={inputClass + " pl-9"} required /></div></div>
          <div><label className="block text-sm mb-1.5 dark:text-slate-300" style={{ fontWeight: 500, color: "#374151" }}>Company Address</label><div className="relative"><MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={form.address} onChange={(e) => up("address", e.target.value)} placeholder="Plot 45 Kampala Road, Kampala" className={inputClass + " pl-9"} /></div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm mb-1.5 dark:text-slate-300" style={{ fontWeight: 500, color: "#374151" }}>Start Date *</label><input type="date" value={form.startDate} onChange={(e) => up("startDate", e.target.value)} className={inputClass} required /></div>
            <div><label className="block text-sm mb-1.5 dark:text-slate-300" style={{ fontWeight: 500, color: "#374151" }}>End Date *</label><input type="date" value={form.endDate} onChange={(e) => up("endDate", e.target.value)} className={inputClass} required /></div>
          </div>
          <div><label className="block text-sm mb-1.5 dark:text-slate-300" style={{ fontWeight: 500, color: "#374151" }}>Role Description</label><textarea rows={3} value={form.description} onChange={(e) => up("description", e.target.value)} placeholder="Briefly describe your internship role and responsibilities..." className={inputClass + " resize-none"} /></div>
          <button type="submit" disabled={loading} className="w-full py-3 text-sm text-white rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-60" style={{ backgroundColor: "#1a365d" }}>
            {loading ? <><LoadingSpinner size={16} color="white" /><span>Registering placement...</span></> : <><Building2 size={15} /> Register Placement & Continue</>}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── DASHBOARD MAIN ──
export function StudentDashboard() {
  const { user, isDark, toggleDark, logout, setHasPlacement } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState<NavId>("overview");
  const [logs, setLogs] = useState<LogEntry[]>(SAMPLE_LOGS);
  const [showNew, setShowNew] = useState(false);
  const [viewLog, setViewLog] = useState<LogEntry | null>(null);
  const [logFilter, setLogFilter] = useState<LogStatus | "all">("all");
  const [newLog, setNewLog] = useState({ weekNumber: 13, startDate: "2026-04-27", endDate: "2026-05-01", activities: "", learnings: "", challenges: "", hours: 8 });

  const hasPlacement = user?.hasPlacement ?? false;

  if (!hasPlacement) {
    return (
      <div className={`flex flex-col min-h-screen ${isDark ? "bg-slate-900" : "bg-gray-50"}`}>
        <header className={`flex items-center justify-between px-6 py-3 border-b ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#1a365d" }}><GraduationCap size={16} className="text-white" /></div>
            <span className="dark:text-white" style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1a365d" }}>ILES</span>
          </div>
          <button onClick={toggleDark} className="p-2 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all">{isDark ? <Sun size={16} /> : <Moon size={16} />}</button>
        </header>
        <PlacementSetup onComplete={setHasPlacement} />
      </div>
    );
  }

  const bg = isDark ? "bg-slate-900" : "bg-gray-50";
  const cardBg = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-slate-400" : "text-gray-500";
  const sidebarBg = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200";

  const filteredLogs = logFilter === "all" ? logs : logs.filter((l) => l.status === logFilter);
  const totalHours = logs.reduce((s, l) => s + l.hours, 0);
  const approvedCount = logs.filter((l) => l.status === "approved").length;
  const pendingCount = logs.filter((l) => l.status === "pending").length;

  const handleNewLogSave = (submit: boolean) => {
    const entry: LogEntry = {
      id: Date.now(), weekNumber: newLog.weekNumber, startDate: newLog.startDate,
      endDate: newLog.endDate, activities: `${newLog.activities}\n\nLearnings: ${newLog.learnings}\n\nChallenges: ${newLog.challenges}`,
      status: submit ? "pending" : "draft",
      submittedAt: submit ? new Date().toISOString() : null,
      createdAt: new Date().toISOString().slice(0, 10), hours: newLog.hours,
    };
    setLogs((prev) => [entry, ...prev]);
    setShowNew(false);
    setNewLog({ weekNumber: 13, startDate: "2026-04-27", endDate: "2026-05-01", activities: "", learnings: "", challenges: "", hours: 8 });
  };

  // ── OVERVIEW ──
  const OverviewContent = () => (
    <div className="overflow-auto px-8 py-6 flex-1">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Hours Logged", value: `${totalHours}`, unit: "/ 480 hrs", icon: Clock, color: "#1a365d" },
          { label: "Logs Approved", value: `${approvedCount}`, unit: `/ ${logs.length} logs`, icon: CheckCircle2, color: "#276749" },
          { label: "Pending Review", value: `${pendingCount}`, unit: "log(s)", icon: AlertCircle, color: "#c05621" },
          { label: "Overall Rating", value: "4.8", unit: "/ 5.0", icon: Star, color: "#b7791f" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border px-4 py-4 flex items-center gap-3 ${cardBg}`}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "15" }}><s.icon size={18} style={{ color: s.color }} /></div>
            <div>
              <p className={`${textSecondary}`} style={{ fontSize: "0.7rem" }}>{s.label}</p>
              <p className={`${textPrimary}`} style={{ fontSize: "1rem", fontWeight: 700 }}>{s.value} <span className={`${textSecondary}`} style={{ fontSize: "0.7rem", fontWeight: 400 }}>{s.unit}</span></p>
            </div>
          </div>
        ))}
      </div>
      {/* Internship Progress */}
      <div className={`rounded-xl border p-5 mb-6 ${cardBg}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`${textPrimary}`} style={{ fontSize: "0.9rem", fontWeight: 600 }}>Internship Progress</h2>
          <span className="text-xs" style={{ color: "#276749", fontWeight: 600 }}>Week 12 of 15</span>
        </div>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1 h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: "80%", backgroundColor: "#1a365d" }} />
          </div>
          <span className={`${textSecondary} text-xs`}>80%</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center"><p className={`${textPrimary}`} style={{ fontWeight: 700, fontSize: "1.1rem" }}>{totalHours}</p><p className={`${textSecondary} text-xs`}>Hours Logged</p></div>
          <div className="text-center"><p className={`${textPrimary}`} style={{ fontWeight: 700, fontSize: "1.1rem" }}>{logs.length}</p><p className={`${textSecondary} text-xs`}>Log Entries</p></div>
          <div className="text-center"><p className={`${textPrimary}`} style={{ fontWeight: 700, fontSize: "1.1rem" }}>TechNova</p><p className={`${textSecondary} text-xs`}>Company</p></div>
        </div>
      </div>
      {/* Recent Logs */}
      <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}>
          <h2 className={`${textPrimary}`} style={{ fontSize: "0.9rem", fontWeight: 600 }}>Recent Log Entries</h2>
          <button onClick={() => setActiveNav("logs")} className="text-xs hover:underline" style={{ color: "#1a365d" }}>View All →</button>
        </div>
        <div className="divide-y" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}>
          {logs.slice(0, 3).map((log) => {
            const cfg = STATUS_CFG[log.status];
            return (
              <div key={log.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: cfg.bg }}><cfg.icon size={14} style={{ color: cfg.color }} /></div>
                <div className="flex-1 min-w-0">
                  <p className={`${textPrimary} truncate`} style={{ fontSize: "0.82rem", fontWeight: 600 }}>Week {log.weekNumber} Log</p>
                  <p className={`${textSecondary} truncate`} style={{ fontSize: "0.72rem" }}>{log.activities.slice(0, 60)}...</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs flex-shrink-0" style={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── LOGS ──
  const LogsContent = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-8 py-4 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: isDark ? "#334155" : "#e2e8f0", backgroundColor: isDark ? "#1e293b" : "white" }}>
        <div>
          <h1 className={`${textPrimary}`} style={{ fontSize: "1.05rem", fontWeight: 600 }}>My Logbook</h1>
          <p className={`${textSecondary} text-xs mt-0.5`}>{user?.name} · BS Computer Science · Week 12 of 15</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-all" style={{ backgroundColor: "#1a365d" }}>
          <Plus size={15} /> New Log Entry
        </button>
      </div>
      <div className="flex-1 overflow-auto px-8 py-5">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 mb-5">
          {([["all", "Total", logs.length, "#1a365d"], ["draft", "Drafts", logs.filter((l) => l.status === "draft").length, "#718096"], ["pending", "Pending", logs.filter((l) => l.status === "pending").length, "#c05621"], ["reviewed", "Reviewed", logs.filter((l) => l.status === "reviewed").length, "#2b6cb0"], ["approved", "Approved", logs.filter((l) => l.status === "approved").length, "#276749"]] as [LogStatus | "all", string, number, string][]).map(([key, label, count, color]) => (
            <button key={key} onClick={() => setLogFilter(key)} className={`px-4 py-3 rounded-xl text-left transition-all border ${logFilter === key ? "shadow-sm" : "hover:shadow-sm"} ${cardBg}`} style={{ borderColor: logFilter === key ? color + "40" : undefined, backgroundColor: logFilter === key ? color + "10" : undefined }}>
              <p style={{ fontSize: "1.4rem", fontWeight: 700, color }}>{count}</p>
              <p className={`${textSecondary}`} style={{ fontSize: "0.72rem" }}>{label}</p>
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const cfg = STATUS_CFG[log.status];
            return (
              <div key={log.id} className={`rounded-xl border overflow-hidden hover:shadow-sm transition-shadow ${cardBg}`}>
                <div className="px-5 py-3 flex items-center justify-between border-b" style={{ borderColor: isDark ? "#334155" : "#f1f5f9", backgroundColor: isDark ? "#1e293b" : "#f7fafc" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#1a365d15" }}><BookOpen size={15} style={{ color: "#1a365d" }} /></div>
                    <div><p className={`${textPrimary}`} style={{ fontSize: "0.85rem", fontWeight: 600 }}>Week {log.weekNumber}</p><p className={`${textSecondary}`} style={{ fontSize: "0.7rem" }}>{log.startDate} — {log.endDate} · {log.hours}h</p></div>
                  </div>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: cfg.bg, color: cfg.color, fontSize: "0.7rem", fontWeight: 600 }}><cfg.icon size={11} />{cfg.label}</span>
                </div>
                <div className="px-5 py-3">
                  {log.activities ? <p className={`${textSecondary} line-clamp-2`} style={{ fontSize: "0.8rem", lineHeight: 1.6 }}>{log.activities}</p> : <p className="text-gray-400 dark:text-slate-500 italic" style={{ fontSize: "0.8rem" }}>No activities entered yet.</p>}
                  {log.reviewComment && (
                    <div className="mt-2 px-3 py-2 rounded-lg flex items-start gap-2" style={{ backgroundColor: log.reviewAction === "revision_requested" ? "#fff7ed" : "#f0fff4", border: `1px solid ${log.reviewAction === "revision_requested" ? "#c0562130" : "#27674930"}` }}>
                      <MessageSquare size={12} style={{ color: log.reviewAction === "revision_requested" ? "#c05621" : "#276749", flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: "0.72rem", lineHeight: 1.5, color: isDark ? "#94a3b8" : "#4a5568" }}><strong>{log.reviewedBy}:</strong> {log.reviewComment}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-gray-400 dark:text-slate-500" style={{ fontSize: "0.65rem" }}>{log.submittedAt ? `Submitted ${new Date(log.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : `Created ${log.createdAt}`}</p>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setViewLog(log)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all"><Eye size={13} /></button>
                      {log.status === "draft" && (
                        <>
                          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all"><Edit3 size={13} /></button>
                          <button onClick={() => setLogs((prev) => prev.filter((l) => l.id !== log.id))} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={13} /></button>
                          <button onClick={() => setLogs((prev) => prev.map((l) => l.id === log.id ? { ...l, status: "pending", submittedAt: new Date().toISOString() } : l))} className="flex items-center gap-1 px-3 py-1.5 text-xs text-white rounded-lg hover:opacity-90 transition-all" style={{ backgroundColor: "#1a365d" }}><Send size={11} /> Submit</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredLogs.length === 0 && (
            <div className={`py-16 text-center rounded-xl border ${cardBg}`}>
              <BookOpen size={32} className="mx-auto mb-3 text-gray-300 dark:text-slate-600" />
              <p className={`${textSecondary} text-sm`}>No entries in this category.</p>
              <button onClick={() => setShowNew(true)} className="mt-3 text-sm hover:underline" style={{ color: "#1a365d" }}>Create your first log</button>
            </div>
          )}
        </div>
      </div>

      {/* New Log Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2"><Plus size={17} style={{ color: "#1a365d" }} /><h3 className="dark:text-white" style={{ fontSize: "0.95rem", color: "#1a365d", fontWeight: 600 }}>New Log Entry</h3></div>
              <button onClick={() => setShowNew(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"><X size={16} className="text-gray-500 dark:text-slate-400" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs dark:text-slate-300 mb-1" style={{ fontWeight: 500, color: "#4b5563" }}>Week #</label><input type="number" value={newLog.weekNumber} onChange={(e) => setNewLog((n) => ({ ...n, weekNumber: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm bg-gray-50 dark:bg-slate-700 dark:text-white focus:outline-none" min={1} max={24} /></div>
                <div><label className="block text-xs dark:text-slate-300 mb-1" style={{ fontWeight: 500, color: "#4b5563" }}>Start Date</label><input type="date" value={newLog.startDate} onChange={(e) => setNewLog((n) => ({ ...n, startDate: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm bg-gray-50 dark:bg-slate-700 dark:text-white focus:outline-none" /></div>
                <div><label className="block text-xs dark:text-slate-300 mb-1" style={{ fontWeight: 500, color: "#4b5563" }}>Hours</label><input type="number" value={newLog.hours} onChange={(e) => setNewLog((n) => ({ ...n, hours: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm bg-gray-50 dark:bg-slate-700 dark:text-white focus:outline-none" min={1} max={80} /></div>
              </div>
              {[["activities", "Activities This Week", "Describe tasks, meetings, and work done in detail..."], ["learnings", "Key Learnings", "What new skills or knowledge did you gain?"], ["challenges", "Challenges Encountered", "Any blockers or issues you faced?"]].map(([key, label, ph]) => (
                <div key={key}>
                  <label className="block text-xs dark:text-slate-300 mb-1" style={{ fontWeight: 500, color: "#4b5563" }}>{label}</label>
                  <textarea rows={key === "activities" ? 4 : 2} value={(newLog as any)[key]} onChange={(e) => setNewLog((n) => ({ ...n, [key]: e.target.value }))} placeholder={ph} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 text-sm bg-gray-50 dark:bg-slate-700 dark:text-white focus:outline-none resize-none" />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button onClick={() => handleNewLogSave(false)} className="flex-1 py-2.5 text-sm dark:text-slate-300 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all" style={{ color: "#374151" }}>Save as Draft</button>
                <button onClick={() => handleNewLogSave(true)} className="flex-1 py-2.5 text-sm text-white rounded-xl flex items-center justify-center gap-1.5 hover:opacity-90 transition-all" style={{ backgroundColor: "#1a365d" }}><Send size={13} /> Submit for Review</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* View Log Modal */}
      {viewLog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-2"><BookOpen size={16} style={{ color: "#1a365d" }} /><h3 className="dark:text-white" style={{ fontSize: "0.95rem", color: "#1a365d", fontWeight: 600 }}>Week {viewLog.weekNumber} Log</h3></div>
              <button onClick={() => setViewLog(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"><X size={16} className="text-gray-500 dark:text-slate-400" /></button>
            </div>
            <div className="px-6 py-5">
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg px-4 py-3 mb-4">
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-2" style={{ fontWeight: 600 }}>Activities</p>
                <p className="text-gray-700 dark:text-slate-300 text-sm" style={{ lineHeight: 1.7 }}>{viewLog.activities || "No activities entered."}</p>
              </div>
              {viewLog.reviewComment && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-lg" style={{ backgroundColor: viewLog.reviewAction === "revision_requested" ? "#fff7ed" : "#f0fff4" }}>
                  <MessageSquare size={13} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  <div><p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Supervisor comment · {viewLog.reviewedBy}</p><p className="text-gray-700 dark:text-slate-300 text-sm" style={{ lineHeight: 1.6 }}>{viewLog.reviewComment}</p></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── PROFILE ──
  const ProfileContent = () => (
    <div className="overflow-auto px-8 py-6 flex-1">
      <div className={`rounded-xl border p-6 mb-5 ${cardBg}`}>
        <div className="flex items-center gap-5 mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl" style={{ backgroundColor: "#1a365d" }}>{user?.initials}</div>
          <div>
            <h2 className={`${textPrimary}`} style={{ fontSize: "1.1rem", fontWeight: 700 }}>{user?.name}</h2>
            <p className={`${textSecondary} text-sm`}>BS Computer Science · Year 4</p>
            <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#f0fff4", color: "#276749", fontWeight: 600 }}><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active Internship · Week 12</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[["Email", user?.email || "", Mail], ["Phone", "+256 702 123 456", Phone], ["University", "Makerere University", Building2], ["Department", "Department of Computer Science", GraduationCap], ["Student No.", "21/U/0123/PS", User], ["Academic Year", "2025/2026", Calendar]].map(([label, val, Icon]) => (
            <div key={String(label)} className={`rounded-lg px-4 py-3 ${isDark ? "bg-slate-700" : "bg-gray-50"}`}>
              <div className="flex items-center gap-2 mb-0.5"><Icon size={13} style={{ color: "#1a365d" }} /><p className={`${textSecondary} text-xs`}>{label}</p></div>
              <p className={`${textPrimary} text-sm`} style={{ fontWeight: 500 }}>{String(val)}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={`rounded-xl border p-5 ${cardBg}`}>
        <h3 className={`${textPrimary} mb-4`} style={{ fontSize: "0.9rem", fontWeight: 600 }}>Internship Placement</h3>
        <div className="grid grid-cols-2 gap-4">
          {[["Company", "TechNova Solutions", Building2], ["Supervisor", "Dr. Elena Santos", User], ["Position", "Software Engineering Intern", Target], ["Duration", "Jan 6 – Apr 10, 2026 (15 wks)", Calendar], ["Address", "Kampala, Uganda", MapPin], ["Status", "Active", CheckCircle2]].map(([label, val, Icon]) => (
            <div key={String(label)} className={`rounded-lg px-4 py-3 ${isDark ? "bg-slate-700" : "bg-gray-50"}`}>
              <div className="flex items-center gap-2 mb-0.5"><Icon size={13} style={{ color: "#1a365d" }} /><p className={`${textSecondary} text-xs`}>{label}</p></div>
              <p className={`${textPrimary} text-sm`} style={{ fontWeight: 500 }}>{String(val)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── DOCUMENTS ──
  const DocumentsContent = () => (
    <div className="overflow-auto px-8 py-6 flex-1">
      <div className="flex items-center justify-between mb-5">
        <h2 className={`${textPrimary}`} style={{ fontSize: "0.95rem", fontWeight: 600 }}>My Documents</h2>
        <button className="flex items-center gap-1.5 px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-all" style={{ backgroundColor: "#1a365d" }}><Upload size={14} /> Upload Document</button>
      </div>
      <div className="space-y-3">
        {DOCS.map((doc) => (
          <div key={doc.id} className={`rounded-xl border flex items-center gap-4 px-5 py-4 ${cardBg}`}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#1a365d15" }}><FileText size={20} style={{ color: "#1a365d" }} /></div>
            <div className="flex-1 min-w-0">
              <p className={`${textPrimary} truncate`} style={{ fontSize: "0.85rem", fontWeight: 600 }}>{doc.name}</p>
              <p className={`${textSecondary}`} style={{ fontSize: "0.72rem" }}>{doc.type} · {doc.size} · Uploaded {doc.date}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs flex-shrink-0" style={{ backgroundColor: doc.status === "verified" ? "#f0fff4" : "#fff7ed", color: doc.status === "verified" ? "#276749" : "#c05621", fontWeight: 600 }}>
              {doc.status === "verified" ? "✓ Verified" : "Pending"}
            </span>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all"><Download size={14} /></button>
          </div>
        ))}
      </div>
      <div className={`mt-5 rounded-xl border-2 border-dashed px-8 py-10 text-center ${isDark ? "border-slate-600" : "border-gray-200"}`}>
        <Upload size={28} className="mx-auto mb-3 text-gray-300 dark:text-slate-600" />
        <p className={`${textPrimary} text-sm`} style={{ fontWeight: 500 }}>Drag & drop files here</p>
        <p className={`${textSecondary} text-xs mt-1`}>or click Upload Document above · PDF, DOCX, PNG (max 10 MB)</p>
      </div>
    </div>
  );

  // ── PROGRESS ──
  const ProgressContent = () => (
    <div className="overflow-auto px-8 py-6 flex-1">
      <div className="grid grid-cols-12 gap-5 mb-5">
        <div className={`col-span-7 rounded-xl border overflow-hidden ${cardBg}`}>
          <div className="px-5 py-4 border-b" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}><h2 className={`${textPrimary}`} style={{ fontSize: "0.9rem", fontWeight: 600 }}>Hours Logged Per Week</h2></div>
          <div className="px-3 py-3">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={WEEKLY_HOURS} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#f0f0f0"} vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#a0aec0" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#a0aec0" }} axisLine={false} tickLine={false} domain={[0, 50]} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="hours" fill="#1a365d" radius={[4, 4, 0, 0]} name="Hours Logged" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={`col-span-5 rounded-xl border overflow-hidden ${cardBg}`}>
          <div className="px-5 py-4 border-b" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}><h2 className={`${textPrimary}`} style={{ fontSize: "0.9rem", fontWeight: 600 }}>Log Status Distribution</h2></div>
          <div className="px-2 py-2">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={STATUS_PIE} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {STATUS_PIE.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: isDark ? "#94a3b8" : "#4a5568" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className={`rounded-xl border p-5 ${cardBg}`}>
        <h2 className={`${textPrimary} mb-4`} style={{ fontSize: "0.9rem", fontWeight: 600 }}>Performance Metrics</h2>
        <div className="space-y-3">
          {[["Logbook Completion", 80, "#1a365d"], ["Approval Rate", 75, "#276749"], ["Supervisor Rating", 96, "#b7791f"], ["Attendance & Punctuality", 100, "#2b6cb0"]].map(([label, val, color]) => (
            <div key={String(label)}>
              <div className="flex items-center justify-between mb-1">
                <p className={`${textSecondary} text-xs`}>{label}</p>
                <p className="text-xs" style={{ fontWeight: 600, color: String(color) }}>{val}%</p>
              </div>
              <div className={`h-2 rounded-full ${isDark ? "bg-slate-700" : "bg-gray-100"}`}>
                <div className="h-full rounded-full transition-all" style={{ width: `${val}%`, backgroundColor: String(color) }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-lg" style={{ backgroundColor: "#f0fff4" }}>
          <Award size={16} style={{ color: "#276749" }} />
          <p className="text-sm" style={{ color: "#276749", fontWeight: 500 }}>On track for successful internship completion · Estimated final score: 4.6/5.0</p>
        </div>
      </div>
    </div>
  );

  // ── SCHEDULE ──
  const ScheduleContent = () => {
    const statusColors: Record<string, { bg: string; color: string; label: string }> = {
      approved: { bg: "#f0fff4", color: "#276749", label: "Approved" },
      revision_requested: { bg: "#fff7ed", color: "#c05621", label: "Needs Revision" },
      pending: { bg: "#ebf4ff", color: "#2b6cb0", label: "Pending Review" },
      draft: { bg: "#f7fafc", color: "#718096", label: "Draft" },
      upcoming: { bg: isDark ? "#1e293b" : "#f8fafc", color: isDark ? "#475569" : "#94a3b8", label: "Upcoming" },
    };
    return (
      <div className="overflow-auto px-8 py-6 flex-1">
        <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}>
            <h2 className={`${textPrimary}`} style={{ fontSize: "0.9rem", fontWeight: 600 }}>15-Week Internship Schedule</h2>
            <p className={`${textSecondary} text-xs`}>Jan 6 – Apr 10, 2026</p>
          </div>
          <div className="divide-y" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}>
            {SCHEDULE_WEEKS.map((w) => {
              const cfg = statusColors[w.status];
              return (
                <div key={w.week} className="px-5 py-3 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.bg }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: cfg.color }}>W{w.week}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${textPrimary}`} style={{ fontSize: "0.82rem", fontWeight: 600 }}>Week {w.week}</p>
                    <p className={`${textSecondary}`} style={{ fontSize: "0.7rem" }}>Starts {w.startDate}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs" style={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
                  {w.week === 12 && <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#1a365d", color: "white", fontWeight: 600 }}>← Current</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const content: Record<NavId, ReactNode> = {
    overview: <OverviewContent />,
    logs: <LogsContent />,
    profile: <ProfileContent />,
    documents: <DocumentsContent />,
    progress: <ProgressContent />,
    schedule: <ScheduleContent />,
    placement: null,
  };

  return (
    <div className={`flex min-h-screen ${bg}`}>
      {/* Sidebar */}
      <aside className={`w-60 flex flex-col border-r flex-shrink-0 ${sidebarBg}`}>
        {/* Brand */}
        <div className="px-4 py-4 border-b" style={{ borderColor: isDark ? "#334155" : "#f1f5f9", backgroundColor: "#1a365d" }}>
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-white" />
            <span className="text-white" style={{ fontWeight: 700, fontSize: "0.9rem" }}>ILES</span>
          </div>
          <p className="text-white/50 text-xs mt-0.5">Internship System</p>
        </div>
        {/* User info */}
        <div className="px-5 py-4 border-b" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: "#1a365d" }}>{user?.initials}</div>
            <div><p className={`${textPrimary} text-sm`} style={{ fontWeight: 600 }}>{user?.name}</p><p className={`${textSecondary} text-xs`}>BS Computer Science</p></div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#276749" }} />
            <span className={`${textSecondary} text-xs`}>Active · Week 12</span>
          </div>
        </div>
        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} onClick={() => setActiveNav(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${activeNav === item.id ? "text-white" : `${textSecondary} hover:bg-gray-50 dark:hover:bg-slate-700`}`} style={activeNav === item.id ? { backgroundColor: "#1a365d" } : {}}>
              <item.icon size={16} />
              <span>{item.label}</span>
              {activeNav === item.id && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}
        </nav>
        {/* Progress */}
        <div className="px-4 py-4 border-t" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}>
          <div className="flex justify-between text-xs mb-1.5">
            <span className={textSecondary}>Internship Progress</span>
            <span style={{ color: "#1a365d", fontWeight: 600 }}>80%</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: "80%", backgroundColor: "#1a365d" }} />
          </div>
          <p className="text-gray-400 dark:text-slate-500 text-xs mt-1.5">{totalHours} / 480 hours</p>
        </div>
        {/* Bottom actions */}
        <div className="px-3 pb-4 space-y-1">
          <button onClick={toggleDark} className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${textSecondary} hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-all`}>
            {isDark ? <Sun size={15} /> : <Moon size={15} />}{isDark ? "Light Mode" : "Dark Mode"}
          </button>
          <button onClick={() => { logout(); navigate("/login"); }} className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${textSecondary} hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-all`}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 border-b flex-shrink-0" style={{ borderColor: isDark ? "#334155" : "#e2e8f0", backgroundColor: isDark ? "#1e293b" : "white" }}>
          <div>
            <h1 className={`${textPrimary}`} style={{ fontSize: "1.05rem", fontWeight: 600 }}>{NAV_ITEMS.find((n) => n.id === activeNav)?.label || "Dashboard"}</h1>
            <p className={`${textSecondary} text-xs mt-0.5`}>Thursday, April 23, 2026 · Week 12 of 15</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: "#e53e3e" }} />
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: "#1a365d" }}>{user?.initials}</div>
          </div>
        </header>
        {/* Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-auto">
          {content[activeNav]}
        </div>
      </main>
    </div>
  );
}