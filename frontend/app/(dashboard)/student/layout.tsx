import { RoleGate } from "@/components/shared/role-gate";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGate allowedRoles={["STUDENT"]}>{children}</RoleGate>;
}
