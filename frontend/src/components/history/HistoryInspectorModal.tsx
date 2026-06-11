import { useHistoryStore } from "../../store/historyStore";
import type { HistoryItem } from "../../types/history/HistoryItem";
import { X, Trash2, Clock, Globe, ArrowDownToLine, ArrowUpFromLine, Info } from "lucide-react";

interface HistoryInspectorModalProps {
  item: HistoryItem | null;
  onClose: () => void;
}

export default function HistoryInspectorModal({
  item,
  onClose,
}: HistoryInspectorModalProps) {
  const deleteHistoryAction = useHistoryStore(
    (state) => state.deleteHistoryAction,
  );

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

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300)
      return "text-brand-success bg-brand-success/5 border-brand-success/10";
    if (code >= 300 && code < 400)
      return "text-blue-400 bg-blue-500/5 border-blue-500/10";
    return "text-brand-error bg-brand-error/5 border-brand-error/10";
  };

  const formatHeaders = (headers: { [key: string]: string }) => {
    if (!headers || Object.keys(headers).length === 0) return "None";
    return Object.entries(headers)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
  };

  const handleDelete = async () => {
    if (!item) return;
    await deleteHistoryAction(item.id);
    onClose();
  };

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-2xl rounded-xl shadow-2xl relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-brand-primary rounded-t-xl" />

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
          <h3 className="text-xs font-bold font-display text-white uppercase tracking-wider">
            History Inspector
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/5 text-slate-500 hover:text-slate-300 rounded cursor-pointer transition-standard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">

          {/* Summary row */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-lg font-mono">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Method</p>
              <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full ${getMethodColor(item.method)}`}>
                {item.method}
              </span>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Status</p>
              <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full ${getStatusColor(item.statusCode)}`}>
                {item.statusCode}
              </span>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Duration</p>
              <p className="text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-brand-primary" />
                {item.durationMs} ms
              </p>
            </div>
          </div>

          {/* URL */}
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <Globe className="w-3 h-3" /> Target URL
            </p>
            <div className="p-3 bg-brand-layer-2 border border-white/5 rounded-lg font-mono text-[10px] text-slate-300 break-all select-all">
              {item.url}
            </div>
          </div>

          {/* Executed At */}
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Executed At</p>
            <div className="p-3 bg-brand-layer-2 border border-white/5 rounded-lg font-mono text-[10px] text-slate-300">
              {item.executedAt}
            </div>
          </div>

          {/* Request section */}
          <div className="space-y-3">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpFromLine className="w-3 h-3 text-brand-primary" /> Request
            </p>

            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 uppercase">Headers</p>
              <pre className="p-3 bg-brand-layer-2 border border-white/5 rounded-lg font-mono text-[10px] text-slate-300 whitespace-pre-wrap break-all select-all overflow-auto max-h-32">
                {formatHeaders(item.requestHeaders)}
              </pre>
            </div>

            {item.requestBody && (
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase">Body</p>
                <pre className="p-3 bg-brand-layer-2 border border-white/5 rounded-lg font-mono text-[10px] text-slate-300 whitespace-pre-wrap break-all select-all overflow-auto max-h-40">
                  {item.requestBody}
                </pre>
              </div>
            )}
          </div>

          {/* Response section */}
          <div className="space-y-3">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ArrowDownToLine className="w-3 h-3 text-brand-primary" /> Response
            </p>

            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 uppercase">Headers</p>
              <pre className="p-3 bg-brand-layer-2 border border-white/5 rounded-lg font-mono text-[10px] text-slate-300 whitespace-pre-wrap break-all select-all overflow-auto max-h-32">
                {formatHeaders(item.responseHeaders)}
              </pre>
            </div>

            {item.responseBody && (
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase">Body</p>
                <pre className="p-3 bg-brand-layer-2 border border-white/5 rounded-lg font-mono text-[10px] text-slate-300 whitespace-pre-wrap break-all select-all overflow-auto max-h-40">
                  {item.responseBody}
                </pre>
              </div>
            )}

            {item.errorMessage && (
              <div className="space-y-1">
                <p className="text-[10px] text-brand-error uppercase font-bold">Error</p>
                <div className="p-3 bg-brand-error/5 border border-brand-error/20 rounded-lg font-mono text-[10px] text-brand-error select-all">
                  {item.errorMessage}
                </div>
              </div>
            )}
          </div>

          {/* Metadata section */}
          <div className="space-y-3">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3 h-3 text-brand-primary" /> Metadata
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase">Auth Type</p>
                <div className="p-2 bg-brand-layer-2 border border-white/5 rounded-lg font-mono text-[10px] text-slate-400">
                  {(!item.authType || item.authType.toLowerCase() === "none") ? "None" : (item.authType.charAt(0).toUpperCase() + item.authType.slice(1))}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase">Timeout</p>
                <div className="p-2 bg-brand-layer-2 border border-white/5 rounded-lg font-mono text-[10px] text-slate-400">
                  {item.timeoutSeconds}s
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-slate-500 uppercase">Success</p>
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold font-mono border ${item.success ? "text-brand-success bg-brand-success/5 border-brand-success/20" : "text-brand-error bg-brand-error/5 border-brand-error/20"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${item.success ? "bg-brand-success" : "bg-brand-error"}`} />
                {item.success ? "true" : "false"}
              </div>
            </div>

            {item.authType && item.authType.toLowerCase() !== "none" && item.authValue && Object.keys(item.authValue).length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase">Auth Value</p>
                <pre className="p-3 bg-brand-layer-2 border border-white/5 rounded-lg font-mono text-[10px] text-slate-300 whitespace-pre-wrap break-all select-all overflow-auto max-h-32">
                  {JSON.stringify(item.authValue, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-white/5 flex gap-2 shrink-0 justify-end">
          <button
            onClick={handleDelete}
            className="px-4 py-1.5 bg-brand-error/10 hover:bg-brand-error border border-brand-error/20 hover:border-brand-error text-brand-error hover:text-white font-semibold rounded-lg transition-standard text-xs cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
