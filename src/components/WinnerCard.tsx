import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { HistoryItem } from "../App";

export const slotDurationMs = 800;

type WinnerCardProps = {
  winner: HistoryItem | null;
  namesPool: string[];
  remainingNames: string[];
  soundEnabled: boolean;
};

const WinnerCard = ({ winner, namesPool, remainingNames, soundEnabled }: WinnerCardProps) => {
  const [displayName, setDisplayName] = useState<string>("Ready to draw");
  const [displayNames, setDisplayNames] = useState<string[]>(["Ready to draw"]);
  const [isRevealing, setIsRevealing] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const slotNames = useMemo(() => {
    const pool = remainingNames.length > 0 ? remainingNames : namesPool;
    return pool.length > 0 ? pool : ["Lucky One"];
  }, [remainingNames, namesPool]);

  useEffect(() => {
    if (!winner) {
      setDisplayName("Ready to draw");
      setDisplayNames(["Ready to draw"]);
      setIsRevealing(false);
      return;
    }

    const playTone = (frequency: number, duration: number, gainValue: number) => {
      if (!soundEnabled) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }
      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "square";
      oscillator.frequency.value = frequency;
      gain.gain.value = gainValue;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration / 1000);
    };

    let frame = 0;
    setIsRevealing(true);
    const interval = window.setInterval(() => {
      frame += 1;
      const pick = slotNames[frame % slotNames.length];
      setDisplayName(pick);
      playTone(540, 60, 0.08);
    }, 80);

    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      setDisplayNames(winner.names);
      setIsRevealing(false);
      playTone(920, 180, 0.12);
    }, slotDurationMs);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [winner, slotNames, soundEnabled]);

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
            {isRevealing || !winner
              ? displayName
              : displayNames.length > 1
                ? "Group Winners"
                : displayNames[0]}
          </motion.p>
          {!isRevealing && winner && displayNames.length > 1 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {displayNames.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-neon-purple/40 bg-black/50 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/80"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs uppercase tracking-[0.25em] text-white/50">
            {winner ? new Date(winner.timestamp).toLocaleTimeString() : "Awaiting draw"}
          </p>
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

export default WinnerCard;
