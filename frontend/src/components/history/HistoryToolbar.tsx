
interface HistoryToolbarProps {
  selectedMethodFilter: string | null;
  setSelectedMethodFilter: (method: string | null) => void;
}

export default function HistoryToolbar({
  selectedMethodFilter,
  setSelectedMethodFilter
}: HistoryToolbarProps) {
  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "text-blue-400 border-blue-500/20 bg-blue-500/10";
      case "POST":
        return "text-brand-success border-brand-success/20 bg-brand-success/10";
      case "PUT":
        return "text-brand-warning border-brand-warning/20 bg-brand-warning/10";
      case "DELETE":
        return "text-brand-error border-brand-error/20 bg-brand-error/10";
      case "PATCH":
        return "text-purple-400 border-purple-500/20 bg-purple-500/10";
      default:
        return "text-slate-400 border-slate-500/20 bg-slate-500/10";
    }
  };

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 justify-between">
      {/* Method tags selectors */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1">Filter Method</span>
        {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => {
          const isSelected = selectedMethodFilter === m;
          return (
            <button
              key={m}
              onClick={() => setSelectedMethodFilter(isSelected ? null : m)}
              className={`px-2.5 py-1 border rounded text-[10px] font-bold font-mono transition-standard cursor-pointer ${isSelected
                ? getMethodColor(m) + " border-brand-primary/50"
                : "border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
            >
              {m}
            </button>
          );
        })}
      </div>
    </div>
  );
}
