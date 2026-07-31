"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export function SkillBadge({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.06, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.2, delay, ease: "easeOut" }}
      className="flex h-8 w-fit items-center gap-2 rounded-xl border border-border bg-background px-4 ring-2 ring-border/20"
    >
      {children}
    </motion.div>
  );
}
