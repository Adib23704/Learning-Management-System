"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { UserRole } from "@/lib/constants/roles";
import { ROLE_DASHBOARD } from "@/lib/constants/routes";

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const router = useRouter();
  const { user } = useCurrentUser();

  useEffect(() => {
    if (user && !allowedRoles.includes(user.role)) {
      router.replace(ROLE_DASHBOARD[user.role] || "/");
    }
  }, [user, allowedRoles, router]);

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
