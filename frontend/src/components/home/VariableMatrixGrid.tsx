import { useState, useMemo, useEffect } from "react";
import { useEnvironmentStore } from "../../store/environmentStore";
import { Trash2, FolderPlus, Edit3 } from "lucide-react";

export default function VariableMatrixGrid() {
  const environments = useEnvironmentStore((state) => state.environments);
  const activeEnvironmentId = useEnvironmentStore(
    (state) => state.activeEnvironmentId,
  );
  const addVariableAction = useEnvironmentStore(
    (state) => state.addVariableAction,
  );
  const updateVariableAction = useEnvironmentStore(
    (state) => state.updateVariableAction,
  );
  const deleteVariableAction = useEnvironmentStore(
    (state) => state.deleteVariableAction,
  );
  const editEnvironmentAction = useEnvironmentStore(
    (state) => state.editEnvironmentAction,
  );

  const [editingValues, setEditingValues] = useState<{
    index: number;
    key: string;
    value: string;
  } | null>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");

  const activeEnv =
    environments.find(
      (environment) => environment.id === activeEnvironmentId,
    ) || environments[0];

  useEffect(() => {
    if (activeEnv) {
      setEditName(activeEnv.name);
      setIsEditingName(false);
    }
  }, [activeEnv?.id, activeEnv?.name]);

  const filteredVariables = activeEnv?.variables || [];

  const phantomRow = { id: "phantom", key: "", value: "" };

  const displayVariables = useMemo(() => {
    const list = [...filteredVariables, phantomRow];
    const phantomIndex = filteredVariables.length;
    if (editingValues && editingValues.index === phantomIndex) {
      if (
        editingValues.key.trim() !== "" ||
        editingValues.value.trim() !== ""
      ) {
        list.push({ id: "phantom-next", key: "", value: "" });
      }
    }
    return list;
  }, [filteredVariables, editingValues]);

  const handleSaveEnvName = async () => {
    if (!activeEnv) return;
    const trimmedName = editName.trim();
    if (!trimmedName || trimmedName === activeEnv.name) {
      setEditName(activeEnv.name);
      setIsEditingName(false);
      return;
    }

    const res = await editEnvironmentAction(activeEnv.id, {
      name: trimmedName,
      environmentColor: activeEnv.color,
    });

    if (res && !res.success) {
      alert(res.error || "Failed to update environment name.");
      setEditName(activeEnv.name);
    }
    setIsEditingName(false);
  };

  const handleInputChange = (
    index: number,
    field: "key" | "value",
    newValue: string,
  ) => {
    const isPhantomRow = index >= filteredVariables.length;
    const originalVar = isPhantomRow
      ? { key: "", value: "" }
      : filteredVariables[index];

    setEditingValues((prev) => {
      if (prev && prev.index === index) {
        return { ...prev, [field]: newValue };
      }
      return {
        index,
        key: field === "key" ? newValue : originalVar.key,
        value: field === "value" ? newValue : originalVar.value,
      };
    });
  };

  const handleSaveRow = async (index: number) => {
    if (!activeEnv || !editingValues || editingValues.index !== index) return;

    const { key, value } = editingValues;
    const isPhantomRow = index >= filteredVariables.length;

    if (!key.trim() && !value.trim()) {
      setEditingValues(null);
      return;
    }

    let response;
    if (isPhantomRow) {
      response = await addVariableAction(activeEnv.id, {
        key: key.trim(),
        value: value.trim(),
      });
    } else {
      const targetVar = filteredVariables[index];
      if (key !== targetVar.key || value !== targetVar.value) {
        response = await updateVariableAction(activeEnv.id, targetVar.id, {
          key: key.trim(),
          value: value.trim(),
        });
      }
    }
    if (response && !response.success) {
      alert(response.error || "Failed to save variable.");
    }
    setEditingValues(null);
  };

  const handleDeleteGridRow = async (index: number) => {
    if (!activeEnv) return;
    const isPhantomRow = index >= filteredVariables.length;
    if (isPhantomRow) {
      setEditingValues(null);
    } else {
      const storeVariables = filteredVariables;
      if (index >= storeVariables.length) return;
      const res = await deleteVariableAction(
        activeEnv.id,
        storeVariables[index].id,
      );
      if (res && !res.success) {
        alert(res.error || "Failed to delete variable.");
      }
    }
  };

  if (environments.length === 0) {
    return (
      <div className="lg:col-span-3">
        <div className="glass-panel rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] border border-white/5 space-y-3 animate-float">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 border border-white/5">
            <FolderPlus className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold font-display text-white">
            No Active Scope
          </h3>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Create Environment to start adding variables
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-3 space-y-4">
      <div className="glass-panel rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0 group">
              <h2 className="text-sm font-semibold font-display text-white shrink-0">
                Variables Grid:
              </h2>
              {isEditingName ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleSaveEnvName}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveEnvName();
                    } else if (e.key === "Escape") {
                      setIsEditingName(false);
                      setEditName(activeEnv.name);
                    }
                  }}
                  autoFocus
                  className="bg-brand-layer-2 border border-white/10 rounded px-1.5 py-0.5 text-xs text-slate-200 font-bold focus:outline-none focus:border-brand-primary max-w-[200px]"
                />
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-xs font-bold text-slate-300 tracking-wide hover:text-white cursor-pointer truncate max-w-[250px] flex items-center gap-1 hover:bg-white/5 px-1.5 py-0.5 rounded transition-standard text-left"
                  title="Click to edit environment name"
                >
                  {activeEnv?.name || "Active Environment"}
                  <Edit3 className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Editable matrix syncing instantly with URL interpolation scripts.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-400 border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-2">Variable Key</th>
                <th className="py-2.5 px-2">Value</th>
                <th className="py-2.5 px-2 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayVariables.map((variable, index) => {
                return (
                  <tr
                    key={index}
                    className="hover:bg-white/[0.01] transition-standard"
                  >
                    <td className="py-2 px-1">
                      <input
                        type="text"
                        value={
                          editingValues && editingValues.index === index
                            ? editingValues.key
                            : variable.key
                        }
                        onChange={(e) =>
                          handleInputChange(index, "key", e.target.value)
                        }
                        onBlur={() => handleSaveRow(index)}
                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-brand-primary/50 focus:ring-0 text-slate-200 font-mono text-[11px] py-1 px-1 focus:outline-none placeholder-slate-600"
                        placeholder="KEY_NAME"
                      />
                    </td>

                    <td className="py-2 px-1 relative">
                      <div className="flex items-center gap-1.5 pr-6">
                        <input
                          type="text"
                          value={
                            editingValues && editingValues.index === index
                              ? editingValues.value
                              : variable.value
                          }
                          onChange={(e) =>
                            handleInputChange(index, "value", e.target.value)
                          }
                          onBlur={() => handleSaveRow(index)}
                          className="w-full bg-transparent border-0 border-b border-transparent focus:border-brand-primary/50 focus:ring-0 font-mono text-[11px] py-1 px-1 focus:outline-none placeholder-slate-600 transition-all duration-300 text-brand-success"
                          placeholder="Variable value"
                        />
                      </div>
                    </td>

                    <td className="py-2 px-1 text-right">
                      {index < filteredVariables.length ||
                      (editingValues &&
                        editingValues.index === index &&
                        (editingValues.key.trim() !== "" ||
                          editingValues.value.trim() !== "")) ? (
                        <button
                          onClick={() => handleDeleteGridRow(index)}
                          className="p-1 hover:bg-brand-error/10 text-slate-600 hover:text-brand-error rounded transition-standard cursor-pointer"
                          title="Delete Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
