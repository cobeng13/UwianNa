import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TopBar from "./components/TopBar";
import NameInput from "./components/NameInput";
import WinnerCard, { slotDurationMs } from "./components/WinnerCard";
import History from "./components/History";
import RemainingList from "./components/RemainingList";
import AutoDraw from "./components/AutoDraw";
import RigModal from "./components/RigModal";
import Toast, { ToastMessage } from "./components/Toast";
import { getRandomIndex } from "./utils/random";
import type { RandomnessType } from "./utils/random";
import { clearState, loadState, saveState } from "./utils/storage";

export type HistoryItem = {
  round: number;
  names: string[];
  timestamp: number;
  groupSize: number;
};
export type RigRule = {
  id: string;
  name: string;
  round: number;
  enabled: boolean;
  used: boolean;
};

const parseNames = (text: string) =>
  text
    .split("\n")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);

const defaultInterval = 10;

const App = () => {
  const [inputText, setInputText] = useState("");
  const [originalNames, setOriginalNames] = useState<string[]>([]);
  const [remainingNames, setRemainingNames] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [roundCounter, setRoundCounter] = useState(0);
  const [winner, setWinner] = useState<HistoryItem | null>(null);
  const [randomnessType, setRandomnessType] = useState<RandomnessType>("math");
  const [groupDrawEnabled, setGroupDrawEnabled] = useState(false);
  const [groupSizeInitial, setGroupSizeInitial] = useState(1);
  const [groupSizeCurrent, setGroupSizeCurrent] = useState(1);
  const [decreaseGroupSize, setDecreaseGroupSize] = useState(false);

  const [rigRules, setRigRules] = useState<RigRule[]>([]);
  const [rigEnabled, setRigEnabled] = useState(false);
  const [rigModalOpen, setRigModalOpen] = useState(false);

  const [autoDrawEnabled, setAutoDrawEnabled] = useState(false);
  const [autoDrawIntervalSec, setAutoDrawIntervalSec] = useState(defaultInterval);
  const [nextDrawAt, setNextDrawAt] = useState<number | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [rigToastVisible, setRigToastVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const titleClickTimes = useRef<number[]>([]);
  const pendingHistoryTimers = useRef<number[]>([]);

  useEffect(() => {
    const stored = loadState();
    if (!stored) return;
    const normalizedHistory: HistoryItem[] = stored.history.map((item) => {
      if ("names" in item && Array.isArray(item.names)) {
        return {
          round: item.round,
          names: item.names,
          timestamp: item.timestamp,
          groupSize: item.groupSize ?? item.names.length
        };
      }
      return {
        round: item.round,
        names: [item.name],
        timestamp: item.timestamp,
        groupSize: 1
      };
    });
    setOriginalNames(stored.originalNames);
    setRemainingNames(stored.remainingNames);
    setHistory(normalizedHistory);
    setRoundCounter(stored.roundCounter);
    setRigRules(stored.rigRules);
    setRigEnabled(stored.rigEnabled);
    setAutoDrawEnabled(stored.autoDrawEnabled);
    setAutoDrawIntervalSec(stored.autoDrawIntervalSec || defaultInterval);
    setWinner(normalizedHistory[0] ?? null);
    setSoundEnabled(stored.soundEnabled ?? false);
    setGroupDrawEnabled(stored.groupDrawEnabled ?? false);
    setGroupSizeInitial(Math.max(1, stored.groupSizeInitial ?? 1));
    setGroupSizeCurrent(Math.max(1, stored.groupSizeCurrent ?? stored.groupSizeInitial ?? 1));
    setDecreaseGroupSize(stored.decreaseGroupSize ?? false);
    if (stored.originalNames.length > 0) {
      setInputText(stored.originalNames.join("\n"));
    }
  }, []);

  useEffect(() => {
    saveState({
      originalNames,
      remainingNames,
      history,
      roundCounter,
      rigRules,
      rigEnabled,
      autoDrawEnabled,
      autoDrawIntervalSec,
      soundEnabled,
      groupDrawEnabled,
      groupSizeInitial,
      groupSizeCurrent,
      decreaseGroupSize
    });
  }, [
    originalNames,
    remainingNames,
    history,
    roundCounter,
    rigRules,
    rigEnabled,
    autoDrawEnabled,
    autoDrawIntervalSec,
    soundEnabled,
    groupDrawEnabled,
    groupSizeInitial,
    groupSizeCurrent,
    decreaseGroupSize
  ]);

  useEffect(() => {
    setGroupSizeCurrent(
      Math.max(1, decreaseGroupSize ? groupSizeInitial - roundCounter : groupSizeInitial)
    );
  }, [groupSizeInitial, decreaseGroupSize, roundCounter]);

  useEffect(() => {
    if (autoDrawEnabled) {
      setNextDrawAt(Date.now() + autoDrawIntervalSec * 1000);
    } else {
      setNextDrawAt(null);
    }
  }, [autoDrawEnabled, autoDrawIntervalSec]);

  useEffect(() => {
    const minimumRemaining = groupDrawEnabled ? groupSizeCurrent : 1;
    if (remainingNames.length < minimumRemaining && autoDrawEnabled) {
      setAutoDrawEnabled(false);
    }
  }, [remainingNames.length, autoDrawEnabled, groupDrawEnabled, groupSizeCurrent]);

  const nextRound = roundCounter + 1;

  const availableRigNames = useMemo(
    () => (remainingNames.length > 0 ? remainingNames : originalNames),
    [remainingNames, originalNames]
  );

  const addToast = useCallback((message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message }]);
  }, []);

  const clearPendingHistory = useCallback(() => {
    pendingHistoryTimers.current.forEach((timer) => window.clearTimeout(timer));
    pendingHistoryTimers.current = [];
  }, []);

  const handleApply = useCallback(() => {
    const parsed = parseNames(inputText);
    clearPendingHistory();
    setOriginalNames(parsed);
    setRemainingNames(parsed);
    setHistory([]);
    setRoundCounter(0);
    setWinner(null);
    setAutoDrawEnabled(false);
    setRigRules((prev) => prev.map((rule) => ({ ...rule, used: false })));
    setGroupSizeCurrent(Math.max(1, decreaseGroupSize ? groupSizeInitial : groupSizeInitial));
  }, [inputText, clearPendingHistory, decreaseGroupSize, groupSizeInitial]);

  const handleDraw = useCallback(() => {
    const groupSizeForDraw = groupDrawEnabled
      ? Math.max(1, decreaseGroupSize ? groupSizeInitial - roundCounter : groupSizeInitial)
      : 1;
    if (remainingNames.length === 0) {
      addToast("No names left!");
      return;
    }
    if (groupDrawEnabled && remainingNames.length < groupSizeForDraw) {
      addToast("Not enough names left for this group size.");
      return;
    }

    const round = roundCounter + 1;
    let selectedNames: string[] = [];
    let rigRuleIdsToUse: string[] = [];

    if (rigEnabled) {
      const matchingRules = rigRules.filter(
        (rule) => rule.enabled && !rule.used && rule.round === round
      );
      for (const rule of matchingRules) {
        if (!remainingNames.includes(rule.name)) continue;
        if (selectedNames.includes(rule.name)) continue;
        if (selectedNames.length >= groupSizeForDraw) break;
        selectedNames = [...selectedNames, rule.name];
        rigRuleIdsToUse = [...rigRuleIdsToUse, rule.id];
        if (selectedNames.length >= groupSizeForDraw) break;
      }
    }

    if (selectedNames.length < groupSizeForDraw) {
      let pool = remainingNames.filter((name) => !selectedNames.includes(name));
      const remainingSlots = groupSizeForDraw - selectedNames.length;
      const protectedNames = rigEnabled
        ? rigRules
            .filter((rule) => rule.enabled && !rule.used && rule.round > round)
            .map((rule) => rule.name)
        : [];
      if (protectedNames.length > 0) {
        const availableNames = pool.filter((name) => !protectedNames.includes(name));
        if (availableNames.length >= remainingSlots) {
          pool = availableNames;
        }
      }
      while (selectedNames.length < groupSizeForDraw && pool.length > 0) {
        const { index, type } = getRandomIndex(pool.length);
        setRandomnessType(type);
        const pick = pool[index];
        selectedNames = [...selectedNames, pick];
        pool = pool.filter((name) => name !== pick);
      }
    }

    const timestamp = Date.now();
    const newHistory: HistoryItem = {
      round,
      names: selectedNames,
      timestamp,
      groupSize: groupSizeForDraw
    };

    setRemainingNames((prev) => {
      const toRemove = new Set(selectedNames);
      return prev.filter((name) => !toRemove.has(name));
    });
    if (rigRuleIdsToUse.length > 0) {
      setRigRules((prev) =>
        prev.map((rule) =>
          rigRuleIdsToUse.includes(rule.id) ? { ...rule, used: true } : rule
        )
      );
    }
    const historyTimer = window.setTimeout(() => {
      setHistory((prev) => [newHistory, ...prev]);
    }, slotDurationMs);
    pendingHistoryTimers.current.push(historyTimer);
    setRoundCounter(round);
    setWinner(newHistory);
    setGroupSizeCurrent(
      Math.max(1, decreaseGroupSize ? groupSizeInitial - round : groupSizeInitial)
    );
  }, [
    remainingNames,
    roundCounter,
    rigEnabled,
    rigRules,
    addToast,
    groupDrawEnabled,
    decreaseGroupSize,
    groupSizeInitial
  ]);

  useEffect(() => {
    return () => {
      clearPendingHistory();
    };
  }, [clearPendingHistory]);

  useEffect(() => {
    if (!autoDrawEnabled || !nextDrawAt) return;
    const timer = window.setInterval(() => {
      if (Date.now() >= nextDrawAt) {
        handleDraw();
        setNextDrawAt(Date.now() + autoDrawIntervalSec * 1000);
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [autoDrawEnabled, nextDrawAt, autoDrawIntervalSec, handleDraw]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const [latest, ...rest] = history;
    setHistory(rest);
    setRemainingNames((prev) => [...prev, ...latest.names]);
    setRoundCounter((prev) => Math.max(prev - 1, 0));
    setGroupSizeCurrent(
      Math.max(1, decreaseGroupSize ? groupSizeInitial - Math.max(roundCounter - 1, 0) : groupSizeInitial)
    );
    setWinner(rest[0] ?? null);
    setRigRules((prev) =>
      prev.map((rule) =>
        rule.used && rule.round === latest.round && latest.names.includes(rule.name)
          ? { ...rule, used: false }
          : rule
      )
    );
  }, [history, decreaseGroupSize, groupSizeInitial, roundCounter]);

  const handleReset = useCallback(() => {
    handleApply();
  }, [handleApply]);

  const handleTitleClick = () => {
    const now = Date.now();
    titleClickTimes.current = [...titleClickTimes.current, now].filter(
      (time) => now - time <= 4000
    );
    if (titleClickTimes.current.length >= 7) {
      titleClickTimes.current = [];
      setRigModalOpen(true);
      setRigToastVisible(true);
      window.setTimeout(() => setRigToastVisible(false), 1600);
    }
  };

  const handleClearStorage = () => {
    clearState();
    addToast("Saved data cleared.");
  };

  return (
    <div className="casino-bg min-h-screen px-4 pb-16 pt-6 md:px-10">
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8">
        <TopBar
          remaining={remainingNames.length}
          round={roundCounter}
          randomnessType={randomnessType}
          onTitleClick={handleTitleClick}
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid gap-8 lg:grid-cols-[1.1fr_1fr]"
        >
          <div className="order-2 flex flex-col gap-6 lg:order-1">
            <NameInput
              inputText={inputText}
              onTextChange={setInputText}
              onApply={handleApply}
              remaining={remainingNames.length}
            />

            <div className="glass-panel rounded-3xl p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <button
                    onClick={handleDraw}
                    className="btn-neon focus-outline text-lg"
                  >
                    Draw
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={handleUndo}
                      className="rounded-full border border-neon-cyan/60 px-5 py-2 text-sm font-semibold text-neon-cyan transition hover:shadow-neon-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/80"
                    >
                      Undo
                    </button>
                    <button
                      onClick={handleReset}
                      className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-neon-purple/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple/80"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <AutoDraw
                  enabled={autoDrawEnabled}
                  intervalSec={autoDrawIntervalSec}
                  onToggle={setAutoDrawEnabled}
                  onIntervalChange={setAutoDrawIntervalSec}
                  nextDrawAt={nextDrawAt}
                />

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                        Group Draw Mode
                      </p>
                      <p className="text-sm text-white/50">
                        Draw multiple winners each round.
                      </p>
                    </div>
                    <button
                      onClick={() => setGroupDrawEnabled((prev) => !prev)}
                      className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${
                        groupDrawEnabled
                          ? "border border-neon-cyan/70 bg-neon-cyan/10 text-neon-cyan shadow-neon-cyan"
                          : "border border-white/20 text-white/60"
                      }`}
                    >
                      {groupDrawEnabled ? "On" : "Off"}
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                    <label className="flex items-center gap-3">
                      <span className="text-white/60">Group size</span>
                      <input
                        type="number"
                        min={1}
                        value={groupSizeInitial}
                        onChange={(event) =>
                          setGroupSizeInitial(Math.max(1, Number(event.target.value)))
                        }
                        className="focus-outline w-20 rounded-lg border border-white/10 bg-black/40 px-3 py-1 text-white"
                      />
                    </label>
                    <label className="flex items-center gap-2 text-white/60">
                      <input
                        type="checkbox"
                        checked={decreaseGroupSize}
                        onChange={(event) => setDecreaseGroupSize(event.target.checked)}
                        className="h-4 w-4 rounded border border-white/30 bg-black/40 text-neon-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/80"
                      />
                      Decrease group size each round
                    </label>
                    <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/60">
                      Current size: {groupSizeCurrent}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
                  <span className="rounded-full border border-white/15 px-3 py-1">
                    Draws are unique until Undo.
                  </span>
                  <button
                    onClick={() => setSoundEnabled((prev) => !prev)}
                    className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] transition ${
                      soundEnabled
                        ? "border-neon-pink/70 text-neon-pink shadow-neon-pink"
                        : "border-white/20 text-white/60"
                    }`}
                  >
                    Sound: {soundEnabled ? "On" : "Off"}
                  </button>
                  <button
                    onClick={handleClearStorage}
                    className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.2em] transition hover:border-neon-cyan/70 hover:text-neon-cyan"
                  >
                    Clear saved data
                  </button>
                </div>
              </div>
            </div>

            <RemainingList names={remainingNames} />
          </div>

          <div className="order-1 flex flex-col gap-6 lg:order-2">
            <WinnerCard
              winner={winner}
              namesPool={originalNames}
              remainingNames={remainingNames}
              soundEnabled={soundEnabled}
            />
            <History items={history} />
          </div>
        </motion.div>
      </div>

      <RigModal
        open={rigModalOpen}
        onClose={() => setRigModalOpen(false)}
        rigEnabled={rigEnabled}
        setRigEnabled={setRigEnabled}
        rigRules={rigRules}
        setRigRules={setRigRules}
        names={availableRigNames}
        nextRound={nextRound}
      />

      <Toast toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      <AnimatePresence>
        {rigToastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-8 right-6 z-50 rounded-full border border-neon-pink/60 bg-black/70 px-4 py-2 text-sm"
          >
            🎰 Rig Mode Unlocked
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
