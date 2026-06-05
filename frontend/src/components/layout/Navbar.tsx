import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useEnvironmentStore } from "../../store/environmentStore";
import {
  ChevronDown,
  UserPlus
} from "lucide-react";

export default function Navbar() {
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);

  const environments = useEnvironmentStore((state) => state.environments);
  const activeEnvironmentId = useEnvironmentStore((state) => state.activeEnvironmentId);
  const setActiveEnvironment = useEnvironmentStore((state) => state.setActiveEnvironment);

  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [environmentDropdownOpen, setEnvironmentDropdownOpen] = useState(false);

  useEffect(() => {
    if (!workspaceDropdownOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setWorkspaceDropdownOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [workspaceDropdownOpen]);

  useEffect(() => {
    if (!environmentDropdownOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEnvironmentDropdownOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [environmentDropdownOpen]);

  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId) || workspaces[0];
  const activeEnv = environments.find((environment) => environment.id === activeEnvironmentId) || environments[0];

  const getEnvDotColor = (color: string) => {
    if (color === "emerald") return "bg-brand-success shadow-[0_0_8px_#10B981]";
    if (color === "amber") return "bg-brand-warning shadow-[0_0_8px_#F59E0B]";
    return "bg-slate-400 shadow-[0_0_8px_#94A3B8]";
  };

  return (
    <header className="h-14 glass-panel border-b border-white/5 flex items-center justify-between px-6 z-20">
      {/* Workspace Switcher & Environment Selector */}
      <div className="flex items-center gap-6">
        {/* Workspace Selector dropdown */}
        <div className="relative">
          <button
            onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
            className="flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 transition-standard cursor-pointer min-w-36"
          >
            <div className="w-3.5 h-3.5 rounded bg-brand-primary/20 flex items-center justify-center text-[10px]">📁</div>
            <span className="truncate max-w-28 text-left">{activeWorkspace.name}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ml-auto ${workspaceDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {workspaceDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setWorkspaceDropdownOpen(false)} />
              <div className="absolute top-10 left-0 w-64 bg-brand-layer-2 border border-white/10 rounded-lg shadow-2xl p-2 z-50">
                <div className="px-2 py-1 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  Workspaces
                </div>
                <div className="space-y-0.5 mt-1">
                  {workspaces.map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => {
                        setActiveWorkspace(workspace.id);
                        setWorkspaceDropdownOpen(false);
                      }}
                      className={`w-full flex flex-col items-start px-2 py-2 rounded-md transition-standard text-left ${workspace.id === activeWorkspaceId ? "bg-brand-primary/10 text-white" : "hover:bg-white/[0.03] text-slate-400"
                        }`}
                    >
                      <span className="text-xs font-medium">{workspace.name}</span>
                      <span className="text-[10px] opacity-75 truncate max-w-[220px]">{workspace.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Environment Switcher dropdown */}
        <div className="relative">
          <button
            onClick={() => setEnvironmentDropdownOpen(!environmentDropdownOpen)}
            className="flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 transition-standard cursor-pointer"
          >
            <span className={`w-2 h-2 rounded-full ${getEnvDotColor(activeEnv.color)}`} />
            <span className="truncate text-left">{activeEnv.name}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${environmentDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {environmentDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setEnvironmentDropdownOpen(false)} />
              <div className="absolute top-10 left-0 w-44 bg-brand-layer-2 border border-white/10 rounded-lg shadow-2xl p-1.5 z-50">
                {environments.map((environment) => (
                  <button
                    key={environment.id}
                    onClick={() => {
                      setActiveEnvironment(environment.id);
                      setEnvironmentDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md transition-standard text-left text-xs ${environment.id === activeEnvironmentId ? "bg-brand-primary/10 text-white" : "hover:bg-white/[0.03] text-slate-400"
                      }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${getEnvDotColor(environment.color)}`} />
                    {environment.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Presence indicators & Actions */}
      <div className="flex items-center gap-4">
        {/* Real-time Collaboration presence avatars */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mr-1 hidden lg:inline">
            Presence
          </span>
          <div className="flex -space-x-1.5">
            {activeWorkspace.members.slice(0, 4).map((member, memberIndex) => (
              <div
                key={memberIndex}
                title={`${member.name} (${member.role}) - ${member.status}`}
                className={`w-7 h-7 rounded-full bg-brand-layer-2 border flex items-center justify-center text-xs relative cursor-pointer group shadow-[0_0_10px_rgba(0,0,0,0.5)] ${member.status === "active"
                  ? memberIndex === 1
                    ? "border-brand-success animate-pulse" // Pulses if active editing
                    : "border-brand-success"
                  : "border-brand-warning"
                  }`}
              >
                <span>{member.avatar}</span>
                {/* Tiny presence bulb */}
                <span
                  className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#0B0F19] ${member.status === "active" ? "bg-brand-success" : "bg-brand-warning"
                    }`}
                />
              </div>
            ))}
          </div>
          <Link
            to="/workspaces"
            className="w-7 h-7 rounded-full bg-white/[0.02] border border-dashed border-white/15 hover:border-brand-primary/50 text-slate-400 hover:text-brand-primary transition-standard flex items-center justify-center"
            title="Manage Members"
          >
            <UserPlus className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </header>
  );
}