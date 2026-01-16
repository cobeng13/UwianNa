import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type AutoDrawProps = {
  enabled: boolean;
  intervalSec: number;
  onToggle: (value: boolean) => void;
  onIntervalChange: (value: number) => void;
  nextDrawAt: number | null;
};

const AutoDraw = ({ enabled, intervalSec, onToggle, onIntervalChange, nextDrawAt }: AutoDrawProps) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!enabled || !nextDrawAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(timer);
  }, [enabled, nextDrawAt]);

  const remainingSeconds = nextDrawAt ? Math.max(0, Math.ceil((nextDrawAt - now) / 1000)) : "--";
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Auto Draw</p>
          <p className="text-sm text-white/50">Let the roulette spin for you.</p>
        </div>
        <button
          onClick={() => onToggle(!enabled)}
          className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.3em] transition ${
            enabled
              ? "border border-neon-pink/70 bg-neon-pink/10 text-neon-pink shadow-neon-pink"
              : "border border-white/20 text-white/60"
          }`}
        >
          {enabled ? "On" : "Off"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-3">
          <span className="text-white/60">Interval (sec)</span>
          <input
            type="number"
            min={1}
            value={intervalSec}
            onChange={(event) => onIntervalChange(Math.max(1, Number(event.target.value)))}
            className="focus-outline w-20 rounded-lg border border-white/10 bg-black/40 px-3 py-1 text-white"
          />
        </label>
        <motion.div
          key={enabled ? "active" : "idle"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60"
        >
          Next draw in: {remainingSeconds}s
        </motion.div>
      </div>
    </div>
  );
};

export default AutoDraw;
