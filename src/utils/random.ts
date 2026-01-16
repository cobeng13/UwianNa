export type RandomnessType = "crypto" | "math";

export const getRandomIndex = (max: number): { index: number; type: RandomnessType } => {
  if (max <= 0) {
    return { index: 0, type: "math" };
  }

  if (window.crypto?.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return { index: array[0] % max, type: "crypto" };
  }

  return { index: Math.floor(Math.random() * max), type: "math" };
};
