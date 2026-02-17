"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

type NavbarProps = {
  onMobileMenuToggle: () => void;
};

export function Navbar({ onMobileMenuToggle }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex flex-1 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileMenuToggle}
          aria-label="Open menu"
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
