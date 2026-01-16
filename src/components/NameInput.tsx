type NameInputProps = {
  inputText: string;
  onTextChange: (value: string) => void;
  onApply: () => void;
  remaining: number;
};

const NameInput = ({ inputText, onTextChange, onApply, remaining }: NameInputProps) => {
  return (
    <section className="glass-panel flex flex-col gap-4 rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/60">Names (one per line)</p>
          <p className="text-xs text-white/50">Paste your list, then apply.</p>
        </div>
        <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70">
          Remaining: {remaining}
        </span>
      </div>
      <textarea
        value={inputText}
        onChange={(event) => onTextChange(event.target.value)}
        placeholder="Ada\nMiles\nJo\nSal"
        rows={8}
        className="focus-outline w-full resize-none rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white/90 placeholder:text-white/30"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onApply} className="btn-neon focus-outline">
          Apply / Reset from list
        </button>
        <span className="text-xs text-white/50">Applying clears history and resets rounds.</span>
      </div>
    </section>
  );
};

export default NameInput;
