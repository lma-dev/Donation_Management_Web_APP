"use client";

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
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Donation Place?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{" "}
            <span className="text-foreground font-medium">
              {place?.name ?? "this donation place"}
            </span>
            . This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
