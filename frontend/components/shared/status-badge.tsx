"use client";

import type { BadgeProps } from "@/components/ui/badge";
import { Badge } from "@/components/ui/badge";

const STATUS_MAP: Record<
  string,
  { label: string; variant: BadgeProps["variant"] }
> = {
  DRAFT: { label: "Draft", variant: "outline" },
  PUBLISHED: { label: "Published", variant: "success" },
  ARCHIVED: { label: "Archived", variant: "default" },
  ACTIVE: { label: "Active", variant: "success" },
  COMPLETED: { label: "Completed", variant: "info" },
  DROPPED: { label: "Dropped", variant: "error" },
};

interface StatusBadgeProps {
  status: string;
  type?: "course" | "enrollment";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_MAP[status] ?? {
    label: status,
    variant: "default" as const,
  };

  return (
    <Badge variant={config.variant} size="sm">
      {config.label}
    </Badge>
  );
}
