import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type ToastMessage = {
  id: string;
  message: string;
};

type ToastProps = {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
};

const Toast = ({ toasts, onRemove }: ToastProps) => {
  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => onRemove(toast.id), 2500)
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [toasts, onRemove]);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="rounded-full border border-neon-pink/60 bg-black/70 px-4 py-2 text-sm text-white"
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
