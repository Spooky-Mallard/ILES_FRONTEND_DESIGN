import { NavLink } from "react-router";
import { GraduationCap, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-8">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "#1a365d" }}>
          <GraduationCap size={40} className="text-white" />
        </div>
        <p className="text-6xl mb-4 dark:text-white" style={{ fontWeight: 800, color: "#1a365d" }}>404</p>
        <h1 className="text-gray-900 dark:text-white mb-2" style={{ fontSize: "1.3rem", fontWeight: 700 }}>Page Not Found</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mb-8" style={{ lineHeight: 1.7 }}>
          The page you are looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <NavLink to="/" className="inline-flex items-center gap-2 px-6 py-3 text-sm text-white rounded-xl hover:opacity-90 transition-all" style={{ backgroundColor: "#1a365d" }}>
          <ArrowLeft size={14} /> Back to Home
        </NavLink>
      </div>
    </div>
  );
}
