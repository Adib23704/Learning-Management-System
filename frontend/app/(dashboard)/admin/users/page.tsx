"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search, ShieldAlert, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { type Column, DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS, type UserRole } from "@/lib/constants/roles";
import { formatDate } from "@/lib/utils/format";
import {
  type CreateUserInput,
  createUserSchema,
} from "@/lib/validators/user.schema";
import {
  useActivateUserMutation,
  useCreateUserMutation,
  useGetUsersQuery,
  useSuspendUserMutation,
} from "@/store/api/users.api";
import type { User } from "@/types";

const ROLE_FILTER_OPTIONS = [
  { value: "ALL", label: "All Roles" },
  { value: "STUDENT", label: "Student" },
  { value: "INSTRUCTOR", label: "Instructor" },
  { value: "ADMIN", label: "Admin" },
] as const;

const ROLE_BADGE_VARIANT: Record<
  string,
  "default" | "success" | "info" | "warning"
> = {
  STUDENT: "default",
  INSTRUCTOR: "info",
  ADMIN: "warning",
  SUPER_ADMIN: "success",
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string;
    action: "suspend" | "activate";
    userName: string;
  }>({ open: false, userId: "", action: "suspend", userName: "" });

  const { data: usersData, isLoading } = useGetUsersQuery({
    search: search || undefined,
    role: roleFilter !== "ALL" ? (roleFilter as UserRole) : undefined,
  });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [suspendUser, { isLoading: isSuspending }] = useSuspendUserMutation();
  const [activateUser, { isLoading: isActivating }] = useActivateUserMutation();

  const users = usersData?.data ?? [];

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "STUDENT",
    },
  });

  const handleCreateUser = async (values: CreateUserInput) => {
    try {
      await createUser(values).unwrap();
      toast.success("User created successfully");
      setCreateDialogOpen(false);
      form.reset();
    } catch {
      toast.error("Failed to create user");
    }
  };

  const handleToggleStatus = async () => {
    try {
      if (confirmDialog.action === "suspend") {
        await suspendUser(confirmDialog.userId).unwrap();
        toast.success("User suspended successfully");
      } else {
        await activateUser(confirmDialog.userId).unwrap();
        toast.success("User activated successfully");
      }
      setConfirmDialog((prev) => ({ ...prev, open: false }));
    } catch {
      toast.error(`Failed to ${confirmDialog.action} user`);
    }
  };

  const columns: Column<Record<string, unknown>>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        render: (item) => {
          const u = item as unknown as User;
          return (
            <div className="font-medium text-neutral-800">
              {u.firstName} {u.lastName}
            </div>
          );
        },
      },
      {
        key: "email",
        header: "Email",
        render: (item) => {
          const u = item as unknown as User;
          return <span className="text-neutral-600">{u.email}</span>;
        },
      },
      {
        key: "role",
        header: "Role",
        render: (item) => {
          const u = item as unknown as User;
          return (
            <Badge variant={ROLE_BADGE_VARIANT[u.role] ?? "default"} size="sm">
              {ROLE_LABELS[u.role] ?? u.role}
            </Badge>
          );
        },
      },
      {
        key: "isActive",
        header: "Status",
        render: (item) => {
          const u = item as unknown as User;
          return (
            <Badge variant={u.isActive ? "success" : "error"} size="sm">
              {u.isActive ? "Active" : "Suspended"}
            </Badge>
          );
        },
      },
      {
        key: "createdAt",
        header: "Joined",
        render: (item) => {
          const u = item as unknown as User;
          return (
            <span className="text-neutral-500">{formatDate(u.createdAt)}</span>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        render: (item) => {
          const u = item as unknown as User;
          return (
            <div className="flex items-center justify-end gap-1">
              {u.isActive ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDialog({
                      open: true,
                      userId: u.id,
                      action: "suspend",
                      userName: `${u.firstName} ${u.lastName}`,
                    });
                  }}
                >
                  <ShieldAlert className="h-4 w-4 text-red-500" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDialog({
                      open: true,
                      userId: u.id,
                      action: "activate",
                      userName: `${u.firstName} ${u.lastName}`,
                    });
                  }}
                >
                  <ShieldCheck className="h-4 w-4 text-accent-600" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage all platform users"
        actions={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Create User
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={users as unknown as Record<string, unknown>[]}
        isLoading={isLoading}
        emptyMessage="No users found."
      />

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleCreateUser)}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="First Name"
                required
                error={form.formState.errors.firstName?.message}
              >
                <Input
                  {...form.register("firstName")}
                  placeholder="John"
                  error={!!form.formState.errors.firstName}
                />
              </FormField>
              <FormField
                label="Last Name"
                required
                error={form.formState.errors.lastName?.message}
              >
                <Input
                  {...form.register("lastName")}
                  placeholder="Doe"
                  error={!!form.formState.errors.lastName}
                />
              </FormField>
            </div>
            <FormField
              label="Email"
              required
              error={form.formState.errors.email?.message}
            >
              <Input
                type="email"
                {...form.register("email")}
                placeholder="john@example.com"
                error={!!form.formState.errors.email}
              />
            </FormField>
            <FormField
              label="Password"
              required
              error={form.formState.errors.password?.message}
            >
              <Input
                type="password"
                {...form.register("password")}
                placeholder="Minimum 8 characters"
                error={!!form.formState.errors.password}
              />
            </FormField>
            <FormField
              label="Role"
              required
              error={form.formState.errors.role?.message}
            >
              <Select
                value={form.watch("role")}
                onValueChange={(val) =>
                  form.setValue("role", val as CreateUserInput["role"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isCreating}>
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={
          confirmDialog.action === "suspend" ? "Suspend User" : "Activate User"
        }
        description={
          confirmDialog.action === "suspend"
            ? `Are you sure you want to suspend ${confirmDialog.userName}? They will lose access to the platform.`
            : `Are you sure you want to activate ${confirmDialog.userName}? They will regain access to the platform.`
        }
        confirmText={
          confirmDialog.action === "suspend" ? "Suspend" : "Activate"
        }
        variant={confirmDialog.action === "suspend" ? "danger" : "default"}
        onConfirm={handleToggleStatus}
        isLoading={isSuspending || isActivating}
      />
    </div>
  );
}
