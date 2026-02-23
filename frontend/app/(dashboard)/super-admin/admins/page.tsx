"use client";

import { Plus, Search, ShieldAlert, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { formatDate } from "@/lib/utils/format";
import {
  useActivateUserMutation,
  useCreateUserMutation,
  useGetUsersQuery,
  useSuspendUserMutation,
} from "@/store/api/users.api";
import type { User } from "@/types";

const createAdminSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
});

type CreateAdminInput = z.infer<typeof createAdminSchema>;

export default function SuperAdminAdminsPage() {
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string;
    action: "suspend" | "activate";
    userName: string;
  }>({ open: false, userId: "", action: "suspend", userName: "" });

  const { data: usersData, isLoading } = useGetUsersQuery({
    role: "ADMIN",
    search: search || undefined,
  });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [suspendUser, { isLoading: isSuspending }] = useSuspendUserMutation();
  const [activateUser, { isLoading: isActivating }] = useActivateUserMutation();

  const admins = usersData?.data ?? [];

  const form = useForm<CreateAdminInput>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });

  const handleCreate = async (values: CreateAdminInput) => {
    try {
      await createUser({ ...values, role: "ADMIN" }).unwrap();
      toast.success("Admin created successfully");
      setCreateDialogOpen(false);
      form.reset();
    } catch {
      toast.error("Failed to create admin");
    }
  };

  const handleToggleStatus = async () => {
    try {
      if (confirmDialog.action === "suspend") {
        await suspendUser(confirmDialog.userId).unwrap();
        toast.success("Admin suspended successfully");
      } else {
        await activateUser(confirmDialog.userId).unwrap();
        toast.success("Admin activated successfully");
      }
      setConfirmDialog((prev) => ({ ...prev, open: false }));
    } catch {
      toast.error(`Failed to ${confirmDialog.action} admin`);
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
            <p className="font-medium text-neutral-800">
              {u.firstName} {u.lastName}
            </p>
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
                  type="button"
                  variant="ghost"
                  size="sm"
                  title="Suspend admin"
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
                  type="button"
                  variant="ghost"
                  size="sm"
                  title="Activate admin"
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
        title="Admins"
        description="Manage platform administrators"
        actions={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Admin
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder="Search admins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <DataTable
        columns={columns}
        data={admins as unknown as Record<string, unknown>[]}
        isLoading={isLoading}
        emptyMessage="No admins found."
      />

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleCreate)}
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
                placeholder="admin@example.com"
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
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isCreating}>
                Create Admin
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={
          confirmDialog.action === "suspend" ? "Suspend Admin" : "Activate Admin"
        }
        description={
          confirmDialog.action === "suspend"
            ? `Are you sure you want to suspend ${confirmDialog.userName}? They will lose admin access.`
            : `Are you sure you want to activate ${confirmDialog.userName}? They will regain admin access.`
        }
        confirmText={confirmDialog.action === "suspend" ? "Suspend" : "Activate"}
        variant={confirmDialog.action === "suspend" ? "danger" : "default"}
        onConfirm={handleToggleStatus}
        isLoading={isSuspending || isActivating}
      />
    </div>
  );
}
