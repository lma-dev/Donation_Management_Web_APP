"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Mail, Shield, CalendarDays } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContent } from "@/components/layout/PageContent";

type Profile = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
};

export default function ProfilePage() {
  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const memberSince = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(profile.createdAt));

  return (
    <PageContent title="Profile" description="Your account information.">
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-lg font-medium text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">
                {profile.name ?? "Unnamed User"}
              </CardTitle>
              <Badge variant="secondary" className="mt-1">
                {profile.role}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Mail className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <div>
                <dt className="text-muted-foreground text-sm">Email</dt>
                <dd className="text-sm font-medium">{profile.email}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <div>
                <dt className="text-muted-foreground text-sm">Role</dt>
                <dd className="text-sm font-medium">{profile.role}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarDays className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <div>
                <dt className="text-muted-foreground text-sm">Member Since</dt>
                <dd className="text-sm font-medium">{memberSince}</dd>
              </div>
            </div>
          </dl>
        </CardContent>
      </Card>
    </PageContent>
  );
}
