import { useState, useMemo } from "react";
import type { ElementType } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import {
  Search, Users, Building2, TrendingUp, GraduationCap, Bell, Download,
  ChevronUp, ChevronDown, MoreHorizontal, CheckCircle2, Clock, AlertTriangle,
  Eye, UserX, UserCheck, RefreshCw, LogOut, Home, LayoutDashboard, Settings,
  Moon, Sun, ChevronRight, BarChart2,
} from "lucide-react";

const PLACEMENT_DATA = [
  { name: "Technology", value: 42, color: "#1a365d" }, { name: "Finance", value: 18, color: "#2b6cb0" },
  { name: "Healthcare", value: 15, color: "#276749" }, { name: "Education", value: 10, color: "#c05621" },
  { name: "Manufacturing", value: 8, color: "#b7791f" }, { name: "Government", value: 7, color: "#6b46c1" },
];
const WEEKLY_HOURS = [
  { week: "Wk 1", avg: 32, target: 40 }, { week: "Wk 2", avg: 36, target: 40 }, { week: "Wk 3", avg: 39, target: 40 },
  { week: "Wk 4", avg: 38, target: 40 }, { week: "Wk 5", avg: 41, target: 40 }, { week: "Wk 6", avg: 40, target: 40 },
  { week: "Wk 7", avg: 38, target: 40 }, { week: "Wk 8", avg: 42, target: 40 }, { week: "Wk 9", avg: 39, target: 40 },
  { week: "Wk 10", avg: 43, target: 40 }, { week: "Wk 11", avg: 40, target: 40 }, { week: "Wk 12", avg: 38, target: 40 },
];
const COMPLETION_DATA = [
  { month: "Nov", completed: 12, enrolled: 15 }, { month: "Dec", completed: 10, enrolled: 13 },
  { month: "Jan", completed: 18, enrolled: 20 }, { month: "Feb", completed: 22, enrolled: 25 },
  { month: "Mar", completed: 28, enrolled: 30 }, { month: "Apr", completed: 20, enrolled: 28 },
];
type UserRole = "Student" | "Supervisor" | "Admin";
type UserStatus = "Active" | "Inactive" | "Pending";
interface UserRow {
  id: number; name: string; initials: string; email: string; role: UserRole;
  department: string; status: UserStatus; lastActive: string; internshipsCount: number; logsCount: number;
}
const USERS: UserRow[] = [
  { id: 1, name: "Maria Reyes", initials: "MR", email: "m.reyes@student.edu", role: "Student", department: "CS", status: "Active", lastActive: "Today", internshipsCount: 1, logsCount: 12 },
  { id: 2, name: "Juan dela Cruz", initials: "JC", email: "j.delacruz@student.edu", role: "Student", department: "IT", status: "Active", lastActive: "Yesterday", internshipsCount: 1, logsCount: 11 },
  { id: 3, name: "Ana Santos", initials: "AS", email: "a.santos@student.edu", role: "Student", department: "IS", status: "Active", lastActive: "Today", internshipsCount: 1, logsCount: 12 },
  { id: 4, name: "Carlos Mendez", initials: "CM", email: "c.mendez@student.edu", role: "Student", department: "CE", status: "Active", lastActive: "3 days ago", internshipsCount: 1, logsCount: 10 },
  { id: 5, name: "Sofia Lim", initials: "SL", email: "s.lim@student.edu", role: "Student", department: "CS", status: "Active", lastActive: "Today", internshipsCount: 1, logsCount: 12 },
  { id: 6, name: "Ramon Bautista", initials: "RB", email: "r.bautista@student.edu", role: "Student", department: "IT", status: "Active", lastActive: "Yesterday", internshipsCount: 1, logsCount: 11 },
  { id: 7, name: "Lara Cruz", initials: "LC", email: "l.cruz@student.edu", role: "Student", department: "CS", status: "Inactive", lastActive: "2 weeks ago", internshipsCount: 0, logsCount: 0 },
  { id: 8, name: "Dr. Elena Santos", initials: "ES", email: "e.santos@faculty.edu", role: "Supervisor", department: "CS", status: "Active", lastActive: "Today", internshipsCount: 6, logsCount: 0 },
  { id: 9, name: "Prof. Miguel Torres", initials: "MT", email: "m.torres@faculty.edu", role: "Supervisor", department: "IT", status: "Active", lastActive: "Today", internshipsCount: 4, logsCount: 0 },
  { id: 10, name: "Dr. Joana Uy", initials: "JU", email: "j.uy@faculty.edu", role: "Supervisor", department: "CE", status: "Pending", lastActive: "Never", internshipsCount: 0, logsCount: 0 },
  { id: 11, name: "Admin User", initials: "AU", email: "admin@iles.edu", role: "Admin", department: "MIS", status: "Active", lastActive: "Today", internshipsCount: 0, logsCount: 0 },
  { id: 12, name: "Bella Panganiban", initials: "BP", email: "b.panganiban@student.edu", role: "Student", department: "IS", status: "Pending", lastActive: "Never", internshipsCount: 0, logsCount: 0 },
];
type SortField = "name" | "role" | "status" | "lastActive" | "logsCount";
type SortDir = "asc" | "desc";
const ROLE_COLORS: Record<UserRole, { bg: string; color: string }> = {
  Student: { bg: "#ebf4ff", color: "#1a365d" },
  Supervisor: { bg: "#fef3c7", color: "#92400e" },
  Admin: { bg: "#fce7f3", color: "#9d174d" },
};
const STATUS_STYLES: Record<UserStatus, { bg: string; color: string; icon: ElementType }> = {
  Active: { bg: "#f0fff4", color: "#276749", icon: CheckCircle2 },
  Inactive: { bg: "#f7fafc", color: "#718096", icon: UserX },
  Pending: { bg: "#fff7ed", color: "#c05621", icon: Clock },
};
const ILES_STATS = [
  { label: "Total Students", value: "100", sub: "+8 this semester", icon: GraduationCap, color: "#1a365d" },
  { label: "Active Internships", value: "87", sub: "87% placement rate", icon: Building2, color: "#276749" },
  { label: "Logs This Week", value: "342", sub: "↑ 12% vs last week", icon: TrendingUp, color: "#c05621" },
  { label: "Supervisors", value: "14", sub: "Avg 6.2 students each", icon: Users, color: "#6b46c1" },
];
const NAV_ITEMS = [
  { icon: Home, label: "Overview", id: "overview" },
  { icon: Users, label: "User Management", id: "users" },
  { icon: Building2, label: "Placements", id: "placements" },
  { icon: BarChart2, label: "Analytics", id: "analytics" },
  { icon: Settings, label: "Settings", id: "settings" },
];

export function AdminDashboard() {
  const { user, isDark, toggleDark, logout } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("overview");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | UserRole>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | UserStatus>("All");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const bg = isDark ? "bg-slate-900" : "bg-gray-50";
  const cardBg = isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-slate-400" : "text-gray-500";

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };
  const filtered = useMemo(() => {
    return USERS.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.toLowerCase().includes(q);
      const matchRole = roleFilter === "All" || u.role === roleFilter;
      const matchStatus = statusFilter === "All" || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    }).sort((a, b) => {
      const av = typeof a[sortField] === "string" ? (a[sortField] as string).toLowerCase() : a[sortField];
      const bv = typeof b[sortField] === "string" ? (b[sortField] as string).toLowerCase() : b[sortField];
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [search, roleFilter, statusFilter, sortField, sortDir]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp size={12} className="text-gray-300 dark:text-slate-600" />;
    return sortDir === "asc" ? <ChevronUp size={12} style={{ color: "#1a365d" }} /> : <ChevronDown size={12} style={{ color: "#1a365d" }} />;
  };

  const OverviewContent = () => (
    <div className="flex-1 overflow-auto px-8 py-6">
      <div className="grid grid-cols-4 gap-4 mb-6">
        {ILES_STATS.map((s) => (
          <div key={s.label} className={`rounded-xl border px-5 py-4 ${cardBg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`${textSecondary} text-xs`}>{s.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "15" }}><s.icon size={16} style={{ color: s.color }} /></div>
            </div>
            <p style={{ fontSize: "1.6rem", fontWeight: 700, color: "#1a365d" }} className="dark:text-blue-300">{s.value}</p>
            <p className={`${textSecondary} text-xs mt-0.5`}>{s.sub}</p>
          </div>
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-12 gap-5 mb-6">
        <div className={`col-span-4 rounded-xl border overflow-hidden ${cardBg}`}>
          <div className="px-5 py-4 border-b" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}><h2 className={`${textPrimary}`} style={{ fontSize: "0.9rem", fontWeight: 600 }}>Placement by Industry</h2><p className={`${textSecondary} text-xs`}>By sector</p></div>
          <div className="px-2 py-3"><ResponsiveContainer width="100%" height={210}><PieChart><Pie data={PLACEMENT_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">{PLACEMENT_DATA.map((e) => <Cell key={e.name} fill={e.color} />)}</Pie><Tooltip formatter={(v) => [`${v} students`, ""]} contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e2e8f0" }} /><Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: isDark ? "#94a3b8" : "#4a5568" }}>{v}</span>} /></PieChart></ResponsiveContainer></div>
        </div>
        <div className={`col-span-5 rounded-xl border overflow-hidden ${cardBg}`}>
          <div className="px-5 py-4 border-b" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}><h2 className={`${textPrimary}`} style={{ fontSize: "0.9rem", fontWeight: 600 }}>Average Weekly Hours</h2><p className={`${textSecondary} text-xs`}>Actual vs target (40 hrs)</p></div>
          <div className="px-3 py-3"><ResponsiveContainer width="100%" height={210}><BarChart data={WEEKLY_HOURS} barSize={14}><CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#f0f0f0"} vertical={false} /><XAxis dataKey="week" tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#a0aec0" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#a0aec0" }} axisLine={false} tickLine={false} domain={[0, 50]} /><Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e2e8f0" }} formatter={(v, name) => [`${v} hrs`, name === "avg" ? "Actual Avg" : "Target"]} /><Bar dataKey="avg" fill="#1a365d" radius={[4, 4, 0, 0]} name="avg" /><Bar dataKey="target" fill="#bee3f8" radius={[4, 4, 0, 0]} name="target" /></BarChart></ResponsiveContainer></div>
        </div>
        <div className={`col-span-3 rounded-xl border overflow-hidden ${cardBg}`}>
          <div className="px-5 py-4 border-b" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}><h2 className={`${textPrimary}`} style={{ fontSize: "0.9rem", fontWeight: 600 }}>Completions Trend</h2><p className={`${textSecondary} text-xs`}>Monthly completions</p></div>
          <div className="px-3 py-3"><ResponsiveContainer width="100%" height={210}><AreaChart data={COMPLETION_DATA}><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1a365d" stopOpacity={0.15} /><stop offset="95%" stopColor="#1a365d" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#f0f0f0"} vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#a0aec0" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: isDark ? "#64748b" : "#a0aec0" }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e2e8f0" }} /><Area type="monotone" dataKey="enrolled" stroke="#bee3f8" fill="none" strokeWidth={2} dot={false} name="Enrolled" /><Area type="monotone" dataKey="completed" stroke="#1a365d" fill="url(#cg)" strokeWidth={2} dot={{ fill: "#1a365d", r: 3 }} name="Completed" /></AreaChart></ResponsiveContainer></div>
        </div>
      </div>
    </div>
  );

  const UsersContent = () => (
    <div className="flex-1 overflow-auto px-8 py-6">
      <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
        <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}>
          <div><h2 className={`${textPrimary}`} style={{ fontSize: "0.9rem", fontWeight: 600 }}>User Management</h2><p className={`${textSecondary} text-xs`}>{filtered.length} of {USERS.length} users</p></div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className={`pl-8 pr-3 py-2 text-sm rounded-lg border focus:outline-none w-48 ${isDark ? "border-slate-600 bg-slate-700 text-white" : "border-gray-200 bg-gray-50"}`} /></div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as "All" | UserRole)} className={`px-3 py-2 text-sm rounded-lg border focus:outline-none ${isDark ? "border-slate-600 bg-slate-700 text-white" : "border-gray-200 bg-gray-50"}`}><option value="All">All Roles</option><option value="Student">Student</option><option value="Supervisor">Supervisor</option><option value="Admin">Admin</option></select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "All" | UserStatus)} className={`px-3 py-2 text-sm rounded-lg border focus:outline-none ${isDark ? "border-slate-600 bg-slate-700 text-white" : "border-gray-200 bg-gray-50"}`}><option value="All">All Statuses</option><option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Pending">Pending</option></select>
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-all" style={{ backgroundColor: "#1a365d" }}><UserCheck size={13} /> Add User</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: isDark ? "#1e293b" : "#f7fafc" }}>
                {[{ label: "Name", field: "name" as SortField }, { label: "Role", field: "role" as SortField }, { label: "Department", field: null }, { label: "Status", field: "status" as SortField }, { label: "Last Active", field: "lastActive" as SortField }, { label: "Logs / Internships", field: "logsCount" as SortField }, { label: "Actions", field: null }].map((col) => (
                  <th key={col.label} className={`text-left px-5 py-3 ${textSecondary} select-none`} style={{ fontSize: "0.72rem", fontWeight: 600 }}>
                    {col.field ? <button onClick={() => handleSort(col.field!)} className={`flex items-center gap-1 hover:${textPrimary} transition-colors`}>{col.label}<SortIcon field={col.field} /></button> : col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const roleCfg = ROLE_COLORS[u.role];
                const statusCfg = STATUS_STYLES[u.status];
                return (
                  <tr key={u.id} className={`border-t transition-colors ${isDark ? "border-slate-700 hover:bg-slate-700/50" : "border-gray-100 hover:bg-gray-50"}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: "#1a365d", fontSize: "0.7rem" }}>{u.initials}</div>
                        <div><p className={`${textPrimary}`} style={{ fontSize: "0.82rem", fontWeight: 600 }}>{u.name}</p><p className={`${textSecondary}`} style={{ fontSize: "0.7rem" }}>{u.email}</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-3"><span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: roleCfg.bg, color: roleCfg.color, fontSize: "0.7rem", fontWeight: 600 }}>{u.role}</span></td>
                    <td className={`px-5 py-3 ${textSecondary}`} style={{ fontSize: "0.8rem" }}>{u.department}</td>
                    <td className="px-5 py-3"><span className="flex items-center gap-1 w-fit px-2 py-0.5 rounded-full" style={{ backgroundColor: statusCfg.bg, color: statusCfg.color, fontSize: "0.7rem", fontWeight: 600 }}><statusCfg.icon size={10} />{u.status}</span></td>
                    <td className={`px-5 py-3 ${textSecondary}`} style={{ fontSize: "0.8rem" }}>{u.lastActive}</td>
                    <td className="px-5 py-3">
                      {u.role === "Student" ? <><span className="text-xs text-gray-600 dark:text-slate-400"><span style={{ fontWeight: 600, color: "#1a365d" }}>{u.logsCount}</span> logs</span>{" "}<span className="text-xs text-gray-600 dark:text-slate-400"><span style={{ fontWeight: 600, color: "#276749" }}>{u.internshipsCount}</span> internship</span></> : u.role === "Supervisor" ? <span className="text-xs text-gray-600 dark:text-slate-400"><span style={{ fontWeight: 600, color: "#1a365d" }}>{u.internshipsCount}</span> students</span> : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 relative">
                        <button className={`p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-all ${isDark ? "hover:bg-slate-700" : "hover:bg-gray-100"}`}><Eye size={14} /></button>
                        <button className={`p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-all ${isDark ? "hover:bg-slate-700" : "hover:bg-gray-100"}`} onClick={() => setActiveMenuId(activeMenuId === u.id ? null : u.id)}><MoreHorizontal size={14} /></button>
                        {activeMenuId === u.id && (
                          <div className={`absolute right-0 top-8 z-20 rounded-lg shadow-lg border py-1 w-36 ${isDark ? "bg-slate-700 border-slate-600" : "bg-white border-gray-200"}`}>
                            <button className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 ${isDark ? "text-slate-300 hover:bg-slate-600" : "text-gray-600 hover:bg-gray-50"}`}><UserCheck size={12} /> Activate</button>
                            <button className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 ${isDark ? "text-slate-300 hover:bg-slate-600" : "text-gray-600 hover:bg-gray-50"}`}><UserX size={12} /> Deactivate</button>
                            <button className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 flex items-center gap-2"><AlertTriangle size={12} /> Remove</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center text-gray-400 dark:text-slate-500"><Search size={32} className="mx-auto mb-2 opacity-30" /><p className="text-sm">No users match your search</p></div>}
        </div>
        <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}>
          <p className={`${textSecondary} text-xs`}>Showing {filtered.length} of {USERS.length} users</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((p) => (
              <button key={p} className={`w-7 h-7 rounded-lg text-xs transition-all ${p === 1 ? "text-white" : `${textSecondary} hover:bg-gray-100 dark:hover:bg-slate-700`}`} style={p === 1 ? { backgroundColor: "#1a365d" } : {}}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex min-h-screen ${bg}`}>
      {/* Sidebar */}
      <aside className={`w-60 flex flex-col border-r flex-shrink-0 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
        <div className="px-4 py-4 border-b" style={{ borderColor: isDark ? "#334155" : "#f1f5f9", backgroundColor: "#4a1d96" }}>
          <div className="flex items-center gap-2"><LayoutDashboard size={18} className="text-white" /><span className="text-white" style={{ fontWeight: 700, fontSize: "0.9rem" }}>ILES</span></div>
          <p className="text-white/50 text-xs mt-0.5">System Administration</p>
        </div>
        <div className="px-5 py-4 border-b" style={{ borderColor: isDark ? "#334155" : "#f1f5f9" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: "#4a1d96" }}>{user?.initials}</div>
            <div><p className={`${textPrimary} text-sm`} style={{ fontWeight: 600 }}>{user?.name}</p><p className={`${textSecondary} text-xs`}>Internship Administrator</p></div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} onClick={() => setActiveNav(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${activeNav === item.id ? "text-white" : `${textSecondary} hover:bg-gray-50 dark:hover:bg-slate-700`}`} style={activeNav === item.id ? { backgroundColor: "#4a1d96" } : {}}>
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
          <div><h1 className={`${textPrimary}`} style={{ fontSize: "1.05rem", fontWeight: 600 }}>System Administration</h1><p className={`${textSecondary} text-xs mt-0.5`}>ILES · Academic Year 2025–2026 · Semester 2</p></div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"><Download size={14} /> Export</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-all" style={{ backgroundColor: "#1a365d" }}><RefreshCw size={14} /> Sync Data</button>
            <button className="relative p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all"><Bell size={18} /><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: "#e53e3e" }} /></button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: "#4a1d96" }}>{user?.initials}</div>
          </div>
        </header>
        <div className="flex-1 flex flex-col min-h-0 overflow-auto">
          {activeNav === "overview" ? <OverviewContent /> : activeNav === "users" ? <UsersContent /> : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BarChart2 size={40} className="mx-auto mb-4 text-gray-300 dark:text-slate-600" />
                <p className={`${textSecondary} text-sm`}>This section is coming soon.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
