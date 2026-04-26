export function LoadingSpinner({ size = 40, color = "#1a365d" }: { size?: number; color?: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        {/* Outer ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `${size * 0.075}px solid ${color}20`,
            borderTopColor: color,
            animation: "spin 0.9s linear infinite",
          }}
        />
        {/* Inner ring */}
        <div
          style={{
            position: "absolute",
            inset: size * 0.2,
            borderRadius: "50%",
            border: `${size * 0.075}px solid ${color}10`,
            borderBottomColor: color,
            animation: "spin 0.6s linear infinite reverse",
          }}
        />
        {/* Center dot */}
        <div
          style={{
            position: "absolute",
            inset: "50%",
            transform: "translate(-50%, -50%)",
            width: size * 0.15,
            height: size * 0.15,
            borderRadius: "50%",
            backgroundColor: color,
            marginLeft: -(size * 0.075),
            marginTop: -(size * 0.075),
          }}
        />
      </div>
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <LoadingSpinner size={52} />
      <p className="mt-4 text-sm text-gray-500 dark:text-slate-400" style={{ letterSpacing: "0.05em" }}>
        Loading ILES...
      </p>
    </div>
  );
}
