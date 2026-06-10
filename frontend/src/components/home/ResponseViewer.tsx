import { useState, useEffect, useMemo, useCallback } from "react";
import { useRequestStore } from "../../store/requestStore";
import {
  Search,
  Copy,
  Check,
  Globe,
  Clock,
  Database,
  AlertCircle,
  Code,
} from "lucide-react";

export default function ResponseViewer() {
  const isExecuting = useRequestStore((state) => state.isExecuting);
  const lastResponse = useRequestStore((state) => state.lastResponse);

  const [activeTab, setActiveTab] = useState<"body" | "headers" | "preview">(
    "body",
  );
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [compilingPreview, setCompilingPreview] = useState(false);
  const [previewCounter, setPreviewCounter] = useState(0);

  useEffect(() => {
    if (activeTab === "preview" && previewCounter > 0) {
      setCompilingPreview(true);
      const timer = setTimeout(() => setCompilingPreview(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [previewCounter, activeTab]);

  const handleCopy = useCallback(async () => {
    if (!lastResponse?.body) return;
    try {
      await navigator.clipboard.writeText(lastResponse.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.warn(
        "Clipboard write failed — document may not be focused or permission denied.",
      );
    }
  }, [lastResponse?.body]);

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300)
      return "text-brand-success border-brand-success/20 bg-brand-success/5 shadow-[0_0_10px_rgba(16,185,129,0.1)]";
    if (code >= 300 && code < 400)
      return "text-blue-400 border-blue-500/20 bg-blue-500/5 shadow-[0_0_10px_rgba(99,102,241,0.1)]";
    return "text-brand-error border-brand-error/20 bg-brand-error/5 shadow-[0_0_10px_rgba(244,63,94,0.1)]";
  };

  const isJson = (str: string) => {
    if (!str) return false;
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const formattedLines = useMemo(() => {
    const body = lastResponse?.body;
    if (!body) return null;

    try {
      const parsed = JSON.parse(body);
      const formatted = JSON.stringify(parsed, null, 2);
      const lines = formatted.split("\n");

      return lines.map((line) => {
        const keyMatch = line.match(/^(\s*"[^"]+"\s*:)(.*)$/);

        if (keyMatch) {
          const key = keyMatch[1];
          const val = keyMatch[2];

          let valClass = "text-slate-300";
          if (val.includes('"')) {
            valClass = "text-brand-success";
          } else if (val.includes("true") || val.includes("false")) {
            valClass = "text-purple-400";
          } else if (val.includes("null")) {
            valClass = "text-slate-500";
          } else if (/\d/.test(val)) {
            valClass = "text-brand-warning";
          }

          return { key, val, valClass, raw: line };
        }

        return { key: null, val: null, valClass: null, raw: line };
      });
    } catch {
      return body.split("\n").map((line) => ({
        key: null,
        val: null,
        valClass: null,
        raw: line,
      }));
    }
  }, [lastResponse?.body]);

  const renderFormattedJson = () => {
    if (!formattedLines) return null;

    return formattedLines.map((line, idx) => {
      const hasMatch =
        searchQuery &&
        line.raw.toLowerCase().includes(searchQuery.toLowerCase());

      let renderedLine;
      if (line.key) {
        renderedLine = (
          <span>
            <span className="text-brand-primary">{line.key}</span>
            <span className={line.valClass!}>{line.val}</span>
          </span>
        );
      } else {
        renderedLine = <span className="text-slate-300">{line.raw}</span>;
      }

      return (
        <div
          key={idx}
          className={`flex hover:bg-white/[0.02] px-3 font-mono text-[11px] leading-relaxed transition-standard ${
            hasMatch ? "bg-brand-primary/20 text-white font-semibold" : ""
          }`}
        >
          {/* Line Number Panel */}
          <span className="w-8 shrink-0 text-right select-none pr-3 border-r border-white/5 text-slate-600 font-mono text-[10px]">
            {idx + 1}
          </span>

          {/* Formatted Text View */}
          <span className="pl-3 whitespace-pre-wrap">{renderedLine}</span>
        </div>
      );
    });
  };

  const getPreviewHtml = (body: string) => {
    if (!body) return "";
    const trimmed = body.trim();

    if (
      trimmed.startsWith("<!DOCTYPE html>") ||
      trimmed.toLowerCase().includes("<html")
    ) {
      return body;
    }

    try {
      const parsed = JSON.parse(body);
      const formatted = JSON.stringify(parsed, null, 2);
      return `
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #1e293b; background: #f8fafc; }
              h2 { color: #6366f1; font-weight: 700; margin-top: 0; }
              pre { background: #e2e8f0; padding: 12px; border-radius: 8px; font-size: 13px; color: #334155; overflow-x: auto; }
            </style>
          </head>
          <body>
            <h2>PostKid HTML sandbox compiling...</h2>
            <p>Successfully rendered response body context dynamically in sandboxed container:</p>
            <pre>${formatted}</pre>
          </body>
        </html>
      `;
    } catch {
      const escaped = body
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      return `
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; color: #1e293b; background: #f8fafc; }
              h2 { color: #6366f1; font-weight: 700; margin-top: 0; }
              pre { background: #e2e8f0; padding: 12px; border-radius: 8px; font-size: 13px; color: #334155; overflow-x: auto; white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h2>PostKid Plain Text Preview</h2>
            <pre>${escaped}</pre>
          </body>
        </html>
      `;
    }
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col h-[340px] shadow-[0_0_30px_rgba(0,0,0,0.3)] z-10 shrink-0">
      {/* 1. Frosted Metadata Banner */}
      <div className="h-12 bg-white/[0.01] border-b border-white/5 px-4 flex items-center justify-between shrink-0">
        {/* Status Metrics or Idle state details */}
        {lastResponse ? (
          <div className="flex items-center gap-3.5">
            {/* Status Code Pill */}
            <div
              className={`flex items-center gap-1.5 border px-2.5 py-1 rounded-md text-xs font-semibold ${getStatusColor(lastResponse.status)}`}
            >
              <span>{lastResponse.status}</span>
              <span className="opacity-75 font-normal text-[10px] uppercase tracking-wide">
                {lastResponse.statusText}
              </span>
            </div>

            {/* Latency Pill */}
            <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{lastResponse.latency}ms</span>
              {lastResponse.latency > 500 && (
                <span title="High latency exceeded threshold">
                  <AlertCircle className="w-3.5 h-3.5 text-brand-warning animate-pulse" />
                </span>
              )}
            </div>

            {/* Payload Size Pill */}
            <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-300">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>{lastResponse.size}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium italic">
            <Globe className="w-4 h-4 text-slate-600" />
            <span>
              Response Workbench Idle. Send a request to initiate compiling.
            </span>
          </div>
        )}

        {/* Tab switcher options */}
        {lastResponse && (
          <div className="flex items-center gap-1 text-[11px] font-semibold">
            <button
              onClick={() => setActiveTab("body")}
              className={`px-3 py-1.5 rounded transition-standard cursor-pointer ${
                activeTab === "body"
                  ? "bg-white/5 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Response Body
            </button>
            <button
              onClick={() => setActiveTab("headers")}
              className={`px-3 py-1.5 rounded transition-standard cursor-pointer ${
                activeTab === "headers"
                  ? "bg-white/5 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Headers ({Object.keys(lastResponse.headers).length})
            </button>
            <button
              onClick={() => {
                setActiveTab("preview");
                setPreviewCounter((c) => c + 1);
              }}
              className={`px-3 py-1.5 rounded transition-standard cursor-pointer ${
                activeTab === "preview"
                  ? "bg-white/5 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Preview
            </button>
          </div>
        )}
      </div>

      {/* 2. Lower Content Section */}
      <div className="flex-1 min-h-0 bg-[#060814]/40 relative">
        {/* Loading Spinner overlay during active runner execution */}
        {isExecuting && (
          <div className="absolute inset-0 bg-[#060814]/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-brand-primary/20 border-t-brand-primary animate-spin" />
            <span className="text-xs font-mono text-brand-primary animate-pulse">
              awaiting remote kafka socket headers...
            </span>
          </div>
        )}

        {/* Actual Output Content switcher */}
        {lastResponse ? (
          <div className="h-full flex flex-col">
            {activeTab === "body" && (
              <div className="flex-1 min-h-0 flex flex-col">
                {/* Search & Copy tools strip */}
                <div className="h-9 border-b border-white/5 px-4 flex items-center justify-between shrink-0 bg-[#0B0F19]/40">
                  <div className="relative w-44">
                    <input
                      type="text"
                      placeholder={
                        isJson(lastResponse.body)
                          ? "Query JSON nodes..."
                          : "Search response..."
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-6 pr-2 py-1 bg-transparent border-0 text-[10px] text-slate-300 placeholder-slate-600 focus:outline-none"
                    />
                    <Search className="absolute left-0 top-2.5 w-3 h-3 text-slate-600" />
                  </div>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-standard cursor-pointer"
                    aria-label="Copy response body to clipboard"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-brand-success" />
                        <span className="text-brand-success">
                          Copied payload
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy Raw
                      </>
                    )}
                  </button>
                </div>

                {/* Main scrollable highlighted code block */}
                <div className="flex-1 overflow-auto py-3 bg-[#060814]/20 select-text">
                  {renderFormattedJson()}
                </div>
              </div>
            )}

            {activeTab === "headers" && (
              <div className="flex-1 overflow-auto p-4 select-text">
                <table className="w-full text-left text-[11px] font-mono text-slate-400 border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] text-slate-500 font-semibold uppercase tracking-wider pb-1">
                      <th className="py-2">Header Key</th>
                      <th className="py-2">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {Object.entries(lastResponse.headers).map(
                      ([key, value]) => (
                        <tr key={key} className="hover:bg-white/[0.01]">
                          <td className="py-2 font-semibold text-brand-primary">
                            {key}
                          </td>
                          <td className="py-2 text-slate-300 select-all">
                            {value}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "preview" && (
              <div className="flex-1 h-full relative">
                {compilingPreview ? (
                  <div className="absolute inset-0 p-4 space-y-3">
                    <div className="w-full h-4 shimmer-skeleton rounded" />
                    <div className="w-[85%] h-4 shimmer-skeleton rounded" />
                    <div className="w-[60%] h-4 shimmer-skeleton rounded" />
                  </div>
                ) : (
                  /* Sandboxed preview iframe — no allow-scripts to prevent XSS from response bodies */
                  <iframe
                    title="Mock sandboxed preview"
                    className="w-full h-full border-0 bg-white"
                    sandbox=""
                    srcDoc={getPreviewHtml(lastResponse.body)}
                  />
                )}
              </div>
            )}
          </div>
        ) : (
          /* Empty/Idle placeholder overlay */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 gap-2">
            <Code className="w-10 h-10 text-slate-800 animate-float" />
            <p className="text-xs text-slate-500 font-medium">
              Awaiting Execution Dispatcher
            </p>
            <p className="text-[10px] text-slate-600 leading-relaxed max-w-xs">
              Select an endpoint from collections sidebar tree, configure
              parameters, and press the glow 'Send' trigger to verify.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
