import { RandomnessType } from "../utils/random";

type TopBarProps = {
  remaining: number;
  round: number;
  randomnessType: RandomnessType;
  onTitleClick: () => void;
};

const TopBar = ({ remaining, round, randomnessType, onTitleClick }: TopBarProps) => {
  return (
    <header className="glass-panel flex flex-col gap-4 rounded-3xl px-6 py-4 md:flex-row md:items-center md:justify-between">
      <button
        onClick={onTitleClick}
        className="text-left font-display text-3xl uppercase tracking-[0.3em] text-white focus-outline"
      >
        Lucky Draw
      </button>
      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em]">
        <span className="rounded-full border border-neon-pink/60 px-3 py-1 text-neon-pink">
          Remaining: {remaining}
        </span>
        <span className="rounded-full border border-neon-cyan/60 px-3 py-1 text-neon-cyan">
          Round: {round}
        </span>
        <span className="rounded-full border border-neon-purple/60 px-3 py-1 text-neon-purple">
          Randomness: {randomnessType === "crypto" ? "Crypto" : "Math.random"}
        </span>
      </div>
    </header>
  );
};

export default TopBar;
