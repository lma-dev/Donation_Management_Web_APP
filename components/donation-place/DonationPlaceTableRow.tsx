"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DonationPlace } from "@/features/donation-place/types";

type DonationPlaceTableRowProps = {
  place: DonationPlace;
  onEdit: (place: DonationPlace) => void;
  onDelete: (place: DonationPlace) => void;
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function DonationPlaceTableRow({
  place,
  onEdit,
  onDelete,
}: DonationPlaceTableRowProps) {
  const t = useTranslations("donationPlaces");
  const tc = useTranslations("common");

  return (
    <TableRow>
      <TableCell className="font-medium">{place.name}</TableCell>
      <TableCell className="text-muted-foreground">
        {place.note || "—"}
      </TableCell>
      <TableCell>
        <Badge
          variant={place.isActive ? "default" : "secondary"}
          className="text-xs font-normal"
        >
          {place.isActive ? t("active") : t("inactive")}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(place.updatedAt)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onEdit(place)}
              >
                <Pencil />
                <span className="sr-only">{`${tc("edit")} ${place.name}`}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{tc("edit")}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(place)}
              >
                <Trash2 />
                <span className="sr-only">{`${tc("delete")} ${place.name}`}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{tc("delete")}</TooltipContent>
          </Tooltip>
        </div>
      </TableCell>
    </TableRow>
  );
}
