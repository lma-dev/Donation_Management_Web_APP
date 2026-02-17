"use client";

import { MapPin } from "lucide-react";
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
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-muted mb-4 flex size-12 items-center justify-center rounded-lg">
        <MapPin className="text-muted-foreground size-6" />
      </div>
      <h3 className="text-sm font-medium">No donation places found</h3>
      <p className="text-muted-foreground mt-1 text-sm">
        Get started by adding a new donation place.
      </p>
    </div>
  );
}

export function DonationPlaceTable({
  places,
  onEdit,
  onDelete,
}: DonationPlaceTableProps) {
  if (places.length === 0) {
    return <EmptyState />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Name</TableHead>
          <TableHead>Note</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="w-[80px]">Actions</TableHead>
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
