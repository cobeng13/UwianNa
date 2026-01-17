import { AnimatePresence, motion } from "framer-motion";

type RemainingListProps = {
  names: string[];
};

const RemainingList = ({ names }: RemainingListProps) => {
  return (
    <section className="glass-panel flex flex-col gap-4 rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Remaining names</p>
          <p className="text-sm text-white/50">Scroll to explore pool</p>
        </div>
        <span className="rounded-full border border-neon-cyan/50 px-3 py-1 text-xs text-neon-cyan">
          {names.length} left
        </span>
      </div>

      <div className="max-h-52 overflow-y-auto pr-2 scrollbar-hidden">
        <AnimatePresence>
          {names.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/50"
            >
              Load names to begin.
            </motion.div>
          )}
          <div className="flex flex-wrap gap-2">
            {names.map((name) => (
              <motion.span
                key={name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white/80"
              >
                {name}
              </motion.span>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default RemainingList;
