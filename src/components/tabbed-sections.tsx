"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type TabItem = {
  value: string;
  label: string;
  content: ReactNode;
};

/**
 * Client wrapper around the tab bar. Panel content is rendered on the server
 * and handed in as `content`, so the sections stay server components.
 *
 * Content is animated manually (instead of via radix TabsContent) so the
 * outgoing panel can play an exit animation before the incoming one enters -
 * radix unmounts the previous panel immediately, which leaves no time for
 * `motion.div`'s `exit` to run.
 */
export default function TabbedSections({ tabs }: { tabs: TabItem[] }) {
  const [active, setActive] = useState(tabs[0]?.value);
  const activeTab = tabs.find((tab) => tab.value === active);

  if (tabs.length === 0 || !activeTab) return null;

  return (
    <Tabs
      value={active}
      onValueChange={setActive}
      className="w-full"
    >
      <TabsList className="overflow-x-auto">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="relative mt-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab.value}
            id={`tabpanel-${activeTab.value}`}
            role="tabpanel"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {activeTab.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </Tabs>
  );
}
