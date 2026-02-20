"use client";

import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DonationPlaceTableRow } from "@/components/donation-place/DonationPlaceTableRow";
import type { DonationPlace } from "@/features/donation-place/types";

type DonationPlaceTableProps = {
  places: DonationPlace[];
  onEdit: (place: DonationPlace) => void;
  onDelete: (place: DonationPlace) => void;
};

function EmptyState() {
  const t = useTranslations("donationPlaces");

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-muted mb-4 flex size-12 items-center justify-center rounded-lg">
        <MapPin className="text-muted-foreground size-6" />
      </div>
      <h3 className="text-sm font-medium">{t("empty")}</h3>
      <p className="text-muted-foreground mt-1 text-sm">
        {t("emptyDescription")}
      </p>
    </div>
  );
}

export function DonationPlaceTable({
  places,
  onEdit,
  onDelete,
}: DonationPlaceTableProps) {
  const t = useTranslations("donationPlaces");

  if (places.length === 0) {
    return <EmptyState />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>{t("table.name")}</TableHead>
          <TableHead>{t("table.note")}</TableHead>
          <TableHead>{t("table.status")}</TableHead>
          <TableHead>{t("table.updated")}</TableHead>
          <TableHead className="w-[80px]">{t("table.actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {places.map((place) => (
          <DonationPlaceTableRow
            key={place.id}
            place={place}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
}
