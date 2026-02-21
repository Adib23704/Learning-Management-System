import { RoleGate } from "@/components/shared/role-gate";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGate allowedRoles={["INSTRUCTOR"]}>{children}</RoleGate>;
}
