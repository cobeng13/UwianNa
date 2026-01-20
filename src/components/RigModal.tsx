import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { RigRule } from "../App";

type RigModalProps = {
  open: boolean;
  onClose: () => void;
  rigEnabled: boolean;
  setRigEnabled: (value: boolean) => void;
  rigRules: RigRule[];
  setRigRules: (rules: RigRule[]) => void;
  names: string[];
  nextRound: number;
};

const RigModal = ({
  open,
  onClose,
  rigEnabled,
  setRigEnabled,
  rigRules,
  setRigRules,
  names,
  nextRound
}: RigModalProps) => {
  const [selectedName, setSelectedName] = useState("");
  const [round, setRound] = useState(nextRound);
  const [roundDirty, setRoundDirty] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (!roundDirty) {
      setRound(nextRound);
    }
  }, [nextRound, open, roundDirty]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setRoundDirty(false);
    setRound(nextRound);
    if (names.length > 0) {
      setSelectedName((prev) => prev || names[0]);
    }
  }, [open, nextRound, names]);

  const canSave = selectedName.length > 0 && round >= 1;

  const addRule = () => {
    if (!canSave) return;
    const id = `${Date.now()}-${Math.random()}`;
    const newRule: RigRule = {
      id,
      name: selectedName,
      round,
      enabled: true,
      used: false
    };
    setRigRules([newRule, ...rigRules]);
    setRoundDirty(false);
    setRound(nextRound);
  };

  const sortedRules = useMemo(() => [...rigRules].sort((a, b) => a.round - b.round), [rigRules]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="glass-panel w-full max-w-2xl rounded-3xl border border-neon-purple/40 p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-neon-pink">Rig Mode</p>
                <h2 className="font-display text-2xl uppercase tracking-[0.2em]">House Advantage</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70"
              >
                Close
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={rigEnabled}
                  onChange={(event) => setRigEnabled(event.target.checked)}
                  className="h-4 w-4 accent-neon-pink"
                />
                Enable rigging
              </label>
              <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/60">
                Active rules: {rigRules.filter((rule) => rule.enabled && !rule.used).length}
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Add rig rule</p>
              <div className="mt-4 flex flex-wrap items-end gap-4">
                <label className="flex flex-1 flex-col gap-2 text-sm">
                  Name
                  <select
                    value={selectedName}
                    onChange={(event) => setSelectedName(event.target.value)}
                    className="focus-outline rounded-lg border border-white/10 bg-black/40 px-3 py-2"
                  >
                    {names.length === 0 && <option value="">No names available</option>}
                    {names.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm">
                  Force at round #
                  <input
                    type="number"
                    min={1}
                    value={round}
                    onChange={(event) => {
                      setRoundDirty(true);
                      setRound(Math.max(1, Number(event.target.value)));
                    }}
                    className="focus-outline w-32 rounded-lg border border-white/10 bg-black/40 px-3 py-2"
                  />
                </label>
                <button
                  onClick={addRule}
                  disabled={!canSave}
                  className="rounded-full border border-neon-cyan/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-neon-cyan transition disabled:opacity-40"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Rules</p>
              <div className="mt-3 flex max-h-52 flex-col gap-3 overflow-y-auto pr-2 scrollbar-hidden">
                {sortedRules.length === 0 && (
                  <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/50">
                    No rig rules yet.
                  </div>
                )}
                {sortedRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
                  >
                    <div>
                      <p className="font-display text-lg text-neon-pink">{rule.name}</p>
                      <p className="text-xs text-white/50">Round {rule.round}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs text-white/60">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(event) =>
                            setRigRules(
                              rigRules.map((item) =>
                                item.id === rule.id
                                  ? { ...item, enabled: event.target.checked }
                                  : item
                              )
                            )
                          }
                          className="h-4 w-4 accent-neon-cyan"
                        />
                        Enabled
                      </label>
                      {rule.used && (
                        <span className="rounded-full border border-neon-purple/60 px-3 py-1 text-xs text-neon-purple">
                          Used
                        </span>
                      )}
                      <button
                        onClick={() => setRigRules(rigRules.filter((item) => item.id !== rule.id))}
                        className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RigModal;
