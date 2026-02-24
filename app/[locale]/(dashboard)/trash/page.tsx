"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useAtom } from "jotai";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageContent } from "@/components/layout/PageContent";
import { PageGuide } from "@/components/layout/PageGuide";
import { TrashTabContent } from "@/components/trash/TrashTabContent";
import { activeTabAtom } from "@/features/trash/atoms";
import type { TrashResourceType } from "@/features/trash/types";

const TAB_TYPES: TrashResourceType[] = [
  "users",
  "donation-places",
  "supporter-donations",
  "distribution-records",
];

export default function TrashPage() {
  const t = useTranslations("trash");
  const { data: session } = useSession();
  const canPurge = session?.user?.role === "SYSTEM_ADMIN";
  const [activeTab, setActiveTab] = useAtom(activeTabAtom);

  return (
    <PageContent
      title={t("title")}
      description={t("description")}
      guide={
        <PageGuide
          title={t("guide.title")}
          description={t("guide.description")}
        />
      }
    >
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TrashResourceType)}
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          {TAB_TYPES.map((type) => (
            <TabsTrigger key={type} value={type}>
              {t(`tabs.${type}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        {TAB_TYPES.map((type) => (
          <TabsContent key={type} value={type}>
            <TrashTabContent
              type={type}
              isActive={activeTab === type}
              canPurge={canPurge}
            />
          </TabsContent>
        ))}
      </Tabs>
    </PageContent>
  );
}
