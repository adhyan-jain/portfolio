"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type TabItem = {
  value: string;
  label: string;
  content: ReactNode;
};

/**
 * Client wrapper around the tab bar. Panel content is rendered on the server
 * and handed in as `content`, so the sections stay server components.
 */
export default function TabbedSections({ tabs }: { tabs: TabItem[] }) {
  if (tabs.length === 0) return null;

  return (
    <Tabs defaultValue={tabs[0].value} className="w-full">
      <TabsList className="overflow-x-auto">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
