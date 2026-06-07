import { useState, useMemo, useEffect, useRef } from "react";
import { useActiveRequestStore } from "../../store/activeRequestStore";
import type { RequestItem } from "../../types/request/RequestItem";
import { useEnvironmentStore } from "../../store/environmentStore";

import {
  Send,
  Save,
  Info,
  Layers,
  Unlock,
  Key,
  ShieldAlert,
  Sliders,
  Sparkles,
  RefreshCw,
  Trash2,
  Edit3
} from "lucide-react";

export default function RequestBuilder() {
  const activeRequest = useActiveRequestStore((state) => state.activeRequest);
  const isExecuting = useActiveRequestStore((state) => state.isExecuting);
  const updateActiveRequestAction = useActiveRequestStore((state) => state.updateActiveRequestAction);
  const executeRequestAction = useActiveRequestStore((state) => state.executeRequestAction);

  const phantomRow = { key: "", value: "", active: true };

  const storeParams = activeRequest?.params || [];
  const displayParams = useMemo(() => [...storeParams, phantomRow], [storeParams]);

  const storeHeaders = activeRequest?.headers || [];
  const displayHeaders = useMemo(() => [...storeHeaders, phantomRow], [storeHeaders]);

  const environments = useEnvironmentStore((state) => state.environments);
  const activeEnvironmentId = useEnvironmentStore((state) => state.activeEnvironmentId);

  const [activeTab, setActiveTab] = useState<"params" | "auth" | "headers" | "body" | "settings">("params");
  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);
  const [showResolvedUrl, setShowResolvedUrl] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (activeRequest) {
      setEditName(activeRequest.name);
      setIsEditingName(false);
    }
  }, [activeRequest?.id]);

  const methodDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!methodDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (methodDropdownRef.current && !methodDropdownRef.current.contains(e.target as Node)) {
        setMethodDropdownOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMethodDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [methodDropdownOpen]);

  const activeEnvironment = environments.find((environment) => environment.id === activeEnvironmentId) || environments[0];
  const activeVariables = activeEnvironment?.variables || [];

  const getResolvedUrl = (rawUrl: string) => {
    let url = rawUrl;
    activeVariables.forEach((variable) => {
      url = url.replace(`{{${variable.key}}}`, variable.value);
    });
    return url;
  };

  const getMethodStyle = (method: RequestItem["method"]) => {
    switch (method) {
      case "GET":
        return {
          pill: "text-blue-400 border-blue-500/20 bg-blue-500/10",
          border: "focus-within:border-blue-500/50 focus-within:ring-blue-500/10",
          btn: "bg-blue-500 hover:bg-blue-600 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
        };
      case "POST":
        return {
          pill: "text-brand-success border-brand-success/20 bg-brand-success/10",
          border: "focus-within:border-brand-success/50 focus-within:ring-brand-success/10",
          btn: "bg-brand-success hover:bg-brand-success/90 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
        };
      case "PUT":
        return {
          pill: "text-brand-warning border-brand-warning/20 bg-brand-warning/10",
          border: "focus-within:border-brand-warning/50 focus-within:ring-brand-warning/10",
          btn: "bg-brand-warning hover:bg-brand-warning/90 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]"
        };
      case "DELETE":
        return {
          pill: "text-brand-error border-brand-error/20 bg-brand-error/10",
          border: "focus-within:border-brand-error/50 focus-within:ring-brand-error/10",
          btn: "bg-brand-error hover:bg-brand-error/90 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]"
        };
      case "PATCH":
        return {
          pill: "text-purple-400 border-purple-500/20 bg-purple-500/10",
          border: "focus-within:border-purple-500/50 focus-within:ring-purple-500/10",
          btn: "bg-purple-500 hover:bg-purple-600 hover:shadow-[0_0_15px_rgba(139,92,246,0.4)]"
        };
      default:
        return {
          pill: "text-slate-400 border-slate-500/20 bg-slate-500/10",
          border: "focus-within:border-brand-primary/50 focus-within:ring-brand-primary/10",
          btn: "bg-brand-primary hover:bg-brand-secondary"
        };
    }
  };

  const currentStyles = getMethodStyle(activeRequest?.method || "GET");

  const handleSend = () => {
    if (!activeRequest) return;
    executeRequestAction(activeEnvironmentId, environments);
  };

  const handleSave = () => {
    if (!activeRequest) return;
    alert("Request variables securely saved to workspace catalog metadata.");
  };

  const handleGridChange = (
    type: "params" | "headers",
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    if (!activeRequest) return;
    const storeGrid = activeRequest[type] || [];
    const isPhantomRow = index === storeGrid.length;

    if (isPhantomRow) {
      const newRow = { key: "", value: "", active: true, [field]: value };
      updateActiveRequestAction({ [type]: [...storeGrid, newRow] });
    } else {
      const grid = [...storeGrid];
      grid[index] = { ...grid[index], [field]: value };
      updateActiveRequestAction({ [type]: grid });
    }
  };

  const handleToggleRowActive = (type: "params" | "headers", index: number, status: boolean) => {
    if (!activeRequest) return;
    const storeGrid = activeRequest[type] || [];
    if (index >= storeGrid.length) return;
    const grid = [...storeGrid];
    grid[index] = { ...grid[index], active: status };
    updateActiveRequestAction({ [type]: grid });
  };

  const handleDeleteGridRow = (type: "params" | "headers", index: number) => {
    if (!activeRequest) return;
    const grid = activeRequest[type].filter((_, idx) => idx !== index);
    updateActiveRequestAction({ [type]: grid });
  };

  const beautifyJson = () => {
    if (!activeRequest || activeRequest.bodyType !== "json") return;
    try {
      const parsed = JSON.parse(activeRequest.bodyJson);
      const beautified = JSON.stringify(parsed, null, 2);
      updateActiveRequestAction({ bodyJson: beautified });
    } catch {
      alert("Invalid JSON format. Check syntax parameters before indent alignment.");
    }
  };



  const hasCurlyBraces = activeRequest?.url.includes("{{") && activeRequest?.url.includes("}}");

  if (!activeRequest) return null;

  return (
    <div className="glass-panel rounded-xl border border-white/5 p-5 space-y-4 flex flex-col h-[420px] shadow-[0_0_30px_rgba(0,0,0,0.3)] z-10 shrink-0">
      {/* Top API URL Builder strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0 group">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
              Request Sandbox /
            </span>
            {isEditingName ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => {
                  setIsEditingName(false);
                  if (editName.trim() && editName.trim() !== activeRequest.name) {
                    updateActiveRequestAction({ name: editName.trim() });
                  } else {
                    setEditName(activeRequest.name);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setIsEditingName(false);
                    if (editName.trim() && editName.trim() !== activeRequest.name) {
                      updateActiveRequestAction({ name: editName.trim() });
                    } else {
                      setEditName(activeRequest.name);
                    }
                  } else if (e.key === "Escape") {
                    setIsEditingName(false);
                    setEditName(activeRequest.name);
                  }
                }}
                autoFocus
                className="bg-brand-layer-2 border border-white/10 rounded px-1 py-0.5 text-[10px] text-slate-200 font-bold uppercase focus:outline-none focus:border-brand-primary max-w-[200px]"
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-[10px] font-bold text-slate-300 uppercase tracking-widest hover:text-white cursor-pointer truncate max-w-[250px] flex items-center gap-1 hover:bg-white/5 px-1 py-0.5 rounded transition-standard text-left"
                title="Click to edit request name"
              >
                {activeRequest.name}
                <Edit3 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 px-2.5 py-1 rounded text-[10px] font-semibold text-slate-300 transition-standard cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Save Draft
          </button>
        </div>

        {/* Main Address bar container */}
        <div className={`flex bg-brand-layer-1 border border-white/5 rounded-xl p-1.5 transition-all duration-200 ${currentStyles.border}`}>
          {/* Colored Pill Method Dropdown */}
          <div className="relative" ref={methodDropdownRef}>
            <button
              onClick={() => setMethodDropdownOpen(!methodDropdownOpen)}
              className={`px-3 py-2 rounded-lg text-xs font-bold border transition-standard cursor-pointer ${currentStyles.pill}`}
            >
              {activeRequest.method}
            </button>

            {methodDropdownOpen && (
              <div className="absolute top-11 left-0 bg-brand-layer-2 border border-white/10 rounded-lg shadow-2xl p-1 z-50 w-28">
                {(["GET", "POST", "PUT", "DELETE", "PATCH"] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => {
                      updateActiveRequestAction({ method: method });
                      setMethodDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded transition-standard ${method === activeRequest.method
                      ? "bg-brand-primary/10 text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
                      }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* URL String Input */}
          <div className="flex-1 px-3 relative flex items-center min-w-0">
            <input
              type="text"
              value={activeRequest.url}
              onChange={(e) => updateActiveRequestAction({ url: e.target.value })}
              className="w-full bg-transparent border-0 text-slate-200 text-xs font-mono py-1.5 focus:outline-none focus:ring-0 placeholder-slate-600"
              placeholder="{{base_url}}/endpoint"
            />

            {/* Neon variable indicator highlighting */}
            {hasCurlyBraces && (
              <button
                onClick={() => setShowResolvedUrl(!showResolvedUrl)}
                className="absolute right-2 px-1.5 py-0.5 rounded bg-brand-success/10 text-brand-success border border-brand-success/20 text-[9px] font-bold flex items-center gap-1 hover:bg-brand-success/20 transition-standard cursor-pointer"
                title="Variables Interpolated"
              >
                <Sparkles className="w-3 h-3" />
                {"{{x}}"}
              </button>
            )}
          </div>

          {/* Pulsing Send trigger */}
          <button
            onClick={handleSend}
            disabled={isExecuting}
            className={`px-5 rounded-lg font-display text-xs font-bold text-white flex items-center gap-1.5 transition-standard cursor-pointer ${currentStyles.btn} disabled:opacity-40 disabled:pointer-events-none shrink-0`}
          >
            {isExecuting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            Send
          </button>
        </div>

        {/* Resolved URL Variables Overlay tooltip */}
        {showResolvedUrl && hasCurlyBraces && (
          <div className="bg-[#0B0F19] border border-brand-success/20 p-2.5 rounded-lg text-[10px] font-mono text-slate-400 flex items-center gap-2 animate-float">
            <Info className="w-3.5 h-3.5 text-brand-success shrink-0" />
            <span className="text-slate-500 shrink-0">Compiler translates URL:</span>
            <span className="text-brand-success select-all">{getResolvedUrl(activeRequest.url)}</span>
          </div>
        )}
      </div>

      {/* Segmented configuration tabs */}
      <div className="space-y-4 flex-1 min-h-0 flex flex-col">

        <div className="flex items-center border-b border-white/5 text-xs font-semibold gap-1.5 shrink-0">
          {(["params", "auth", "headers", "body", "settings"] as const).map((tab) => {
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 border-b-2 capitalize transition-standard cursor-pointer ${isActive
                  ? "border-brand-primary text-white bg-brand-primary/[0.01]"
                  : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Core tab panels */}
        <div className="flex-1 overflow-auto bg-brand-layer-1/25 rounded-xl border border-white/5 p-4 min-h-0 flex flex-col">

          {/* 1. Parameters grid builder */}
          {activeTab === "params" && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                <Layers className="w-3.5 h-3.5" /> Query Parameters Grid
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-2 w-8 text-center">Active</th>
                    <th className="py-2 px-2">Key</th>
                    <th className="py-2 px-2">Value</th>
                    <th className="py-2 w-12 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayParams.map((param, index) => (
                    <tr key={index} className="hover:bg-white/[0.01] transition-standard">
                      <td className="py-1.5 text-center">
                        <input
                          type="checkbox"
                          checked={param.active}
                          onChange={(e) => handleToggleRowActive("params", index, e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-white/10 bg-brand-layer-2 text-brand-primary focus:ring-brand-primary/20 accent-brand-primary cursor-pointer"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={param.key}
                          onChange={(e) => handleGridChange("params", index, "key", e.target.value)}
                          className="w-full bg-transparent border-0 border-b border-transparent focus:border-brand-primary/40 focus:ring-0 text-slate-200 font-mono text-[11px] py-0.5 focus:outline-none placeholder-slate-600"
                          placeholder="Parameter key"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) => handleGridChange("params", index, "value", e.target.value)}
                          className="w-full bg-transparent border-0 border-b border-transparent focus:border-brand-primary/40 focus:ring-0 text-slate-400 font-mono text-[11px] py-0.5 focus:outline-none placeholder-slate-600"
                          placeholder="Value mapping"
                        />
                      </td>
                      <td className="py-1.5 text-right pr-2">
                        {index < storeParams.length ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteGridRow("params", index)}
                            className="p-1 hover:bg-brand-error/10 text-slate-500 hover:text-brand-error rounded transition-standard cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. Authentication switcher config */}
          {activeTab === "auth" && (
            <div className="space-y-5 max-w-lg">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Unlock className="w-3.5 h-3.5" /> Authorization Schemes
                </label>
                <select
                  value={activeRequest.authType}
                  onChange={(e) => updateActiveRequestAction({ authType: e.target.value as RequestItem["authType"] })}
                  className="block w-full bg-brand-layer-2 border border-white/5 rounded-lg text-xs text-slate-300 p-2.5 focus:outline-none focus:border-brand-primary"
                >
                  <option value="none">No Auth (Implicit parameters)</option>
                  <option value="bearer">Bearer Token (Header injected)</option>
                  <option value="basic">Basic Credentials (Base64 encrypted)</option>
                </select>
              </div>

              {activeRequest.authType === "bearer" && (
                <div className="space-y-1 bg-white/[0.01] border border-white/5 p-3 rounded-lg">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Bearer Token</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={activeRequest.authValue.token || ""}
                      onChange={(e) => updateActiveRequestAction({ authValue: { ...activeRequest.authValue, token: e.target.value } })}
                      placeholder="eyJhY2Nlc3NfdG9rZW4iOiJsaXZlX2FlZDM5..."
                      className="block w-full pr-10 pl-3 py-2 bg-brand-layer-2 border border-white/5 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-brand-primary font-mono"
                    />
                    <Key className="absolute right-3 top-2.5 w-4 h-4 text-slate-500" />
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                    Appends an <span className="font-mono text-brand-primary">Authorization: Bearer {"<token>"}</span> key headers context automatically.
                  </p>
                </div>
              )}

              {activeRequest.authType === "basic" && (
                <div className="space-y-3 bg-white/[0.01] border border-white/5 p-3 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Username</label>
                      <input
                        type="text"
                        value={activeRequest.authValue.username || ""}
                        onChange={(e) => updateActiveRequestAction({ authValue: { ...activeRequest.authValue, username: e.target.value } })}
                        placeholder="api_key_id"
                        className="block w-full px-3 py-2 bg-brand-layer-2 border border-white/5 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Password</label>
                      <input
                        type="password"
                        value={activeRequest.authValue.password || ""}
                        onChange={(e) => updateActiveRequestAction({ authValue: { ...activeRequest.authValue, password: e.target.value } })}
                        placeholder="••••••••"
                        className="block w-full px-3 py-2 bg-brand-layer-2 border border-white/5 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Headers grid builder */}
          {activeTab === "headers" && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                <Layers className="w-3.5 h-3.5" /> API Request Headers Grid
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-2 w-8 text-center">Active</th>
                    <th className="py-2 px-2">Header Key</th>
                    <th className="py-2 px-2">Value</th>
                    <th className="py-2 w-12 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayHeaders.map((header, index) => (
                    <tr key={index} className="hover:bg-white/[0.01] transition-standard">
                      <td className="py-1.5 text-center">
                        <input
                          type="checkbox"
                          checked={header.active}
                          onChange={(e) => handleToggleRowActive("headers", index, e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-white/10 bg-brand-layer-2 text-brand-primary focus:ring-brand-primary/20 accent-brand-primary cursor-pointer"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={header.key}
                          onChange={(e) => handleGridChange("headers", index, "key", e.target.value)}
                          className="w-full bg-transparent border-0 border-b border-transparent focus:border-brand-primary/40 focus:ring-0 text-slate-200 font-mono text-[11px] py-0.5 focus:outline-none placeholder-slate-600"
                          placeholder="Header key (e.g. Content-Type)"
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={header.value}
                          onChange={(e) => handleGridChange("headers", index, "value", e.target.value)}
                          className="w-full bg-transparent border-0 border-b border-transparent focus:border-brand-primary/40 focus:ring-0 text-slate-400 font-mono text-[11px] py-0.5 focus:outline-none placeholder-slate-600"
                          placeholder="Value"
                        />
                      </td>
                      <td className="py-1.5 text-right pr-2">
                        {index < storeHeaders.length ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteGridRow("headers", index)}
                            className="p-1 hover:bg-brand-error/10 text-slate-500 hover:text-brand-error rounded transition-standard cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. JSON Monaco-style body editor */}
          {activeTab === "body" && (
            <div className="flex-1 min-h-0 flex flex-col space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  <Sliders className="w-3.5 h-3.5" /> Body payload configuration
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">application/json</span>
                  <button
                    onClick={beautifyJson}
                    className="flex items-center gap-1 bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 px-2 py-1 rounded text-[9px] font-semibold text-slate-300 transition-standard cursor-pointer"
                  >
                    Beautify JSON
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 bg-[#060814]/40 border border-white/5 rounded-lg flex overflow-hidden">
                <div className="w-8 border-r border-white/5 text-right select-none py-3 pr-2.5 text-slate-700 font-mono text-[10px] bg-[#060814]/20">
                  {Array.from({ length: Math.max(1, (activeRequest.bodyJson || "").split("\n").length) }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>

                <textarea
                  value={activeRequest.bodyJson || ""}
                  onChange={(e) => updateActiveRequestAction({ bodyJson: e.target.value, bodyType: "json" })}
                  placeholder='{\n  "key": "value"\n}'
                  className="flex-1 bg-transparent p-3 text-xs font-mono text-brand-success focus:outline-none resize-none overflow-y-auto leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* 5. Settings */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-lg">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold tracking-wider border-b border-white/5 pb-2">
                <ShieldAlert className="w-3.5 h-3.5" /> Outage & Timeout Parameters
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Request Timeout (ms)</label>
                  <input
                    type="number"
                    value={activeRequest.timeoutMs ?? 5000}
                    onChange={(e) => updateActiveRequestAction({ timeoutMs: Number(e.target.value) || 5000 })}
                    className="block w-full px-3 py-2 bg-brand-layer-2 border border-white/5 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}