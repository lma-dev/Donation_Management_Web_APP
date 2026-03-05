"use client";

import { useTranslations } from "next-intl";
import { Mail, Phone, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ContactDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ContactDialog({ open, onOpenChange }: ContactDialogProps) {
  const t = useTranslations("contact");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">{t("description")}</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href={`mailto:${t("email")}`}
                className="text-sm text-primary hover:underline"
              >
                {t("email")}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{t("phone")}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{t("address")}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
