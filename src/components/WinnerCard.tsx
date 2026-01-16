import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { HistoryItem } from "../App";

const slotDuration = 800;

type WinnerCardProps = {
  winner: HistoryItem | null;
  namesPool: string[];
  remainingNames: string[];
};

const WinnerCard = ({ winner, namesPool, remainingNames }: WinnerCardProps) => {
  const [displayName, setDisplayName] = useState<string>("Ready to draw");
  const [isRevealing, setIsRevealing] = useState(false);

  const slotNames = useMemo(() => {
    const pool = remainingNames.length > 0 ? remainingNames : namesPool;
    return pool.length > 0 ? pool : ["Lucky One"];
  }, [remainingNames, namesPool]);

  useEffect(() => {
    if (!winner) {
      setDisplayName("Ready to draw");
      setIsRevealing(false);
      return;
    }

    let frame = 0;
    setIsRevealing(true);
    const interval = window.setInterval(() => {
      frame += 1;
      const pick = slotNames[frame % slotNames.length];
      setDisplayName(pick);
    }, 80);

    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      setDisplayName(winner.name);
      setIsRevealing(false);
    }, slotDuration);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [winner, slotNames]);

  return (
    <section className="glass-panel relative overflow-hidden rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Winner</p>
          <p className="text-sm text-white/50">Slot reveal + glow</p>
        </div>
        <span className="rounded-full border border-neon-purple/60 px-3 py-1 text-xs text-neon-purple">
          Round {winner?.round ?? 0}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={winner?.timestamp ?? "idle"}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.35 }}
          className={`mt-6 rounded-3xl border border-white/10 bg-black/40 px-6 py-10 text-center shadow-neon-purple ${
            winner ? "winner-sweep" : ""
          }`}
        >
          <motion.p
            className="font-display text-3xl uppercase tracking-[0.2em] text-white"
            animate={isRevealing ? { textShadow: "0 0 18px rgba(255,79,216,0.7)" } : {}}
          >
            {displayName}
          </motion.p>
          <p className="mt-3 text-xs uppercase tracking-[0.25em] text-white/50">
            {winner ? new Date(winner.timestamp).toLocaleTimeString() : "Awaiting draw"}
          </p>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default WinnerCard;
