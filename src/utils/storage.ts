type StoredState = {
  originalNames: string[];
  remainingNames: string[];
  history: { round: number; name: string; timestamp: number }[];
  roundCounter: number;
  rigRules: {
    id: string;
    name: string;
    round: number;
    enabled: boolean;
    used: boolean;
  }[];
  rigEnabled: boolean;
  autoDrawEnabled: boolean;
  autoDrawIntervalSec: number;
  soundEnabled: boolean;
};

const STORAGE_KEY = "lucky-draw-state";

export const loadState = (): StoredState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredState;
  } catch {
    return null;
  }
};

export const saveState = (state: StoredState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore write errors
  }
};

export const clearState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};

export type { StoredState };
