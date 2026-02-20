import {
  BarChart3,
  BookOpen,
  FolderTree,
  LayoutDashboard,
  type LucideIcon,
  PlusCircle,
  Settings,
  Users,
} from "lucide-react";
import type { UserRole } from "./roles";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navConfig: Record<UserRole, NavItem[]> = {
  STUDENT: [
    { label: "Dashboard", href: "/student", icon: LayoutDashboard },
    { label: "My Courses", href: "/student/courses", icon: BookOpen },
  ],
  INSTRUCTOR: [
    { label: "Dashboard", href: "/instructor", icon: LayoutDashboard },
    { label: "My Courses", href: "/instructor/courses", icon: BookOpen },
    {
      label: "Create Course",
      href: "/instructor/courses/new",
      icon: PlusCircle,
    },
    { label: "Analytics", href: "/instructor/analytics", icon: BarChart3 },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Courses", href: "/admin/courses", icon: BookOpen },
    { label: "Categories", href: "/admin/categories", icon: FolderTree },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  ],
  SUPER_ADMIN: [
    { label: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
    { label: "Admins", href: "/super-admin/admins", icon: Users },
    { label: "All Users", href: "/super-admin/users", icon: Users },
    { label: "Courses", href: "/super-admin/courses", icon: BookOpen },
    { label: "Analytics", href: "/super-admin/analytics", icon: BarChart3 },
    { label: "Configuration", href: "/super-admin/config", icon: Settings },
  ],
};
