import { motion } from "framer-motion";

export function LiveWaveform({ levels }: { levels: number[] }) {
  return (
    <div className="grid grid-cols-12 gap-1 p-3 rounded-3xl bg-surface/80 border border-border/70">
      {levels.map((level, index) => (
        <motion.div
          key={index}
          className="rounded-full bg-gradient-to-t from-primary to-info"
          style={{ height: `${Math.max(10, Math.min(100, level * 100))}%` }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 0.75 + (index % 3) * 0.05, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
