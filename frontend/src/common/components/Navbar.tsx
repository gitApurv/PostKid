import { useState, useEffect, useRef } from "react";
import { ChevronDown, Layers2, Settings } from "lucide-react";
import { useWorkspaceStore } from "../../workspace/store/workspaceStore";
import WorkspaceSettingsModal from "../../workspace/components/WorkspaceSettingsModal";

export default function Navbar() {
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspaceAction);
  const fetchWorkspaces = useWorkspaceStore((state) => state.fetchWorkspacesAction);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      <header className="h-14 glass-panel border-b border-white/5 flex items-center justify-between px-6 z-20 relative">
        <div className="flex items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-slate-300 hover:text-white transition cursor-pointer select-none"
            >
              <Layers2 className="w-3.5 h-3.5 text-brand-primary shrink-0" />
              <span className="text-[11px] font-semibold truncate max-w-[140px]">
                {activeWorkspace ? activeWorkspace.name : "Select Workspace"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            </button>

            {isOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-brand-layer-2 border border-white/10 rounded-lg shadow-2xl p-1.5 z-30">
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {workspaces.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => {
                        setActiveWorkspace(w.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-md transition-standard flex items-center justify-between cursor-pointer ${
                        w.id === activeWorkspaceId ? "bg-white/[0.02] text-white font-medium" : ""
                      }`}
                    >
                      <span className="truncate">{w.name}</span>
                      {w.id === activeWorkspaceId && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/5 my-1.5" />
                <button
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-brand-primary hover:bg-brand-primary/10 rounded-md transition-standard cursor-pointer font-medium"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Manage Workspaces
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <WorkspaceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}

