import { AnimatePresence, motion } from "framer-motion";
import type { HistoryItem } from "../App";

type HistoryProps = {
  items: HistoryItem[];
};

const History = ({ items }: HistoryProps) => {
  return (
    <section className="glass-panel flex flex-col gap-4 rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">History</p>
          <p className="text-sm text-white/50">Most recent first</p>
        </div>
        <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/60">
          {items.length} draws
        </span>
      </div>

      <div className="flex max-h-64 flex-col gap-3 overflow-y-auto pr-2 scrollbar-hidden">
        <AnimatePresence>
          {items.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/50"
            >
              No draws yet.
            </motion.div>
          )}
          {items.map((item) => (
            <motion.div
              key={item.timestamp}
              layout
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-lg text-neon-pink">{item.name}</p>
                <span className="text-xs text-white/50">Round {item.round}</span>
              </div>
              <p className="text-xs text-white/40">
                {new Date(item.timestamp).toLocaleTimeString()}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default History;
