import { useActiveRequestStore } from "../store/activeRequestStore";
import CollectionSidebar from "../components/requestsBuilder/CollectionSidebar";
import RequestBuilder from "../components/requestsBuilder/RequestBuilder";
import ResponseViewer from "../components/requestsBuilder/ResponseViewer";
import CollectionDetails from "../components/requestsBuilder/CollectionDetails";
import { Sparkles } from "lucide-react";

export default function RequestsBuilderPage() {
  const activeRequest = useActiveRequestStore((state) => state.activeRequest);
  const activeCollectionId = useActiveRequestStore((state) => state.activeCollectionId);

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* 1. Left Collections Drawer */}
      <CollectionSidebar />

      {/* 2. Right Workspace core split grids */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto p-6 space-y-6">
        {activeRequest ? (
          <>
            <RequestBuilder />
            <ResponseViewer />
          </>
        ) : activeCollectionId ? (
          <CollectionDetails />
        ) : (
          /* Empty Sandbox placeholder */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-brand-layer-1/10 rounded-xl border border-dashed border-white/5 gap-3">
            <Sparkles className="w-12 h-12 text-brand-primary animate-pulse-slow" />
            <h2 className="text-sm font-semibold text-slate-200">No Selection</h2>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed">
              Select a collection or expand its tree to select an API request and start designing.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}