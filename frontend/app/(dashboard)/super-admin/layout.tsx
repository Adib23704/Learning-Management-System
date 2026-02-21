import { RoleGate } from "@/components/shared/role-gate";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGate allowedRoles={["SUPER_ADMIN"]}>{children}</RoleGate>;
}
