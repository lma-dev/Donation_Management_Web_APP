"use client";

import { useState, useEffect } from "react";
import { CircleAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DonationPlace } from "@/features/donation-place/types";
import type { DonationPlaceFormData } from "@/features/donation-place/use-donation-place-actions";

type DonationPlaceFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  place: DonationPlace | null;
  onSubmit: (data: DonationPlaceFormData) => void | Promise<void>;
};

export function DonationPlaceForm({
  open,
  onOpenChange,
  place,
  onSubmit,
}: DonationPlaceFormProps) {
  const isEditing = place !== null;

  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(place?.name ?? "");
      setNote(place?.note ?? "");
      setIsActive(place?.isActive ?? true);
      setError(null);
      setSubmitting(false);
    }
  }, [open, place]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        note: note.trim() || undefined,
        isActive,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Donation Place" : "Add Donation Place"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the donation place details below."
              : "Fill in the details to add a new donation place."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="place-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="place-name"
              placeholder="Enter place name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="place-note">Note</Label>
            <Input
              id="place-note"
              placeholder="Optional note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="place-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-primary size-4 rounded"
            />
            <Label htmlFor="place-active" className="cursor-pointer">
              Active
            </Label>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <CircleAlert className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              {isEditing ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
