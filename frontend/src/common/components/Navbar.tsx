import { ChevronDown, Layers2 } from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-14 glass-panel border-b border-white/5 flex items-center justify-between px-6 z-20">
      <button
        disabled
        title="Workspace switching coming soon"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-slate-400 cursor-not-allowed opacity-60 select-none"
      >
        <Layers2 className="w-3.5 h-3.5 text-brand-primary shrink-0" />
        <span className="text-[11px] font-semibold truncate max-w-[140px]">
          My Workspace
        </span>
        <ChevronDown className="w-3 h-3 shrink-0" />
        <span className="ml-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide bg-brand-primary/10 text-brand-primary border border-brand-primary/20 leading-none">
          Soon
        </span>
      </button>
    </header>
  );
}
