import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  Star, CheckCircle2, BarChart2, ChevronDown, Building2, Send, Info, Lock, X,
  AlertCircle, LogOut, Home, ClipboardCheck, Users, Moon, Sun, GraduationCap,
  ChevronRight, BookOpen, TrendingUp,
} from "lucide-react";

interface Criteria { id: number; name: string; description: string; weight: number; }
interface StudentPlacement { id: number; name: string; initials: string; course: string; company: string; weekNumber: number; totalWeeks: number; finalGrade?: string; evaluated?: boolean; score?: number; }
interface EvalScore { criteriaId: number; score: number | null; }

const CRITERIA: Criteria[] = [
  { id: 1, name: "Punctuality & Attendance", description: "Consistently arrives on time, meets deadlines, and attends required meetings.", weight: 0.2 },
  { id: 2, name: "Technical Skills", description: "Demonstrates competency in relevant technical skills for the placement role.", weight: 0.35 },
  { id: 3, name: "Initiative & Proactiveness", description: "Takes ownership of tasks, asks questions, and contributes beyond assigned work.", weight: 0.2 },
  { id: 4, name: "Communication", description: "Communicates clearly with team members and documents work effectively.", weight: 0.15 },
  { id: 5, name: "Teamwork & Collaboration", description: "Works well with colleagues and contributes positively to team dynamics.", weight: 0.1 },
];

const STUDENTS: StudentPlacement[] = [
  { id: 1, name: "Maria Reyes", initials: "MR", course: "BS Computer Science", company: "TechNova Solutions", weekNumber: 12, totalWeeks: 15 },
  { id: 2, name: "Ana Santos", initials: "AS", course: "BS Information Systems", company: "CloudPeak Corp", weekNumber: 12, totalWeeks: 15, evaluated: true, score: 4.35, finalGrade: "A" },
  { id: 3, name: "Carlos Mendez", initials: "CM", course: "BS Computer Engineering", company: "InnovatePH", weekNumber: 10, totalWeeks: 15 },
  { id: 4, name: "Ramon Bautista", initials: "RB", course: "BS Information Technology", company: "FinEdge Systems", weekNumber: 11, totalWeeks: 15 },
];

const SCORE_LABELS: Record<number, string> = { 1: "Poor", 2: "Below Avg", 3: "Average", 4: "Good", 5: "Excellent" };

function ScoreButtons({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)} className={`w-9 h-9 rounded-lg text-sm transition-all border ${value === s ? "text-white border-transparent" : "text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700"}`} style={value === s ? { backgroundColor: s >= 4 ? "#276749" : s === 3 ? "#c05621" : "#c53030", fontWeight: 600 } : {}} title={SCORE_LABELS[s]}>{s}</button>
      ))}
      {value && <span className="text-xs text-gray-500 dark:text-slate-400 ml-1">{SCORE_LABELS[value]}</span>}
    </div>
  );
}

const NAV_ITEMS = [
  { icon: Home, label: "Overview", id: "overview" },
  { icon: Star, label: "Evaluations", id: "evaluations" },
  { icon: Users, label: "My Students", id: "students" },
  { icon: BarChart2, label: "Reports", id: "reports" },
];

export function AcademicSupervisorDashboard() {
  const { user, isDark, toggleDark, logout } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("evaluations");
  const [evalStudent, setEvalStudent] = useState<StudentPlacement | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set([2]));
  const [scores, setScores] = useState<Record<number, EvalScore[]>>({});
  const [isFinalised, setIsFinalised] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expandCriteria, setExpandCriteria] = useState(false);

  const bg = isDark ? "bg-slate-900" : "bg-gray-50";
  const cardBg = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-slate-400" : "text-gray-500";

  const openEval = (student: StudentPlacement) => {
    setEvalStudent(student);
    setScores((prev) => ({ ...prev, [student.id]: prev[student.id] || CRITERIA.map((c) => ({ criteriaId: c.id, score: null })) }));
    setIsFinalised(false);
    setSubmitted(false);
  };

  const getScoresForStudent = (id: number) => scores[id] || CRITERIA.map((c) => ({ criteriaId: c.id, score: null }));
  const setScore = (studentId: number, criteriaId: number, score: number) => {
    setScores((prev) => ({ ...prev, [studentId]: (prev[studentId] || CRITERIA.map((c) => ({ criteriaId: c.id, score: null }))).map((s) => s.criteriaId === criteriaId ? { ...s, score } : s) }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setCompleted((prev) => new Set([...prev, evalStudent!.id]));
      setEvalStudent(null);
    }, 1400);
  };

  const EvaluationsContent = () => (
    <div className="flex-1 overflow-auto px-8 py-6">
      {/* Criteria ref */}
      <div className={`rounded-xl border mb-6 overflow-hidden ${cardBg}`}>
        <button onClick={() => setExpandCriteria((v) => !v)} className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${isDark ? "hover:bg-slate-700" : "hover:bg-gray-50"}`}>
          <div className="flex items-center gap-2"><Info size={15} style={{ color: "#6b46c1" }} /><span style={{ fontSize: "0.9rem", color: "#6b46c1", fontWeight: 600 }}>Evaluation Criteria</span><span className={`${textSecondary} text-xs`}>{CRITERIA.length} criteria · Weights sum to 100%</span></div>
          <ChevronDown size={15} className="text-gray-400" style={{ transform: expandCriteria ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }} />
        </button>
        {expandCriteria && (
          <div className="border-t px-5 py-4" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}>
            {CRITERIA.map((c) => (
              <div key={c.id} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}>
                <div className="flex items-center gap-2 w-24 flex-shrink-0"><div className="h-1.5 rounded-full" style={{ width: `${c.weight * 100}px`, backgroundColor: "#6b46c1" }} /><span className="text-xs" style={{ color: "#6b46c1", fontWeight: 600 }}>{(c.weight * 100).toFixed(0)}%</span></div>
                <div><p className={`${textPrimary}`} style={{ fontSize: "0.82rem", fontWeight: 600 }}>{c.name}</p><p className={`${textSecondary}`} style={{ fontSize: "0.72rem" }}>{c.description}</p></div>
              </div>
            ))}
            <div className="mt-3 text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1"><Lock size={11} /> Criteria configured by the Internship Administrator.</div>
          </div>
        )}
      </div>
      <h2 className={`${textPrimary} mb-4`} style={{ fontSize: "0.9rem", fontWeight: 600 }}>Your Assigned Interns</h2>
      <div className="grid grid-cols-12 gap-4">
        {STUDENTS.map((student) => {
          const isDone = completed.has(student.id);
          return (
            <div key={student.id} className={`col-span-6 rounded-xl border overflow-hidden hover:shadow-sm transition-shadow ${cardBg}`}>
              <div className="px-5 py-4 flex items-center gap-3 border-b" style={{ borderColor: isDark ? "#334155" : "#f1f5f9", backgroundColor: isDark ? "#1e293b" : "#f7fafc" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: "#6b46c1", fontSize: "0.85rem" }}>{student.initials}</div>
                <div className="flex-1 min-w-0"><p className={`${textPrimary}`} style={{ fontSize: "0.88rem", fontWeight: 600 }}>{student.name}</p><p className={`${textSecondary} truncate`} style={{ fontSize: "0.7rem" }}>{student.course}</p></div>
                {isDone ? <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ backgroundColor: "#f0fff4", color: "#276749", fontWeight: 600 }}><CheckCircle2 size={11} /> Evaluated</span> : <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ backgroundColor: "#fff7ed", color: "#c05621", fontWeight: 600 }}><AlertCircle size={11} /> Pending</span>}
              </div>
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-3"><Building2 size={13} className="text-gray-400" /><span className={`${textSecondary}`} style={{ fontSize: "0.8rem" }}>{student.company}</span></div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1"><span className={textSecondary}>Progress</span><span className={textSecondary}>Wk {student.weekNumber}/{student.totalWeeks}</span></div>
                  <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(student.weekNumber / student.totalWeeks) * 100}%`, backgroundColor: "#6b46c1" }} /></div>
                </div>
                {isDone && student.score && (
                  <div className="mb-3 flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: "#f0fff4" }}>
                    <span className="text-xs" style={{ color: "#276749", fontWeight: 600 }}>Final Score</span>
                    <span className="text-xs" style={{ color: "#276749", fontWeight: 700 }}>{student.score?.toFixed(2)} / 5.00</span>
                  </div>
                )}
                <button onClick={() => openEval(student)} className="w-full py-2.5 text-sm rounded-lg flex items-center justify-center gap-1.5 transition-all hover:opacity-90" style={isDone ? { backgroundColor: isDark ? "#334155" : "#f7fafc", color: "#6b46c1", border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}` } : { backgroundColor: "#6b46c1", color: "white" }}>
                  <Star size={13} />{isDone ? "View / Edit Evaluation" : "Start Evaluation"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const OverviewContent = () => (
    <div className="flex-1 overflow-auto px-8 py-6">
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Assigned Students", value: STUDENTS.length, icon: GraduationCap, color: "#6b46c1" },
          { label: "Evaluated", value: completed.size, icon: CheckCircle2, color: "#276749" },
          { label: "Pending Evaluation", value: STUDENTS.length - completed.size, icon: AlertCircle, color: "#c05621" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border px-5 py-4 flex items-center gap-4 ${cardBg}`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + "15" }}><s.icon size={20} style={{ color: s.color }} /></div>
            <div><p className={`${textSecondary}`} style={{ fontSize: "0.75rem" }}>{s.label}</p><p style={{ fontSize: "1.5rem", fontWeight: 700, color: s.color }}>{s.value}</p></div>
          </div>
        ))}
      </div>
      <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
        <div className="px-5 py-4 border-b" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}><h2 className={`${textPrimary}`} style={{ fontSize: "0.9rem", fontWeight: 600 }}>Student Evaluation Status</h2></div>
        <div className="divide-y" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}>
          {STUDENTS.map((s) => (
            <div key={s.id} className="px-5 py-3 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0" style={{ backgroundColor: "#6b46c1" }}>{s.initials}</div>
              <div className="flex-1 min-w-0"><p className={`${textPrimary} truncate`} style={{ fontSize: "0.82rem", fontWeight: 600 }}>{s.name}</p><p className={`${textSecondary} truncate`} style={{ fontSize: "0.7rem" }}>{s.course} · {s.company}</p></div>
              {completed.has(s.id) ? <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#f0fff4", color: "#276749", fontWeight: 600 }}><CheckCircle2 size={10} /> Evaluated</span> : <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: "#fff7ed", color: "#c05621", fontWeight: 600 }}><AlertCircle size={10} /> Pending</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex min-h-screen ${bg}`}>
      {/* Sidebar */}
      <aside className={`w-60 flex flex-col border-r flex-shrink-0 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
        <div className="px-4 py-4 border-b" style={{ borderColor: isDark ? "#334155" : "#f1f5f9", backgroundColor: "#6b46c1" }}>
          <div className="flex items-center gap-2"><BookOpen size={18} className="text-white" /><span className="text-white" style={{ fontWeight: 700, fontSize: "0.9rem" }}>ILES</span></div>
          <p className="text-white/50 text-xs mt-0.5">Academic Supervisor</p>
        </div>
        <div className="px-5 py-4 border-b" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: "#6b46c1" }}>{user?.initials}</div>
            <div><p className={`${textPrimary} text-sm`} style={{ fontWeight: 600 }}>{user?.name}</p><p className={`${textSecondary} text-xs`}>Academic Supervisor</p></div>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#276749" }} />
            <span className={`${textSecondary} text-xs`}>{STUDENTS.length} students assigned</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} onClick={() => setActiveNav(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${activeNav === item.id ? "text-white" : `${textSecondary} hover:bg-gray-50 dark:hover:bg-slate-700`}`} style={activeNav === item.id ? { backgroundColor: "#6b46c1" } : {}}>
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
          <div><h1 className={`${textPrimary}`} style={{ fontSize: "1.05rem", fontWeight: 600 }}>Academic Evaluation Dashboard</h1><p className={`${textSecondary} text-xs mt-0.5`}>{completed.size}/{STUDENTS.length} students evaluated this semester</p></div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: "#6b46c1" }}>{user?.initials}</div>
        </header>
        <div className="flex-1 flex flex-col min-h-0 overflow-auto">
          {activeNav === "overview" ? <OverviewContent /> : activeNav === "evaluations" ? <EvaluationsContent /> : (
            <div className="flex-1 flex items-center justify-center">
              <p className={`${textSecondary} text-sm`}>This section is coming soon.</p>
            </div>
          )}
        </div>
      </main>

      {/* Evaluation Modal */}
      {evalStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-xl my-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: "#6b46c1" }}>{evalStudent.initials}</div>
                <div><p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#6b46c1" }}>Evaluate: {evalStudent.name}</p><p className={`${textSecondary}`} style={{ fontSize: "0.7rem" }}>{evalStudent.company} · Week {evalStudent.weekNumber}</p></div>
              </div>
              <button onClick={() => setEvalStudent(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"><X size={16} className="text-gray-500 dark:text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5">
              <div className="space-y-4 mb-5">
                {CRITERIA.map((c) => {
                  const studentScores = getScoresForStudent(evalStudent.id);
                  const sc = studentScores.find((s) => s.criteriaId === c.id);
                  const ws = sc?.score ? sc.score * c.weight : null;
                  return (
                    <div key={c.id} className={`rounded-xl p-4 ${isDark ? "bg-slate-700" : "bg-gray-50"}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div><p className={`${textPrimary}`} style={{ fontSize: "0.85rem", fontWeight: 600 }}>{c.name}</p><p className={`${textSecondary}`} style={{ fontSize: "0.72rem" }}>{c.description}</p></div>
                        <span className="px-2 py-0.5 rounded-full text-xs ml-3 flex-shrink-0" style={{ backgroundColor: "#ebf4ff", color: "#6b46c1", fontWeight: 600 }}>{(c.weight * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <ScoreButtons value={sc?.score ?? null} onChange={(v) => setScore(evalStudent.id, c.id, v)} />
                        {ws !== null && <span className="text-xs text-gray-500 dark:text-slate-400">Weighted: <strong style={{ color: "#6b46c1" }}>{ws.toFixed(2)}</strong></span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Weighted total */}
              {(() => {
                const studentScores = getScoresForStudent(evalStudent.id);
                const total = CRITERIA.reduce((acc, c) => { const sc = studentScores.find((s) => s.criteriaId === c.id); return sc?.score ? acc + sc.score * c.weight : acc; }, 0);
                const allScored = studentScores.every((s) => s.score !== null);
                return (
                  <>
                    <div className="px-4 py-3 rounded-xl mb-4 flex items-center justify-between" style={{ backgroundColor: "#6b46c1", color: "white" }}>
                      <div className="flex items-center gap-2"><BarChart2 size={16} /><span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Weighted Total Score</span></div>
                      <div className="text-right"><span style={{ fontSize: "1.4rem", fontWeight: 700 }}>{total.toFixed(2)}</span><span className="opacity-60 text-sm"> / 5.00</span></div>
                    </div>
                    <label className={`flex items-center gap-2.5 cursor-pointer mb-5 p-3 rounded-lg border transition-all ${isDark ? "border-slate-600 hover:bg-slate-700" : "border-gray-200 hover:bg-gray-50"}`}>
                      <input type="checkbox" checked={isFinalised} onChange={(e) => setIsFinalised(e.target.checked)} className="rounded" />
                      <div><p className={`${textPrimary} text-sm`} style={{ fontWeight: 500 }}>Finalise this evaluation</p><p className={`${textSecondary} text-xs`}>Once finalised, scores cannot be changed. Student will see the results.</p></div>
                      {isFinalised && <Lock size={14} className="text-gray-400 ml-auto flex-shrink-0" />}
                    </label>
                    {submitted && <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-100 mb-4"><CheckCircle2 size={14} style={{ color: "#276749" }} /><p className="text-sm" style={{ color: "#276749" }}>Evaluation submitted successfully!</p></div>}
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setEvalStudent(null)} className={`flex-1 py-2.5 text-sm rounded-xl border transition-all ${isDark ? "border-slate-600 text-slate-300 hover:bg-slate-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}>Cancel</button>
                      <button type="submit" disabled={!allScored || submitted} className="flex-1 py-2.5 text-sm text-white rounded-xl flex items-center justify-center gap-1.5 hover:opacity-90 transition-all disabled:opacity-50" style={{ backgroundColor: "#6b46c1" }}>
                        <Send size={13} />{isFinalised ? "Submit & Finalise" : "Save Evaluation"}
                      </button>
                    </div>
                    {!allScored && <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-2">Score all criteria to submit.</p>}
                  </>
                );
              })()}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}