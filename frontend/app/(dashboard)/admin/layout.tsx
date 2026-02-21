import { RoleGate } from "@/components/shared/role-gate";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGate allowedRoles={["ADMIN"]}>{children}</RoleGate>;
}
