"use client";

import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { DonationPlace } from "@/features/donation-place/types";

type DeleteDonationPlaceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  place: DonationPlace | null;
  onConfirm: () => void;
};

export function DeleteDonationPlaceDialog({
  open,
  onOpenChange,
  place,
  onConfirm,
}: DeleteDonationPlaceDialogProps) {
  const t = useTranslations("donationPlaces");
  const tc = useTranslations("common");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteDescription", { name: place?.name ?? "this donation place" })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {tc("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
